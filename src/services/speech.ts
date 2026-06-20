import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { LanguageType } from '../context/LocalizationContext';

const LANG_LOCALE_MAP: Record<LanguageType, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  it: 'it-IT',
  es: 'es-ES'
};

// ========================================================
// MAPEAMENTO FONÉTICO DE LETRAS (MÉTODO FÔNICO)
// Quando o TTS recebe uma letra isolada, pronuncia o NOME da letra.
// Este mapa converte a letra para sua representação fonética (o SOM),
// que o motor TTS pronunciará corretamente em cada idioma.
// Ex: Italiano B → "ba" (som /b/) em vez de "bi" (nome da letra)
// ========================================================
const PHONETIC_LETTER_MAP: Record<LanguageType, Record<string, string>> = {
  it: {
    // Metodo fonico italiano: suoni delle lettere (non i nomi)
    A: 'a',  B: 'ba', C: 'ca', D: 'da', E: 'e',  F: 'fa',
    G: 'ga', H: 'a',  I: 'i',  J: 'gia',K: 'ka', L: 'la',
    M: 'ma', N: 'na', O: 'o',  P: 'pa', Q: 'qua',R: 'ra',
    S: 'sa', T: 'ta', U: 'u',  V: 'va', W: 'wa', X: 'csi',
    Y: 'ya', Z: 'za',
  },
  pt: {
    // Método fônico português: sons das letras
    A: 'a',    B: 'be',   C: 'ce',   D: 'de',    E: 'e',     F: 'fe',
    G: 'gue',  H: 'a',    I: 'i',    J: 'je',    K: 'ca',    L: 'le',
    M: 'me',   N: 'ne',   O: 'o',    P: 'pe',    Q: 'que',   R: 're',
    S: 'se',   T: 'te',   U: 'u',    V: 've',    W: 'wa',    X: 'che',
    Y: 'ya',   Z: 'ze',
  },
  en: {
    // English synthetic phonics: consonant sounds
    A: 'ay',  B: 'buh', C: 'cuh', D: 'duh', E: 'eh',  F: 'fuh',
    G: 'guh', H: 'huh', I: 'ih',  J: 'juh', K: 'kuh', L: 'luh',
    M: 'muh', N: 'nuh', O: 'oh',  P: 'puh', Q: 'kwuh',R: 'ruh',
    S: 'suh', T: 'tuh', U: 'uh',  V: 'vuh', W: 'wuh', X: 'ks',
    Y: 'yuh', Z: 'zuh',
  },
  es: {
    // Método fónico español: sonidos de las letras
    A: 'a',  B: 'ba', C: 'ca', D: 'da', E: 'e',  F: 'fa',
    G: 'ga', H: 'a',  I: 'i',  J: 'ja', K: 'ka', L: 'la',
    M: 'ma', N: 'na', O: 'o',  P: 'pa', Q: 'qua',R: 'ra',
    S: 'sa', T: 'ta', U: 'u',  V: 'ba', W: 'ua', X: 'csa',
    Y: 'ya', Z: 'za',
  },
};

/**
 * Converte uma letra isolada para sua representação fonética no idioma indicado.
 * Permite que o TTS pronuncie o SOM da letra em vez do seu NOME.
 * Sílabas e palavras completas são retornadas sem alteração.
 */
const toPhoneticText = (text: string, language: LanguageType): string => {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();
  // Aplicar apenas para letra única (A–Z)
  if (upper.length === 1 && upper >= 'A' && upper <= 'Z') {
    const map = PHONETIC_LETTER_MAP[language];
    if (map && map[upper]) return map[upper];
  }
  return text;
};

// ========================================================
// CONFIGURAÇÕES DA VOZ COM INTEGRAÇÃO DE IA
// ========================================================

// 1. (Recomendado para Produção Segura) URL da sua Edge Function no Supabase.
// Ex: 'https://rhzqijryyjoesuwodiln.supabase.co/functions/v1/tts'
const SUPABASE_TTS_FUNCTION_URL = '';

// 2. (Para testes rápidos na Web) Sua chave de API da OpenAI.
// ATENÇÃO: Não envie para produção com a chave exposta aqui!
const OPENAI_API_KEY = ''

let currentSound: Audio.Sound | null = null;

