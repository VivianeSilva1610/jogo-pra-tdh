import { Audio } from 'expo-av';

const SOUNDS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav',
  tryAgain: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
  chest: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav',
  pop: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav'
};

const BG_MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

let bgMusicSound: Audio.Sound | null = null;
let isMusicPlaying = false;

export const playSound = async (type: keyof typeof SOUNDS, isSoundEnabled: boolean) => {
  if (!isSoundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: SOUNDS[type] },
      { shouldPlay: true }
    );
    // Descarrega o som da memória após tocar
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn(`Erro ao tocar som ${type}:`, error);
  }
};

export const startBgMusic = async (isSoundEnabled: boolean) => {
  if (!isSoundEnabled || isMusicPlaying) return;
  try {
    // Configurar áudio para tocar em segundo plano no iOS/Android
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false
    });

    if (bgMusicSound) {
      await bgMusicSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: BG_MUSIC_URL },
      { 
        shouldPlay: true, 
        isLooping: true, 
        volume: 0.15 // Volume de fundo bem baixinho para não distrair
      }
    );
    bgMusicSound = sound;
    isMusicPlaying = true;
  } catch (error) {
    console.warn('Erro ao carregar música de fundo:', error);
  }
};

export const stopBgMusic = async () => {
  if (!bgMusicSound) return;
  try {
    await bgMusicSound.stopAsync();
    await bgMusicSound.unloadAsync();
    bgMusicSound = null;
    isMusicPlaying = false;
  } catch (error) {
    console.warn('Erro ao parar música de fundo:', error);
  }
};

export const setBgMusicVolume = async (volume: number) => {
  if (!bgMusicSound) return;
  try {
    await bgMusicSound.setVolumeAsync(volume);
  } catch (error) {
    console.warn('Erro ao ajustar volume da música:', error);
  }
};
