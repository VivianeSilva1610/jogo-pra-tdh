import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { CustomButton } from '../components/CustomButton';
import { StarIcon, CoinIcon } from '../components/VectorIcons';
import { ArrowLeft } from 'lucide-react-native';

interface GameMapScreenProps {
  onNavigate: (screen: string) => void;
  onSelectGame: (gameId: string) => void;
}

interface GameNode {
  id: string;
  num: number;
  titleKey: 'game1Title' | 'game2Title' | 'game3Title' | 'game4Title' | 'game5Title' | 'game6Title' | 'game7Title';
  color: string;
  borderColor: string;
  emoji: string;
}

const GAMES_LIST: GameNode[] = [
  { id: 'game_1', num: 1, titleKey: 'game1Title', color: '#81C784', borderColor: '#4CAF50', emoji: '🌳' },
  { id: 'game_2', num: 2, titleKey: 'game2Title', color: '#FFB74D', borderColor: '#FF9800', emoji: '🐝' },
  { id: 'game_3', num: 3, titleKey: 'game3Title', color: '#4FC3F7', borderColor: '#03A9F4', emoji: '🫧' },
  { id: 'game_4', num: 4, titleKey: 'game4Title', color: '#BA68C8', borderColor: '#9C27B0', emoji: '🗣️' },
  { id: 'game_5', num: 5, titleKey: 'game5Title', color: '#FF8A80', borderColor: '#FF5252', emoji: '🧩' },
  { id: 'game_6', num: 6, titleKey: 'game6Title', color: '#D4E157', borderColor: '#AFB42B', emoji: '🍎' },
  { id: 'game_7', num: 7, titleKey: 'game7Title', color: '#A1887F', borderColor: '#795548', emoji: '🏰' },
];

export const GameMapScreen: React.FC<GameMapScreenProps> = ({ onNavigate, onSelectGame }) => {
  const { t } = useLocalization();
  const { stars, coins } = useGame();

  const handlePlayGame = (gameId: string) => {
    onSelectGame(gameId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => onNavigate('home')}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={24} color="#37474F" />
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

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.pathContainer}>
          {GAMES_LIST.map((game, index) => {
            // Desenhar um caminho sinuoso alternando margem esquerda e direita
            const isLeft = index % 2 === 0;
            const alignStyle = isLeft ? styles.alignLeft : styles.alignRight;

            return (
              <View key={game.id} style={[styles.nodeWrapper, alignStyle]}>
                {/* Linhas conectando os nós no mapa */}
                {index < GAMES_LIST.length - 1 && (
                  <View style={[styles.connector, isLeft ? styles.connectorRight : styles.connectorLeft]} />
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handlePlayGame(game.id)}
                  style={[
                    styles.woodBoard,
                    { backgroundColor: game.color, borderColor: game.borderColor }
                  ]}
                >
                  <View style={styles.badgeNumber}>
                    <Text style={styles.numberText}>{game.num}</Text>
                  </View>
                  <Text style={styles.boardEmoji}>{game.emoji}</Text>
                  <Text style={styles.boardText}>{t(game.titleKey)}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Floresta verde clarinha
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 3,
    borderColor: '#C8E6C9',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  scores: {
    flexDirection: 'row',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#37474F',
    marginLeft: 3,
  },
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  pathContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  nodeWrapper: {
    width: '80%',
    marginVertical: 20,
    position: 'relative',
    zIndex: 2,
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  connector: {
    position: 'absolute',
    height: 90,
    width: 6,
    backgroundColor: '#81C784',
    borderStyle: 'dashed',
    borderRadius: 1,
    zIndex: -1,
  },
  connectorRight: {
    right: -20,
    top: 70,
    transform: [{ rotate: '25deg' }],
  },
  connectorLeft: {
    left: -20,
    top: 70,
    transform: [{ rotate: '-25deg' }],
  },
  woodBoard: {
    borderRadius: 20,
    borderWidth: 4,
    borderBottomWidth: 8, // Efeito 3D de madeira
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#5D4037',
  },
  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  boardEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  boardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
