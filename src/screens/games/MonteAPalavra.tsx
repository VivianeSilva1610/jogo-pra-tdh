import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface MonteAPalavraProps {
  onBack: () => void;
}

interface WordOption {
  word: string;
  emoji: string;
  soundText: string;
}

const WORDS_POOL: WordOption[] = [
  { word: 'CASA', emoji: '🏠', soundText: 'Casa' },
  { word: 'BOLA', emoji: '⚽', soundText: 'Bola' },
  { word: 'TREM', emoji: '🚂', soundText: 'Trem' },
  { word: 'GATO', emoji: '🐱', soundText: 'Gato' }
];

export const MonteAPalavra: React.FC<MonteAPalavraProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [currentWordObj, setCurrentWordObj] = useState<WordOption>(WORDS_POOL[0]);
  const [shuffledLetters, setShuffledLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Animação para construir/ampliar o item (ex: a casa crescendo na tela)
  const buildScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Escolhe uma palavra aleatória do pool
    const selected = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
    setCurrentWordObj(selected);
    setTypedLetters([]);
    setRoundCompleted(false);
    buildScale.setValue(0);

    // Separar letras, atribuir ID para evitar duplicatas nos cliques e embaralhar
    const letters = selected.word.split('').map((char, index) => ({
      id: index,
      char,
      used: false
    }));

    setShuffledLetters(letters.sort(() => Math.random() - 0.5));
  }, []);

  const handleLetterTap = (letterItem: { id: number; char: string; used: boolean }) => {
    if (roundCompleted || letterItem.used) return;

    const nextIndex = typedLetters.length;
    const expectedChar = currentWordObj.word[nextIndex];

    if (letterItem.char === expectedChar) {
      // Letra certa!
      playSound('pop', soundEnabled);
      
      // Marcar letra como usada no grid inferior
      setShuffledLetters(prev => prev.map(item => item.id === letterItem.id ? { ...item, used: true } : item));
      
      // Adicionar à palavra montada
      const newTyped = [...typedLetters, letterItem.char];
      setTypedLetters(newTyped);

      // Falar a letra digitada
      speak(letterItem.char, language);

      // Verificar se a palavra foi completamente formada
      if (newTyped.length === currentWordObj.word.length) {
        setRoundCompleted(true);
        playSound('success', soundEnabled);
        
        // Animação de construção do elemento (cresce com mola)
        Animated.spring(buildScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true
        }).start(() => {
          // Falar a palavra completa e concluir depois de 3 segundos
          speak(currentWordObj.soundText, language);
        });

        setTimeout(async () => {
          await completeChallenge('word', currentWordObj.word);
          onBack();
        }, 3500);
      }
    } else {
      // Letra errada (Wiggle / tremor sem punir)
      playSound('pop', soundEnabled);
      speak(t('tryAgain'), language);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game5Title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game5Prompt', { word: currentWordObj.word })} />

      <View style={styles.gameArea}>
        
        {/* Espaços da Palavra (Slots) */}
        <View style={styles.wordSlotsRow}>
          {currentWordObj.word.split('').map((char, index) => {
            const isFilled = index < typedLetters.length;
            return (
              <View key={index} style={[styles.slot, isFilled && styles.slotFilled]}>
                <Text style={styles.slotText}>
                  {isFilled ? typedLetters[index] : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ANIMAÇÃO DE CONSTRUÇÃO DO ELEMENTO (CASA, BOLA, TREM...) */}
        <View style={styles.buildArea}>
          {roundCompleted && (
            <Animated.View style={{ transform: [{ scale: buildScale }], alignItems: 'center' }}>
              <Text style={styles.buildEmoji}>{currentWordObj.emoji}</Text>
              <Text style={styles.buildLabel}>{currentWordObj.word}</Text>
            </Animated.View>
          )}
        </View>

        {/* Letras Embaralhadas para Clicar */}
        {!roundCompleted && (
          <View style={styles.lettersRow}>
            {shuffledLetters.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[styles.letterBtn, item.used && styles.letterBtnUsed]}
                  onPress={() => handleLetterTap(item)}
                  disabled={item.used}
                >
                  <Text style={[styles.letterBtnText, item.used && styles.letterBtnTextUsed]}>
                    {item.char}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBEE', // Vermelho/Rosa clarinho acolhedor
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#FFCDD2',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  wordSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  slot: {
    width: 54,
    height: 60,
    borderBottomWidth: 4,
    borderColor: '#FF8A80',
    backgroundColor: '#FFF',
    marginHorizontal: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  slotFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  slotText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2E7D32',
  },
  buildArea: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buildEmoji: {
    fontSize: 90,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  buildLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: '#C2185B',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  lettersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '90%',
    maxWidth: 400,
    marginBottom: 10,
  },
  letterBtn: {
    backgroundColor: '#FFF',
    width: 64,
    height: 64,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FF8A80',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  letterBtnUsed: {
    backgroundColor: '#ECEFF1',
    borderColor: '#B0BEC5',
    opacity: 0.3,
  },
  letterBtnText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  letterBtnTextUsed: {
    color: '#90A4AE',
  },
});
