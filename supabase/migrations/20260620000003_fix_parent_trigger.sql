-- ========================================================
-- MIGRAÇÃO: Correção do Gatilho e Email Nullable
-- Cole no "SQL Editor" do painel do Supabase e clique em "Run"
-- ========================================================

-- 1. Remove a restrição de NOT NULL da coluna email na tabela parents
ALTER TABLE public.parents 
  ALTER COLUMN email DROP NOT NULL;

-- 2. Atualiza a função do gatilho para usar COALESCE e tratar emails nulos de forma segura
CREATE OR REPLACE FUNCTION public.handle_new_parent_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.parents (id, email)
  VALUES (
    new.id, 
    COALESCE(new.email, 'sem-email@oauth.com')
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.subscriptions (parent_id, plan, status)
  VALUES (new.id, 'free', 'active')
  ON CONFLICT (parent_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
