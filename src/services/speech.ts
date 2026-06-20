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
// CONFIGURAÇÕES DA VOZ COM INTEGRAÇÃO DE IA
// ========================================================

// 1. (Recomendado para Produção Segura) URL da sua Edge Function no Supabase.
// Ex: 'https://rhzqijryyjoesuwodiln.supabase.co/functions/v1/tts'
const SUPABASE_TTS_FUNCTION_URL = '';

// 2. (Para testes rápidos na Web) Sua chave de API da OpenAI.
// ATENÇÃO: Não envie para produção com a chave exposta aqui!
const OPENAI_API_KEY = '';

let currentSound: Audio.Sound | null = null;

export const speak = async (text: string, language: LanguageType) => {
  try {
    // Parar qualquer voz anterior
    await stopSpeech();

    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';

    // OPÇÃO A: Supabase Edge Function (IA Premium Segura - para mobile e web)
    if (SUPABASE_TTS_FUNCTION_URL) {
      const url = `${SUPABASE_TTS_FUNCTION_URL}?text=${encodeURIComponent(text)}&lang=${locale}`;
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
          input: text,
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
      webSpeechSynth(text, locale);
      return;
    }

    // OPÇÃO D: Expo Speech (Motor de voz nativo do celular)
    await mobileLocalSpeech(text, locale);

  } catch (error) {
    console.warn('Erro ao reproduzir voz:', error);
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';
    if (Platform.OS === 'web') {
      webSpeechSynth(text, locale);
    } else {
      mobileLocalSpeech(text, locale);
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
