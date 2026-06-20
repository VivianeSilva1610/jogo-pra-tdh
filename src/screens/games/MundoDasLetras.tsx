import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface MundoDasLetrasProps {
  onBack: () => void;
}

// Dicionário completo de dicas (Imagem/Emoji + Palavra + Sílaba) para todas as 26 letras do alfabeto
const LETTER_HINTS: Record<string, { emoji: string; word: string; syllable: string }> = {
  A: { emoji: '🐝', word: 'Abelha', syllable: 'A' },
  B: { emoji: '⚽', word: 'Bola', syllable: 'BO' },
  C: { emoji: '🏠', word: 'Casa', syllable: 'CA' },
  D: { emoji: '🎲', word: 'Dado', syllable: 'DA' },
  E: { emoji: '🐘', word: 'Elefante', syllable: 'E' },
  F: { emoji: '🔥', word: 'Fogo', syllable: 'FO' },
  G: { emoji: '🐱', word: 'Gato', syllable: 'GA' },
  H: { emoji: '🚁', word: 'Helicóptero', syllable: 'HE' },
  I: { emoji: '🏝️', word: 'Ilha', syllable: 'I' },
  J: { emoji: '🐊', word: 'Jacaré', syllable: 'JA' },
  K: { emoji: '🥝', word: 'Kiwi', syllable: 'KI' },
  L: { emoji: '🦁', word: 'Leão', syllable: 'LE' },
  M: { emoji: '🍎', word: 'Maçã', syllable: 'MA' },
  N: { emoji: '☁️', word: 'Nuvem', syllable: 'NU' },
  O: { emoji: '🥚', word: 'Ovo', syllable: 'O' },
  P: { emoji: '🦆', word: 'Pato', syllable: 'PA' },
  Q: { emoji: '🧀', word: 'Queijo', syllable: 'QUE' },
  R: { emoji: '🐭', word: 'Rato', syllable: 'RA' },
  S: { emoji: '☀️', word: 'Sol', syllable: 'SO' },
  T: { emoji: '🍅', word: 'Tomate', syllable: 'TO' },
  U: { emoji: '🍇', word: 'Uva', syllable: 'U' },
  V: { emoji: '🐮', word: 'Vaca', syllable: 'VA' },
  W: { emoji: '🧇', word: 'Waffle', syllable: 'WA' },
  X: { emoji: '🍵', word: 'Xícara', syllable: 'XI' },
  Y: { emoji: '🍜', word: 'Yakisoba', syllable: 'YA' },
  Z: { emoji: '🦓', word: 'Zebra', syllable: 'ZE' },
};

const TARGET_LETTERS = ['A', 'E', 'I', 'O', 'U', 'B', 'M', 'P', 'T'];

interface ItemData {
  slotIndex: number;
  letter: string;
  emoji: string;
  word: string;
  syllable: string;
  revealed: boolean;
}

