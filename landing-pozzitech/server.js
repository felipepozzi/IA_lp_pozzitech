'use strict';

require('dotenv').config();

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const routes = require('./src/routes/index');
const chatRoutes = require('./src/routes/chat');

const app = express();
const PORT = process.env.PORT || 2999;

// ── Segurança ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://assets.calendly.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://calendly.com"],
      connectSrc: ["'self'"],
    },
  },
}));

// ── Compressão ───────────────────────────────────────────────
app.use(compression());

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));

// ── Arquivos estáticos ───────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
app.use(express.static(path.join(__dirname, 'src/public'), {
  maxAge: isDev ? 0 : '1y',
  etag: true,
  lastModified: true,
}));

// ── Template engine ──────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ── Rotas ────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/', routes);

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).redirect('/');
});

// ── Versão de assets (cache-busting) ─────────────────────────
// Calculada uma vez na inicialização: muda a cada restart/deploy
app.locals.assetVersion = Date.now();

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✓ PozziTech Landing rodando em http://localhost:${PORT}\n`);
});
