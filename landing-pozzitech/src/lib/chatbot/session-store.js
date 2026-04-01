'use strict';

const { getClient } = require('../supabase');

// Cache em memória de sessões ativas
const cache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos (mais agressivo que projetos)
const SESSION_TTL_HOURS = 24;

function setCache(sessionId, session) {
  cache.set(sessionId, { session, cachedAt: Date.now() });
}

function getCache(sessionId) {
  const entry = cache.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    cache.delete(sessionId);
    return null;
  }
  return entry.session;
}

/**
 * Busca ou cria uma sessão no Supabase.
 * @param {string} sessionId  UUID gerado pelo cliente
 * @param {string} projectId  UUID do projeto
 * @param {string} channel    'web' | 'whatsapp'
 */
async function getSession(sessionId, projectId, channel = 'web') {
  const cached = getCache(sessionId);
  if (cached) return cached;

  const { data, error } = await getClient()
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    setCache(sessionId, data);
    return data;
  }

  // Cria nova sessão
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const { data: created, error: createError } = await getClient()
    .from('conversations')
    .insert({
      project_id: projectId,
      session_id: sessionId,
      channel,
      current_step: 'welcome',
      lead_data: {},
      messages: [],
      message_count: 0,
      is_completed: false,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (createError) throw createError;

  setCache(sessionId, created);
  return created;
}

/**
 * Atualiza campos de uma sessão e invalida o cache.
 */
async function updateSession(sessionId, updates) {
  const { data, error } = await getClient()
    .from('conversations')
    .update(updates)
    .eq('session_id', sessionId)
    .select()
    .single();

  if (error) throw error;

  setCache(sessionId, data);
  return data;
}

// Limpa cache expirado a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of cache.entries()) {
    if (now - entry.cachedAt > CACHE_TTL_MS) cache.delete(id);
  }
}, 5 * 60 * 1000).unref();

module.exports = { getSession, updateSession };
