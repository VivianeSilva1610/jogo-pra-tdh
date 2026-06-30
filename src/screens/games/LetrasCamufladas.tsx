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

interface LetrasCamufladasProps {
  onBack: () => void;
}

const TARGET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Letras distratoras visualmente parecidas com cada letra alvo
const SIMILAR_LETTERS: Record<string, string[]> = {
  A: ['H', 'N', 'M', 'R', 'K'],
  B: ['D', 'P', 'R', 'E', 'F'],
  C: ['G', 'O', 'Q', 'D', 'U'],
  D: ['B', 'O', 'P', 'Q', 'G'],
  E: ['F', 'B', 'L', 'P', 'T'],
  F: ['E', 'P', 'T', 'L', 'I'],
  G: ['C', 'O', 'Q', 'D', 'U'],
  H: ['N', 'M', 'K', 'A', 'R'],
  I: ['L', 'T', 'F', 'J', 'Y'],
  J: ['I', 'L', 'T', 'Y', 'F'],
  K: ['H', 'N', 'R', 'X', 'Y'],
  L: ['I', 'T', 'F', 'E', 'J'],
  M: ['N', 'H', 'W', 'A', 'K'],
  N: ['M', 'H', 'K', 'R', 'A'],
  O: ['C', 'D', 'G', 'Q', 'U'],
  P: ['B', 'D', 'F', 'R', 'E'],
  Q: ['O', 'C', 'G', 'D', 'U'],
  R: ['B', 'P', 'K', 'N', 'H'],
  S: ['Z', 'C', 'G', 'O', 'U'],
  T: ['I', 'F', 'L', 'Y', 'J'],
  U: ['V', 'C', 'O', 'W', 'Y'],
  V: ['U', 'W', 'Y', 'N', 'M'],
  W: ['M', 'V', 'N', 'U', 'Y'],
  X: ['K', 'Y', 'H', 'Z', 'N'],
  Y: ['V', 'X', 'T', 'J', 'I'],
  Z: ['S', 'E', 'F', 'T', 'L'],
};

const LOCALIZED_SYLLABLES: Record<string, { easy: string[]; medium: string[]; hard: string[] }> = {
  pt: {
    easy: ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'MO', 'PO', 'BO', 'CO', 'TO', 'DO', 'ME', 'PE', 'BE', 'LE', 'TE', 'DE', 'MI', 'PI', 'LI', 'TI'],
    medium: ['GA', 'FA', 'SA', 'VA', 'GO', 'FO', 'SO', 'VO', 'GE', 'FE', 'SE', 'NE', 'VI', 'SI', 'JA', 'JO', 'JE', 'JI', 'NA', 'NO', 'NI', 'LU', 'MU', 'BU', 'DU'],
    hard: ['RA', 'RO', 'RE', 'RI', 'RU', 'JU', 'XA', 'XO', 'XE', 'XI', 'XU', 'ZA', 'ZO', 'ZE', 'ZI', 'ZU', 'PRA', 'PLA', 'BRA', 'BLA', 'CRA', 'CLA', 'TRA', 'FRA', 'FLA', 'DRA', 'GRA', 'GLA']
  },
  en: {
    easy: ['MA', 'PA', 'BA', 'CA', 'DA', 'ME', 'PE', 'BE', 'MI', 'PI', 'MO', 'PO', 'BO', 'CO', 'DO', 'MU', 'PU', 'BU', 'DU'],
    medium: ['FA', 'HA', 'JA', 'FE', 'HE', 'JE', 'FI', 'HI', 'FO', 'HO', 'JO', 'FU', 'HU', 'JU', 'GA', 'GE', 'GO', 'GU'],
    hard: ['LA', 'LE', 'LI', 'LO', 'LU', 'RA', 'RE', 'RI', 'RO', 'RU', 'SA', 'SE', 'SI', 'SO', 'SU', 'TA', 'TE', 'TI', 'TO', 'TU', 'WA', 'WE', 'WI', 'WO', 'ZA', 'ZE', 'ZI', 'ZO']
  },
  es: {
    easy: ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'MO', 'PO', 'BO', 'CO', 'TO', 'DO', 'ME', 'PE', 'BE', 'LE', 'TE', 'DE', 'MI', 'PI', 'LI', 'TI'],
    medium: ['GA', 'FA', 'SA', 'VA', 'GO', 'FO', 'SO', 'VO', 'GE', 'FE', 'SE', 'NE', 'VI', 'SI', 'JA', 'JO', 'JE', 'JI', 'NA', 'NO', 'NI', 'LU', 'MU', 'BU', 'DU'],
    hard: ['RA', 'RO', 'RE', 'RI', 'RU', 'JU', 'CHA', 'CHE', 'CHI', 'CHO', 'CHU', 'LLA', 'LLE', 'LLI', 'LLO', 'LLU', 'PRA', 'PLA', 'BRA', 'BLA', 'CRA', 'CLA', 'TRA', 'FRA', 'FLA', 'DRA']
  },
  it: {
    easy: ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'MO', 'PO', 'BO', 'CO', 'TO', 'DO', 'ME', 'PE', 'BE', 'LE', 'TE', 'DE', 'MI', 'PI', 'LI', 'TI'],
    medium: ['GA', 'FA', 'SA', 'VA', 'GO', 'FO', 'SO', 'VO', 'GE', 'FE', 'SE', 'NE', 'VI', 'SI', 'JA', 'JO', 'JE', 'JI', 'NA', 'NO', 'NI', 'LU', 'MU', 'BU', 'DU'],
    hard: ['RA', 'RO', 'RE', 'RI', 'RU', 'GNA', 'GNE', 'GNI', 'GNO', 'GNU', 'GLI', 'PRA', 'PLA', 'BRA', 'BLA', 'CRA', 'CLA', 'TRA', 'FRA', 'FLA', 'DRA', 'GRA', 'GLA']
  }
};

