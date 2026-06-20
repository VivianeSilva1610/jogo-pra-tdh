-- ========================================================
-- MIGRAÇÃO: Adicionar nome personalizado do avatar
-- Cole no "SQL Editor" do painel do Supabase
-- ========================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_name TEXT;
