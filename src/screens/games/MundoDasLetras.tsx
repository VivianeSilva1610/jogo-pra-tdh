import { THEME_COLORS } from '../../styles/theme';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';
import { PerfectRun } from '../../components/PerfectRun';

interface MundoDasLetrasProps {
  onBack: () => void;
}

interface Hint {
  emoji: string;
  word: string;
  syllable: string;
}

interface GameTarget {
  type: 'letter' | 'syllable';
  value: string;
  letter: string;
}

// Dicionário completo localizado para todas as 26 letras nos 4 idiomas
const LETTER_HINTS: Record<string, Record<string, Hint>> = {
  A: {
    pt: { emoji: '🐝', word: 'Abelha', syllable: 'A' },
    en: { emoji: '🍎', word: 'Apple', syllable: 'A' },
    it: { emoji: '🐝', word: 'Ape', syllable: 'A' },
    es: { emoji: '🐝', word: 'Abeja', syllable: 'A' },
  },
  B: {
    pt: { emoji: '⚽', word: 'Bola', syllable: 'BO' },
    en: { emoji: '⚽', word: 'Ball', syllable: 'BA' },
    it: { emoji: '🍌', word: 'Banana', syllable: 'BA' },
    es: { emoji: '⚽', word: 'Bola', syllable: 'BO' },
  },
  C: {
    pt: { emoji: '🏠', word: 'Casa', syllable: 'CA' },
    en: { emoji: '🐱', word: 'Cat', syllable: 'CA' },
    it: { emoji: '🏠', word: 'Casa', syllable: 'CA' },
    es: { emoji: '🏠', word: 'Casa', syllable: 'CA' },
  },
  D: {
    pt: { emoji: '🎲', word: 'Dado', syllable: 'DA' },
    en: { emoji: '🐬', word: 'Dolphin', syllable: 'DOL' },
    it: { emoji: '🎲', word: 'Dado', syllable: 'DA' },
    es: { emoji: '🎲', word: 'Dado', syllable: 'DA' },
  },
  E: {
    pt: { emoji: '🐘', word: 'Elefante', syllable: 'E' },
    en: { emoji: '🥚', word: 'Egg', syllable: 'E' },
    it: { emoji: '🐘', word: 'Elefante', syllable: 'E' },
    es: { emoji: '🐘', word: 'Elefante', syllable: 'E' },
  },
  F: {
    pt: { emoji: '🔥', word: 'Fogo', syllable: 'FO' },
    en: { emoji: '🐟', word: 'Fish', syllable: 'FI' },
    it: { emoji: '🔥', word: 'Fuoco', syllable: 'FU' },
    es: { emoji: '🔥', word: 'Fuego', syllable: 'FU' },
  },
  G: {
    pt: { emoji: '🐱', word: 'Gato', syllable: 'GA' },
    en: { emoji: '🦒', word: 'Giraffe', syllable: 'GI' },
    it: { emoji: '🐱', word: 'Gatto', syllable: 'GA' },
    es: { emoji: '🐱', word: 'Gato', syllable: 'GA' },
  },
  H: {
    pt: { emoji: '🚁', word: 'Helicóptero', syllable: 'HE' },
    en: { emoji: '🚁', word: 'Helicopter', syllable: 'HE' },
    it: { emoji: '🏨', word: 'Hotel', syllable: 'HO' },
    es: { emoji: '🚁', word: 'Helicóptero', syllable: 'HE' },
  },
  I: {
    pt: { emoji: '🏝️', word: 'Ilha', syllable: 'I' },
    en: { emoji: '🦎', word: 'Iguana', syllable: 'I' },
    it: { emoji: '🏝️', word: 'Isola', syllable: 'I' },
    es: { emoji: '🏝️', word: 'Isla', syllable: 'I' },
  },
  J: {
    pt: { emoji: '🐊', word: 'Jacaré', syllable: 'JA' },
    en: { emoji: '🍯', word: 'Jar', syllable: 'JA' },
    it: { emoji: '👖', word: 'Jeans', syllable: 'JE' },
    es: { emoji: '🦒', word: 'Jirafa', syllable: 'JI' },
  },
  K: {
    pt: { emoji: '🥝', word: 'Kiwi', syllable: 'KI' },
    en: { emoji: '🥝', word: 'Kiwi', syllable: 'KI' },
    it: { emoji: '🥝', word: 'Kiwi', syllable: 'KI' },
    es: { emoji: '🥝', word: 'Kiwi', syllable: 'KI' },
  },
  L: {
    pt: { emoji: '🦁', word: 'Leão', syllable: 'LE' },
    en: { emoji: '🦁', word: 'Lion', syllable: 'LI' },
    it: { emoji: '🦁', word: 'Leone', syllable: 'LE' },
    es: { emoji: '🦁', word: 'León', syllable: 'LE' },
  },
  M: {
    pt: { emoji: '🍎', word: 'Maçã', syllable: 'MA' },
    en: { emoji: '🐵', word: 'Monkey', syllable: 'MO' },
    it: { emoji: '🍎', word: 'Mela', syllable: 'ME' },
    es: { emoji: '🍎', word: 'Manzana', syllable: 'MA' },
  },
  N: {
    pt: { emoji: '☁️', word: 'Nuvem', syllable: 'NU' },
    en: { emoji: '🪵', word: 'Nut', syllable: 'NU' },
    it: { emoji: '☁️', word: 'Nuvola', syllable: 'NU' },
    es: { emoji: '☁️', word: 'Nube', syllable: 'NU' },
  },
  O: {
    pt: { emoji: '🥚', word: 'Ovo', syllable: 'O' },
    en: { emoji: '🐙', word: 'Octopus', syllable: 'O' },
    it: { emoji: '👁️', word: 'Occhio', syllable: 'O' },
    es: { emoji: '👁️', word: 'Ojo', syllable: 'O' },
  },
  P: {
    pt: { emoji: '🦆', word: 'Pato', syllable: 'PA' },
    en: { emoji: '🍐', word: 'Pear', syllable: 'PE' },
    it: { emoji: '🦆', word: 'Papera', syllable: 'PA' },
    es: { emoji: '🦆', word: 'Pato', syllable: 'PA' },
  },
  Q: {
    pt: { emoji: '🧀', word: 'Queijo', syllable: 'QUE' },
    en: { emoji: '👑', word: 'Queen', syllable: 'QUE' },
    it: { emoji: '📜', word: 'Quaderno', syllable: 'QUA' },
    es: { emoji: '🧀', word: 'Queso', syllable: 'QUE' },
  },
  R: {
    pt: { emoji: '🐭', word: 'Rato', syllable: 'RA' },
    en: { emoji: '🌈', word: 'Rainbow', syllable: 'RA' },
    it: { emoji: '🐸', word: 'Rana', syllable: 'RA' },
    es: { emoji: '🐭', word: 'Ratón', syllable: 'RA' },
  },
  S: {
    pt: { emoji: '☀️', word: 'Sol', syllable: 'SO' },
    en: { emoji: '☀️', word: 'Sun', syllable: 'SU' },
    it: { emoji: '☀️', word: 'Sole', syllable: 'SO' },
    es: { emoji: '☀️', word: 'Sol', syllable: 'SO' },
  },
  T: {
    pt: { emoji: '🍅', word: 'Tomate', syllable: 'TO' },
    en: { emoji: '🐯', word: 'Tiger', syllable: 'TI' },
    it: { emoji: '🐯', word: 'Tigre', syllable: 'TI' },
    es: { emoji: '🍅', word: 'Tomate', syllable: 'TO' },
  },
  U: {
    pt: { emoji: '🍇', word: 'Uva', syllable: 'U' },
    en: { emoji: '🦄', word: 'Unicorn', syllable: 'U' },
    it: { emoji: '🍇', word: 'Uva', syllable: 'U' },
    es: { emoji: '🍇', word: 'Uva', syllable: 'U' },
  },
  V: {
    pt: { emoji: '🐮', word: 'Vaca', syllable: 'VA' },
    en: { emoji: '🌋', word: 'Volcano', syllable: 'VO' },
    it: { emoji: '🐮', word: 'Vacca', syllable: 'VA' },
    es: { emoji: '🐮', word: 'Vaca', syllable: 'VA' },
  },
  W: {
    pt: { emoji: '🧇', word: 'Waffle', syllable: 'WA' },
    en: { emoji: '🧇', word: 'Waffle', syllable: 'WA' },
    it: { emoji: '🧇', word: 'Waffle', syllable: 'WA' },
    es: { emoji: '🧇', word: 'Waffle', syllable: 'WA' },
  },
  X: {
    pt: { emoji: '🍵', word: 'Xícara', syllable: 'XI' },
    en: { emoji: '📦', word: 'Box', syllable: 'X' },
    it: { emoji: '🩻', word: 'Xilofono', syllable: 'XI' },
    es: { emoji: '🩻', word: 'Xilófono', syllable: 'XI' },
  },
  Y: {
    pt: { emoji: '🍜', word: 'Yakisoba', syllable: 'YA' },
    en: { emoji: '🪀', word: 'Yo-yo', syllable: 'YO' },
    it: { emoji: '🧘', word: 'Yoga', syllable: 'YO' },
    es: { emoji: '🍜', word: 'Yakisoba', syllable: 'YA' },
  },
  Z: {
    pt: { emoji: '🦓', word: 'Zebra', syllable: 'ZE' },
    en: { emoji: '🦓', word: 'Zebra', syllable: 'ZE' },
    it: { emoji: '🦓', word: 'Zebra', syllable: 'ZE' },
    es: { emoji: '🦓', word: 'Zebra', syllable: 'ZE' },
  }
};

