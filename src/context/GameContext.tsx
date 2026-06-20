import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CharacterType = 'boy' | 'girl' | 'fox' | 'panda' | 'kitten' | 'robot';

export interface StickerItem {
  id: string;
  nameKey: string;
  emoji: string;
  cost: number;
  category: 'animals' | 'nature' | 'fantasy';
}

export interface ClothingItem {
  id: string;
  nameKey: string;
  emoji: string;
  cost: number;
}

export const STICKERS_LIST: StickerItem[] = [
  { id: 'sticker_lion', nameKey: 'stickerLion', emoji: '🦁', cost: 30, category: 'animals' },
  { id: 'sticker_elephant', nameKey: 'stickerElephant', emoji: '🐘', cost: 35, category: 'animals' },
  { id: 'sticker_bunny', nameKey: 'stickerBunny', emoji: '🐰', cost: 25, category: 'animals' },
  { id: 'sticker_dino', nameKey: 'stickerDino', emoji: '🦖', cost: 40, category: 'animals' },
  { id: 'sticker_unicorn', nameKey: 'stickerUnicorn', emoji: '🦄', cost: 50, category: 'fantasy' },
  { id: 'sticker_dragon', nameKey: 'stickerDragon', emoji: '🐉', cost: 45, category: 'fantasy' },
  { id: 'sticker_dolphin', nameKey: 'stickerDolphin', emoji: '🐬', cost: 30, category: 'animals' },
  { id: 'sticker_butterfly', nameKey: 'stickerButterfly', emoji: '🦋', cost: 20, category: 'nature' },
  { id: 'sticker_flower', nameKey: 'stickerFlower', emoji: '🌸', cost: 15, category: 'nature' },
  { id: 'sticker_rainbow', nameKey: 'stickerRainbow', emoji: '🌈', cost: 25, category: 'nature' },
];

export const CLOTHING_LIST: ClothingItem[] = [
  { id: 'hat_explorer', nameKey: 'hat_explorer', emoji: '🤠', cost: 50 },
  { id: 'crown', nameKey: 'crown', emoji: '👑', cost: 100 },
  { id: 'sunglasses', nameKey: 'sunglasses', emoji: '🕶️', cost: 30 },
  { id: 'cape_wizard', nameKey: 'cape_wizard', emoji: '🧙‍♂️', cost: 80 },
  { id: 'backpack_rocket', nameKey: 'backpack_rocket', emoji: '🚀', cost: 120 },
];

interface GameContextProps {
  stars: number;
  coins: number;
  character: CharacterType | null;
  unlockedStickers: string[];
  unlockedClothing: string[];
  equippedClothing: string | null;
  challengesCompleted: number;
  learnedLetters: string[];
  masteredSyllables: string[];
  readWords: string[];
  soundEnabled: boolean;
  isPremium: boolean;
  dailyUsageSeconds: Record<string, number>; // e.g. { 'Mon': 120, 'Tue': 0... }
  showChestModal: boolean;
  setShowChestModal: (show: boolean) => void;
  
