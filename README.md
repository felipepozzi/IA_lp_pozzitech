# PozziTech — Landing Page

Landing page de conversão B2B para a **PozziTech**, consultoria de automação com IA para PMEs. O objetivo é capturar leads qualificados via agendamento de diagnóstico gratuito (Calendly) ou WhatsApp.

## Stack

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js >= 18 + Express 4 |
| Templates | EJS |
| CSS | Tailwind CSS 3.4 |
| JS Frontend | Vanilla JS |
| Deploy | Docker (multi-stage, Node 20 Alpine) |
| Porta | 2999 |

## Pré-requisitos

- Node.js >= 18
- npm

## Instalação

```bash
cd landing-pozzitech
npm install
```

## Desenvolvimento

```bash
# Terminal 1 — servidor com auto-reload
npm run dev

# Terminal 2 — watch de CSS
npm run watch:css
```

Acesse: [http://localhost:2999](http://localhost:2999)

## Build e Produção

```bash
# Compilar CSS minificado
npm run build:css

# Iniciar servidor
npm start
```

## Docker

```bash
docker build -t pozzitech-lp .
docker run -p 2999:2999 pozzitech-lp
```

## Variáveis de Ambiente

Crie um arquivo `.env` em `landing-pozzitech/` com as seguintes variáveis:

```env
SUPABASE_URL=
SUPABASE_KEY=
RESEND_API_KEY=
NOTIFICATION_EMAIL=
```

## Estrutura

```
landing-pozzitech/
├── server.js                   # entrada da aplicação Express
├── src/
│   ├── input.css               # fonte Tailwind (editar aqui)
│   ├── controllers/
│   │   └── homeController.js   # dados passados para a view
│   ├── routes/
│   │   └── index.js
│   ├── public/
│   │   ├── css/style.css       # CSS gerado (não editar)
│   │   ├── js/main.js
│   │   └── images/
│   └── views/
│       ├── index.ejs
│       └── partials/           # hero, problem, solution, results, ...
```

> **Nunca edite `src/public/css/style.css` diretamente.** Edite `src/input.css` e recompile.

## Configuração

Para alterar número do WhatsApp, mensagem padrão ou link do Calendly, edite apenas `src/controllers/homeController.js`.
