-- ========================================================
-- MIGRAÇÃO: Permitir inserção manual RLS de pais e assinaturas
-- Cole no "SQL Editor" do painel do Supabase e clique em "Run"
-- ========================================================

-- 1. Permitir que usuários autenticados criem sua própria linha na tabela public.parents
CREATE POLICY "Pais podem inserir seu próprio perfil" 
  ON public.parents FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. Permitir que usuários autenticados criem sua própria linha na tabela public.subscriptions
CREATE POLICY "Pais podem inserir suas próprias assinaturas" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = parent_id);
