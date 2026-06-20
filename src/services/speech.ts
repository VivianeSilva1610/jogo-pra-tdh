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

// 3. Ativar voz neural gratuita e super compreensível do Google Translate
// Excelente para testes imediatos sem precisar de chaves ou gastar créditos.
const USE_NEURAL_GOOGLE_TTS = true;

let currentSound: Audio.Sound | null = null;

export const speak = async (text: string, language: LanguageType) => {
  try {
    // Parar qualquer voz anterior (tanto local quanto externa/IA)
    await stopSpeech();

    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';

    // OPÇÃO A: Supabase Edge Function (IA Premium Segura)
    if (SUPABASE_TTS_FUNCTION_URL) {
      const url = `${SUPABASE_TTS_FUNCTION_URL}?text=${encodeURIComponent(text)}&lang=${locale}`;
      await playAudioFromUrl(url);
      return;
    }

    // OPÇÃO B: OpenAI TTS Direta (IA Premium - Testes na Web)
    if (OPENAI_API_KEY) {
      if (Platform.OS === 'web') {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'nova', // Voz feminina amigável e super nítida para crianças
          })
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const htmlAudio = new window.Audio(audioUrl);
          htmlAudio.play();
          // Guarda a referência global para poder parar o som no meio se necessário
          (window as any)._currentSpeechAudio = htmlAudio;
          return;
        }
      }
    }

    // OPÇÃO C: Voz Neural do Google Translate (Gratuita, muito clara e natural)
    if (USE_NEURAL_GOOGLE_TTS) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${locale}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      if (Platform.OS === 'web') {
        const htmlAudio = new window.Audio(url);
        htmlAudio.play().catch(() => {
          // Se o navegador bloquear o autoplay por falta de interação do usuário, usa o fallback local
          fallbackToLocalSpeech(text, locale);
        });
        (window as any)._currentSpeechAudio = htmlAudio;
      } else {
        await playAudioFromUrl(url);
      }
      return;
    }

    // OPÇÃO D: Fallback Local (Expo Speech nativo)
    await fallbackToLocalSpeech(text, locale);

  } catch (error) {
    console.warn('Erro ao reproduzir voz IA/Neural:', error);
    // Caso ocorra qualquer falha de internet ou API, recua para o áudio do sistema
    const locale = LANG_LOCALE_MAP[language] || 'pt-BR';
    fallbackToLocalSpeech(text, locale);
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
    console.warn('Erro ao carregar som remoto da IA:', err);
    throw err;
  }
};

/**
 * Fallback para o motor de voz nativo do sistema operacional do celular
 */
const fallbackToLocalSpeech = async (text: string, locale: string) => {
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
    // Parar Expo Speech nativo
    await Speech.stop();

    // Parar som remoto no celular
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Parar áudio HTML5 no navegador
    if (Platform.OS === 'web' && (window as any)._currentSpeechAudio) {
      (window as any)._currentSpeechAudio.pause();
      (window as any)._currentSpeechAudio = null;
    }
  } catch (error) {
    console.warn('Erro ao parar reprodução de voz:', error);
  }
};
