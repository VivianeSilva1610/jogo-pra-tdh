-- ========================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - AVENTURA DAS LETRAS
-- Cole este código no "SQL Editor" do painel do Supabase
-- ========================================================

-- 1. Tabela PARENTS (Responsáveis) - Relacionado com auth.users do Supabase
CREATE TABLE public.parents (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela CHILDREN (Crianças)
CREATE TABLE public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    avatar VARCHAR(255) DEFAULT 'panda',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela PROGRESS (Progresso das Fases)
CREATE TABLE public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    world VARCHAR(100) NOT NULL, -- e.g. 'Mundo das Letras'
    level INTEGER NOT NULL,      -- e.g. 1, 2, 3
    score INTEGER DEFAULT 0 NOT NULL,
    stars INTEGER DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Impede duplicidade de registro de progresso para a mesma fase da mesma criança
    CONSTRAINT unique_child_level UNIQUE (child_id, world, level)
);

-- 4. Tabela SESSIONS (Sessões de Jogo - Métricas de TDAH)
CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    duration INTEGER DEFAULT 0 NOT NULL, -- em segundos
    activities_completed INTEGER DEFAULT 0 NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 5. Tabela ACHIEVEMENTS (Conquistas Estáticas)
CREATE TABLE public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL
);

-- 6. Tabela CHILD_ACHIEVEMENTS (Conquistas Desbloqueadas pelas Crianças)
CREATE TABLE public.child_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_child_achievement UNIQUE (child_id, achievement_id)
);

-- 7. Tabela LETTERS_CHALLENGES (Desafios de Letras)
CREATE TABLE public.letters_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    letter CHAR(1) NOT NULL UNIQUE,
    image VARCHAR(255), -- Caminho da imagem no Storage
    audio VARCHAR(255)  -- Caminho do áudio no Storage
);

-- 8. Tabela WORD_CHALLENGES (Desafios de Palavras)
CREATE TABLE public.word_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word VARCHAR(100) NOT NULL UNIQUE,
    image VARCHAR(255), -- Caminho da imagem no Storage
    difficulty VARCHAR(50) DEFAULT 'easy' -- 'easy', 'medium', 'hard'
);

-- 9. Tabela SUBSCRIPTIONS (Assinaturas Premium)
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan VARCHAR(50) DEFAULT 'free' NOT NULL, -- 'free', 'monthly', 'annual'
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- 'active', 'canceled', 'expired'
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- ATIVAR SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ========================================================

-- Responsáveis (Parents)
CREATE POLICY "Pais podem ver seu próprio perfil" ON public.parents FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Pais podem atualizar seu próprio perfil" ON public.parents FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Pais podem inserir seu próprio perfil" ON public.parents FOR INSERT WITH CHECK (auth.uid() = id);

-- Crianças (Children)
CREATE POLICY "Pais podem ver dados de seus filhos" ON public.children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Pais podem gerenciar dados de seus filhos" ON public.children FOR ALL USING (auth.uid() = parent_id);

-- Progresso (Progress)
CREATE POLICY "Pais podem ver o progresso dos seus filhos" ON public.progress FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.children WHERE id = progress.child_id AND parent_id = auth.uid()));

CREATE POLICY "Pais podem atualizar/inserir progresso dos filhos" ON public.progress FOR ALL 
USING (EXISTS (SELECT 1 FROM public.children WHERE id = progress.child_id AND parent_id = auth.uid()));

-- Sessões (Sessions)
CREATE POLICY "Pais podem ver as sessoes dos filhos" ON public.sessions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.children WHERE id = sessions.child_id AND parent_id = auth.uid()));

CREATE POLICY "Pais podem inserir sessoes dos filhos" ON public.sessions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.children WHERE id = child_id AND parent_id = auth.uid()));

-- Conquistas do Filho (Child Achievements)
CREATE POLICY "Pais podem ver conquistas dos filhos" ON public.child_achievements FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.children WHERE id = child_achievements.child_id AND parent_id = auth.uid()));

CREATE POLICY "Pais podem adicionar conquistas aos filhos" ON public.child_achievements FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.children WHERE id = child_id AND parent_id = auth.uid()));

-- Assinaturas (Subscriptions)
CREATE POLICY "Pais podem ver suas assinaturas" ON public.subscriptions FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Pais podem inserir suas próprias assinaturas" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Desafios e Conquistas Estáticas (Leitura livre para usuários logados)
CREATE POLICY "Permitir leitura para usuarios autenticados" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura de desafios de letras" ON public.letters_challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura de desafios de palavras" ON public.word_challenges FOR SELECT TO authenticated USING (true);

-- ========================================================
-- GATILHO AUTOMÁTICO (TRIGGER) NO CADASTRO DE USUÁRIO
-- ========================================================
-- Cria automaticamente uma linha na tabela parents quando um novo usuário se cadastra no Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_parent_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.parents (id, email)
  VALUES (new.id, new.email);
  
  -- Cria uma assinatura gratuita padrão inicial
  INSERT INTO public.subscriptions (parent_id, plan, status)
  VALUES (new.id, 'free', 'active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registra o gatilho
CREATE OR REPLACE TRIGGER on_auth_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_parent_user();