export const LetrasCamufladas: React.FC<LetrasCamufladasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted, stars, learnedLetters, masteredSyllables } = useGame();

  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetLetter, setTargetLetter] = useState('B');
  const [choices, setChoices] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false); // Rastreia erros em TODAS as rodadas
  const [showPerfect, setShowPerfect] = useState(false);

  // Inicializar fila com base na dificuldade
  useEffect(() => {
    const activeLang = language || 'pt';
    const syllablesPool = LOCALIZED_SYLLABLES[activeLang] || LOCALIZED_SYLLABLES['pt'];
    const activeHardSyllables = syllablesPool.hard;

    const difficulty = Math.floor(challengesCompleted / 7) % 3; // 0: Fácil, 1: Médio, 2: Difícil
    let pool: string[] = [];

    if (difficulty === 2) {
      pool = [...activeHardSyllables];
      const masteredList = masteredSyllables || [];
      let unmasteredPool = pool.filter(s => !masteredList.includes(s.toUpperCase()));
      if (unmasteredPool.length < 3) {
        unmasteredPool = pool;
      }
      pool = unmasteredPool;
    } else {
      let letterPool = [...TARGET_LETTERS];
      if (difficulty === 0) {
        letterPool = ['A', 'B', 'C', 'D', 'E', 'I', 'L', 'M', 'N', 'O', 'P', 'T', 'U', 'V'];
      } else {
        letterPool = ['F', 'G', 'H', 'J', 'Q', 'R', 'S', 'Z'];
      }
      const learnedList = learnedLetters || [];
      let unlearnedPool = letterPool.filter(l => !learnedList.includes(l.toUpperCase()));
      if (unlearnedPool.length < 3) {
        unlearnedPool = letterPool;
      }
      pool = unlearnedPool;
    }

    const selectedTargets: string[] = [];
    const poolCopy = [...pool];
    while (selectedTargets.length < 3 && poolCopy.length > 0) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      selectedTargets.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, [challengesCompleted, learnedLetters, masteredSyllables, language]);

  // Iniciar nova rodada quando muda o índice
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      startNewRound(queue[currentIndex]);
    }
  }, [currentIndex, queue]);

  const startNewRound = (selectedTarget: string) => {
    setTargetLetter(selectedTarget);
    setRoundCompleted(false);
    setSelectedIdx(null);
    hadErrorInRound.current = false;

    let allChoices: string[] = [];
    if (selectedTarget.length > 1) {
      const activeLang = language || 'pt';
      const syllablesPool = LOCALIZED_SYLLABLES[activeLang] || LOCALIZED_SYLLABLES['pt'];
      const activeHardSyllables = syllablesPool.hard;
      // Sílabas distratoras do pool correspondente
      const distractors = activeHardSyllables.filter(s => s !== selectedTarget);
      const shuffled = [...distractors].sort(() => Math.random() - 0.5).slice(0, 4);
      allChoices = [...shuffled, selectedTarget].sort(() => Math.random() - 0.5);
    } else {
      // Pegar letras distratoras (parecidas com a alvo para dificultar visualmente)
      const pool = SIMILAR_LETTERS[selectedTarget] ?? 
        'ABCDEFGHIJKLMNOPRSTUVXY'.split('').filter(l => l !== selectedTarget);
      // Embaralhar e pegar 4
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
      // Misturar com a letra alvo → 5 opções no total, todas letras
      allChoices = [...shuffled, selectedTarget].sort(() => Math.random() - 0.5);
    }
    setChoices(allChoices);

    // Tocar o som alvo ao iniciar
    speak(selectedTarget, language);
  };


  const handleSelect = (item: string, index: number) => {
    if (roundCompleted) return;
    setSelectedIdx(index);

    if (item === targetLetter) {
      // Correto!
      playSound('success', soundEnabled);
      setRoundCompleted(true);

      setTimeout(async () => {
        let updatedQueue = [...queue];
        if (hadErrorInRound.current) {
          updatedQueue.push(targetLetter);
          setQueue(updatedQueue);
        }

        const nextIdx = currentIndex + 1;
        if (nextIdx < updatedQueue.length) {
          setCurrentIndex(nextIdx);
        } else {
          await completeChallenge(targetLetter.length > 1 ? 'syllable' : 'letter', targetLetter);
          if (!hadErrorEver.current) {
            setShowPerfect(true);
          } else {
            onBack();
          }
        }
      }, 2000);
    } else {
      // Incorreto
      hadErrorInRound.current = true;
      hadErrorEver.current = true;
      playSound('pop', soundEnabled);
      speak(t('tryAgain'), language);
      
      // Limpa seleção incorreta depois de 1s para deixar tentar de novo
      setTimeout(() => {
        setSelectedIdx(null);
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game2Title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeText}>⭐ {stars}</Text>
          </View>
          <Text style={styles.roundText}>{t('roundLabel')} {currentIndex + 1}/{queue.length}</Text>
        </View>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game2Prompt')} />
      
      <TouchableOpacity 
        style={styles.listenButton} 
        onPress={() => speak(targetLetter, language)}
      >
        <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
      </TouchableOpacity>

      <View style={styles.gameplayArea}>
        <View style={styles.row}>
          {choices.map((item, index) => {
            const isSelected = selectedIdx === index;
            const isCorrect = item === targetLetter;
            
            let itemStyle: any = styles.bubble;
            let textStyle: any = styles.bubbleText;

            if (isSelected) {
              if (isCorrect) {
                itemStyle = [styles.bubble, styles.bubbleCorrect];
                textStyle = [styles.bubbleText, styles.bubbleTextCorrect];
              } else {
                itemStyle = [styles.bubble, styles.bubbleIncorrect];
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => handleSelect(item, index)}
                style={itemStyle}
                disabled={roundCompleted || isSelected}
              >
                <Text style={[textStyle, item.length > 2 ? { fontSize: 22 } : item.length > 1 ? { fontSize: 30 } : null]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <PerfectRun visible={showPerfect} onClose={onBack} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0', // Laranja clarinho acolhedor
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
  gameplayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  bubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF8F0',
    borderWidth: 3,
    borderColor: '#FFB74D',
    borderBottomWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 9,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleCorrect: {
    borderColor: '#4CAF50',
    borderBottomColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
    transform: [{ scale: 1.12 }],
  },
  bubbleIncorrect: {
    borderColor: '#B0BEC5',
    borderBottomColor: '#B0BEC5',
    backgroundColor: '#ECEFF1',
    opacity: 0.5,
  },
  bubbleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#5D4037',
  },
  bubbleTextCorrect: {
    color: '#2E7D32',
  },
});
