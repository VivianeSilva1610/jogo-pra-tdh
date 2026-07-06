-- ============================================================
-- Fase 1: Portal dos Pais / Freemium
-- Execute no Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Gate de PIN para o Portal dos Pais
ALTER TABLE parents
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- 2. Enriquecimento do perfil da criança
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'pt';

-- 3. Campos do provedor de pagamento + grant de acesso admin
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_granted_until TIMESTAMPTZ;

-- 4. Tabela de consentimento parental LGPD/COPPA (NOVA)
CREATE TABLE IF NOT EXISTS parental_consents (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id      UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  child_id       UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  terms_version  TEXT NOT NULL,
  consented_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(child_id, terms_version)
);

ALTER TABLE parental_consents ENABLE ROW LEVEL SECURITY;

-- Responsável só acessa seus próprios registros de consentimento
-- (parents.id = auth.uid() neste projeto)
CREATE POLICY "parent_owns_consents" ON parental_consents
  FOR ALL USING (parent_id = auth.uid());
