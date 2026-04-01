-- ============================================================
-- Migration 002 — Seed: Projeto PozziTech (Consultoria IA)
-- Executar após 001_chatbot_tables.sql
-- ============================================================

INSERT INTO projects (
  slug,
  name,
  system_prompt,
  welcome_message,
  allowed_domains,
  funnel_config,
  notification_email,
  webhook_url,
  resend_from_name,
  resend_from_email,
  is_active,
  max_messages_per_session
) VALUES (
  'pozzitech',
  'PozziTech — Consultoria de Automação com IA',

  -- System prompt
  'Você é o assistente virtual da PozziTech, consultoria especializada em automação com IA para pequenas e médias empresas brasileiras. Seu objetivo é qualificar leads e incentivar o agendamento do Diagnóstico Gratuito de 30 minutos.

Sobre a PozziTech:
- Especialistas em automação de processos repetitivos com IA
- Soluções: atendimento ao cliente com IA, CRM automatizado, integração de sistemas, análise de dados e relatórios automáticos
- Atende todos os segmentos: varejo, saúde, serviços, logística, construção civil, tecnologia e mais
- Resultados típicos: 40% de redução em tarefas manuais, ROI recuperado em 3-6 meses
- Diagnóstico Gratuito: sessão de 30 minutos, sem compromisso, mapeia processos e apresenta oportunidades reais

Tom de voz: profissional, acolhedor e direto. Use emojis com moderação. Responda sempre em português brasileiro. Seja conciso (máximo 3 frases por resposta). Foque em valor para o negócio do lead. Encoraje o agendamento do diagnóstico quando pertinente.

Restrições importantes:
- Nunca invente casos de clientes ou métricas específicas
- Não forneça preços ou valores de projetos
- Não prometa resultados garantidos
- Foque em entender o negócio do lead e mostrar como a automação pode ajudá-lo',

  -- Mensagem de boas-vindas
  'Olá! 👋 Sou o assistente da PozziTech. Vou te ajudar a descobrir como a automação com IA pode transformar o seu negócio.',

  -- Domínios permitidos
  ARRAY['pozzitech.com.br', 'www.pozzitech.com.br', 'localhost'],

  -- Configuração do funil
  '{
    "steps": [
      {
        "id": "welcome",
        "type": "chips",
        "message": "Como posso te ajudar hoje?",
        "options": [
          { "label": "Quero saber mais sobre automação com IA", "value": "saber_mais", "next_step": "segment" },
          { "label": "Agendar diagnóstico gratuito", "value": "agendar", "next_step": "collect_name" },
          { "label": "Tenho uma dúvida", "value": "duvida", "next_step": "free_chat" }
        ]
      },
      {
        "id": "segment",
        "type": "chips",
        "message": "Qual o segmento da sua empresa?",
        "field": "segment",
        "options": [
          { "label": "Comércio / Varejo", "value": "comercio", "next_step": "pain" },
          { "label": "Saúde / Clínicas", "value": "saude", "next_step": "pain" },
          { "label": "Serviços", "value": "servicos", "next_step": "pain" },
          { "label": "Indústria / Logística", "value": "industria", "next_step": "pain" },
          { "label": "Outro segmento", "value": "outro", "next_step": "pain", "allow_free_input": true }
        ]
      },
      {
        "id": "pain",
        "type": "chips",
        "message": "Qual o maior desafio do seu negócio hoje?",
        "field": "pain_point",
        "ai_response_after": true,
        "options": [
          { "label": "Tarefas repetitivas que tomam muito tempo", "value": "automacao", "next_step": "collect_name" },
          { "label": "Atendimento ao cliente lento ou caro", "value": "atendimento", "next_step": "collect_name" },
          { "label": "Dificuldade em analisar dados", "value": "dados", "next_step": "collect_name" },
          { "label": "Altos custos operacionais", "value": "custos", "next_step": "collect_name" },
          { "label": "Outro desafio", "value": "outro", "next_step": "collect_name", "allow_free_input": true }
        ]
      },
      {
        "id": "collect_name",
        "type": "collect_field",
        "message": "Para agendar seu diagnóstico gratuito, qual o seu nome?",
        "field": "name",
        "validation": "min:2",
        "next_step": "collect_email"
      },
      {
        "id": "collect_email",
        "type": "collect_field",
        "message": "Qual o seu melhor e-mail, {name}?",
        "field": "email",
        "validation": "email",
        "next_step": "collect_phone"
      },
      {
        "id": "collect_phone",
        "type": "collect_field",
        "message": "E um telefone com DDD para contato?",
        "field": "phone",
        "validation": "phone_br",
        "next_step": "confirmed"
      },
      {
        "id": "confirmed",
        "type": "confirmation",
        "message": "Perfeito, {name}! 🎉 Entraremos em contato em até 24h para confirmar sua sessão de diagnóstico gratuito. Tem alguma dúvida enquanto isso?",
        "trigger_lead_capture": true,
        "next_step": "free_chat"
      },
      {
        "id": "free_chat",
        "type": "ai_only",
        "transition_message": "Claro! Me conta sua dúvida. 😊",
        "message": null
      }
    ],
    "lead_fields": ["name", "email", "phone", "segment", "pain_point"]
  }'::jsonb,

  -- Email de notificação (substitua pelo seu)
  'felipe@pozzitech.com.br',

  -- Webhook n8n pós-captura (substitua pela URL real)
  'http://localhost:5678/webhook/lead-captured',

  -- Resend
  'PozziTech',
  'assistente@pozzitech.com.br',

  true,
  10
)
ON CONFLICT (slug) DO UPDATE SET
  system_prompt = EXCLUDED.system_prompt,
  welcome_message = EXCLUDED.welcome_message,
  funnel_config = EXCLUDED.funnel_config,
  notification_email = EXCLUDED.notification_email,
  is_active = EXCLUDED.is_active,
  updated_at = now();
