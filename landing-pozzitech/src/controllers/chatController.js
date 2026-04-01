'use strict';

const { loadProject } = require('../lib/chatbot/project-loader');
const { getSession, updateSession } = require('../lib/chatbot/session-store');
const { processMessage, findStep, buildChips, presentStep } = require('../lib/chatbot/engine');
const { getClient } = require('../lib/supabase');
const rateLimiter = require('../lib/chatbot/rate-limiter');
const { sendLeadSummaryEmail, sendLeadNotificationEmail } = require('../lib/email');

// Slug do projeto desta landing page (configurável por env)
const PROJECT_SLUG = process.env.CHATBOT_PROJECT_SLUG || 'pozzitech';

// ── Sanitização básica de input ──────────────────────────────

function sanitizeInput(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, 500)
    .replace(/[<>]/g, ''); // evita injeção básica de HTML
}

function isValidSessionId(id) {
  return typeof id === 'string' && /^[\w\-]{8,64}$/.test(id);
}

// ── Captura de lead ──────────────────────────────────────────

async function captureLead(project, sessionId, leadData, messages) {
  const leadFields = project.funnel_config.lead_fields || [];
  const fixedFields = new Set(['name', 'email', 'phone']);
  const customFields = {};

  for (const field of leadFields) {
    if (!fixedFields.has(field) && leadData[field] != null) {
      customFields[field] = leadData[field];
    }
  }

  // Salva no Supabase
  const { error: insertError } = await getClient()
    .from('chat_leads')
    .insert({
      project_id: project.id,
      session_id: sessionId,
      channel: 'web',
      name: leadData.name || 'Não informado',
      email: leadData.email || null,
      phone: leadData.phone || 'Não informado',
      custom_fields: customFields,
      conversation_log: messages.slice(-30),
      source: 'chatbot',
      status: 'new',
    });

  if (insertError) {
    console.error('[lead-capture] Supabase insert error:', insertError.message);
  }

  // Envia emails (fire-and-forget)
  const emailPayload = {
    name: leadData.name || 'Visitante',
    email: leadData.email,
    phone: leadData.phone,
    segment: leadData.segment || leadData.segmento || null,
    challenge: leadData.challenge || leadData.desafio || null,
  };

  if (leadData.email) sendLeadSummaryEmail(emailPayload);
  sendLeadNotificationEmail(emailPayload);

  // Notifica n8n (fire-and-forget — não bloqueia a resposta ao usuário)
  const webhookUrl = project.webhook_url || process.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        project_slug: project.slug,
        channel: 'web',
        lead: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          custom_fields: customFields,
          conversation_log: messages.slice(-30),
        },
        notification_email: project.notification_email,
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(err => console.error('[lead-webhook]', err.message));
  }
}

// ── GET /api/chat/init ───────────────────────────────────────
// Inicializa sessão e retorna a mensagem de boas-vindas + chips do 1º passo

async function handleInit(req, res) {
  const { sessionId } = req.query;

  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ error: 'sessionId inválido.' });
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!rateLimiter.check(ip)) {
    return res.status(429).json({ error: 'Muitas requisições. Aguarde alguns minutos.' });
  }

  try {
    const project = await loadProject(PROJECT_SLUG);
    if (!project) return res.status(503).json({ error: 'Serviço indisponível.' });

    const session = await getSession(sessionId, project.id, 'web');
    const steps = project.funnel_config.steps;
    const currentStep = findStep(steps, session.current_step);

    if (!currentStep) return res.status(500).json({ error: 'Configuração inválida.' });

    const isNewSession = session.message_count === 0;
    const presented = presentStep(currentStep, session.lead_data || {});

    return res.json({
      greeting: isNewSession ? project.welcome_message : 'Continuando por onde paramos... 😊',
      message: presented?.message || null,
      chips: presented?.chips || null,
      inputDisabled: presented?.inputDisabled || false,
    });
  } catch (err) {
    console.error('[chat/init]', err.message);
    return res.status(503).json({ error: 'Serviço indisponível.' });
  }
}

// ── POST /api/chat ───────────────────────────────────────────
// Processa mensagem do usuário e retorna resposta do funil/IA

async function handleMessage(req, res) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  if (!rateLimiter.check(ip)) {
    return res.status(429).json({ reply: 'Muitas mensagens. Aguarde alguns minutos.' });
  }

  const { sessionId, message, selectedChip } = req.body || {};

  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ reply: 'Sessão inválida.' });
  }

  const userInput = sanitizeInput(selectedChip || message);
  if (!userInput) {
    return res.status(400).json({ reply: 'Mensagem inválida.' });
  }

  try {
    const project = await loadProject(PROJECT_SLUG);
    if (!project) return res.status(503).json({ reply: 'Serviço indisponível. Fale pelo WhatsApp.' });

    const session = await getSession(sessionId, project.id, 'web');

    // Limite de mensagens por sessão
    if (session.message_count >= project.max_messages_per_session) {
      return res.json({
        reply: 'Chegamos ao limite desta conversa. 😊 Entre em contato pelo WhatsApp para continuar!',
        nextStep: 'limit_reached',
      });
    }

    const result = await processMessage(userInput, session, project);

    // Histórico para contexto da IA (mantém últimas 20 trocas)
    const updatedMessages = [
      ...(session.messages || []),
      { role: 'user', content: userInput },
      { role: 'assistant', content: result.reply },
    ].slice(-20);

    await updateSession(sessionId, {
      current_step: result.nextStepId,
      lead_data: result.updatedLeadData,
      messages: updatedMessages,
      message_count: session.message_count + 1,
      is_completed: result.triggerLeadCapture ? true : session.is_completed,
    });

    if (result.triggerLeadCapture) {
      await captureLead(project, sessionId, result.updatedLeadData, updatedMessages);
    }

    return res.json({
      reply: result.reply,
      chips: result.chips || null,
      followUp: result.followUp || null,
      inputDisabled: result.inputDisabled || false,
      nextStep: result.nextStepId,
      isLeadComplete: result.triggerLeadCapture || false,
    });
  } catch (err) {
    console.error('[chat/message]', err.message);
    return res.status(503).json({ reply: 'Ops, algo deu errado. Fale pelo WhatsApp 😊' });
  }
}

module.exports = { handleInit, handleMessage };
