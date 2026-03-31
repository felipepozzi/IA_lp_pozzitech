'use strict';

// Rate limiter in-memory por IP
// Upgrade path: substituir por Redis sem mudar a interface pública

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 40;           // requisições por janela por IP

const store = new Map();

function check(ip) {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

// Limpa entradas expiradas a cada 5 minutos para evitar vazamento de memória
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(ip);
  }
}, 5 * 60 * 1000).unref();

module.exports = { check };
