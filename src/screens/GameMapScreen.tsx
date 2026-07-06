import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert, Dimensions } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { StarIcon, CoinIcon, getAvatarComponent } from '../components/VectorIcons';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G, Polygon, Text as SvgText } from 'react-native-svg';
import { THEME_COLORS } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playSound } from '../services/audio';
import { speak } from '../services/speech';

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

  // Free: games 1-2 in PT-BR only. Premium: all games + all languages.
  const isFreemiumLocked = (gameIndex: number): boolean => {
    if (isPremium) return false;
    if (language !== 'pt') return true; // non-PT requires premium
    return gameIndex >= 2;             // games 3-7 require premium
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
          <View style={styles.scoreBadge}>
            <StarIcon size={18} />
            <Text style={styles.scoreText}>{stars}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <CoinIcon size={18} />
            <Text style={styles.scoreText}>{coins}</Text>
          </View>
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
          
          {/* SVG DO CAMINHO E DOS MUNDOS */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="1200">
            {/* Linha sinuosa de fundo */}
            <Path 
              d="M 260 1040 Q 140 980 130 920 T 80 810 T 190 690 T 280 570 T 160 450 T 90 320 T 200 170" 
              fill="none" 
              stroke="#FFE082" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
            <Path 
              d="M 260 1040 Q 140 980 130 920 T 80 810 T 190 690 T 280 570 T 160 450 T 90 320 T 200 170" 
              fill="none" 
              stroke="#FFF" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray="6, 8"
            />

            {/* MUNDO 1: Jardim das Letras */}
            <G transform="translate(45, 1020)">
              <Circle cx="0" cy="0" r="30" fill="#A8E6A3" opacity="0.9" />
              <Circle cx="-10" cy="-12" r="20" fill="#81C784" />
              <Circle cx="12" cy="-8" r="16" fill="#66BB6A" />
              <SvgText x="-18" y="20" fill="#5D4037" fontSize="11" fontWeight="bold">Jardim</SvgText>
              <SvgText x="-12" y="-12" fill="#FFF" fontSize="16" fontWeight="900">A</SvgText>
              <SvgText x="8" y="-4" fill="#FFF" fontSize="12" fontWeight="900">B</SvgText>
            </G>

            {/* MUNDO 2: Floresta das Sílabas */}
            <G transform="translate(330, 715)">
              <Rect x="-25" y="-10" width="50" height="20" rx="10" fill="#8D6E63" />
              <Circle cx="-15" cy="-20" r="25" fill="#81C784" />
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
              {/* Casinha */}
              <Rect x="-20" y="-5" width="40" height="30" fill="#FFE082" stroke="#5D4037" strokeWidth="2" />
              <Polygon points="-25,-5 0,-25 25,-5" fill="#FF8A80" stroke="#5D4037" strokeWidth="2" />
              <Rect x="-6" y="8" width="12" height="17" fill="#8D6E63" />
              <Circle cx="10" cy="5" r="4" fill="#FFF9C4" />
              <SvgText x="-12" y="38" fill="#5D4037" fontSize="11" fontWeight="bold">Vale</SvgText>
            </G>

            {/* MUNDO 4: Castelo das Frases */}
            <G transform="translate(320, 310)">
              {/* Castelo */}
              <Rect x="-25" y="-10" width="50" height="35" fill="#E1BEE7" stroke="#5D4037" strokeWidth="2" />
              <Rect x="-22" y="-25" width="10" height="15" fill="#CE93D8" stroke="#5D4037" strokeWidth="2" />
              <Rect x="12" y="-25" width="10" height="15" fill="#CE93D8" stroke="#5D4037" strokeWidth="2" />
              <Polygon points="-25,-25 -17,-40 -9,-25" fill="#BA68C8" />
              <Polygon points="9,-25 17,-40 25,-25" fill="#BA68C8" />
              <Rect x="-6" y="8" width="12" height="17" rx="3" fill="#5D4037" />
              <SvgText x="-22" y="38" fill="#5D4037" fontSize="11" fontWeight="bold">Castelo</SvgText>
            </G>

            {/* MUNDO 5: Biblioteca Mágica */}
            <G transform="translate(200, 100)">
              {/* Torre alta com chapéu estrelado */}
              <Rect x="-15" y="-15" width="30" height="55" fill="#D1C4E9" stroke="#5D4037" strokeWidth="2" />
              <Polygon points="-22,-15 0,-45 22,-15" fill="#8E7CFF" stroke="#5D4037" strokeWidth="2" />
              <Circle cx="0" cy="-30" r="2.5" fill="#FFF9C4" />
              <Circle cx="-8" cy="-22" r="1.5" fill="#FFF9C4" />
              <Circle cx="8" cy="-22" r="1.5" fill="#FFF9C4" />
              <Rect x="-5" y="20" width="10" height="20" fill="#5D4037" />
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
          <TouchableOpacity 
            style={[styles.chestPoint, { left: 45, top: 870 }]} 
            onPress={() => handleChestPress('chest_10_stars', 10)}
            activeOpacity={0.8}
          >
            <Text style={styles.chestEmoji}>{claimedChests.includes('chest_10_stars') ? '🔓' : '🎁'}</Text>
            <View style={styles.chestStarsBadge}><Text style={styles.chestStarsBadgeText}>⭐10</Text></View>
          </TouchableOpacity>

          {/* Baú 2 (25 estrelas) */}
          <TouchableOpacity 
            style={[styles.chestPoint, { left: 285, top: 630 }]} 
            onPress={() => handleChestPress('chest_25_stars', 25)}
            activeOpacity={0.8}
          >
            <Text style={styles.chestEmoji}>{claimedChests.includes('chest_25_stars') ? '🔓' : '🎁'}</Text>
            <View style={styles.chestStarsBadge}><Text style={styles.chestStarsBadgeText}>⭐25</Text></View>
          </TouchableOpacity>

          {/* Baú 3 (50 estrelas) */}
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

            const bgColor = isProgressionLocked ? '#CFD8DC' : freemiumLocked ? '#E8D5F5' : game.color;
            const borderColor = isProgressionLocked ? '#90A4AE' : freemiumLocked ? '#AB47BC' : game.borderColor;

            return (
              <TouchableOpacity
                key={game.id}
                activeOpacity={isDisabled ? 1 : 0.7}
                disabled={isDisabled}
                onPress={() => handleSelectNode(game.id, index, game.x, game.y)}
                style={[
                  styles.nodeButton,
                  { left: game.x - 30, top: game.y - 35, backgroundColor: bgColor, borderColor }
                ]}
              >
                {isProgressionLocked ? (
                  <Text style={styles.nodeLockText}>🔒</Text>
                ) : freemiumLocked ? (
                  <Text style={styles.nodeLockText}>⭐🔒</Text>
                ) : (
                  <>
                    <Text style={styles.nodeEmoji}>{game.emoji}</Text>
                    {isCompleted && <Text style={styles.checkmarkBadge}>✓</Text>}
                  </>
                )}
                <View style={[styles.titleBubble, game.x >= 200 ? styles.titleLeft : styles.titleRight]}>
                  <Text style={styles.titleBubbleText}>{t(game.titleKey)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* NÓ DA BIBLIOTECA MÁGICA */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSelectLibrary}
            style={[
              styles.nodeButton,
              styles.libraryNodeButton,
              { left: 170, top: 135 }
            ]}
          >
            <Text style={styles.nodeEmoji}>📚</Text>
          </TouchableOpacity>

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
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 6,
    borderWidth: 2,
    borderColor: THEME_COLORS.goldenYellow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
    marginLeft: 3,
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
  nodeButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderBottomWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.brownDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 5,
  },
  libraryNodeButton: {
    backgroundColor: '#E1BEE7',
    borderColor: '#8E7CFF',
    borderBottomColor: '#7E57C2',
  },
  nodeLockText: {
    fontSize: 22,
  },
  nodeEmoji: {
    fontSize: 28,
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 16,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  titleBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#D7CCC8',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  titleRight: {
    left: 70,
  },
  titleLeft: {
    right: 70,
  },
  titleBubbleText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME_COLORS.brownDark,
    textAlign: 'center',
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
    fontSize: 9,
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
