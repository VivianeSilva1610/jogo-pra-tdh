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
// ========================================================
const PHONETIC_LETTER_MAP: Record<LanguageType, Record<string, string>> = {
  it: {
    A: 'a',    B: 'bè',   C: 'cè',   D: 'dè',   E: 'e',    F: 'fè',
    G: 'gè',   H: 'acca', I: 'i',    J: 'i lunga', K: 'cappa', L: 'lè',
    M: 'mè',   N: 'nè',   O: 'o',    P: 'pè',   Q: 'qu',   R: 'rè',
    S: 'sè',   T: 'tè',   U: 'u',    V: 'vè',   W: 'doppia vu', X: 'ics',
    Y: 'i greca', Z: 'zè',
  },
  pt: {
    A: 'a',    B: 'be',   C: 'ce',   D: 'de',    E: 'e',     F: 'fe',
    G: 'gue',  H: 'a',    I: 'i',    J: 'je',    K: 'ca',    L: 'le',
    M: 'me',   N: 'ne',   O: 'o',    P: 'pe',    Q: 'que',   R: 're',
    S: 'se',   T: 'te',   U: 'u',    V: 've',    W: 'wa',    X: 'che',
    Y: 'ya',   Z: 'ze',
  },
  en: {
    A: 'ay',  B: 'buh', C: 'cuh', D: 'duh', E: 'eh',  F: 'fuh',
    G: 'guh', H: 'huh', I: 'ih',  J: 'juh', K: 'kuh', L: 'luh',
    M: 'muh', N: 'nuh', O: 'oh',  P: 'puh', Q: 'kwuh',R: 'ruh',
    S: 'suh', T: 'tuh', U: 'uh',  V: 'vuh', W: 'wuh', X: 'ks',
    Y: 'yuh', Z: 'zuh',
  },
  es: {
    A: 'a',  B: 'be',  C: 'ce',  D: 'de', E: 'e',  F: 'efe',
    G: 'gue',H: 'a',   I: 'i',   J: 'je', K: 'ca', L: 'ele',
    M: 'eme',N: 'ene', O: 'o',   P: 'pe', Q: 'cu', R: 'erre',
    S: 'ese',T: 'te',  U: 'u',   V: 'uve',W: 'uve doble', X: 'equis',
    Y: 'ye', Z: 'ceta',
  },
};

const toPhoneticText = (text: string, language: LanguageType): string => {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();
  if (upper.length === 1 && upper >= 'A' && upper <= 'Z') {
    const map = PHONETIC_LETTER_MAP[language];
    if (map && map[upper]) return map[upper];
  }
  return text;
};

// ========================================================
// CONFIGURAÇÕES DE TTS
// ========================================================

// ElevenLabs API Key
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

// Supabase Edge Function (alternativa segura para produção)
const SUPABASE_TTS_FUNCTION_URL = '';

// OpenAI TTS (alternativa para testes na Web)
const OPENAI_API_KEY = '';

let currentSound: Audio.Sound | null = null;

