# CLAUDE.md — PozziTech Landing Page

Documentação do projeto para uso em sessões com Claude Code.

---

## Visão Geral

Landing page de conversão B2B para a **PozziTech**, consultoria de automação com IA para PMEs. O objetivo é capturar leads qualificados via agendamento de diagnóstico gratuito (Calendly) ou WhatsApp.

**Funil da página:**
`Dor (problema)` → `Solução` → `Resultados` → `Como Funciona` → `Casos de Uso` → `Oferta de Diagnóstico` → `FAQ` → `CTA Final`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js >= 18 + Express 4 |
| Templates | EJS |
| CSS | Tailwind CSS 3.4 (compilado via CLI) |
| JS Frontend | Vanilla JS (sem frameworks) |
| Deploy | Docker (multi-stage, Node 20 Alpine) |
| Porta | 2999 |

---

## Estrutura de Arquivos

```
IA_lp_pozzitech/
├── CLAUDE.md                          ← este arquivo
├── landing-pozzitech/
│   ├── server.js                      ← entrada da aplicação Express
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│       ├── input.css                  ← fonte Tailwind (editar aqui, não no style.css)
│       ├── controllers/
│       │   └── homeController.js      ← dados passados para a view (meta, whatsapp, calendly, faqs)
│       ├── routes/
│       │   └── index.js               ← GET / → homeController.index
│       ├── public/
│       │   ├── css/style.css          ← CSS gerado (não editar manualmente)
│       │   ├── js/main.js             ← toda a interatividade frontend
│       │   └── images/                ← logo.png, logo1.png, logo2.png
│       └── views/
│           ├── index.ejs              ← template principal (inclui todos os partials)
│           └── partials/
│               ├── head.ejs           ← <head>: meta, SEO, schema.org, Google Fonts
│               ├── header.ejs         ← navbar fixa + menu mobile
│               ├── hero.ejs           ← seção acima da dobra com CTAs e mockup animado
│               ├── problem.ejs        ← 6 cards de dores do cliente (fundo claro)
│               ├── solution.ejs       ← 4 cards de soluções (fundo escuro)
│               ├── results.ejs        ← 5 métricas de ROI
│               ├── how-it-works.ejs   ← 3 passos do processo
│               ├── use-cases.ejs      ← 6 segmentos de mercado com métricas
│               ├── offer.ejs          ← oferta de diagnóstico gratuito + CTAs de booking
│               ├── faq.ejs            ← acordeão de 6 perguntas (dados do controller)
│               ├── cta-final.ejs      ← CTA final com urgência
│               ├── footer.ejs         ← rodapé com links e redes sociais
│               └── whatsapp-button.ejs← botão flutuante WhatsApp (fixed bottom-right)
```

---

## Comandos

```bash
# Desenvolvimento (servidor com auto-reload + watch de CSS)
cd landing-pozzitech
npm run dev          # nodemon no server.js
npm run watch:css    # em outro terminal

# Build de produção (CSS minificado)
npm run build:css

# Produção
npm start

# Docker
docker build -t pozzitech-lp .
docker run -p 2999:2999 pozzitech-lp
```

> **Importante:** Nunca edite `src/public/css/style.css` diretamente. Edite `src/input.css` e recompile com `npm run build:css` ou `watch:css`.

---

## Design Tokens (tailwind.config.js)

### Cores

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#0A0A0A` | Texto principal |
| `secondary` | `#111827` | Fundos escuros |
| `accent` | `#4F46E5` | Indigo — botões primários, destaques |
| `accent-hover` | `#4338CA` | Hover de accent |
| `accent-light` | `#818CF8` | Accent suavizado, logo |
| `highlight` | `#22C55E` | Verde — métricas positivas, WhatsApp |
| `surface` | `#F9FAFB` | Fundo de seções claras |

### Outros tokens

| Token | Valor |
|---|---|
| `maxWidth.container` | `1200px` |
| `borderRadius.card` | `12px` |
| `boxShadow.card` | `0 4px 24px rgba(0,0,0,0.06)` |
| `boxShadow.glow` | `0 0 40px rgba(79,70,229,0.25)` |

### Fonte

Inter (Google Fonts) com fallback `system-ui, sans-serif`.

