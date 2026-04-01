-- ============================================================
-- Migration 001 — Chatbot Multi-Tenant: tabelas principais
-- Executar no Supabase SQL Editor
-- ============================================================

-- Tabela de projetos (tenants)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,

  -- Contexto do chatbot
  system_prompt TEXT NOT NULL,
  welcome_message TEXT NOT NULL,

  -- Identificação por canal
  allowed_domains TEXT[] DEFAULT '{}',
  whatsapp_number TEXT,

  -- Configuração do funil (JSON)
  funnel_config JSONB NOT NULL,

  -- Notificações
  notification_email TEXT NOT NULL,
  confirmation_email_template TEXT,
  webhook_url TEXT,

  -- Resend
  resend_from_name TEXT DEFAULT 'Assistente',
  resend_from_email TEXT,

  -- Controle
  is_active BOOLEAN DEFAULT true,
  max_messages_per_session INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_whatsapp ON projects(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active) WHERE is_active = true;

-- Tabela de leads capturados
CREATE TABLE IF NOT EXISTS chat_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) NOT NULL,
  session_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('web', 'whatsapp')),

  -- Campos fixos
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,

  -- Campos dinâmicos por projeto/funil
  custom_fields JSONB DEFAULT '{}',

  -- Log da conversa
  conversation_log JSONB DEFAULT '[]',

  -- Controle
  source TEXT DEFAULT 'chatbot',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_project ON chat_leads(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_channel ON chat_leads(channel);
CREATE INDEX IF NOT EXISTS idx_leads_status ON chat_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON chat_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON chat_leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON chat_leads(phone);

-- Tabela de sessões/conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('web', 'whatsapp')),

  current_step TEXT NOT NULL DEFAULT 'welcome',
  lead_data JSONB DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  message_count INT DEFAULT 0,

  is_completed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_project ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conv_expires ON conversations(expires_at) WHERE is_completed = false;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON chat_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_conv_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