// ========================================================
// ÁUDIOS PRÉ-GERADOS: Cache local de frases repetitivas
// Esses áudios foram gerados uma vez com Google Cloud TTS
// e são reproduzidos instantaneamente sem chamada de API.
// ========================================================
const PREGENERATED_AUDIO: Record<string, Record<string, any>> = {
  pt: {
    'vamos tentar novamente?': require('../../assets/audio/voices/pt/tryAgain.mp3'),
    'muito bem!': require('../../assets/audio/voices/pt/wellDone.mp3'),
    'fantástico!': require('../../assets/audio/voices/pt/fantastic.mp3'),
    'incrível!': require('../../assets/audio/voices/pt/amazing.mp3'),
    'você consegue!': require('../../assets/audio/voices/pt/youCanDoIt.mp3'),
    'o portão do castelo se abriu!': require('../../assets/audio/voices/pt/castleOpened.mp3'),
    'perfeito!!!': require('../../assets/audio/voices/pt/perfect_1.mp3'),
    'incrível! você mandou bem!': require('../../assets/audio/voices/pt/perfect_2.mp3'),
    'arrasou! 3 de 3!': require('../../assets/audio/voices/pt/perfect_3.mp3'),
  },
  en: {
    "let's try again?": require('../../assets/audio/voices/en/tryAgain.mp3'),
    'well done!': require('../../assets/audio/voices/en/wellDone.mp3'),
    'fantastic!': require('../../assets/audio/voices/en/fantastic.mp3'),
    'amazing!': require('../../assets/audio/voices/en/amazing.mp3'),
    'you can do it!': require('../../assets/audio/voices/en/youCanDoIt.mp3'),
    'the castle gate has opened!': require('../../assets/audio/voices/en/castleOpened.mp3'),
    'perfect!!!': require('../../assets/audio/voices/en/perfect_1.mp3'),
    'amazing! you nailed it!': require('../../assets/audio/voices/en/perfect_2.mp3'),
    'flawless! 3 for 3!': require('../../assets/audio/voices/en/perfect_3.mp3'),
  },
  it: {
    'riproviamo?': require('../../assets/audio/voices/it/tryAgain.mp3'),
    'ben fatto!': require('../../assets/audio/voices/it/wellDone.mp3'),
    'fantastico!': require('../../assets/audio/voices/it/fantastic.mp3'),
    'incredibile!': require('../../assets/audio/voices/it/amazing.mp3'),
    "ce la puoi fare!": require('../../assets/audio/voices/it/youCanDoIt.mp3'),
    "il portone del castelo si è aperto!": require('../../assets/audio/voices/it/castleOpened.mp3'),
    'perfetto!!!': require('../../assets/audio/voices/it/perfect_1.mp3'),
    "incredibile! ce l'hai fatta!": require('../../assets/audio/voices/it/perfect_2.mp3'),
    'perfetto! 3 su 3!': require('../../assets/audio/voices/it/perfect_3.mp3'),
  },
  es: {
    '¿intentamos de nuevo?': require('../../assets/audio/voices/es/tryAgain.mp3'),
    '¡muy bien!': require('../../assets/audio/voices/es/wellDone.mp3'),
    '¡fantástico!': require('../../assets/audio/voices/es/fantastic.mp3'),
    '¡increíble!': require('../../assets/audio/voices/es/amazing.mp3'),
    '¡tú puedes!': require('../../assets/audio/voices/es/youCanDoIt.mp3'),
    '¡el portón del castillo se ha abierto!': require('../../assets/audio/voices/es/castleOpened.mp3'),
    '¡perfecto!!!': require('../../assets/audio/voices/es/perfect_1.mp3'),
    '¡increíble! ¡lo lograste!': require('../../assets/audio/voices/es/perfect_2.mp3'),
    '¡sin errores! 3 de 3!': require('../../assets/audio/voices/es/perfect_3.mp3'),
  },
};

/**
 * Verifica se o texto corresponde a um áudio pré-gerado.
 * Retorna o asset do require() ou null se não encontrado.
 */
const findPregeneratedAudio = (text: string, language: LanguageType): any | null => {
  const langCache = PREGENERATED_AUDIO[language];
  if (!langCache) return null;
  // Normalizar para minúsculas e remover emojis/espaços extras
  const normalized = text.toLowerCase().replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  return langCache[normalized] || null;
};

/**
 * Reproduz um áudio pré-gerado (asset local) usando expo-av.
 */
const playPregeneratedAudio = async (asset: any): Promise<void> => {
  if (Platform.OS === 'web') {
    // Na web, usar expo-av com o asset
    const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });
    currentSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } else {
    // No mobile, expo-av carrega assets nativamente
    const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });
    currentSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });
  }
};

// ========================================================
// ELEVENLABS TTS
// Vozes de altíssima qualidade (multilingual)
// ========================================================

// Voz por idioma — usar vozes otimizadas para cada língua
// IDs disponíveis em: https://elevenlabs.io/voice-library
const ELEVENLABS_VOICE_MAP: Record<LanguageType, string> = {
  pt: 'EXAVITQu4vr4xnSDxMaL', // Bella — feminina, boa em PT-BR
  en: 'EXAVITQu4vr4xnSDxMaL', // Bella — feminina, nativa em EN
  it: 'XB0fDUnXU5powFXDhCwa', // Charlotte — multilingual, excelente em IT
  es: 'EXAVITQu4vr4xnSDxMaL', // Bella — funciona bem em ES
};

// ISO 639-1 codes aceitos pelo eleven_multilingual_v2
const ELEVENLABS_LANG_CODE: Record<LanguageType, string> = {
  pt: 'pt',
  en: 'en',
  it: 'it',
  es: 'es',
};

/**
 * Chama a API do ElevenLabs e retorna o áudio em base64.
 * language_code é obrigatório para evitar que sílabas curtas
 * (MA, BLA, GLA...) sejam interpretadas como siglas e soletradas.
 */