export const speak = async (text: string, language: LanguageType) => {
  try {
    // Parar qualquer voz anterior
    await stopSpeech();

    // Converter letra isolada para sua representação fonética (som, não nome)
    const phoneticText = toPhoneticText(text, language);
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';

    // OPÇÃO A: Supabase Edge Function (IA Premium Segura - para mobile e web)
    if (SUPABASE_TTS_FUNCTION_URL) {
      const url = `${SUPABASE_TTS_FUNCTION_URL}?text=${encodeURIComponent(phoneticText)}&lang=${locale}`;
      if (Platform.OS === 'web') {
        const htmlAudio = new window.Audio(url);
        (window as any)._currentSpeechAudio = htmlAudio;
        await htmlAudio.play();
      } else {
        await playAudioFromUrl(url);
      }
      return;
    }

    // OPÇÃO B: OpenAI TTS Direta (IA Premium - Testes na Web)
    if (OPENAI_API_KEY && Platform.OS === 'web') {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: phoneticText,
          voice: 'nova', // Voz feminina amigável e nítida para crianças
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const htmlAudio = new window.Audio(audioUrl);
        (window as any)._currentSpeechAudio = htmlAudio;
        htmlAudio.play();
        return;
      }
    }

    // OPÇÃO C: Web Speech API (Nativa do navegador - gratuita, sem CORS, funciona sempre)
    // Esta é a opção padrão para a versão web do app.
    if (Platform.OS === 'web') {
      webSpeechSynth(phoneticText, locale);
      return;
    }

    // OPÇÃO D: Expo Speech (Motor de voz nativo do celular)
    await mobileLocalSpeech(phoneticText, locale);

  } catch (error) {
    console.warn('Erro ao reproduzir voz:', error);
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';
    const phoneticFallback = toPhoneticText(text, language);
    if (Platform.OS === 'web') {
      webSpeechSynth(phoneticFallback, locale);
    } else {
      mobileLocalSpeech(phoneticFallback, locale);
    }
  }
};

/**
 * Web Speech API - API nativa de todos os navegadores modernos.
 * Não requer internet extra, não tem CORS, funciona com voz local do sistema ou da nuvem (Chrome).
 * Lida com carregamento assíncrono de vozes no Chrome (evento voiceschanged).
 */
const selectBestVoice = (locale: string): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find(v => v.lang === locale && v.name.toLowerCase().includes('google')) ||
    voices.find(v => v.lang === locale && !v.localService) ||
    voices.find(v => v.lang === locale) ||
    voices.find(v => v.lang.startsWith(locale.split('-')[0])) ||
    null
  );
};

const doSpeak = (text: string, locale: string) => {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.pitch = 1.15; // Tom ligeiramente infantil
  utterance.rate = 0.88;  // Fala pausada para TDAH
  utterance.volume = 1.0;

  const voice = selectBestVoice(locale);
  if (voice) utterance.voice = voice;

  (window as any)._currentSpeechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

const webSpeechSynth = (text: string, locale: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Web Speech API não disponível neste navegador.');
    return;
  }

  // No Chrome, a lista de vozes carrega de forma assíncrona.
  // Se ainda não estiver pronta, aguarda o evento 'voiceschanged'.
  if (window.speechSynthesis.getVoices().length === 0) {
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      doSpeak(text, locale);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Timeout de segurança: falar mesmo sem vozes premium (usa voz padrão do sistema)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      doSpeak(text, locale);
    }, 500);
  } else {
    doSpeak(text, locale);
  }
};

/**
 * Carrega e toca um arquivo de áudio remoto usando expo-av (ideal para celulares)
 */
const playAudioFromUrl = async (url: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    currentSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } catch (err) {
    console.warn('Erro ao carregar som remoto:', err);
    throw err;
  }
};

/**
 * Motor de voz nativo do sistema operacional (iOS / Android) via expo-speech
 */
const mobileLocalSpeech = async (text: string, locale: string) => {
  await Speech.stop();
  Speech.speak(text, {
    language: locale,
    pitch: 1.15, // Tom infantil/animado
    rate: 0.9,   // Fala pausada para TDAH
  });
};

/**
 * Interrompe qualquer narração em andamento
 */
export const stopSpeech = async () => {
  try {
    // Parar Expo Speech (mobile)
    await Speech.stop();

    // Parar som remoto no celular
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Parar Web Speech API (navegador)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if ((window as any)._currentSpeechAudio) {
        (window as any)._currentSpeechAudio.pause();
        (window as any)._currentSpeechAudio = null;
      }
    }
  } catch (error) {
    console.warn('Erro ao parar reprodução de voz:', error);
  }
};
