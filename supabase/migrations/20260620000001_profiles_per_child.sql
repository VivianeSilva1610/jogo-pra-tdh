-- ========================================================
-- MIGRAÇÃO: Tabela profiles para progresso isolado por criança
-- Cole no "SQL Editor" do painel do Supabase
-- ========================================================

-- Tabela PROFILES (Progresso do jogo por criança)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES public.children(id) ON DELETE CASCADE PRIMARY KEY,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
    -- Progresso geral
    stars INTEGER DEFAULT 0 NOT NULL,
    coins INTEGER DEFAULT 0 NOT NULL,
    challenges_completed INTEGER DEFAULT 0 NOT NULL,
    -- Seleção de personagem e roupa
    character VARCHAR(50) DEFAULT 'panda',
    equipped_clothing VARCHAR(100),
    -- Itens desbloqueados (arrays JSON)
    unlocked_stickers JSONB DEFAULT '[]'::jsonb NOT NULL,
    unlocked_clothing JSONB DEFAULT '[]'::jsonb NOT NULL,
    -- Progresso educacional
    learned_letters JSONB DEFAULT '[]'::jsonb NOT NULL,
    mastered_syllables JSONB DEFAULT '[]'::jsonb NOT NULL,
    read_words JSONB DEFAULT '[]'::jsonb NOT NULL,
    -- Tempo de uso por dia da semana (JSON: {"Dom":0,"Seg":120,...})
    daily_usage_seconds JSONB DEFAULT '{}'::jsonb NOT NULL,
    -- Controle
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas o pai da criança acessa o perfil dela
CREATE POLICY "Pai pode ver perfis de suas crianças"
    ON public.profiles FOR SELECT
    USING (auth.uid() = parent_id);

CREATE POLICY "Pai pode inserir perfis de suas crianças"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Pai pode atualizar perfis de suas crianças"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = parent_id);

CREATE POLICY "Pai pode apagar perfis de suas crianças"
    ON public.profiles FOR DELETE
    USING (auth.uid() = parent_id);
