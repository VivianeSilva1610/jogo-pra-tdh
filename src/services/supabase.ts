import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rhzqijryyjoesuwodiln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoenFpanJ5eWpvZXN1d29kaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzkzMTMsImV4cCI6MjA5NzI1NTMxM30.6kaptqeEmOp2YFqDmnZXO79iiVZUsUQcRboPefe5xTo';

const createSupabaseClient = createClient as any;

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web'
  }
});

// ========================================================
// Tipos de Perfil por Criança
// ========================================================

export interface ChildProgressProfile {
  stars: number;
  coins: number;
  challengesCompleted: number;
  character: string | null;
  avatarName: string | null;
  equippedClothing: string | null;
  unlockedStickers: string[];
  unlockedClothing: string[];
  learnedLetters: string[];
  masteredSyllables: string[];
  readWords: string[];
  dailyUsageSeconds: Record<string, number>;
  isPremium: boolean;
}

// ========================================================
// Funções de Sincronização de Progresso por Criança
// ========================================================

/**
 * Carrega o perfil de progresso de uma criança da nuvem.
 * Retorna null se não encontrar (criança nova, sem progresso salvo).
 */
export const loadChildProfile = async (
  childId: string,
  parentId: string
): Promise<ChildProgressProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', childId)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao carregar perfil da criança:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      stars: data.stars ?? 0,
      coins: data.coins ?? 0,
      challengesCompleted: data.challenges_completed ?? 0,
      character: data.character ?? null,
      avatarName: data.avatar_name ?? null,
      equippedClothing: data.equipped_clothing ?? null,
      unlockedStickers: data.unlocked_stickers ?? [],
      unlockedClothing: data.unlocked_clothing ?? [],
      learnedLetters: data.learned_letters ?? [],
      masteredSyllables: data.mastered_syllables ?? [],
      readWords: data.read_words ?? [],
      dailyUsageSeconds: data.daily_usage_seconds ?? {},
      isPremium: false, // gerido via subscriptions
    };
  } catch (err) {
    console.warn('Erro inesperado ao carregar perfil:', err);
    return null;
  }
};

/**
 * Sincroniza o progresso completo de uma criança com o Supabase.
 * Usa upsert para criar ou atualizar.
 */
export const syncChildProfile = async (
  childId: string,
  parentId: string,
  profile: ChildProgressProfile
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: childId,
          parent_id: parentId,
          stars: profile.stars,
          coins: profile.coins,
          challenges_completed: profile.challengesCompleted,
          character: profile.character ?? 'panda',
          avatar_name: profile.avatarName ?? null,
          equipped_clothing: profile.equippedClothing,
          unlocked_stickers: profile.unlockedStickers,
          unlocked_clothing: profile.unlockedClothing,
          learned_letters: profile.learnedLetters,
          mastered_syllables: profile.masteredSyllables,
          read_words: profile.readWords,
          daily_usage_seconds: profile.dailyUsageSeconds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Erro ao sincronizar perfil na nuvem:', error.message);
    }
  } catch (err) {
    console.warn('Erro inesperado ao sincronizar perfil:', err);
  }
};

/**
 * Busca a lista de filhos vinculados ao pai logado.
 */
export const fetchChildren = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Erro ao buscar filhos:', error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn('Erro inesperado ao buscar filhos:', err);
    return [];
  }
};

/**
 * Cria um perfil de filho no Supabase e inicializa o perfil de progresso.
 */
export const createChildWithProfile = async (
  parentId: string,
  name: string,
  age: number,
  avatar: string
): Promise<any | null> => {
  try {
    // 1. Criar a criança
    const { data: child, error: childError } = await supabase
      .from('children')
      .insert([{ parent_id: parentId, name, age, avatar }])
      .select()
      .single();

    if (childError || !child) {
      console.warn('Erro ao criar criança:', childError?.message);
      return null;
    }

    // 2. Inicializar perfil de progresso zerado
    await supabase.from('profiles').insert([{
      id: child.id,
      parent_id: parentId,
      stars: 0,
      coins: 0,
      challenges_completed: 0,
      character: avatar,
      unlocked_stickers: [],
      unlocked_clothing: [],
      learned_letters: [],
      mastered_syllables: [],
      read_words: [],
      daily_usage_seconds: {},
    }]);

    return child;
  } catch (err) {
    console.warn('Erro ao criar criança com perfil:', err);
    return null;
  }
};
