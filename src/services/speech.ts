import * as Speech from 'expo-speech';
import { LanguageType } from '../context/LocalizationContext';

const LANG_LOCALE_MAP: Record<LanguageType, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  it: 'it-IT',
  es: 'es-ES'
};

let currentSpeechPromise: Promise<void> | null = null;

export const speak = async (text: string, language: LanguageType) => {
  try {
    // Parar qualquer narração em andamento antes de falar
    await Speech.stop();
    
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';
    
    Speech.speak(text, {
      language: locale,
      pitch: 1.15, // Um tom ligeiramente mais agudo e infantil/animado
      rate: 0.9,   // Uma fala ligeiramente mais lenta para melhor legibilidade no TDAH
    });
  } catch (error) {
    console.warn('Erro ao reproduzir voz (TTS):', error);
  }
};

export const stopSpeech = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn('Erro ao parar voz (TTS):', error);
  }
};
