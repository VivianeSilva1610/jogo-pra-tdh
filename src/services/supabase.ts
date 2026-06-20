import { Platform } from 'react-native';
const { createClient } = require('@supabase/supabase-js');

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

// Sincronizar o progresso local com a nuvem quando logado
export const uploadGameProgress = async (
  userId: string,
  progress: {
    character: string | null;
    equippedClothing: string | null;
    stars: number;
    coins: number;
    challengesCompleted: number;
    isPremium: boolean;
  }
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        character: progress.character || 'panda',
        equipped_clothing: progress.equippedClothing,
        stars: progress.stars,
        coins: progress.coins,
        challenges_completed: progress.challengesCompleted,
        is_premium: progress.isPremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (err) {
    console.warn('Erro ao sincronizar perfil com o Supabase:', err);
  }
};

// Sincronizar adesivos comprados
export const uploadStickerUnlock = async (userId: string, stickerId: string) => {
  try {
    await supabase
      .from('sticker_collections')
      .upsert({
        profile_id: userId,
        sticker_id: stickerId,
        unlocked_at: new Date().toISOString()
      }, { onConflict: 'profile_id,sticker_id' });
  } catch (err) {
    console.warn('Erro ao sincronizar adesivos com o Supabase:', err);
  }
};

// Sincronizar roupas compradas
export const uploadClothingUnlock = async (userId: string, clothingId: string) => {
  try {
    await supabase
      .from('clothing_inventories')
      .upsert({
        profile_id: userId,
        clothing_id: clothingId,
        unlocked_at: new Date().toISOString()
      }, { onConflict: 'profile_id,clothing_id' });
  } catch (err) {
    console.warn('Erro ao sincronizar inventário com o Supabase:', err);
  }
};

// Sincronizar logs de uso diário
export const uploadDailyUsage = async (userId: string, dayName: string, secondsPlayed: number) => {
  try {
    await supabase
      .from('daily_usage_logs')
      .upsert({
        profile_id: userId,
        day_name: dayName,
        seconds_played: secondsPlayed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'profile_id,day_name' });
  } catch (err) {
    console.warn('Erro ao sincronizar logs de uso com o Supabase:', err);
  }
};

// Sincronizar progresso escolar
export const uploadAcademicProgress = async (userId: string, itemType: 'letter' | 'syllable' | 'word', itemValue: string) => {
  try {
    await supabase
      .from('academic_progress')
      .upsert({
        profile_id: userId,
        item_type: itemType,
        item_value: itemValue.toUpperCase(),
        unlocked_at: new Date().toISOString()
      }, { onConflict: 'profile_id,item_type,item_value' });
  } catch (err) {
    console.warn('Erro ao sincronizar progresso escolar com o Supabase:', err);
  }
};