  selectCharacter: (char: CharacterType) => Promise<void>;
  addStars: (count: number) => Promise<void>;
  addCoins: (count: number) => Promise<void>;
  buySticker: (id: string, cost: number) => Promise<boolean>;
  buyClothing: (id: string, cost: number) => Promise<boolean>;
  equipClothing: (id: string | null) => Promise<void>;
  completeChallenge: (type: 'letter' | 'syllable' | 'word', value: string) => Promise<void>;
  resetGameProgress: () => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setIsPremium: (premium: boolean) => Promise<void>;
  claimChestReward: () => Promise<string>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stars, setStars] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>([]);
  const [unlockedClothing, setUnlockedClothing] = useState<string[]>([]);
  const [equippedClothing, setEquippedClothing] = useState<string | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState<number>(0);
  const [learnedLetters, setLearnedLetters] = useState<string[]>([]);
  const [masteredSyllables, setMasteredSyllables] = useState<string[]>([]);
  const [readWords, setReadWords] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [isPremium, setIsPremiumState] = useState<boolean>(false);
  const [dailyUsageSeconds, setDailyUsageSeconds] = useState<Record<string, number>>({
    'Dom': 0, 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0
  });
  const [showChestModal, setShowChestModal] = useState<boolean>(false);

  const usageTimerRef = useRef<any>(null);

  // Carregar dados na inicialização
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const keys = [
          'game_stars', 'game_coins', 'game_character',
          'game_stickers', 'game_clothing', 'game_equipped_clothing',
          'game_challenges_count', 'game_letters', 'game_syllables',
          'game_words', 'game_sound', 'game_premium', 'game_usage'
        ];
        const stores = await AsyncStorage.multiGet(keys);
        
        stores.forEach(([key, val]) => {
          if (!val) return;
          switch (key) {
            case 'game_stars': setStars(Number(val)); break;
            case 'game_coins': setCoins(Number(val)); break;
            case 'game_character': setCharacter(val as CharacterType); break;
            case 'game_stickers': setUnlockedStickers(JSON.parse(val)); break;
            case 'game_clothing': setUnlockedClothing(JSON.parse(val)); break;
            case 'game_equipped_clothing': setEquippedClothing(val); break;
            case 'game_challenges_count': setChallengesCompleted(Number(val)); break;
            case 'game_letters': setLearnedLetters(JSON.parse(val)); break;
            case 'game_syllables': setMasteredSyllables(JSON.parse(val)); break;
            case 'game_words': setReadWords(JSON.parse(val)); break;
            case 'game_sound': setSoundEnabledState(val === 'true'); break;
            case 'game_premium': setIsPremiumState(val === 'true'); break;
            case 'game_usage': setDailyUsageSeconds(JSON.parse(val)); break;
          }
        });
      } catch (e) {
        console.error('Falha ao carregar progresso', e);
      }
    };
    loadProgress();
  }, []);

  // Monitorar tempo de uso da sessão
  useEffect(() => {
    usageTimerRef.current = setInterval(() => {
      const todayIndex = new Date().getDay();
      const todayName = DAYS_OF_WEEK[todayIndex];

      setDailyUsageSeconds((prev) => {
        const updated = {
          ...prev,
          [todayName]: (prev[todayName] || 0) + 10, // adiciona 10 segundos
        };
        AsyncStorage.setItem('game_usage', JSON.stringify(updated));
        return updated;
      });
    }, 10000); // roda a cada 10s para não sobrecarregar escrita

    return () => {
      if (usageTimerRef.current) clearInterval(usageTimerRef.current);
    };
  }, []);

  const selectCharacter = async (char: CharacterType) => {
    setCharacter(char);
    await AsyncStorage.setItem('game_character', char);
  };

  const addStars = async (count: number) => {
    const updated = stars + count;
    setStars(updated);
    await AsyncStorage.setItem('game_stars', String(updated));
  };

  const addCoins = async (count: number) => {
    const updated = coins + count;
    setCoins(updated);
    await AsyncStorage.setItem('game_coins', String(updated));
  };

  const buySticker = async (id: string, cost: number): Promise<boolean> => {
    if (coins < cost) return false;
    
    const updatedCoins = coins - cost;
    const updatedStickers = [...unlockedStickers, id];
    
    setCoins(updatedCoins);
    setUnlockedStickers(updatedStickers);
    
    await AsyncStorage.setItem('game_coins', String(updatedCoins));
    await AsyncStorage.setItem('game_stickers', JSON.stringify(updatedStickers));
    return true;
  };

  const buyClothing = async (id: string, cost: number): Promise<boolean> => {
    if (coins < cost) return false;

    const updatedCoins = coins - cost;
    const updatedClothing = [...unlockedClothing, id];

    setCoins(updatedCoins);
    setUnlockedClothing(updatedClothing);

    await AsyncStorage.setItem('game_coins', String(updatedCoins));
    await AsyncStorage.setItem('game_clothing', JSON.stringify(updatedClothing));
    return true;
  };

  const equipClothing = async (id: string | null) => {
    setEquippedClothing(id);
    if (id) {
      await AsyncStorage.setItem('game_equipped_clothing', id);
    } else {
      await AsyncStorage.removeItem('game_equipped_clothing');
    }
  };

  const completeChallenge = async (type: 'letter' | 'syllable' | 'word', value: string) => {
    // 1. Ganho de moedas e estrelas padrão
    const earnedCoins = 10;
    const earnedStars = 1;
    
    const newCoins = coins + earnedCoins;
    const newStars = stars + earnedStars;
    const newCount = challengesCompleted + 1;

    setCoins(newCoins);
    setStars(newStars);
    setChallengesCompleted(newCount);

    await AsyncStorage.setItem('game_coins', String(newCoins));
    await AsyncStorage.setItem('game_stars', String(newStars));
    await AsyncStorage.setItem('game_challenges_count', String(newCount));

    // 2. Atualizar letras, sílabas ou palavras aprendidas
    const upperVal = value.toUpperCase();
    if (type === 'letter') {
      if (!learnedLetters.includes(upperVal)) {
        const updated = [...learnedLetters, upperVal];
        setLearnedLetters(updated);
        await AsyncStorage.setItem('game_letters', JSON.stringify(updated));
      }
    } else if (type === 'syllable') {
      if (!masteredSyllables.includes(upperVal)) {
        const updated = [...masteredSyllables, upperVal];
        setMasteredSyllables(updated);
        await AsyncStorage.setItem('game_syllables', JSON.stringify(updated));
      }
    } else if (type === 'word') {
      if (!readWords.includes(upperVal)) {
        const updated = [...readWords, upperVal];
        setReadWords(updated);
        await AsyncStorage.setItem('game_words', JSON.stringify(updated));
      }
    }

    // 3. Mecânica TDAH: Baú surpresa a cada 5 desafios completos!
    if (newCount > 0 && newCount % 5 === 0) {
      setShowChestModal(true);
    }
  };

  const claimChestReward = async (): Promise<string> => {
    // Dá um adesivo aleatório ou roupas, ou muitas moedas se tudo já estiver comprado
    const lockedStickers = STICKERS_LIST.filter(s => !unlockedStickers.includes(s.id));
    const lockedClothing = CLOTHING_LIST.filter(c => !unlockedClothing.includes(c.id));

    let rewardText = '';
    
    if (lockedStickers.length > 0 && (lockedClothing.length === 0 || Math.random() > 0.4)) {
      // Ganha adesivo
      const chosen = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
      const updatedStickers = [...unlockedStickers, chosen.id];
      setUnlockedStickers(updatedStickers);
      await AsyncStorage.setItem('game_stickers', JSON.stringify(updatedStickers));
      rewardText = `Figurinha: ${chosen.emoji}`;
    } else if (lockedClothing.length > 0) {
      // Ganha roupa
      const chosen = lockedClothing[Math.floor(Math.random() * lockedClothing.length)];
      const updatedClothing = [...unlockedClothing, chosen.id];
      setUnlockedClothing(updatedClothing);
      await AsyncStorage.setItem('game_clothing', JSON.stringify(updatedClothing));
      rewardText = `Roupa: ${chosen.emoji}`;
    } else {
      // Ganha super bônus de moedas
      const bonus = 50;
      const updatedCoins = coins + bonus;
      setCoins(updatedCoins);
      await AsyncStorage.setItem('game_coins', String(updatedCoins));
      rewardText = `Super Moedas: +${bonus} 🪙`;
    }

    setShowChestModal(false);
    return rewardText;
  };

  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    await AsyncStorage.setItem('game_sound', String(enabled));
  };

  const setIsPremium = async (premium: boolean) => {
    setIsPremiumState(premium);
    await AsyncStorage.setItem('game_premium', String(premium));
  };

  const resetGameProgress = async () => {
    setStars(0);
    setCoins(0);
    setCharacter(null);
    setUnlockedStickers([]);
    setUnlockedClothing([]);
    setEquippedClothing(null);
    setChallengesCompleted(0);
    setLearnedLetters([]);
    setMasteredSyllables([]);
    setReadWords([]);
    setDailyUsageSeconds({
      'Dom': 0, 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0
    });
    setIsPremiumState(false);
    
    await AsyncStorage.multiRemove([
      'game_stars', 'game_coins', 'game_character',
      'game_stickers', 'game_clothing', 'game_equipped_clothing',
      'game_challenges_count', 'game_letters', 'game_syllables',
      'game_words', 'game_usage', 'game_premium'
    ]);
  };

  return (
    <GameContext.Provider value={{
      stars, coins, character, unlockedStickers, unlockedClothing, equippedClothing,
      challengesCompleted, learnedLetters, masteredSyllables, readWords, soundEnabled, isPremium,
      dailyUsageSeconds, showChestModal, setShowChestModal,
      selectCharacter, addStars, addCoins, buySticker, buyClothing, equipClothing,
      completeChallenge, resetGameProgress, setSoundEnabled, setIsPremium, claimChestReward
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
