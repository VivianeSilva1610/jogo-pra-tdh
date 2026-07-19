import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncChildProfile, loadChildProfile, loadParentSubscription, ChildProgressProfile } from '../services/supabase';

export type CharacterType = 'boy' | 'girl' | 'fox' | 'panda' | 'kitten' | 'robot';

export interface StickerItem {
  id: string;
  nameKey: string;
  emoji: string;
  isPremium?: boolean;
  cost: number;
  category: 'animals' | 'nature' | 'fantasy';
  imageUrl: string;
}

export interface ClothingItem {
  id: string;
  nameKey: string;
  emoji: string;
  cost: number;
}

export const STICKERS_LIST: StickerItem[] = [
  // ── FREE (10) ─────────────────────────────────────────────
  { id: 'sticker_lion',       nameKey: 'stickerLion',       emoji: '🦁', cost: 30, category: 'animals' },
  { id: 'sticker_elephant',   nameKey: 'stickerElephant',   emoji: '🐘', cost: 35, category: 'animals' },
  { id: 'sticker_bunny',      nameKey: 'stickerBunny',      emoji: '🐰', cost: 25, category: 'animals' },
  { id: 'sticker_dino',       nameKey: 'stickerDino',       emoji: '🦖', cost: 40, category: 'animals' },
  { id: 'sticker_dolphin',    nameKey: 'stickerDolphin',    emoji: '🐬', cost: 30, category: 'animals' },
  { id: 'sticker_butterfly',  nameKey: 'stickerButterfly',  emoji: '🦋', cost: 20, category: 'nature'  },
  { id: 'sticker_flower',     nameKey: 'stickerFlower',     emoji: '🌸', cost: 15, category: 'nature'  },
  { id: 'sticker_rainbow',    nameKey: 'stickerRainbow',    emoji: '🌈', cost: 25, category: 'nature'  },
  { id: 'sticker_unicorn',    nameKey: 'stickerUnicorn',    emoji: '🦄', cost: 50, category: 'fantasy' },
  { id: 'sticker_dragon',     nameKey: 'stickerDragon',     emoji: '🐉', cost: 45, category: 'fantasy' },

  // ── PREMIUM — Animals (12) ────────────────────────────────
  { id: 'sticker_giraffe',    nameKey: 'stickerGiraffe',    emoji: '🦒', cost: 30, category: 'animals', isPremium: true },
  { id: 'sticker_tiger',      nameKey: 'stickerTiger',      emoji: '🐯', cost: 35, category: 'animals', isPremium: true },
  { id: 'sticker_whale',      nameKey: 'stickerWhale',      emoji: '🐋', cost: 40, category: 'animals', isPremium: true },
  { id: 'sticker_penguin',    nameKey: 'stickerPenguin',    emoji: '🐧', cost: 25, category: 'animals', isPremium: true },
  { id: 'sticker_koala',      nameKey: 'stickerKoala',      emoji: '🐨', cost: 30, category: 'animals', isPremium: true },
  { id: 'sticker_parrot',     nameKey: 'stickerParrot',     emoji: '🦜', cost: 35, category: 'animals', isPremium: true },
  { id: 'sticker_peacock',    nameKey: 'stickerPeacock',    emoji: '🦚', cost: 45, category: 'animals', isPremium: true },
  { id: 'sticker_octopus',    nameKey: 'stickerOctopus',    emoji: '🐙', cost: 35, category: 'animals', isPremium: true },
  { id: 'sticker_deer',       nameKey: 'stickerDeer',       emoji: '🦌', cost: 30, category: 'animals', isPremium: true },
  { id: 'sticker_frog',       nameKey: 'stickerFrog',       emoji: '🐸', cost: 20, category: 'animals', isPremium: true },
  { id: 'sticker_owl',        nameKey: 'stickerOwl',        emoji: '🦉', cost: 30, category: 'animals', isPremium: true },
  { id: 'sticker_gorilla',    nameKey: 'stickerGorilla',    emoji: '🦍', cost: 40, category: 'animals', isPremium: true },

  // ── PREMIUM — Nature (8) ──────────────────────────────────
  { id: 'sticker_sunflower',  nameKey: 'stickerSunflower',  emoji: '🌻', cost: 20, category: 'nature',  isPremium: true },
  { id: 'sticker_cactus',     nameKey: 'stickerCactus',     emoji: '🌵', cost: 25, category: 'nature',  isPremium: true },
  { id: 'sticker_mushroom',   nameKey: 'stickerMushroom',   emoji: '🍄', cost: 25, category: 'nature',  isPremium: true },
  { id: 'sticker_tree',       nameKey: 'stickerTree',       emoji: '🌳', cost: 20, category: 'nature',  isPremium: true },
  { id: 'sticker_lightning',  nameKey: 'stickerLightning',  emoji: '⚡', cost: 30, category: 'nature',  isPremium: true },
  { id: 'sticker_volcano',    nameKey: 'stickerVolcano',    emoji: '🌋', cost: 45, category: 'nature',  isPremium: true },
  { id: 'sticker_crystal',    nameKey: 'stickerCrystal',    emoji: '💎', cost: 50, category: 'nature',  isPremium: true },
  { id: 'sticker_wave',       nameKey: 'stickerWave',       emoji: '🌊', cost: 25, category: 'nature',  isPremium: true },

  // ── PREMIUM — Fantasy (10) ────────────────────────────────
  { id: 'sticker_wizard',     nameKey: 'stickerWizard',     emoji: '🧙', cost: 50, category: 'fantasy', isPremium: true },
  { id: 'sticker_fairy',      nameKey: 'stickerFairy',      emoji: '🧚', cost: 45, category: 'fantasy', isPremium: true },
  { id: 'sticker_mermaid',    nameKey: 'stickerMermaid',    emoji: '🧜', cost: 55, category: 'fantasy', isPremium: true },
  { id: 'sticker_phoenix',    nameKey: 'stickerPhoenix',    emoji: '🦅', cost: 60, category: 'fantasy', isPremium: true },
  { id: 'sticker_witch',      nameKey: 'stickerWitch',      emoji: '🔮', cost: 45, category: 'fantasy', isPremium: true },
  { id: 'sticker_knight',     nameKey: 'stickerKnight',     emoji: '⚔️', cost: 50, category: 'fantasy', isPremium: true },
  { id: 'sticker_treasure',   nameKey: 'stickerTreasure',   emoji: '💰', cost: 40, category: 'fantasy', isPremium: true },
  { id: 'sticker_castle',     nameKey: 'stickerCastle',     emoji: '🏰', cost: 55, category: 'fantasy', isPremium: true },
  { id: 'sticker_ghost',      nameKey: 'stickerGhost',      emoji: '👻', cost: 35, category: 'fantasy', isPremium: true },
  { id: 'sticker_magic_hat',  nameKey: 'stickerMagicHat',   emoji: '🎩', cost: 40, category: 'fantasy', isPremium: true },

  // ── PREMIUM — Espaço (8) ──────────────────────────────────
  { id: 'sticker_planet',     nameKey: 'stickerPlanet',     emoji: '🪐', cost: 45, category: 'space',   isPremium: true },
  { id: 'sticker_alien',      nameKey: 'stickerAlien',      emoji: '👽', cost: 40, category: 'space',   isPremium: true },
  { id: 'sticker_moon',       nameKey: 'stickerMoon',       emoji: '🌙', cost: 30, category: 'space',   isPremium: true },
  { id: 'sticker_comet',      nameKey: 'stickerComet',      emoji: '☄️', cost: 50, category: 'space',   isPremium: true },
  { id: 'sticker_astronaut',  nameKey: 'stickerAstronaut',  emoji: '👨‍🚀', cost: 55, category: 'space',   isPremium: true },
  { id: 'sticker_ufo',        nameKey: 'stickerUfo',        emoji: '🛸', cost: 45, category: 'space',   isPremium: true },
  { id: 'sticker_telescope',  nameKey: 'stickerTelescope',  emoji: '🔭', cost: 40, category: 'space',   isPremium: true },
  { id: 'sticker_galaxy',     nameKey: 'stickerGalaxy',     emoji: '🌌', cost: 60, category: 'space',   isPremium: true },

  // ── PREMIUM — Comida (7) ──────────────────────────────────
  { id: 'sticker_pizza',      nameKey: 'stickerPizza',      emoji: '🍕', cost: 25, category: 'food',    isPremium: true },
  { id: 'sticker_cake',       nameKey: 'stickerCake',       emoji: '🎂', cost: 30, category: 'food',    isPremium: true },
  { id: 'sticker_icecream',   nameKey: 'stickerIcecream',   emoji: '🍦', cost: 20, category: 'food',    isPremium: true },
  { id: 'sticker_watermelon', nameKey: 'stickerWatermelon', emoji: '🍉', cost: 20, category: 'food',    isPremium: true },
  { id: 'sticker_sushi',      nameKey: 'stickerSushi',      emoji: '🍣', cost: 35, category: 'food',    isPremium: true },
  { id: 'sticker_cookie',     nameKey: 'stickerCookie',     emoji: '🍪', cost: 20, category: 'food',    isPremium: true },
  { id: 'sticker_strawberry', nameKey: 'stickerStrawberry', emoji: '🍓', cost: 15, category: 'food',    isPremium: true },

  // ── PREMIUM — Esportes (5) ────────────────────────────────
  { id: 'sticker_soccer',     nameKey: 'stickerSoccer',     emoji: '⚽', cost: 30, category: 'sports',  isPremium: true },
  { id: 'sticker_basketball', nameKey: 'stickerBasketball', emoji: '🏀', cost: 30, category: 'sports',  isPremium: true },
  { id: 'sticker_trophy',     nameKey: 'stickerTrophy',     emoji: '🏆', cost: 50, category: 'sports',  isPremium: true },
  { id: 'sticker_medal',      nameKey: 'stickerMedal',      emoji: '🥇', cost: 45, category: 'sports',  isPremium: true },
  { id: 'sticker_surfing',    nameKey: 'stickerSurfing',    emoji: '🏄', cost: 40, category: 'sports',  isPremium: true },
];

