'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { validate } = require('./validators');

let anthropicClient;
function getAnthropic() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY não configurada');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// ── Utilitários ──────────────────────────────────────────────

function findStep(steps, stepId) {
  return steps.find(s => s.id === stepId) || null;
}

/** Substitui {variavel} pelo valor em leadData */
function interpolate(template, leadData) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => leadData[key] || '');
}

function buildChips(options) {
  if (!options || !options.length) return null;
  return options.map(o => ({ label: o.label, value: o.value || o.label }));
}

// ── IA ───────────────────────────────────────────────────────

async function callAI(systemPrompt, messageHistory, userMessage) {
  // Usa apenas as últimas 10 trocas para contexto, evitando tokens desnecessários
  const history = (messageHistory || [])
    .filter(m => m.role && m.content)
    .slice(-10)
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 1000) }));

  history.push({ role: 'user', content: userMessage });

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    system: systemPrompt,
    messages: history,
  });

  return response.content[0].text;
}

// ── Apresentação do próximo passo ────────────────────────────

function presentStep(step, leadData) {
  if (!step) return null;
  let message = null;

  if (step.message) {
    message = interpolate(step.message, leadData);
  } else if (step.transition_message) {
    message = step.transition_message;
  } else if (step.type === 'ai_only' || step.type === 'free_chat') {
    message = 'Claro! Me conta sua dúvida. 😊';
  }

  const chips = step.type === 'chips' ? buildChips(step.options) : null;
  const inputDisabled = step.type === 'chips';

  return { message, chips, inputDisabled };
}

// ── Engine principal ─────────────────────────────────────────

/**
 * Processa uma mensagem do usuário contra o passo atual do funil.
 *
 * @returns {object} {
 *   reply, nextStepId, chips, followUp,
 *   inputDisabled, triggerLeadCapture, updatedLeadData
 * }
 */
async function processMessage(userInput, session, project) {
  const { funnel_config, system_prompt } = project;
  const { steps } = funnel_config;
  const leadData = { ...(session.lead_data || {}) };
  const messageHistory = session.messages || [];

  const currentStep = findStep(steps, session.current_step);
  if (!currentStep) throw new Error(`Step não encontrado: ${session.current_step}`);

  let reply = '';
  let nextStepId = currentStep.id; // default: permanece no mesmo passo
  let chips = null;
  let followUp = null;
  let inputDisabled = false;
  let triggerLeadCapture = false;

  switch (currentStep.type) {

    // ── Chips: opções clicáveis ──────────────────────────────
    case 'chips': {
      const options = currentStep.options || [];
      const input = userInput.toLowerCase().trim();

      let matched = options.find(o =>
        (o.value || o.label).toLowerCase() === input ||
        o.label.toLowerCase() === input
      );

      // Fallback: aceita texto livre se alguma opção tiver allow_free_input
      if (!matched) {
        const freeOpt = options.find(o => o.allow_free_input);
        if (freeOpt) matched = { ...freeOpt, value: userInput };
      }

      if (!matched) {
        reply = 'Por favor, escolha uma das opções acima. 👆';
        chips = buildChips(options);
        inputDisabled = true;
        break;
      }

      if (currentStep.field) {
        leadData[currentStep.field] = matched.value || matched.label;
      }

      nextStepId = matched.next_step;

      if (currentStep.ai_response_after) {
        // Chama IA para resposta empática; entrega próximo passo como followUp
        const context = `[O usuário respondeu "${matched.label}" para: "${currentStep.message}". Responda de forma empática e personalizada em 1-2 frases curtas, sem repetir a pergunta e sem pedir mais informações ainda.]`;
        reply = await callAI(system_prompt, messageHistory, context);
        followUp = presentStep(findStep(steps, nextStepId), leadData);
      } else {
        const next = findStep(steps, nextStepId);
        const presented = presentStep(next, leadData);
        if (presented) {
          reply = presented.message || '';
          chips = presented.chips;
          inputDisabled = presented.inputDisabled;
        }
      }
      break;
    }

    // ── Coleta de campo com validação ────────────────────────
    case 'collect_field': {
      const result = validate(userInput, currentStep.validation);
      if (!result.valid) {
        reply = result.message || 'Entrada inválida. Tente novamente.';
        break; // permanece no mesmo passo
      }

      if (currentStep.field) {
        leadData[currentStep.field] = userInput.trim();
      }

      nextStepId = currentStep.next_step;
      let nextStep = findStep(steps, nextStepId);

      // Se o próximo for confirmation, processa imediatamente (mesmo request)
      if (nextStep && nextStep.type === 'confirmation') {
        reply = interpolate(nextStep.message, leadData);
        if (nextStep.trigger_lead_capture) triggerLeadCapture = true;
        nextStepId = nextStep.next_step || nextStepId;
        nextStep = findStep(steps, nextStepId);
      } else if (nextStep) {
        const presented = presentStep(nextStep, leadData);
        reply = presented?.message || '';
        chips = presented?.chips || null;
        inputDisabled = presented?.inputDisabled || false;
      }

      // Após processar confirmation, verifica se próximo tem chips
      if (nextStep && nextStep.type === 'chips' && !chips) {
        chips = buildChips(nextStep.options);
        inputDisabled = true;
      }
      break;
    }

    // ── Passo de confirmação (acessado diretamente, edge case) ─
    case 'confirmation': {
      reply = interpolate(currentStep.message, leadData);
      if (currentStep.trigger_lead_capture) triggerLeadCapture = true;
      nextStepId = currentStep.next_step || currentStep.id;
      const nextStep = findStep(steps, nextStepId);
      if (nextStep && nextStep.type === 'chips') {
        chips = buildChips(nextStep.options);
        inputDisabled = true;
      }
      break;
    }

    // ── Chat livre com IA ────────────────────────────────────
    case 'ai_only':
    case 'free_chat': {
      reply = await callAI(system_prompt, messageHistory, userInput);
      // Permanece no mesmo passo
      break;
    }

    default: {
      reply = currentStep.message
        ? interpolate(currentStep.message, leadData)
        : 'Como posso te ajudar?';
      if (currentStep.next_step) nextStepId = currentStep.next_step;
    }
  }

  return {
    reply,
    nextStepId,
    chips,
    followUp,
    inputDisabled,
    triggerLeadCapture,
    updatedLeadData: leadData,
  };
}

module.exports = { processMessage, findStep, interpolate, buildChips, presentStep };
