'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { handleInit, handleMessage } = require('../controllers/chatController');

// ── Rate Limiting (express-rate-limit) ───────────────────────
// POST /api/chat: máx 10 mensagens/minuto por IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { reply: 'Muitas mensagens. Aguarde 1 minuto antes de continuar.' },
  skipSuccessfulRequests: false,
});

// GET /api/chat/init: máx 5 inits/hora por IP (limita abuso de leads)
const initLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições de inicialização. Tente mais tarde.' },
});

router.get('/init', initLimiter, handleInit);
router.post('/', chatLimiter, handleMessage);

module.exports = router;
