-- ========================================================
-- MIGRAÇÃO: Remover gatilho de cadastro que causa falha no Supabase
-- Cole no "SQL Editor" do painel do Supabase e clique em "Run"
-- ========================================================

-- 1. Remove o gatilho da tabela auth.users para evitar falhas no login/signup
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;

-- 2. Opcional: Remove a função correspondente
DROP FUNCTION IF EXISTS public.handle_new_parent_user();