export const MundoDasLetras: React.FC<MundoDasLetrasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [targetLetter, setTargetLetter] = useState('A');
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [round, setRound] = useState(1);
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Animações de revelação (posição Y) para cada um dos 4 slots
  const anims = {
    0: useRef(new Animated.Value(0)).current,
    1: useRef(new Animated.Value(0)).current,
    2: useRef(new Animated.Value(0)).current,
    3: useRef(new Animated.Value(0)).current
  };

  // Animações de opacidade para cada um dos 4 slots (fadem para revelar o fundo)
  const opacities = {
    0: useRef(new Animated.Value(1)).current,
    1: useRef(new Animated.Value(1)).current,
    2: useRef(new Animated.Value(1)).current,
    3: useRef(new Animated.Value(1)).current
  };

  // Iniciar nova rodada
  useEffect(() => {
    startNewRound();
  }, [round]);

  const startNewRound = () => {
    // Escolher letra alvo aleatória
    const selectedTarget = TARGET_LETTERS[Math.floor(Math.random() * TARGET_LETTERS.length)];
    setTargetLetter(selectedTarget);
    setRoundCompleted(false);

    // Resetar animações
    Object.keys(anims).forEach(key => {
      const idx = Number(key) as keyof typeof anims;
      Animated.timing(anims[idx], { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(opacities[idx], { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });

    // Distribuir letras nos slots
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== selectedTarget);
    
    // O primeiro slot ganha a letra alvo, os outros ganham letras aleatórias não repetidas
    const selectedWrongLetters: string[] = [];
    while (selectedWrongLetters.length < 3) {
      const randomIdx = Math.floor(Math.random() * alphabet.length);
      const chosenLetter = alphabet[randomIdx];
      if (!selectedWrongLetters.includes(chosenLetter)) {
        selectedWrongLetters.push(chosenLetter);
        alphabet.splice(randomIdx, 1); // remove do pool para não repetir
      }
    }

    const slots = [selectedTarget, ...selectedWrongLetters];

    // Embaralhar os slots
    const shuffledSlots = slots
      .map((letter) => ({ letter }))
      .sort(() => Math.random() - 0.5);

    // Mapear os dados dos cartões com as dicas correspondentes
    const newItemsData = shuffledSlots.map((item, index) => {
      const hint = LETTER_HINTS[item.letter] || { emoji: '❓', word: 'Desconhecido', syllable: item.letter };
      return {
        slotIndex: index,
        letter: item.letter,
        emoji: hint.emoji,
        word: hint.word,
        syllable: hint.syllable,
        revealed: false
      };
    });

    setItemsData(newItemsData);
  };

  const handleTapItem = (slotIndex: number, itemLetter: string) => {
    if (roundCompleted) return;

    // Revelar o item específico
    setItemsData(prev => prev.map((item, idx) => idx === slotIndex ? { ...item, revealed: true } : item));
    
    // Animação paralela: deslizar para cima e sumir (fade-out)
    const animRef = anims[slotIndex as keyof typeof anims];
    const opacityRef = opacities[slotIndex as keyof typeof opacities];

    Animated.parallel([
      Animated.timing(animRef, {
        toValue: -85, // desliza para cima
        duration: 350,
        useNativeDriver: true
      }),
      Animated.timing(opacityRef, {
        toValue: 0, // desaparece por completo
        duration: 350,
        useNativeDriver: true
      })
    ]).start();

    if (itemLetter === targetLetter) {
      // ACERTOU!
      playSound('success', soundEnabled);
      setRoundCompleted(true);
      
      // Espera 2.5s antes de ir para a próxima rodada ou terminar
      setTimeout(async () => {
        if (round < 3) {
          setRound(r => r + 1);
        } else {
          // Desafio finalizado com sucesso!
          await completeChallenge('letter', targetLetter);
          onBack();
        }
      }, 2500);
    } else {
      // ERROU! (Feedback positivo: Lumi diz "Vamos tentar novamente?")
      playSound('pop', soundEnabled);
      // Fazer o item vibrar levemente antes de falar
      Animated.sequence([
        Animated.timing(animRef, { toValue: -75, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -95, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -85, duration: 100, useNativeDriver: true })
      ]).start(() => {
        speak(t('tryAgain'), language);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DO JOGO */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game1Title')}</Text>
        <Text style={styles.roundText}>Rodada {round}/3</Text>
      </View>

      {/* BARRA DE PROGRESSO DO TDAH */}
      <ProgressBar current={challengesCompleted} />

      {/* LUMI COM INSTRUÇÃO NARRADA */}
      <MascotLumi text={t('game1Prompt', { letter: targetLetter })} />

      {/* CENÁRIO FLORESTA INTERATIVA COM DICAS EDUCACIONAIS */}
      <View style={styles.forestScene}>
        {itemsData.map((item) => {
          const animStyle = {
            transform: [{ translateY: anims[item.slotIndex as keyof typeof anims] }],
            opacity: opacities[item.slotIndex as keyof typeof opacities]
          };

          return (
            <View key={item.slotIndex} style={styles.itemWrapper}>
              {/* Letra Oculta de Trás (fica no centro do wrapper) */}
              <View style={styles.letterContainer}>
                {item.revealed && (
                  <Text style={[
                    styles.letterText,
                    item.letter === targetLetter ? styles.letterSuccess : styles.letterWrong
                  ]}>
                    {item.letter}
                  </Text>
                )}
              </View>

              {/* Elemento Interativo da Frente (Emoji + Sílaba + Palavra) */}
              <Animated.View style={[styles.coverContainer, animStyle]} pointerEvents={item.revealed ? 'none' : 'auto'}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={item.revealed || roundCompleted}
                  onPress={() => handleTapItem(item.slotIndex, item.letter)}
                  style={styles.coverButton}
                >
                  <Text style={styles.coverEmoji}>{item.emoji}</Text>
                  {/* Exibe sílaba e palavra dica para pareamento fonético, ex: "BO - BOLA" */}
                  <Text style={styles.coverLabel}>{item.syllable} - {item.word.toUpperCase()}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  roundText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
  },
  forestScene: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'center',
    paddingHorizontal: 10,
  },
  itemWrapper: {
    width: '44%',
    aspectRatio: 0.9,
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letterContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  letterText: {
    fontSize: 38,
    fontWeight: '900',
  },
  letterSuccess: {
    color: '#4CAF50', // Letra certa verde
  },
  letterWrong: {
    color: '#B0BEC5', // Letra errada cinza suave
  },
  coverContainer: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  coverButton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#81C784',
    borderBottomWidth: 8, // Lindo efeito 3D fofo de botão de desenho animado
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: 5,
  },
  coverEmoji: {
    fontSize: 54,
  },
  coverLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
});
