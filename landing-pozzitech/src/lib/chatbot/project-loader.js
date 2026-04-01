'use strict';

const { getClient } = require('../supabase');

// Cache em memória: slug → { project, cachedAt }
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Carrega um projeto pelo slug, com cache em memória de 5 min.
 * Retorna o projeto ou null se não encontrado / inativo.
 */
async function loadProject(slug) {
  const now = Date.now();
  const cached = cache.get(slug);

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.project;
  }

  const { data, error } = await getClient()
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('[project-loader]', error?.message || 'projeto não encontrado:', slug);
    return null;
  }

  cache.set(slug, { project: data, cachedAt: now });
  return data;
}

/** Invalida o cache de um projeto (útil ao atualizar config). */
function invalidate(slug) {
  cache.delete(slug);
}

module.exports = { loadProject, invalidate };