const elevenLabsTTS = async (text: string, language: LanguageType = 'pt'): Promise<string> => {
  const voiceId = ELEVENLABS_VOICE_MAP[language];
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        language_code: ELEVENLABS_LANG_CODE[language],
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${errorText}`);
  }

  // Converter ArrayBuffer para Base64 (necessário para React Native)
  const arrayBuffer = await response.arrayBuffer();
  if (Platform.OS === 'web') {
    // Na web, podemos usar o buffer direto convertendo pra URL
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // Retorna apenas os dados base64
      };
      reader.readAsDataURL(blob);
    });
  } else {
    // No mobile, precisamos de uma solução que não use Blob se não suportado,
    // mas o fetch do React Native suporta ArrayBuffer que pode ser convertido (idealmente com react-native-fs ou buffer)
    // Para simplificar, assumimos que o polyfill de Buffer existe ou usamos a abordagem Web se funcionar.
    // Vamos usar a mesma abordagem da Web que o Expo costuma suportar.
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }
};

/**
 * Reproduz áudio do ElevenLabs na web.
 */
const playElevenLabsWeb = async (text: string, language: LanguageType) => {
  const audioBase64 = await elevenLabsTTS(text, language);
  const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
  const htmlAudio = new window.Audio(audioUrl);
  (window as any)._currentSpeechAudio = htmlAudio;
  await htmlAudio.play();
};

/**
 * Reproduz áudio do ElevenLabs no mobile.
 */
const playElevenLabsMobile = async (text: string, language: LanguageType) => {
  const audioBase64 = await elevenLabsTTS(text, language);
  const dataUri = `data:audio/mp3;base64,${audioBase64}`;

  const { sound } = await Audio.Sound.createAsync(
    { uri: dataUri },
    { shouldPlay: true }
  );
  currentSound = sound;
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
      currentSound = null;
    }
  });
};

// ========================================================
// PARÂMETROS DE VOZ POR IDIOMA (para Web Speech API / Expo Speech)
// ========================================================
const LANG_RATE_MAP: Record<LanguageType, number> = {
  pt: 0.88,
  en: 0.88,
  it: 0.88,
  es: 0.85,
};

const LANG_PITCH_MAP: Record<LanguageType, number> = {
  pt: 1.15,
  en: 1.10,
  it: 1.10,
  es: 1.10,
};

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

  for (const name of preferred) {
    const found = voices.find(v => v.lang === locale && v.name.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }
  for (const name of preferred) {
    const found = voices.find(v => v.lang.startsWith(locale.split('-')[0]) && v.name.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }

  const googleExact = voices.find(v => v.lang === locale && v.name.toLowerCase().includes('google'));
  if (googleExact) return googleExact;

  const networkExact = voices.find(v => v.lang === locale && !v.localService);
  if (networkExact) return networkExact;

  const localExact = voices.find(v => v.lang === locale);
  if (localExact) return localExact;

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

  if (window.speechSynthesis.getVoices().length === 0) {
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      doSpeak(text, locale, language);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      doSpeak(text, locale, language);
    }, 600);
  } else {
    doSpeak(text, locale, language);
  }
};

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

// ========================================================
// FUNÇÃO PRINCIPAL: speak()
// Prioridade:
//   1. Áudio pré-gerado (local, instantâneo, offline)
//   2. ElevenLabs TTS (API, alta qualidade)
//   3. Supabase Edge Function
//   4. OpenAI TTS
//   5. Web Speech API (navegador)
//   6. Expo Speech (mobile nativo)
// ========================================================

export const speak = async (text: string, language: LanguageType) => {
  try {
    await stopSpeech();

    const phoneticText = toPhoneticText(text, language).toLowerCase();
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';

    // OPÇÃO 1: Áudio pré-gerado (cache local - instantâneo e sem custo)
    const pregeneratedAsset = findPregeneratedAudio(phoneticText, language);
    if (pregeneratedAsset) {
      try {
        await playPregeneratedAudio(pregeneratedAsset);
        return;
      } catch (error) {
        console.warn('Erro ao reproduzir áudio pré-gerado, usando fallback:', error);
      }
    }

    // OPÇÃO 2: ElevenLabs TTS (Voz de estúdio)
    if (ELEVENLABS_API_KEY) {
      try {
        if (Platform.OS === 'web') {
          await playElevenLabsWeb(phoneticText, language);
        } else {
          await playElevenLabsMobile(phoneticText, language);
        }
        return;
      } catch (error) {
        console.warn('ElevenLabs TTS falhou, usando fallback:', error);
      }
    }

    // OPÇÃO 3: Supabase Edge Function
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

    // OPÇÃO 4: OpenAI TTS
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
          voice: 'nova',
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

    // OPÇÃO 5: Web Speech API (gratuita, nativa do navegador)
    if (Platform.OS === 'web') {
      webSpeechSynth(phoneticText, locale, language);
      return;
    }

    // OPÇÃO 6: Expo Speech (motor de voz nativo do celular)
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
 * Interrompe qualquer narração em andamento
 */
export const stopSpeech = async () => {
  try {
    await Speech.stop();

    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

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
