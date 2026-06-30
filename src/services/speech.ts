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
    // Metodo fonico italiano: suoni delle lettere per TTS
    // Invece del nome della lettera ("bi", "effe"), usiamo il suono fonico ("be", "fe") con accento grave per forzare la pronuncia aperta
    A: 'a',    B: 'bè',   C: 'cè',   D: 'dè',   E: 'e',    F: 'fè',
    G: 'gè',   H: 'acca', I: 'i',    J: 'i lunga', K: 'cappa', L: 'lè',
    M: 'mè',   N: 'nè',   O: 'o',    P: 'pè',   Q: 'qu',   R: 'rè',
    S: 'sè',   T: 'tè',   U: 'u',    V: 'vè',   W: 'doppia vu', X: 'ics',
    Y: 'i greca', Z: 'zè',
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
    A: 'a',  B: 'be',  C: 'ce',  D: 'de', E: 'e',  F: 'efe',
    G: 'gue',H: 'a',   I: 'i',   J: 'je', K: 'ca', L: 'ele',
    M: 'eme',N: 'ene', O: 'o',   P: 'pe', Q: 'cu', R: 'erre',
    S: 'ese',T: 'te',  U: 'u',   V: 'uve',W: 'uve doble', X: 'equis',
    Y: 'ye', Z: 'ceta',
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
    // E converter para minúsculas para evitar que o motor de voz (TTS) soletre sílabas e palavras em maiúsculas (ex: "MA" lido como "M. A.")
    const phoneticText = toPhoneticText(text, language).toLowerCase();
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
      webSpeechSynth(phoneticText, locale, language);
      return;
    }

    // OPÇÃO D: Expo Speech (Motor de voz nativo do celular)
    await mobileLocalSpeech(phoneticText, locale, language);

  } catch (error) {
    console.warn('Erro ao reproduzir voz:', error);
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';
    const phoneticFallback = toPhoneticText(text, language);
    if (Platform.OS === 'web') {
      webSpeechSynth(phoneticFallback, locale, language);
    } else {
      mobileLocalSpeech(phoneticFallback, locale, language);
    }
  }
};

/**
 * Web Speech API - API nativa de todos os navegadores modernos.
 * Não requer internet extra, não tem CORS, funciona com voz local do sistema ou da nuvem (Chrome).
 * Lida com carregamento assíncrono de vozes no Chrome (evento voiceschanged).
 */
// ========================================================
// PARÂMETROS DE VOZ POR IDIOMA
// Ajuste fino de velocidade e tom para melhor dicção em cada língua
// ========================================================
const LANG_RATE_MAP: Record<LanguageType, number> = {
  pt: 0.88,
  en: 0.88,
  it: 0.88,  // Aumentar para evitar som robótico/picotado
  es: 0.85,
};

const LANG_PITCH_MAP: Record<LanguageType, number> = {
  pt: 1.15,
  en: 1.10,
  it: 1.10,  // Tom um pouco mais agudo/infantil alegre
  es: 1.10,
};

// Nomes de vozes de alta qualidade conhecidas, por idioma (ordem de preferência)
const PREFERRED_VOICE_NAMES: Record<LanguageType, string[]> = {
  it: ['Google italiano', 'Alice', 'Paola', 'Luca', 'Federica', 'Cosimo', 'Elsa'],
  pt: ['Google português do Brasil', 'Google português', 'Luciana', 'Fernanda', 'Joana'],
  en: ['Google US English', 'Google UK English Female', 'Samantha', 'Karen', 'Moira'],
  es: ['Google español', 'Google español de Estados Unidos', 'Monica', 'Paulina', 'Jorge'],
};

const selectBestVoice = (locale: string, language: LanguageType): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = PREFERRED_VOICE_NAMES[language] || [];

  // 1. Tentar voz preferida por nome exato (locale exato)
  for (const name of preferred) {
    const found = voices.find(v => v.lang === locale && v.name.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }

  // 2. Tentar voz preferida por nome (qualquer locale compatível)
  for (const name of preferred) {
    const found = voices.find(v => v.lang.startsWith(locale.split('-')[0]) && v.name.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }

  // 3. Voz Google no locale exato
  const googleExact = voices.find(v => v.lang === locale && v.name.toLowerCase().includes('google'));
  if (googleExact) return googleExact;

  // 4. Qualquer voz de rede (online) no locale exato
  const networkExact = voices.find(v => v.lang === locale && !v.localService);
  if (networkExact) return networkExact;

  // 5. Qualquer voz local no locale exato
  const localExact = voices.find(v => v.lang === locale);
  if (localExact) return localExact;

  // 6. Fallback: qualquer voz compatível com o idioma base
  return voices.find(v => v.lang.startsWith(locale.split('-')[0])) || null;
};

const doSpeak = (text: string, locale: string, language: LanguageType) => {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.pitch  = LANG_PITCH_MAP[language] ?? 1.1;
  utterance.rate   = LANG_RATE_MAP[language]  ?? 0.88;
  utterance.volume = 1.0;

  const voice = selectBestVoice(locale, language);
  if (voice) utterance.voice = voice;

  (window as any)._currentSpeechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

const webSpeechSynth = (text: string, locale: string, language: LanguageType) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Web Speech API não disponível neste navegador.');
    return;
  }

  // No Chrome, a lista de vozes carrega de forma assíncrona.
  if (window.speechSynthesis.getVoices().length === 0) {
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      doSpeak(text, locale, language);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Timeout de segurança: falar mesmo sem vozes premium (usa voz padrão do sistema)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      doSpeak(text, locale, language);
    }, 600);
  } else {
    doSpeak(text, locale, language);
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
const mobileLocalSpeech = async (text: string, locale: string, language?: LanguageType) => {
  await Speech.stop();
  const rate  = language ? (LANG_RATE_MAP[language]  ?? 0.88) : 0.88;
  const pitch = language ? (LANG_PITCH_MAP[language] ?? 1.1)  : 1.1;
  Speech.speak(text, {
    language: locale,
    pitch,
    rate,
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
