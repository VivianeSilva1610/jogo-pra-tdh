import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pswmbqlafywaxphsrloe.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1V-eYBqCdiwkYTj0ra5Myw_lVQnNmfh';

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
  parentId: string // auth_user_id
): Promise<ChildProgressProfile | null> => {
  try {
    const { data: cp, error: cpError } = await supabase
      .from('child_profiles')
      .select(`*, families!inner(auth_user_id)`)
      .eq('id', childId)
      .eq('families.auth_user_id', parentId)
      .maybeSingle();

    if (cpError) {
      console.warn('Erro ao carregar perfil da criança:', cpError.message);
      return null;
    }

    if (!cp) return null;

    const { data: rp, error: rpError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('child_profile_id', childId)
      .maybeSingle();

    // Extrair estrelas do jsonb
    const starsByGame = cp.stars_by_game || {};
    const stars = starsByGame['aventura_das_letras'] || 0;

    return {
      stars: stars,
      coins: cp.seeds ?? 0,
      challengesCompleted: rp?.challenges_completed ?? 0,
      character: cp.avatar ?? null,
      avatarName: rp?.avatar_name ?? null,
      equippedClothing: rp?.equipped_clothing ?? null,
      unlockedStickers: cp.unlocked_stickers ?? [],
      unlockedClothing: rp?.unlocked_clothing ?? [],
      learnedLetters: rp?.learned_letters ?? [],
      masteredSyllables: rp?.mastered_syllables ?? [],
      readWords: rp?.read_words ?? [],
      dailyUsageSeconds: rp?.daily_usage_seconds ?? {}, // Note: might need another place for daily_usage if not in reading_progress, but let's assume reading_progress or child_profiles
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
    // 1. Fetch current child_profile to merge jsonb and add seeds
    const { data: cp } = await supabase
      .from('child_profiles')
      .select('seeds, stars_by_game')
      .eq('id', childId)
      .maybeSingle();
      
    const currentStars = cp?.stars_by_game || {};
    const newStars = { ...currentStars, aventura_das_letras: profile.stars };

    const { error: cpError } = await supabase
      .from('child_profiles')
      .update({
        seeds: profile.coins, // O certo seria incrementar, mas syncChildProfile envia o total
        stars_by_game: newStars,
        avatar: profile.character ?? 'panda',
        unlocked_stickers: profile.unlockedStickers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', childId);

    if (cpError) {
      console.warn('Erro ao atualizar child_profiles na nuvem:', cpError.message);
    }

    // 2. Upsert in reading_progress
    const { error: rpError } = await supabase
      .from('reading_progress')
      .upsert(
        {
          child_profile_id: childId,
          challenges_completed: profile.challengesCompleted,
          avatar_name: profile.avatarName ?? null,
          equipped_clothing: profile.equippedClothing,
          unlocked_clothing: profile.unlockedClothing,
          learned_letters: profile.learnedLetters,
          mastered_syllables: profile.masteredSyllables,
          read_words: profile.readWords,
          daily_usage_seconds: profile.dailyUsageSeconds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'child_profile_id' }
      );

    if (rpError) {
      console.warn('Erro ao sincronizar reading_progress na nuvem:', rpError.message);
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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('child_profiles')
      .select('*, families!inner(auth_user_id)')
      .eq('families.auth_user_id', userData.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Erro ao buscar filhos:', error.message);
      return [];
    }
    // Rename lang to preferred_language to keep compatibility with UI
    return (data ?? []).map((c: any) => ({
      ...c,
      preferred_language: c.lang
    }));
  } catch (err) {
    console.warn('Erro inesperado ao buscar filhos:', err);
    return [];
  }
};

/**
 * Lê o pin_hash do responsável para o gate do Portal dos Pais.
 */
export const getParentPinHash = async (parentId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('parent_pin_hash')
      .eq('auth_user_id', parentId)
      .maybeSingle();

    if (error || !data) return null;
    return data.parent_pin_hash ?? null;
  } catch {
    return null;
  }
};

/**
 * Salva um novo pin_hash no Supabase para o responsável.
 */
export const setParentPinHash = async (parentId: string, pinHash: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('families')
      .update({ parent_pin_hash: pinHash })
      .eq('auth_user_id', parentId);

    return !error;
  } catch {
    return false;
  }
};

/**
 * Remove um filho e seu perfil de progresso (CASCADE cuida do profiles).
 */
export const deleteChild = async (childId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .delete()
      .eq('id', childId)
      .select();

    if (error) {
      console.warn('Erro ao remover criança:', error.message);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.warn('Nenhuma linha foi removida. Talvez você não tenha permissão.');
      return { success: false, error: 'Perfil não encontrado ou sem permissão para remover.' };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Erro inesperado ao remover criança:', err);
    return { success: false, error: err.message || String(err) };
  }
};

/**
 * Lê a assinatura do responsável e deriva isPremium.
 * Fonte de verdade para o freemium; chamado no carregamento do GameContext.
 */
export const loadParentSubscription = async (
  parentId: string
): Promise<{ isPremium: boolean; currentPeriodEnd: string | null; plan: string }> => {
  try {
    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('auth_user_id', parentId)
      .maybeSingle();

    if (!family) return { isPremium: false, currentPeriodEnd: null, plan: 'free' };

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, current_period_end, admin_granted_until')
      .eq('family_id', family.id)
      .maybeSingle();

    if (error || !data) return { isPremium: false, currentPeriodEnd: null, plan: 'free' };

    const now = new Date();
    const isPremium =
      (data.plan === 'premium' &&
        data.current_period_end != null &&
        new Date(data.current_period_end) > now) ||
      (data.admin_granted_until != null &&
        new Date(data.admin_granted_until) > now);

    return {
      isPremium: !!isPremium,
      currentPeriodEnd: data.current_period_end ?? null,
      plan: data.plan ?? 'free',
    };
  } catch (err) {
    console.warn('Erro ao carregar assinatura:', err);
    return { isPremium: false, currentPeriodEnd: null, plan: 'free' };
  }
};

/**
 * Chama a Edge Function stripe-checkout e retorna a URL de pagamento.
 * type: 'checkout' → nova assinatura | 'portal' → gerenciar assinatura existente
 */
export const createStripeSession = async (
  type: 'checkout' | 'portal' = 'checkout'
): Promise<string | null> => {
  try {
    const { data, error } = await (supabase as any).functions.invoke('stripe-checkout', {
      body: { type },
    });
    if (error) { console.warn('Stripe session error:', error); return null; }
    return data?.url ?? null;
  } catch (err) {
    console.warn('Erro ao criar sessão Stripe:', err);
    return null;
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
    // Buscar o family_id do parentId
    const { data: family, error: famError } = await supabase
      .from('families')
      .select('id')
      .eq('auth_user_id', parentId)
      .maybeSingle();

    let familyId = family?.id;

    if (!familyId) {
      // Cria a family se nao existir
      const { data: newFam, error: newFamError } = await supabase
        .from('families')
        .insert([{ auth_user_id: parentId }])
        .select()
        .single();
      
      if (newFamError || !newFam) {
        console.warn('Erro ao criar family:', newFamError?.message);
        return null;
      }
      familyId = newFam.id;
    }

    // 1. Criar a criança em child_profiles
    const { data: child, error: childError } = await supabase
      .from('child_profiles')
      .insert([{ family_id: familyId, name, avatar, lang: 'pt' }]) // age was in old schema, maybe not in new, add if needed or ignore
      .select()
      .single();

    if (childError || !child) {
      console.warn('Erro ao criar criança:', childError?.message);
      return null;
    }

    // 2. Inicializar perfil de progresso zerado em reading_progress
    await supabase.from('reading_progress').insert([{
      child_profile_id: child.id,
      learned_letters: [],
      mastered_syllables: [],
      read_words: [],
      daily_usage_seconds: {},
      unlocked_clothing: [],
      challenges_completed: 0
    }]);

    // Retorna com preferred_language para UI
    return {
      ...child,
      preferred_language: child.lang
    };
  } catch (err) {
    console.warn('Erro ao criar criança com perfil:', err);
    return null;
  }
};