export const CLOTHING_CATEGORIES: Record<string, 'head' | 'face' | 'body' | 'back' | 'hand'> = {
  hat_explorer: 'head',
  crown: 'head',
  pirate_hat: 'head',
  sunglasses: 'face',
  detective_lens: 'face',
  cape_wizard: 'body',
  princess_dress: 'body',
  superhero_cape: 'body',
  dino_costume: 'body',
  backpack_rocket: 'back',
  balloon: 'back',
  teddy_bear: 'hand',
  toy_train: 'hand',
  magic_wand: 'hand',
  gamepad: 'hand',
};

export const CLOTHING_LIST: ClothingItem[] = [
  { id: 'hat_explorer', nameKey: 'hat_explorer', emoji: '🤠', cost: 50 },
  { id: 'crown', nameKey: 'crown', emoji: '👑', cost: 100 },
  { id: 'sunglasses', nameKey: 'sunglasses', emoji: '🕶️', cost: 30 },
  { id: 'cape_wizard', nameKey: 'cape_wizard', emoji: '🧙‍♂️', cost: 80 },
  { id: 'backpack_rocket', nameKey: 'backpack_rocket', emoji: '🚀', cost: 120 },
  { id: 'teddy_bear', nameKey: 'teddy_bear', emoji: '🧸', cost: 60 },
  { id: 'toy_train', nameKey: 'toy_train', emoji: '🚂', cost: 70 },
  { id: 'balloon', nameKey: 'balloon', emoji: '🎈', cost: 40 },
  { id: 'magic_wand', nameKey: 'magic_wand', emoji: '🪄', cost: 80 },
  { id: 'gamepad', nameKey: 'gamepad', emoji: '🎮', cost: 90 },
  { id: 'princess_dress', nameKey: 'princess_dress', emoji: '👗', cost: 100 },
  { id: 'superhero_cape', nameKey: 'superhero_cape', emoji: '🦸', cost: 90 },
  { id: 'dino_costume', nameKey: 'dino_costume', emoji: '🦖', cost: 110 },
  { id: 'pirate_hat', nameKey: 'pirate_hat', emoji: '🏴‍☠️', cost: 85 },
  { id: 'detective_lens', nameKey: 'detective_lens', emoji: '🔍', cost: 50 },
];

