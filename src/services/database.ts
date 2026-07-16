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
  preferred_language?: string;
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
  family_id: string;
  plan: 'free' | 'premium' | 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'expired';
  expires_at?: string | null;
  // Phase 1: payment provider + admin grant
  provider?: string | null;
  provider_subscription_id?: string | null;
  provider_customer_id?: string | null;
  current_period_end?: string | null;
  admin_granted_until?: string | null;
}

export interface ParentalConsent {
  id?: string;
  parent_id: string;
  child_id: string;
  terms_version: string;
  consented_at?: string;
}

export interface GameEvent {
  id?: string;
  session_id?: string;
  profile_id: string;
  game_key: string;
  event_type: string;
  target?: string;
  target_type?: 'letter' | 'syllable' | 'word' | 'instruction' | 'sequence' | 'image' | 'rule';
  response_value?: string;
  correct?: boolean;
  response_time_ms?: number;
  error_type?: 'omissao' | 'substituicao' | 'inversao' | 'acrescimo' | 'impulsiva';
  emotion?: 'tranquilo' | 'neutro' | 'irritado' | 'chorou';
  context?: 'after_error' | 'after_wait' | 'after_loss' | 'general';
  occurred_at?: string;
}


// ========================================================
// Funções de Integração com o Supabase
// ========================================================

/**
 * 1. CRIAR PERFIL DE CRIANÇA (children)
 * Insere um novo registro com o nome, idade e avatar escolhido.
 */
export async function createChild(child: Omit<ChildProfile, 'id' | 'created_at'>): Promise<ChildProfile> {
  // Mock para adaptar o schema antigo. O ideal é usar createChildWithProfile do supabase.ts
  const { data: family } = await supabase.from('families').select('id').eq('auth_user_id', child.parent_id).single();
  const famId = family?.id;
  
  const { data, error } = await supabase
    .from('child_profiles')
    .insert([{ family_id: famId, name: child.name, avatar: child.avatar, lang: child.preferred_language || 'pt' }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar perfil de criança:', error.message);
    throw error;
  }
  return { ...data, preferred_language: data.lang, parent_id: child.parent_id };
}

/**
 * BUSCAR CRIANÇAS DO PAI LOGADO (children)
 * Retorna a lista de crianças vinculadas ao responsável (id do pai vem do auth.users).
 */
export async function getChildren(): Promise<ChildProfile[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('child_profiles')
    .select('*, families!inner(auth_user_id)')
    .eq('families.auth_user_id', userData.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar perfis de crianças:', error.message);
    throw error;
  }
  return (data || []).map((c: any) => ({
    ...c,
    preferred_language: c.lang
  }));
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
 * 3.4. INICIAR SESSÃO DE MINIJOGO (game_sessions)
 * Cria a sessão no início do jogo para possibilitar o registro de eventos amarrados a ela.
 */
export async function startGameSession(childId: string, gameKey: string): Promise<string> {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([{
      profile_id: childId,
      game_key: gameKey,
      start_time: new Date().toISOString(),
      status: 'in_progress', // Ou similar, dependendo do esquema exato
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao criar game_session:', error.message);
    throw error;
  }
  return data.id;
}

/**
 * 3.4. FINALIZAR SESSÃO DE MINIJOGO (game_sessions)
 * Atualiza a sessão indicando conclusão e salvando dados sumarizados (opcional).
 */
export async function endGameSession(sessionId: string, updates: any = {}): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      end_time: new Date().toISOString(),
      status: 'completed',
      ...updates
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Erro ao finalizar game_session:', error.message);
    throw error;
  }
}

/**
 * 3.5. REGISTRAR EVENTO DE JOGO (game_events)
 * Salva um evento analítico de gameplay (ex: resposta correta, tempo de resposta).
 */
export async function logGameEvent(event: Omit<GameEvent, 'id' | 'occurred_at'>): Promise<GameEvent> {
  const { data, error } = await supabase
    .from('game_events')
    .insert([
      {
        ...event,
        occurred_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar evento de jogo:', error.message);
    throw error;
  }
  return data;
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
  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('auth_user_id', parentId)
    .maybeSingle();

  if (!family) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('family_id', family.id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar assinatura:', error.message);
    throw error;
  }
  return data;
}

/**
 * INSERIR CONSENTIMENTO PARENTAL LGPD/COPPA
 * Usa upsert para garantir idempotência (mesmo child + versão não duplica).
 */
export async function insertParentalConsent(
  parentId: string,
  childId: string,
  termsVersion: string
): Promise<ParentalConsent> {
  const { data, error } = await supabase
    .from('parental_consents')
    .upsert(
      { parent_id: parentId, child_id: childId, terms_version: termsVersion },
      { onConflict: 'child_id,terms_version' }
    )
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar consentimento parental:', error.message);
    throw error;
  }
  return data;
}
