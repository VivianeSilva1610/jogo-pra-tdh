-- 1. Criar Tabela de Perfis de Jogador (ligado ao auth.users do Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    character VARCHAR(50) DEFAULT 'panda',
    equipped_clothing VARCHAR(100) DEFAULT NULL,
    stars INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Coleção de Adesivos Unlocked (Stickers Album)
CREATE TABLE public.sticker_collections (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sticker_id VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (profile_id, sticker_id)
);

-- 3. Loja de Roupas Desbloqueadas (Inventory)
CREATE TABLE public.clothing_inventories (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    clothing_id VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (profile_id, clothing_id)
);

-- 4. Logs de Tempo de Uso Diário
CREATE TABLE public.daily_usage_logs (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_name VARCHAR(10) NOT NULL, -- 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
    seconds_played INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (profile_id, day_name)
);

-- 5. Progresso Acadêmico de Alfabetização
CREATE TABLE public.academic_progress (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'letter', 'syllable', 'word'
    item_value VARCHAR(100) NOT NULL, -- e.g. 'A', 'MA', 'CASA'
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (profile_id, item_type, item_value)
);

-- HABILITAR RLS (Row Level Security) EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticker_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_progress ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS DE RLS (Usuários autenticados só lêem/escrevem seus próprios registros)

-- Perfis
CREATE POLICY "Usuários autenticados podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários autenticados podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Usuários autenticados podem criar seu próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Adesivos
CREATE POLICY "Usuários autenticados podem ver seus adesivos"
ON public.sticker_collections FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Usuários autenticados podem adicionar adesivos"
ON public.sticker_collections FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Roupas
CREATE POLICY "Usuários autenticados podem ver seu guarda-roupas"
ON public.clothing_inventories FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Usuários autenticados podem adicionar roupas compradas"
ON public.clothing_inventories FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Tempo de Uso
CREATE POLICY "Usuários autenticados podem ler seus logs de uso"
ON public.daily_usage_logs FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Usuários autenticados podem salvar logs de uso"
ON public.daily_usage_logs FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Progresso Escolar
CREATE POLICY "Usuários autenticados podem ver seu progresso escolar"
ON public.academic_progress FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Usuários autenticados podem adicionar progresso escolar"
ON public.academic_progress FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- TRIGGER AUTOMÁTICO: Criar perfil automaticamente no cadastro do auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, character, stars, coins, challenges_completed, is_premium)
  VALUES (new.id, 'panda', 0, 0, 0, false);
  
  -- Inicializar logs de uso diário zerados
  INSERT INTO public.daily_usage_logs (profile_id, day_name, seconds_played)
  VALUES 
    (new.id, 'Dom', 0),
    (new.id, 'Seg', 0),
    (new.id, 'Ter', 0),
    (new.id, 'Qua', 0),
    (new.id, 'Qui', 0),
    (new.id, 'Sex', 0),
    (new.id, 'Sáb', 0);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