const TARGET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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
  const { soundEnabled, completeChallenge, challengesCompleted, stars, learnedLetters } = useGame();

  const [queue, setQueue] = useState<GameTarget[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetLetter, setTargetLetter] = useState('A');
  const [targetType, setTargetType] = useState<'letter' | 'syllable'>('letter');
  const [targetValue, setTargetValue] = useState('A');
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false); // Rastreia erros em TODAS as rodadas
  const [showPerfect, setShowPerfect] = useState(false);

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

  // Inicializar fila com base na dificuldade
  useEffect(() => {
    const difficulty = Math.floor(challengesCompleted / 7) % 3; // 0: Fácil, 1: Médio, 2: Difícil
    let pool = [...TARGET_LETTERS];
    if (difficulty === 0) {
      pool = ['A', 'B', 'C', 'D', 'E', 'I', 'L', 'M', 'N', 'O', 'P', 'T', 'U', 'V'];
    } else if (difficulty === 1) {
      pool = ['F', 'G', 'H', 'J', 'Q', 'R', 'S', 'Z'];
    } else {
      pool = ['K', 'W', 'X', 'Y', 'Z', 'J', 'Q', 'H', 'G', 'F'];
    }

    const learnedList = learnedLetters || [];
    let unlearnedPool = pool.filter(l => !learnedList.includes(l.toUpperCase()));
    if (unlearnedPool.length < 3) {
      unlearnedPool = pool;
    }

    const selectedTargets: GameTarget[] = [];
    const activeLang = language || 'pt';
    const poolCopy = [...unlearnedPool];
    while (selectedTargets.length < 3 && poolCopy.length > 0) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      const chosenLetter = poolCopy[idx];
      poolCopy.splice(idx, 1);

      // Decidir tipo: se difficulty for 2, sempre sílaba (100%), senão 50%
      const type = difficulty === 2 ? 'syllable' : (Math.random() < 0.5 ? 'letter' : 'syllable');
      const hintMap = LETTER_HINTS[chosenLetter];
      const hint = hintMap 
        ? (hintMap[activeLang] || hintMap['pt']) 
        : { syllable: chosenLetter };

      selectedTargets.push({
        type,
        value: type === 'letter' ? chosenLetter : hint.syllable,
        letter: chosenLetter
      });
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, [challengesCompleted, language, learnedLetters]);

  // Iniciar nova rodada quando muda o índice ou idioma
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      startNewRound(queue[currentIndex]);
    }
  }, [currentIndex, queue, language]);

  const startNewRound = (selectedTarget: GameTarget) => {
    setTargetLetter(selectedTarget.letter);
    setTargetType(selectedTarget.type);
    setTargetValue(selectedTarget.value);
    setRoundCompleted(false);
    hadErrorInRound.current = false;

    // Falar a letra ou sílaba alvo no início da rodada
    speak(selectedTarget.value, language);


    // Resetar animações
    Object.keys(anims).forEach(key => {
      const idx = Number(key) as keyof typeof anims;
      Animated.timing(anims[idx], { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(opacities[idx], { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });

    // Distribuir letras nos slots.
    // IMPORTANTE: os distratores devem vir do MESMO pool de dificuldade do alvo
    // (fácil/médio/difícil), nunca do alfabeto inteiro. Misturar letras fáceis
    // (ex: A, U) com letras difíceis (ex: W, X) na mesma rodada quebra a
    // progressão de dificuldade e aumenta a carga cognitiva para a criança.
    const difficultyForRound = Math.floor(challengesCompleted / 7) % 3;
    const difficultyPools: Record<number, string[]> = {
      0: ['A', 'B', 'C', 'D', 'E', 'I', 'L', 'M', 'N', 'O', 'P', 'T', 'U', 'V'],
      1: ['F', 'G', 'H', 'J', 'Q', 'R', 'S', 'Z'],
      2: ['K', 'W', 'X', 'Y', 'Z', 'J', 'Q', 'H', 'G', 'F']
    };
    let candidatePool = difficultyPools[difficultyForRound].filter(l => l !== selectedTarget.letter);

    // Fallback de segurança: se o pool da dificuldade atual não tiver letras
    // suficientes (ex: pool difícil só tem 4 letras), completa com o alfabeto
    // geral em vez de travar o jogo - mas só como última opção.
    if (candidatePool.length < 3) {
      const fullAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== selectedTarget.letter && !candidatePool.includes(l));
      candidatePool = [...candidatePool, ...fullAlphabet];
    }

    // O primeiro slot ganha a letra alvo, os outros ganham letras aleatórias não repetidas
    const selectedWrongLetters: string[] = [];
    while (selectedWrongLetters.length < 3 && candidatePool.length > 0) {
      const randomIdx = Math.floor(Math.random() * candidatePool.length);
      const chosenLetter = candidatePool[randomIdx];
      selectedWrongLetters.push(chosenLetter);
      candidatePool.splice(randomIdx, 1);
    }

    const slots = [selectedTarget.letter, ...selectedWrongLetters];

    // Embaralhar os slots
    const shuffledSlots = slots
      .map((letter) => ({ letter }))
      .sort(() => Math.random() - 0.5);

    // Mapear os dados dos cartões com as dicas baseadas no idioma atual
    const activeLang = language || 'pt';
    const newItemsData = shuffledSlots.map((item, index) => {
      const hintMap = LETTER_HINTS[item.letter];
      const hint = hintMap 
        ? (hintMap[activeLang] || hintMap['pt']) 
        : { emoji: '❓', word: 'Desconhecido', syllable: item.letter };

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
        toValue: -85,
        duration: 350,
        useNativeDriver: true
      }),
      Animated.timing(opacityRef, {
        toValue: 0,
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
        let updatedQueue = [...queue];
        if (hadErrorInRound.current) {
          updatedQueue.push(queue[currentIndex]);
          setQueue(updatedQueue);
        }
        
        const nextIdx = currentIndex + 1;
        if (nextIdx < updatedQueue.length) {
          setCurrentIndex(nextIdx);
        } else {
          // Desafio finalizado com sucesso!
          await completeChallenge(targetType, targetValue);
          if (!hadErrorEver.current) {
            setShowPerfect(true);
          } else {
            onBack();
          }
        }
      }, 2500);
    } else {
      // ERROU! (Feedback positivo: Lumi diz "Vamos tentar novamente?")
      hadErrorInRound.current = true;
      hadErrorEver.current = true;
      playSound('pop', soundEnabled);
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
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game1Title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeText}>⭐ {stars}</Text>
          </View>
          <Text style={styles.roundText}>{t('roundLabel')} {currentIndex + 1}/{queue.length}</Text>
        </View>
      </View>

      {/* BARRA DE PROGRESSO DO TDAH */}
      <ProgressBar current={challengesCompleted} />

      {/* LUMI COM INSTRUÇÃO NARRADA */}
      <MascotLumi text={targetType === 'letter' ? t('game1Prompt') : t('game1PromptSyllable')} />
      
      {/* BOTÃO OUVIR NOVAMENTE */}
      <TouchableOpacity 
        style={styles.listenButton} 
        onPress={() => speak(targetValue, language)}
      >
        <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
      </TouchableOpacity>


      {/* CENÁRIO FLORESTA INTERATIVA COM DICAS LOCALIZADAS */}
      <View style={styles.forestScene}>
        {itemsData.map((item) => {
          const animStyle = {
            transform: [{ translateY: anims[item.slotIndex as keyof typeof anims] }],
            opacity: opacities[item.slotIndex as keyof typeof opacities]
          };

          return (
            <View key={item.slotIndex} style={styles.itemWrapper}>
              {/* Letra Oculta de Trás */}
              <View style={styles.letterContainer}>
                {item.revealed && (
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[
                      styles.letterText,
                      item.letter === targetLetter ? styles.letterSuccess : styles.letterWrong,
                      targetType === 'syllable' && item.syllable.length > 2 ? { fontSize: 24 } : null
                    ]}>
                      {targetType === 'syllable' ? item.syllable : item.letter}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#78909C', marginTop: 1 }}>
                      {targetType === 'syllable' ? item.letter : item.syllable}
                    </Text>
                  </View>
                )}
              </View>

              {/* Elemento Interativo da Frente (Dica multi-idioma de Sílaba + Palavra) */}
              <Animated.View style={[styles.coverContainer, animStyle]} pointerEvents={item.revealed ? 'none' : 'auto'}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={item.revealed || roundCompleted}
                  onPress={() => handleTapItem(item.slotIndex, item.letter)}
                  style={styles.coverButton}
                >
                  <Text style={styles.coverEmoji}>{item.emoji}</Text>
                  {/* Exibe a dica no idioma ativo, ex: "BO - BOLA" ou "BA - BALL" */}
                  <Text style={styles.coverLabel}>{item.syllable} - {item.word.toUpperCase()}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })}
      </View>
      <PerfectRun visible={showPerfect} onClose={onBack} />
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
    backgroundColor: THEME_COLORS.softWhite,
    borderBottomWidth: 3,
    borderColor: '#C8E6C9',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.goldenYellow,
  },
  starsBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5D4037',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.brownDark,
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
  listenButton: {
    backgroundColor: '#81C784',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  listenButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 34,
  },
  letterSuccess: {
    color: '#4CAF50',
  },
  letterWrong: {
    color: '#B0BEC5',
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
    borderBottomWidth: 8,
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