interface GameContextProps {
  childId: string | null;
  parentId: string | null;
  stars: number;
  coins: number;
  character: CharacterType | null;
  avatarName: string | null;
  unlockedStickers: string[];
  unlockedClothing: string[];
  equippedClothing: string | null;
  challengesCompleted: number;
  learnedLetters: string[];
  masteredSyllables: string[];
  readWords: string[];
  soundEnabled: boolean;
  isPremium: boolean;
  dailyUsageSeconds: Record<string, number>;
  showChestModal: boolean;
  isLoadingProfile: boolean;
  setShowChestModal: (show: boolean) => void;

  selectCharacter: (char: CharacterType) => Promise<void>;
  setAvatarName: (name: string) => Promise<void>;
  addStars: (count: number) => Promise<void>;
  addCoins: (count: number) => Promise<void>;
  buySticker: (id: string, cost: number) => Promise<boolean>;
  buyClothing: (id: string, cost: number) => Promise<boolean>;
  equipClothing: (id: string | null) => Promise<void>;
  completeChallenge: (type: 'letter' | 'syllable' | 'word', value: string) => Promise<number>;
  resetGameProgress: () => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setIsPremium: (premium: boolean) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  claimChestReward: () => Promise<string>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ─────────────────────────────────────────────────────────────
// GameProvider recebe childId e parentId para isolar dados
// ─────────────────────────────────────────────────────────────
interface GameProviderProps {
  children: React.ReactNode;
  childId: string | null;
  parentId: string | null;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, childId, parentId }) => {
  const [stars, setStars] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [avatarName, setAvatarNameState] = useState<string | null>(null);
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
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const usageTimerRef = useRef<any>(null);

  // ─────────────────────────────────────────────────────────────
  // Prefixo de chave: isolado por childId no AsyncStorage
  // ─────────────────────────────────────────────────────────────
  const prefix = childId ? `child_${childId}_` : 'guest_';

  const key = useCallback((k: string) => `${prefix}${k}`, [prefix]);

  // ─────────────────────────────────────────────────────────────
  // Carregar progresso: 1º tenta Supabase, fallback AsyncStorage
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!childId) {
      setIsLoadingProfile(false);
      return;
    }

    const loadProgress = async () => {
      setIsLoadingProfile(true);
      try {
        // Tentar carregar da nuvem primeiro
        let profile: ChildProgressProfile | null = null;
        if (parentId) {
          profile = await loadChildProfile(childId, parentId);
        }

        if (profile) {
          // Dados da nuvem (fonte de verdade)
          setStars(profile.stars);
          setCoins(profile.coins);
          setChallengesCompleted(profile.challengesCompleted);
          setCharacter((profile.character as CharacterType) ?? null);
          setAvatarNameState(profile.avatarName ?? null);
          setEquippedClothing(profile.equippedClothing);
          setUnlockedStickers(profile.unlockedStickers);
          setUnlockedClothing(profile.unlockedClothing);
          setLearnedLetters(profile.learnedLetters);
          setMasteredSyllables(profile.masteredSyllables);
          setReadWords(profile.readWords);
          setDailyUsageSeconds(profile.dailyUsageSeconds ?? {
            'Dom': 0, 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0
          });
        } else {
          // Fallback: AsyncStorage local (prefixado por child)
          const keys = [
            key('game_stars'), key('game_coins'), key('game_character'),
            key('game_stickers'), key('game_clothing'), key('game_equipped_clothing'),
            key('game_challenges_count'), key('game_letters'), key('game_syllables'),
            key('game_words'), key('game_sound'), key('game_premium'), key('game_usage'),
            key('game_avatar_name')
          ];
          const stores = await AsyncStorage.multiGet(keys);

          stores.forEach(([k, val]) => {
            if (!val) return;
            const shortKey = k.replace(prefix, '');
            switch (shortKey) {
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
              case 'game_avatar_name': setAvatarNameState(val); break;
            }
          });
        }

        // Assinatura (isPremium) — fonte de verdade é a tabela subscriptions
        // Sobrescreve qualquer valor de AsyncStorage; graceful fallback se offline
        if (parentId) {
          const sub = await loadParentSubscription(parentId);
          setIsPremiumState(sub.isPremium);
        }

        // Configurações globais (não isoladas por criança)
        const soundVal = await AsyncStorage.getItem('global_sound');
        if (soundVal !== null) setSoundEnabledState(soundVal === 'true');

      } catch (e) {
        console.error('Falha ao carregar progresso', e);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProgress();
  }, [childId, parentId]);

  // ─────────────────────────────────────────────────────────────
  // Sincronizar com Supabase após cada mudança relevante (debounce 3s)
  // ─────────────────────────────────────────────────────────────
  const syncTimeout = useRef<any>(null);

  const scheduleSync = useCallback((overrides: Partial<ChildProgressProfile> = {}) => {
    if (!childId || !parentId) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      const currentProfile: ChildProgressProfile = {
        stars, coins, challengesCompleted,
        character, avatarName, equippedClothing,
        unlockedStickers, unlockedClothing,
        learnedLetters, masteredSyllables, readWords,
        dailyUsageSeconds, isPremium,
        ...overrides,
      };
      syncChildProfile(childId, parentId, currentProfile);
    }, 3000);
  }, [childId, parentId, stars, coins, challengesCompleted, character, avatarName, equippedClothing,
    unlockedStickers, unlockedClothing, learnedLetters, masteredSyllables, readWords,
    dailyUsageSeconds, isPremium]);

  // Monitorar tempo de uso da sessão
  useEffect(() => {
    if (!childId) return;
    usageTimerRef.current = setInterval(() => {
      const todayIndex = new Date().getDay();
      const todayName = DAYS_OF_WEEK[todayIndex];

      setDailyUsageSeconds((prev) => {
        const updated = {
          ...prev,
          [todayName]: (prev[todayName] || 0) + 10,
        };
        AsyncStorage.setItem(key('game_usage'), JSON.stringify(updated));
        return updated;
      });
    }, 10000);

    return () => {
      if (usageTimerRef.current) clearInterval(usageTimerRef.current);
    };
  }, [childId]);

  // ─────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────

  const selectCharacter = async (char: CharacterType) => {
    setCharacter(char);
    await AsyncStorage.setItem(key('game_character'), char);
    scheduleSync({ character: char });
  };

  const setAvatarName = async (name: string) => {
    const trimmed = name.trim();
    setAvatarNameState(trimmed || null);
    if (trimmed) {
      await AsyncStorage.setItem(key('game_avatar_name'), trimmed);
    } else {
      await AsyncStorage.removeItem(key('game_avatar_name'));
    }
    scheduleSync({ avatarName: trimmed || null });
  };

  const addStars = async (count: number) => {
    const updated = stars + count;
    setStars(updated);
    await AsyncStorage.setItem(key('game_stars'), String(updated));
    scheduleSync({ stars: updated });
  };

  const addCoins = async (count: number) => {
    const updated = coins + count;
    setCoins(updated);
    await AsyncStorage.setItem(key('game_coins'), String(updated));
    scheduleSync({ coins: updated });
  };

  const buySticker = async (id: string, cost: number): Promise<boolean> => {
    if (coins < cost) return false;

    const updatedCoins = coins - cost;
    const updatedStickers = [...unlockedStickers, id];

    setCoins(updatedCoins);
    setUnlockedStickers(updatedStickers);

    await AsyncStorage.setItem(key('game_coins'), String(updatedCoins));
    await AsyncStorage.setItem(key('game_stickers'), JSON.stringify(updatedStickers));
    scheduleSync({ coins: updatedCoins, unlockedStickers: updatedStickers });
    return true;
  };

  const buyClothing = async (id: string, cost: number): Promise<boolean> => {
    if (coins < cost) return false;

    const updatedCoins = coins - cost;
    const updatedClothing = [...unlockedClothing, id];

    setCoins(updatedCoins);
    setUnlockedClothing(updatedClothing);

    await AsyncStorage.setItem(key('game_coins'), String(updatedCoins));
    await AsyncStorage.setItem(key('game_clothing'), JSON.stringify(updatedClothing));
    scheduleSync({ coins: updatedCoins, unlockedClothing: updatedClothing });
    return true;
  };

  const equipClothing = async (id: string | null) => {
    let newEquipped: string | null = null;
    
    if (id === null) {
      newEquipped = null;
    } else {
      // Obter lista atual de itens equipados
      const currentList = equippedClothing ? equippedClothing.split(',').map(x => x.trim()).filter(Boolean) : [];
      
      if (currentList.includes(id)) {
        // Desequipar se já estiver na lista
        const filtered = currentList.filter(x => x !== id);
        newEquipped = filtered.length > 0 ? filtered.join(',') : null;
      } else {
        // Equipar: remover qualquer item na mesma categoria, e adicionar este
        const targetCategory = CLOTHING_CATEGORIES[id];
        const filtered = currentList.filter(x => CLOTHING_CATEGORIES[x] !== targetCategory);
        filtered.push(id);
        newEquipped = filtered.join(',');
      }
    }

    setEquippedClothing(newEquipped);
    if (newEquipped) {
      await AsyncStorage.setItem(key('game_equipped_clothing'), newEquipped);
    } else {
      await AsyncStorage.removeItem(key('game_equipped_clothing'));
    }
    scheduleSync({ equippedClothing: newEquipped });
  };

  const completeChallenge = async (type: 'letter' | 'syllable' | 'word', value: string) => {
    const earnedCoins = 10;
    const difficulty = Math.floor(challengesCompleted / 7) % 3;
    const earnedStars = difficulty + 1; // Easy: 1 star, Moderate: 2 stars, Hard: 3 stars

    const newCoins = coins + earnedCoins;
    const newStars = stars + earnedStars;
    const newCount = challengesCompleted + 1;

    setCoins(newCoins);
    setStars(newStars);
    setChallengesCompleted(newCount);

    await AsyncStorage.setItem(key('game_coins'), String(newCoins));
    await AsyncStorage.setItem(key('game_stars'), String(newStars));
    await AsyncStorage.setItem(key('game_challenges_count'), String(newCount));

    const upperVal = value.toUpperCase();
    let newLetters = learnedLetters;
    let newSyllables = masteredSyllables;
    let newWords = readWords;

    if (type === 'letter') {
      if (!learnedLetters.includes(upperVal)) {
        newLetters = [...learnedLetters, upperVal];
        setLearnedLetters(newLetters);
        await AsyncStorage.setItem(key('game_letters'), JSON.stringify(newLetters));
      }
    } else if (type === 'syllable') {
      if (!masteredSyllables.includes(upperVal)) {
        newSyllables = [...masteredSyllables, upperVal];
        setMasteredSyllables(newSyllables);
        await AsyncStorage.setItem(key('game_syllables'), JSON.stringify(newSyllables));
      }
    } else if (type === 'word') {
      if (!readWords.includes(upperVal)) {
        newWords = [...readWords, upperVal];
        setReadWords(newWords);
        await AsyncStorage.setItem(key('game_words'), JSON.stringify(newWords));
      }
    }

    // Mecânica TDAH: Baú surpresa a cada 5 desafios
    if (newCount > 0 && newCount % 5 === 0) {
      setShowChestModal(true);
    }

    // Sincronizar na nuvem
    scheduleSync({
      coins: newCoins,
      stars: newStars,
      challengesCompleted: newCount,
      learnedLetters: newLetters,
      masteredSyllables: newSyllables,
      readWords: newWords,
    });

    return earnedStars;
  };

  const claimChestReward = async (): Promise<string> => {
    const lockedStickers = STICKERS_LIST.filter(s => !unlockedStickers.includes(s.id));
    const lockedClothing = CLOTHING_LIST.filter(c => !unlockedClothing.includes(c.id));

    let rewardText = '';

    if (lockedStickers.length > 0 && (lockedClothing.length === 0 || Math.random() > 0.4)) {
      const chosen = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
      const updatedStickers = [...unlockedStickers, chosen.id];
      setUnlockedStickers(updatedStickers);
      await AsyncStorage.setItem(key('game_stickers'), JSON.stringify(updatedStickers));
      scheduleSync({ unlockedStickers: updatedStickers });
      rewardText = `Figurinha: ${chosen.emoji}`;
    } else if (lockedClothing.length > 0) {
      const chosen = lockedClothing[Math.floor(Math.random() * lockedClothing.length)];
      const updatedClothing = [...unlockedClothing, chosen.id];
      setUnlockedClothing(updatedClothing);
      await AsyncStorage.setItem(key('game_clothing'), JSON.stringify(updatedClothing));
      scheduleSync({ unlockedClothing: updatedClothing });
      rewardText = `Roupa: ${chosen.emoji}`;
    } else {
      const bonus = 50;
      const updatedCoins = coins + bonus;
      setCoins(updatedCoins);
      await AsyncStorage.setItem(key('game_coins'), String(updatedCoins));
      scheduleSync({ coins: updatedCoins });
      rewardText = `Super Moedas: +${bonus} 🪙`;
    }

    setShowChestModal(false);
    return rewardText;
  };

  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    // Som é configuração global (não por criança)
    await AsyncStorage.setItem('global_sound', String(enabled));
  };

  const setIsPremium = async (premium: boolean) => {
    setIsPremiumState(premium);
    await AsyncStorage.setItem(key('game_premium'), String(premium));
  };

  // Rebusca a assinatura na fonte de verdade (tabela subscriptions).
  // Usado após o retorno do checkout do Stripe, já que o carregamento
  // automático só roda quando childId/parentId mudam.
  const refreshSubscription = async () => {
    if (!parentId) return;
    const sub = await loadParentSubscription(parentId);
    setIsPremiumState(sub.isPremium);
  };

  const resetGameProgress = async () => {
    setStars(0);
    setCoins(0);
    setCharacter(null);
    setAvatarNameState(null);
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

    // Limpar apenas as chaves desta criança
    const keysToRemove = [
      key('game_stars'), key('game_coins'), key('game_character'),
      key('game_stickers'), key('game_clothing'), key('game_equipped_clothing'),
      key('game_challenges_count'), key('game_letters'), key('game_syllables'),
      key('game_words'), key('game_usage'), key('game_premium'), key('game_avatar_name')
    ];
    await AsyncStorage.multiRemove(keysToRemove);

    // Sincronizar reset na nuvem
    if (childId && parentId) {
      await syncChildProfile(childId, parentId, {
        stars: 0, coins: 0, challengesCompleted: 0, character: null,
        avatarName: null, equippedClothing: null, unlockedStickers: [], unlockedClothing: [],
        learnedLetters: [], masteredSyllables: [], readWords: [],
        dailyUsageSeconds: {}, isPremium: false,
      });
    }
  };

  return (
    <GameContext.Provider value={{
      childId, parentId,
      stars, coins, character, avatarName, unlockedStickers, unlockedClothing, equippedClothing,
      challengesCompleted, learnedLetters, masteredSyllables, readWords, soundEnabled, isPremium,
      dailyUsageSeconds, showChestModal, isLoadingProfile, setShowChestModal,
      selectCharacter, setAvatarName, addStars, addCoins, buySticker, buyClothing, equipClothing,
      completeChallenge, resetGameProgress, setSoundEnabled, setIsPremium, refreshSubscription, claimChestReward
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
