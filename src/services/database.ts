import { supabase } from './supabase';

// ========================================================
// interfaces/Tipos de Dados do Banco de Dados
// ========================================================

export interface ChildProfile {
  id?: string;
  parent_id: string;
  name: string;
  age: number;
  avatar: string; // ex: 'panda', 'fox', 'boy', 'girl', etc.
  created_at?: string;
}

export interface GameProgress {
  id?: string;
  child_id: string;
  world: string; // ex: 'Mundo das Letras'
  level: number;  // ex: 1, 2, 3...
  score: number;
  stars: number;
  completed: boolean;
  completed_at?: string;
}

export interface GameSession {
  id?: string;
  child_id: string;
  duration: number; // duração total em segundos
  activities_completed: number; // quantidade de desafios resolvidos
  date?: string; // formato YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ChildAchievement {
  id?: string;
  child_id: string;
  achievement_id: string;
  unlocked_at?: string;
}

export interface LetterChallenge {
  id: string;
  letter: string; // CHAR(1)
  image: string | null; // URL ou caminho no Storage
  audio: string | null; // URL ou caminho no Storage
}

export interface WordChallenge {
  id: string;
  word: string;
  image: string | null; // URL ou caminho no Storage
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Subscription {
  id?: string;
  parent_id: string;
  plan: 'free' | 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'expired';
  expires_at?: string | null;
}

// ========================================================
// Funções de Integração com o Supabase
// ========================================================

/**
 * 1. CRIAR PERFIL DE CRIANÇA (children)
 * Insere um novo registro com o nome, idade e avatar escolhido.
 */
export async function createChild(child: Omit<ChildProfile, 'id' | 'created_at'>): Promise<ChildProfile> {
  const { data, error } = await supabase
    .from('children')
    .insert([child])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar perfil de criança:', error.message);
    throw error;
  }
  return data;
}

/**
 * BUSCAR CRIANÇAS DO PAI LOGADO (children)
 * Retorna a lista de crianças vinculadas ao responsável (id do pai vem do auth.users).
 */
export async function getChildren(): Promise<ChildProfile[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar perfis de crianças:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * 2. SALVAR/ATUALIZAR PROGRESSO (progress)
 * Salva a pontuação e estrelas de uma fase. Caso o progresso já exista para aquele
 * mundo e nível, atualiza os dados correspondentes (upsert).
 */
export async function saveProgress(progress: Omit<GameProgress, 'id' | 'completed_at'>): Promise<GameProgress> {
  const completedAt = progress.completed ? new Date().toISOString() : undefined;
  
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        ...progress,
        completed_at: completedAt,
      },
      { onConflict: 'child_id,world,level' }
    )
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar progresso:', error.message);
    throw error;
  }
  return data;
}

/**
 * BUSCAR PROGRESSO DE UMA CRIANÇA (progress)
 * Obtém todo o histórico de progresso de uma criança para mostrar no painel.
 */
export async function getChildProgress(childId: string): Promise<GameProgress[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('child_id', childId)
    .order('level', { ascending: true });

  if (error) {
    console.error('Erro ao buscar progresso da criança:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * 3. REGISTRAR SESSÃO DE JOGO (sessions)
 * Insere a duração da sessão e desafios concluídos para análise de TDAH dos responsáveis.
 */
export async function createSession(session: Omit<GameSession, 'id' | 'date'>): Promise<GameSession> {
  const todayStr = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        ...session,
        date: todayStr,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar sessão de jogo:', error.message);
    throw error;
  }
  return data;
}

/**
 * BUSCAR SESSÕES DE JOGO DE UMA CRIANÇA (sessions)
 * Usado pelo painel dos pais para gerar os gráficos de tempo de uso e evolução.
 */
export async function getChildSessions(childId: string): Promise<GameSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('child_id', childId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar sessões da criança:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * 4. BUSCAR DESAFIOS DE LETRAS (letters_challenges)
 * Retorna todos os desafios de letras cadastrados (leitura de imagens e áudio de Lumi).
 */
export async function getLettersChallenges(): Promise<LetterChallenge[]> {
  const { data, error } = await supabase
    .from('letters_challenges')
    .select('*')
    .order('letter', { ascending: true });

  if (error) {
    console.error('Erro ao buscar desafios de letras:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * BUSCAR DESAFIOS DE PALAVRAS (word_challenges)
 * Retorna todos os desafios de palavras cadastrados para o jogo.
 */
export async function getWordChallenges(): Promise<WordChallenge[]> {
  const { data, error } = await supabase
    .from('word_challenges')
    .select('*')
    .order('word', { ascending: true });

  if (error) {
    console.error('Erro ao buscar desafios de palavras:', error.message);
    throw error;
  }
  return data || [];
}

// ========================================================
// Funções de Conquistas e Assinaturas (Extras Recomendadas)
// ========================================================

/**
 * BUSCAR CONQUISTAS ESTÁTICAS (achievements)
 */
export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Erro ao buscar lista de conquistas:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * DESBLOQUEAR UMA CONQUISTA PARA A CRIANÇA (child_achievements)
 */
export async function unlockAchievement(childId: string, achievementId: string): Promise<ChildAchievement> {
  const { data, error } = await supabase
    .from('child_achievements')
    .upsert(
      {
        child_id: childId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      },
      { onConflict: 'child_id,achievement_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Erro ao desbloquear conquista:', error.message);
    throw error;
  }
  return data;
}

/**
 * BUSCAR CONQUISTAS DESBLOQUEADAS DE UMA CRIANÇA
 */
export async function getChildUnlockedAchievements(childId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('child_achievements')
    .select('*, achievements(*)')
    .eq('child_id', childId);

  if (error) {
    console.error('Erro ao buscar conquistas desbloqueadas:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * BUSCAR ASSINATURA ATIVA DO PAI (subscriptions)
 */
export async function getParentSubscription(parentId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('parent_id', parentId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar assinatura:', error.message);
    throw error;
  }
  return data;
}