---

## Classes CSS Customizadas (src/input.css)

| Classe | Descrição |
|---|---|
| `.btn-primary` | Botão gradiente indigo, hover com scale + glow |
| `.btn-secondary` | Botão transparente com borda branca |
| `.btn-whatsapp` | Botão gradiente verde |
| `.section-tag` | Pílula de label de seção (fundo semi-transparente) |
| `.card` | Card branco com hover lift |
| `.card-dark` | Card escuro translúcido |
| `.gradient-text` | Texto com gradiente roxo→pink via background-clip |
| `.reveal` | Elemento invisível que anima ao entrar na viewport |
| `.reveal.visible` | Estado revelado (opacity 1 + translateY 0) |
| `#header.scrolled` | Header com blur + background escuro após 40px de scroll |

---

## Dados Dinâmicos (homeController.js)

Todos os dados variáveis são injetados pelo controller e disponíveis nas views via EJS (`<%= variavel %>`):

```javascript
{
  meta: {
    title, description, url, image, keywords
  },
  whatsapp: {
    number: '5511989050585',
    message: 'Olá! Gostaria de agendar um diagnóstico gratuito...'
  },
  calendly: {
    url: 'https://calendly.com/felipepozzi/30min'
  },
  faqs: [ { question, answer }, ... ]   // 6 perguntas
}
```

Para alterar número do WhatsApp, mensagem ou link do Calendly: editar apenas `homeController.js`.

---

## Interatividade Frontend (src/public/js/main.js)

| Funcionalidade | Descrição |
|---|---|
| Header scroll | Adiciona `.scrolled` ao `#header` após 40px |
| Menu mobile | Toggle show/hide do `#mobile-menu`; adiciona `.scrolled` ao header quando aberto para garantir background visível |
| Smooth scroll | Offset de 80px para compensar header fixo |
| Reveal on scroll | `IntersectionObserver` com threshold 0.1 e rootMargin `-40px` |
| FAQ acordeão | Fecha os outros ao abrir um; rotaciona ícone 180° |
| Counter animation | Easing ease-out cúbico em 1200ms com `requestAnimationFrame` |
| Grid stagger | `transitionDelay` incremental de 100ms por item (máx 4 colunas) |
| WhatsApp float | Esconde botão flutuante quando teclado virtual abre no mobile |

---

## SEO e Schema

Definido em `head.ejs`:
- Meta tags Open Graph e Twitter Card
- Schema.org `Organization` + `Service` (JSON-LD)
- URL canônica: `https://pozzitech.com.br`
- Imagem OG: `https://pozzitech.com.br/og-image.jpg`

---

## Segurança (server.js)

Helmet configurado com CSP permitindo:
- Scripts: self + Calendly + Google Tag Manager (inline hash)
- Frames: `calendly.com` (para o widget de agendamento)
- Fontes: `fonts.googleapis.com` + `fonts.gstatic.com`
- Imagens: self + `data:`

---

## Docker

Build multi-stage:
1. **builder**: instala todas as deps + compila CSS
2. **production**: copia apenas `node_modules` de prod + artefatos

```dockerfile
# Health check
wget --quiet --tries=1 --spider http://localhost:2999 || exit 1
```

Porta exposta: `2999`. Variável de ambiente: `NODE_ENV=production`.

---

## Responsividade

Breakpoints Tailwind usados:

| Breakpoint | Largura | Uso principal |
|---|---|---|
| (default) | < 640px | Mobile — menu hambúrguer, layout 1 coluna |
| `sm` | ≥ 640px | Botão "Agendar" no header aparece |
| `md` | ≥ 768px | Grids de 2-4 colunas |
| `lg` | ≥ 1024px | Nav desktop aparece, menu mobile some |

---

## Convenções

- **Não usar JavaScript frameworks** — o projeto usa vanilla JS intencionalmente.
- **Não editar `style.css`** — sempre editar `input.css` e recompilar.
- **Dados no controller** — textos de negócio (WhatsApp, Calendly, FAQs) ficam em `homeController.js`, não espalhados nas views.
- **Line endings LF** — enforçado via `.gitattributes` e `.editorconfig`.
- **Indentação:** 2 espaços em todos os arquivos.
