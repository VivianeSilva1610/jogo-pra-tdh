import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert, Dimensions } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { StarIcon, CoinIcon, getAvatarComponent } from '../components/VectorIcons';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path, Circle, Ellipse, Rect, G, Polygon, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { THEME_COLORS, FONT_SIZES } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playSound } from '../services/audio';
import { speak } from '../services/speech';
import { DropShadow } from '../components/DropShadow';
import { TrailPath } from '../components/TrailPath';
import { LevelNode, LevelNodeState } from '../components/LevelNode';
import { HUDBadge } from '../components/HUDBadge';

const TRAIL_D = 'M 260 1040 Q 140 980 130 920 T 80 810 T 190 690 T 280 570 T 160 450 T 90 320 T 200 170';

// Terreno de fundo: duas colinas orgânicas sobrepostas com gradiente vertical
// sutil (mais claro em cima, mais escuro embaixo) para sugerir volume.
const HILL_BACK_D = 'M -20 1220 C 60 1000 -40 700 40 480 C 110 280 -20 120 60 -20 L 400 -20 L 400 1220 Z';
const HILL_FRONT_D = 'M -20 1220 C 100 1050 20 780 90 560 C 150 340 40 160 130 -20 L 400 -20 L 400 1220 Z';

// Tufos de grama espalhados pelo mapa (textura leve, sem custo de imagens)
const GRASS_TUFTS = [
  { x: 30, y: 1150 }, { x: 300, y: 1120 }, { x: 340, y: 960 }, { x: 20, y: 880 },
  { x: 250, y: 780 }, { x: 40, y: 660 }, { x: 320, y: 500 }, { x: 60, y: 260 },
  { x: 240, y: 200 }, { x: 300, y: 1000 }, { x: 15, y: 500 }, { x: 260, y: 900 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameNode {
  id: string;
  num: number;
  titleKey: 'game1Title' | 'game2Title' | 'game3Title' | 'game4Title' | 'game5Title' | 'game6Title' | 'game7Title';
  color: string;
  borderColor: string;
  emoji: string;
  x: number;
  y: number;
}

const GAMES_LIST: GameNode[] = [
  { id: 'game_1', num: 1, titleKey: 'game1Title', color: '#A8E6A3', borderColor: '#81C784', emoji: '🌳', x: 260, y: 1040 },
  { id: 'game_2', num: 2, titleKey: 'game2Title', color: '#FFD166', borderColor: '#FFB74D', emoji: '🐝', x: 130, y: 920 },
  { id: 'game_3', num: 3, titleKey: 'game3Title', color: '#BEE9FF', borderColor: '#4FC3F7', emoji: '🫧', x: 80, y: 810 },
  { id: 'game_4', num: 4, titleKey: 'game4Title', color: '#8E7CFF', borderColor: '#7E57C2', emoji: '🗣️', x: 190, y: 690 },
  { id: 'game_5', num: 5, titleKey: 'game5Title', color: '#FF8A80', borderColor: '#FF5252', emoji: '🧩', x: 280, y: 570 },
  { id: 'game_6', num: 6, titleKey: 'game6Title', color: '#D4E157', borderColor: '#AFB42B', emoji: '🍎', x: 160, y: 450 },
  { id: 'game_7', num: 7, titleKey: 'game7Title', color: '#BEE9FF', borderColor: '#81D4FA', emoji: '🏰', x: 90, y: 320 },
];

const INTERMEDIATE_STONES = [
  { x: 210, y: 1000 },
  { x: 165, y: 960 },
  { x: 100, y: 870 },
  { x: 85, y: 840 },
  { x: 110, y: 760 },
  { x: 150, y: 730 },
  { x: 230, y: 640 },
  { x: 265, y: 605 },
  { x: 240, y: 520 },
  { x: 190, y: 485 },
  { x: 130, y: 400 },
  { x: 105, y: 360 },
  { x: 135, y: 265 },
  { x: 170, y: 215 },
];

export const GameMapScreen: React.FC<{ onNavigate: (screen: string) => void; onSelectGame: (gameId: string) => void }> = ({ onNavigate, onSelectGame }) => {
  const { t, language } = useLocalization();
  const { stars, coins, character, equippedClothing, childId, challengesCompleted, setShowChestModal, soundEnabled, isPremium } = useGame();

  // Free: games 1-2 in any language, unlimited. Premium: games 3-7 + all extra content.
  const isFreemiumLocked = (gameIndex: number): boolean => {
    if (isPremium) return false;
    return gameIndex >= 2;
  };

  const [claimedChests, setClaimedChests] = useState<string[]>([]);
  const glowAnim = useRef(new Animated.Value(0.7)).current;

  // Determinar o nível de dificuldade ativo (Fácil, Médio, Difícil) e o nó correspondente
  const difficulty = Math.floor(challengesCompleted / 7) % 3; // 0: Fácil, 1: Médio, 2: Difícil
  const currentActiveIndex = challengesCompleted % 7; // 0 a 6
  const initialNode = GAMES_LIST[currentActiveIndex];

  // Referência para animação do avatar
  const avatarX = useRef(new Animated.Value(initialNode.x)).current;
  const avatarY = useRef(new Animated.Value(initialNode.y)).current;

  useEffect(() => {
    // Carregar baús resgatados
    const loadChests = async () => {
      if (childId) {
        const key = `claimed_chests_${childId}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          setClaimedChests(JSON.parse(saved));
        }
      }
    };
    loadChests();

    // Loop de pulsação para as pedras iluminadas
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [childId]);

  const handleChestPress = async (chestId: string, requiredStars: number) => {
    if (claimedChests.includes(chestId)) {
      speak(t('chestAlreadyClaimed') || 'Você já abriu este baú!', language);
      Alert.alert(t('attention') || 'Atenção', 'Você já abriu este baú!');
      return;
    }

    if (stars < requiredStars) {
      const msg = `Você precisa de ${requiredStars} estrelas para abrir este baú! Você tem ${stars}.`;
      speak(msg, language);
      Alert.alert('Baú Trancado', msg);
      return;
    }

    // Unlocked!
    setShowChestModal(true);
    const updated = [...claimedChests, chestId];
    setClaimedChests(updated);
    if (childId) {
      await AsyncStorage.setItem(`claimed_chests_${childId}`, JSON.stringify(updated));
    }
  };

  const handleSelectNode = (gameId: string, gameIndex: number, nodeX: number, nodeY: number) => {
    playSound('pop', soundEnabled);

    if (isFreemiumLocked(gameIndex)) {
      onNavigate('paywall');
      return;
    }

    // Animar personagem até o nó
    Animated.spring(avatarX, { toValue: nodeX, friction: 6, tension: 40, useNativeDriver: true }).start();
    Animated.spring(avatarY, { toValue: nodeY, friction: 6, tension: 40, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        onSelectGame(gameId);
      }, 300);
    });
  };

  const handleSelectLibrary = () => {
    playSound('pop', soundEnabled);
    Animated.spring(avatarX, { toValue: 200, friction: 6, tension: 40, useNativeDriver: true }).start();
    Animated.spring(avatarY, { toValue: 170, friction: 6, tension: 40, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        onNavigate('collection');
      }, 300);
    });
  };

  const handleSelectDeletion = () => {
    playSound('pop', soundEnabled);
    Animated.spring(avatarX, { toValue: 330, friction: 6, tension: 40, useNativeDriver: true }).start();
    Animated.spring(avatarY, { toValue: 960, friction: 6, tension: 40, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        onSelectGame('game_deletion');
      }, 300);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => onNavigate('home')}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('gameListTitle')}</Text>

        <View style={styles.scores}>
          <HUDBadge icon={<StarIcon size={18} />} value={stars} />
          <HUDBadge icon={<CoinIcon size={18} />} value={coins} />
        </View>
      </View>

      {/* MAPA EM SCROLL */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapCanvas}>
          
          {/* BANDEIRA DE DIFICULDADE */}
          <View style={[
            styles.difficultyBanner,
            difficulty === 0 ? styles.bannerEasy : difficulty === 1 ? styles.bannerMedium : styles.bannerHard
          ]}>
            <Text style={[
              styles.difficultyText,
              difficulty === 0 ? styles.textEasy : difficulty === 1 ? styles.textMedium : styles.textHard
            ]}>
              {difficulty === 0 ? t('difficultyEasy') : difficulty === 1 ? t('difficultyMedium') : t('difficultyHard')}
            </Text>
          </View>
          
          {/* SVG DO TERRENO, CAMINHO E DOS MUNDOS */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="1200">
            <Defs>
              <LinearGradient id="hillBackGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#CFEFC9" />
                <Stop offset="100%" stopColor="#9FDB9A" />
              </LinearGradient>
              <LinearGradient id="hillFrontGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#B7E8B0" />
                <Stop offset="100%" stopColor="#7FCB78" />
              </LinearGradient>
              <LinearGradient id="purpleTowerGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#c9b6f5" />
                <Stop offset="55%" stopColor="#9a7de0" />
                <Stop offset="100%" stopColor="#6647ad" />
              </LinearGradient>
              <LinearGradient id="pinkCastleGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#eccdf2" />
                <Stop offset="55%" stopColor="#cf9de3" />
                <Stop offset="100%" stopColor="#9d5cb8" />
              </LinearGradient>
              <LinearGradient id="greenBushGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#C5F0C0" />
                <Stop offset="100%" stopColor="#5FAE58" />
              </LinearGradient>
              <LinearGradient id="houseGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#FFF0B8" />
                <Stop offset="100%" stopColor="#E8B84B" />
              </LinearGradient>
            </Defs>

            {/* Colinas de fundo com volume (gradiente vertical) */}
            <Path d={HILL_BACK_D} fill="url(#hillBackGrad)" />
            <Path d={HILL_FRONT_D} fill="url(#hillFrontGrad)" />
            {GRASS_TUFTS.map((tuft, idx) => (
              <Ellipse key={idx} cx={tuft.x} cy={tuft.y} rx="6" ry="2.5" fill="#4E9548" opacity="0.25" />
            ))}

            {/* Trilha sinuosa entre os níveis */}
            <TrailPath d={TRAIL_D} />

            {/* MUNDO 1: Jardim das Letras */}
            <G transform="translate(45, 1020)">
              <Ellipse cx="0" cy="34" rx="26" ry="7" fill="#0c1e02" opacity="0.18" />
              <Circle cx="0" cy="0" r="30" fill="url(#greenBushGrad)" opacity="0.95" />
              <Circle cx="-10" cy="-12" r="20" fill="#81C784" />
              <Circle cx="12" cy="-8" r="16" fill="#66BB6A" />
              <SvgText x="-18" y="20" fill="#5D4037" fontSize="11" fontWeight="bold">Jardim</SvgText>
              <SvgText x="-12" y="-12" fill="#FFF" fontSize="16" fontWeight="900">A</SvgText>
              <SvgText x="8" y="-4" fill="#FFF" fontSize="12" fontWeight="900">B</SvgText>
            </G>

            {/* MUNDO 2: Floresta das Sílabas */}
            <G transform="translate(330, 715)">
              <Ellipse cx="0" cy="16" rx="28" ry="7" fill="#0c1e02" opacity="0.18" />
              <Rect x="-25" y="-10" width="50" height="20" rx="10" fill="#8D6E63" />
              <Circle cx="-15" cy="-20" r="25" fill="url(#greenBushGrad)" />
              <Circle cx="15" cy="-20" r="20" fill="#AED581" />
              {/* Cogumelo gigante */}
              <Path d="M-5 -2 L5 -2 L5 12 L-5 12 Z" fill="#FFF" />
              <Path d="M-10 -2 C-10 -15 10 -15 10 -2 Z" fill="#FF8A80" />
              <Circle cx="-3" cy="-7" r="1.5" fill="#FFF" />
              <Circle cx="3" cy="-6" r="1.5" fill="#FFF" />
              <SvgText x="-20" y="26" fill="#5D4037" fontSize="11" fontWeight="bold">Floresta</SvgText>
            </G>

            {/* MUNDO 3: Vale das Palavras */}
            <G transform="translate(50, 520)">
              <Ellipse cx="0" cy="27" rx="26" ry="6" fill="#0c1e02" opacity="0.18" />
              {/* Casinha */}
              <Rect x="-20" y="-5" width="40" height="30" fill="url(#houseGrad)" stroke="#5D4037" strokeWidth="2" />
              <Polygon points="-25,-5 0,-25 25,-5" fill="#FF8A80" stroke="#5D4037" strokeWidth="2" />
              <Rect x="-6" y="8" width="12" height="17" fill="#8D6E63" />
              <Circle cx="10" cy="5" r="4" fill="#FFF9C4" />
              <SvgText x="-12" y="38" fill="#5D4037" fontSize="11" fontWeight="bold">Vale</SvgText>
            </G>

            {/* MUNDO 4: Castelo das Frases */}
            <G transform="translate(320, 310)">
              <Ellipse cx="0" cy="27" rx="30" ry="7" fill="#0c1e02" opacity="0.18" />
              {/* Castelo */}
              <Rect x="-25" y="-10" width="50" height="35" fill="url(#pinkCastleGrad)" stroke="#5D4037" strokeWidth="2" />
              <Rect x="-22" y="-25" width="10" height="15" fill="#CE93D8" stroke="#5D4037" strokeWidth="2" />
              <Rect x="12" y="-25" width="10" height="15" fill="#CE93D8" stroke="#5D4037" strokeWidth="2" />
              <Polygon points="-25,-25 -17,-40 -9,-25" fill="#BA68C8" />
              <Polygon points="9,-25 17,-40 25,-25" fill="#BA68C8" />
              <Rect x="-6" y="8" width="12" height="17" rx="3" fill="#5D4037" />
              {/* Reflexo de luz (superior-esquerda) */}
              <Path d="M-24 -9 L-24 22" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
              <SvgText x="-22" y="38" fill="#5D4037" fontSize="11" fontWeight="bold">Castelo</SvgText>
            </G>

            {/* MUNDO 5: Biblioteca Mágica */}
            <G transform="translate(200, 100)">
              <Ellipse cx="0" cy="41" rx="22" ry="6" fill="#0c1e02" opacity="0.18" />
              {/* Torre alta com chapéu estrelado */}
              <Rect x="-15" y="-15" width="30" height="55" fill="url(#purpleTowerGrad)" stroke="#5D4037" strokeWidth="2" />
              <Polygon points="-22,-15 0,-45 22,-15" fill="#8E7CFF" stroke="#5D4037" strokeWidth="2" />
              <Circle cx="0" cy="-30" r="2.5" fill="#FFF9C4" />
              <Circle cx="-8" cy="-22" r="1.5" fill="#FFF9C4" />
              <Circle cx="8" cy="-22" r="1.5" fill="#FFF9C4" />
              <Rect x="-5" y="20" width="10" height="20" fill="#5D4037" />
              {/* Reflexo de luz (superior-esquerda) */}
              <Path d="M-14 -13 L-14 33" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
              {/* Livro flutuante */}
              <Path d="M-25 -50 Q-15 -47 0 -52 Q15 -47 25 -50 L25 -42 Q15 -39 0 -44 Q-15 -39 -25 -42 Z" fill="#FFD166" />
              <SvgText x="-30" y="-58" fill="#8E7CFF" fontSize="10" fontWeight="extrabold">BIBLIOTECA</SvgText>
            </G>
          </Svg>

          {/* RENDERIZAR PEDRAS ILUMINADAS (PONTOS INTERMEDIÁRIOS) */}
          {INTERMEDIATE_STONES.map((stone, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.stone,
                {
                  left: stone.x - 10,
                  top: stone.y - 10,
                  transform: [{ scale: glowAnim }],
                },
              ]}
            />
          ))}

          {/* RENDERIZAR BAÚS DE RECOMPENSA */}
          {/* Baú 1 (10 estrelas) */}
          <DropShadow width={40} height={12} style={{ position: 'absolute', left: 50, top: 895 }} />
          <TouchableOpacity
            style={[styles.chestPoint, { left: 45, top: 870 }]}
            onPress={() => handleChestPress('chest_10_stars', 10)}
            activeOpacity={0.8}
          >
            <Text style={styles.chestEmoji}>{claimedChests.includes('chest_10_stars') ? '🔓' : '🎁'}</Text>
            <View style={styles.chestStarsBadge}><Text style={styles.chestStarsBadgeText}>⭐10</Text></View>
          </TouchableOpacity>

          {/* Baú 2 (25 estrelas) */}
          <DropShadow width={40} height={12} style={{ position: 'absolute', left: 290, top: 655 }} />
          <TouchableOpacity
            style={[styles.chestPoint, { left: 285, top: 630 }]}
            onPress={() => handleChestPress('chest_25_stars', 25)}
            activeOpacity={0.8}
          >
            <Text style={styles.chestEmoji}>{claimedChests.includes('chest_25_stars') ? '🔓' : '🎁'}</Text>
            <View style={styles.chestStarsBadge}><Text style={styles.chestStarsBadgeText}>⭐25</Text></View>
          </TouchableOpacity>

          {/* Baú 3 (50 estrelas) */}
          <DropShadow width={40} height={12} style={{ position: 'absolute', left: 50, top: 415 }} />
          <TouchableOpacity
            style={[styles.chestPoint, { left: 45, top: 390 }]}
            onPress={() => handleChestPress('chest_50_stars', 50)}
            activeOpacity={0.8}
          >
            <Text style={styles.chestEmoji}>{claimedChests.includes('chest_50_stars') ? '🔓' : '🎁'}</Text>
            <View style={styles.chestStarsBadge}><Text style={styles.chestStarsBadgeText}>⭐50</Text></View>
          </TouchableOpacity>

          {/* NÓS DOS MINIJOGOS */}
          {GAMES_LIST.map((game, index) => {
            const isProgressionLocked = (challengesCompleted % 7) < index;
            const isCompleted = (challengesCompleted % 7) > index;
            const freemiumLocked = isFreemiumLocked(index);
            const isDisabled = isProgressionLocked;

            const state: LevelNodeState = isProgressionLocked
              ? 'locked'
              : freemiumLocked
              ? 'freemiumLocked'
              : isCompleted
              ? 'completed'
              : 'current';

            return (
              <LevelNode
                key={game.id}
                state={state}
                color={game.color}
                emoji={game.emoji}
                title={t(game.titleKey)}
                titleSide={game.x >= 200 ? 'left' : 'right'}
                disabled={isDisabled}
                onPress={() => handleSelectNode(game.id, index, game.x, game.y)}
                style={{ left: game.x - 32, top: game.y - 35 }}
              />
            );
          })}

          {/* NÓ DA BIBLIOTECA MÁGICA */}
          <LevelNode
            state="available"
            color="#E1BEE7"
            emoji="📚"
            title={t('worldLibrary')}
            titleSide="right"
            onPress={handleSelectLibrary}
            style={{ left: 138, top: 100 }}
          />

          {/* NÓ DA SÍLABA ESCONDIDA (deleção fonêmica) — desafio bônus, sempre disponível */}
          <LevelNode
            state="available"
            color="#F48FB1"
            emoji="🔍"
            title={t('game8Title')}
            titleSide="left"
            onPress={handleSelectDeletion}
            style={{ left: 298, top: 925 }}
          />

          {/* PERSONAGEM ANIMADO FLUTUANDO NO MAPA */}
          {character && (
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  transform: [
                    { translateX: avatarX },
                    { translateY: avatarY },
                    { translateX: -35 },
                    { translateY: -35 },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <View style={styles.avatarInner}>
                {getAvatarComponent(character, 70, equippedClothing)}
              </View>
            </Animated.View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Verde floresta de fundo
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: THEME_COLORS.softWhite,
    borderBottomWidth: 3,
    borderColor: '#C8E6C9',
    shadowColor: THEME_COLORS.brownDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME_COLORS.orangeDark,
  },
  scores: {
    flexDirection: 'row',
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  mapCanvas: {
    height: 1200,
    width: '100%',
    position: 'relative',
  },
  stone: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF8E1',
    borderWidth: 3,
    borderColor: THEME_COLORS.goldenYellow,
    shadowColor: '#FFD166',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  chestPoint: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
  },
  chestEmoji: {
    fontSize: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  chestStarsBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: THEME_COLORS.goldenYellow,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#F4BD3F',
  },
  chestStarsBadgeText: {
    fontSize: FONT_SIZES.micro,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
  },
  avatarContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    zIndex: 10,
  },
  avatarInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    borderWidth: 3.5,
    borderColor: THEME_COLORS.magicPurple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  difficultyBanner: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderBottomWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 20,
  },
  bannerEasy: {
    borderColor: '#81C784',
  },
  bannerMedium: {
    borderColor: '#FFB74D',
  },
  bannerHard: {
    borderColor: '#FF8A80',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  textEasy: {
    color: '#2E7D32',
  },
  textMedium: {
    color: '#E65100',
  },
  textHard: {
    color: '#C62828',
  },
});
