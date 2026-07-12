#!/bin/bash
# Deploy — Pozzitech Landing Page
# /var/www/pozzitech/deploy.sh

set -e

PROJECT_DIR="/var/www/pozzitech"
PROJECT_NAME="Pozzitech Landing Page"

echo "🚀 Iniciando deploy: $PROJECT_NAME"
echo "📁 Diretório: $PROJECT_DIR"
echo "⏰ $(date '+%d/%m/%Y %H:%M:%S')"
echo "---"

cd "$PROJECT_DIR"

echo "📥 Atualizando código (git pull)..."
git pull origin main

echo "🐳 Reiniciando containers..."
docker compose down
docker compose up -d --build

echo "---"
echo "✅ Status dos containers:"
docker compose ps

echo "---"
echo "📣 IndexNow (Bing) — notificando URLs do sitemap (best-effort)..."
bash "$PROJECT_DIR/scripts/indexnow-ping.sh" || true

echo "---"
echo "✅ Deploy concluído: $PROJECT_NAME"
