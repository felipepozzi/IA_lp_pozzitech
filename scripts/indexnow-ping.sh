#!/bin/bash
# indexnow-ping.sh — notifica o Bing (IndexNow) sobre as URLs do sitemap da
# Pozzitech Landing a cada deploy. O ChatGPT Search usa o índice do Bing; sem
# isso, o site não aparece em respostas com busca ao vivo mesmo com robots.txt
# liberado.
#
# A chave é o próprio nome do arquivo público .txt (32 hex chars) — fonte única,
# sem duplicar o valor. As URLs vêm do próprio sitemap.xml servido pelo site
# (fonte única de verdade). Best-effort: qualquer falha aqui NUNCA derruba o
# deploy (chamado com "|| true" pelo deploy.sh). Espelha a lógica já em produção
# em /var/www/ia_imob_pozzibon/scripts/indexnow-ping.sh.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$SCRIPT_DIR/../landing-pozzitech/src/public"
HOST="${POZZITECH_HOST:-pozzitech.ia.br}"

KEY_FILE=$(find "$PUBLIC_DIR" -maxdepth 1 -regextype posix-extended -regex '.*/[a-f0-9]{32}\.txt' | head -1)
if [ -z "$KEY_FILE" ]; then
  echo "⚠️  indexnow-ping: chave não encontrada em $PUBLIC_DIR (esperado <32-hex>.txt) — pulando."
  exit 0
fi
KEY=$(basename "$KEY_FILE" .txt)

# URLs a partir do sitemap.xml público (mesma fonte que o Google/Bing consomem).
SITEMAP_URL="https://$HOST/sitemap.xml"
mapfile -t URLS < <(curl -s --max-time 15 "$SITEMAP_URL" | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g')

# Fallback: se o sitemap não respondeu (site ainda subindo, DNS, etc.), envia ao
# menos as rotas institucionais para não perder o ping deste deploy.
if [ "${#URLS[@]}" -eq 0 ]; then
  echo "⚠️  indexnow-ping: sitemap vazio/inacessível em $SITEMAP_URL — usando rotas fallback."
  URLS=(
    "https://$HOST/"
    "https://$HOST/geo"
    "https://$HOST/privacidade"
    "https://$HOST/termos"
  )
fi

URL_LIST_JSON=$(printf '"%s",' "${URLS[@]}")
URL_LIST_JSON="[${URL_LIST_JSON%,}]"

BODY=$(cat <<JSON
{"host":"$HOST","key":"$KEY","keyLocation":"https://$HOST/$KEY.txt","urlList":$URL_LIST_JSON}
JSON
)

HTTP_STATUS=$(curl -s -o /tmp/indexnow-pozzitech-response.txt -w '%{http_code}' \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$BODY" --max-time 15 || echo "000")

case "$HTTP_STATUS" in
  200|202) echo "✅ IndexNow: $HTTP_STATUS — ${#URLS[@]} URL(s) enviadas." ;;
  *) echo "⚠️  IndexNow: HTTP $HTTP_STATUS inesperado — $(cat /tmp/indexnow-pozzitech-response.txt 2>/dev/null)" ;;
esac
