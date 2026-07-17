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
import { useGameSession } from '../../hooks/useGameSession';

interface MundoDasSilabasProps {
  onBack: () => void;
}

// Emojis por letra inicial (para decorar as cartas de sílabas)
const LETTER_EMOJI: Record<string, Record<string, string>> = {
  A: { pt: '🐝', en: '🍎', it: '🐝', es: '🐝' },
  B: { pt: '⚽', en: '⚽', it: '🍌', es: '⚽' },
  C: { pt: '🏠', en: '🐱', it: '🏠', es: '🏠' },
  D: { pt: '🎲', en: '🐬', it: '🎲', es: '🎲' },
  E: { pt: '🐘', en: '🥚', it: '🐘', es: '🐘' },
  F: { pt: '🔥', en: '🐟', it: '🔥', es: '🔥' },
  G: { pt: '🐱', en: '🦒', it: '🐱', es: '🐱' },
  H: { pt: '🚁', en: '🚁', it: '🏨', es: '🚁' },
  I: { pt: '🏝️', en: '🦎', it: '🏝️', es: '🏝️' },
  J: { pt: '🐊', en: '🍯', it: '👖', es: '🦒' },
  K: { pt: '🥝', en: '🥝', it: '🥝', es: '🥝' },
  L: { pt: '🦁', en: '🦁', it: '🦁', es: '🦁' },
  M: { pt: '🍎', en: '🐵', it: '🍎', es: '🍎' },
  N: { pt: '☁️', en: '🪵', it: '☁️', es: '☁️' },
  O: { pt: '🥚', en: '🐙', it: '👁️', es: '👁️' },
  P: { pt: '🦆', en: '🍐', it: '🦆', es: '🦆' },
  Q: { pt: '🧀', en: '👑', it: '📜', es: '🧀' },
  R: { pt: '🐭', en: '🌈', it: '🐸', es: '🐭' },
  S: { pt: '☀️', en: '☀️', it: '☀️', es: '☀️' },
  T: { pt: '🍅', en: '🐯', it: '🐯', es: '🍅' },
  U: { pt: '🍇', en: '🦄', it: '🍇', es: '🍇' },
  V: { pt: '🐮', en: '🌋', it: '🐮', es: '🐮' },
  W: { pt: '🧇', en: '🧇', it: '🧇', es: '🧇' },
  X: { pt: '🍵', en: '📦', it: '🩻', es: '🩻' },
  Y: { pt: '🍜', en: '🪀', it: '🧘', es: '🍜' },
  Z: { pt: '🦓', en: '🦓', it: '🦓', es: '🦓' },
};

const LOCALIZED_SYLLABLES: Record<string, { easy: string[]; medium: string[]; hard: string[] }> = {
  pt: {
    easy: ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'MO', 'PO', 'BO', 'CO', 'TO', 'DO', 'ME', 'PE', 'BE', 'LE', 'TE', 'DE', 'MI', 'PI', 'LI', 'TI'],
    medium: ['GA', 'FA', 'SA', 'VA', 'GO', 'FO', 'SO', 'VO', 'GE', 'FE', 'SE', 'NE', 'VI', 'SI', 'JA', 'JO', 'JE', 'JI', 'NA', 'NO', 'NI', 'LU', 'MU', 'BU', 'DU'],
    hard: ['RA', 'RO', 'RE', 'RI', 'RU', 'JU', 'XA', 'XO', 'XE', 'XI', 'XU', 'ZA', 'ZO', 'ZE', 'ZI', 'ZU', 'PRA', 'PLA', 'BRA', 'BLA', 'CRA', 'CLA', 'TRA', 'FRA', 'FLA', 'DRA', 'GRA', 'GLA'],
  },
  en: {
    easy: ['MA', 'PA', 'BA', 'CA', 'DA', 'ME', 'PE', 'BE', 'MI', 'PI', 'MO', 'PO', 'BO', 'CO', 'DO', 'MU', 'PU', 'BU', 'DU'],
    medium: ['FA', 'HA', 'JA', 'FE', 'HE', 'JE', 'FI', 'HI', 'FO', 'HO', 'JO', 'FU', 'HU', 'JU', 'GA', 'GE', 'GO', 'GU'],
    hard: ['LA', 'LE', 'LI', 'LO', 'LU', 'RA', 'RE', 'RI', 'RO', 'RU', 'SA', 'SE', 'SI', 'SO', 'SU', 'TA', 'TE', 'TI', 'TO', 'TU', 'WA', 'WE', 'WI', 'WO', 'ZA', 'ZE', 'ZI', 'ZO'],
  },
  es: {
    easy: ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'MO', 'PO', 'BO', 'CO', 'TO', 'DO', 'ME', 'PE', 'BE', 'LE', 'TE', 'DE', 'MI', 'PI', 'LI', 'TI'],
    medium: ['GA', 'FA', 'SA', 'VA', 'GO', 'FO', 'SO', 'VO', 'GE', 'FE', 'SE', 'NE', 'VI', 'SI', 'JA', 'JO', 'JE', 'JI', 'NA', 'NO', 'NI', 'LU', 'MU', 'BU', 'DU'],
    hard: ['RA', 'RO', 'RE', 'RI', 'RU', 'JU', 'CHA', 'CHE', 'CHI', 'CHO', 'CHU', 'LLA', 'LLE', 'LLI', 'LLO', 'LLU', 'PRA', 'PLA', 'BRA', 'BLA', 'CRA', 'CLA', 'TRA', 'FRA', 'FLA', 'DRA'],
  },
  it: {
    easy: ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'MO', 'PO', 'BO', 'CO', 'TO', 'DO', 'ME', 'PE', 'BE', 'LE', 'TE', 'DE', 'MI', 'PI', 'LI', 'TI'],
    medium: ['GA', 'FA', 'SA', 'VA', 'GO', 'FO', 'SO', 'VO', 'GE', 'FE', 'SE', 'NE', 'VI', 'SI', 'JA', 'JO', 'JE', 'JI', 'NA', 'NO', 'NI', 'LU', 'MU', 'BU', 'DU'],
    hard: ['RA', 'RO', 'RE', 'RI', 'RU', 'GNA', 'GNE', 'GNI', 'GNO', 'GNU', 'GLI', 'PRA', 'PLA', 'BRA', 'BLA', 'CRA', 'CLA', 'TRA', 'FRA', 'FLA', 'DRA', 'GRA', 'GLA'],
  },
};

interface ItemData {
  slotIndex: number;
  syllable: string;
  emoji: string;
  revealed: boolean;
}

export const MundoDasSilabas: React.FC<MundoDasSilabasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted, stars, masteredSyllables } = useGame();

  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetSyllable, setTargetSyllable] = useState('MA');
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false);
  const exerciseFinished = useRef(false); // Trava a fila após a 3ª rodada (evita narrar uma "próxima rodada" fantasma)
  const [showPerfect, setShowPerfect] = useState(false);
  const roundStartTimeRef = useRef<number>(0);
  const { difficulty, logEvent, finishSession, abandonSession } = useGameSession('aventura_das_letras');

  const anims = {
    0: useRef(new Animated.Value(0)).current,
    1: useRef(new Animated.Value(0)).current,
    2: useRef(new Animated.Value(0)).current,
    3: useRef(new Animated.Value(0)).current,
  };

  const opacities = {
    0: useRef(new Animated.Value(1)).current,
    1: useRef(new Animated.Value(1)).current,
    2: useRef(new Animated.Value(1)).current,
    3: useRef(new Animated.Value(1)).current,
  };

  const getPool = (lang: string, difficultyLevel: number): string[] => {
    const poolMap = LOCALIZED_SYLLABLES[lang] || LOCALIZED_SYLLABLES['pt'];
    if (difficultyLevel === 0) return poolMap.easy;
    if (difficultyLevel === 1) return poolMap.medium;
    return poolMap.hard;
  };

  useEffect(() => {
    if (exerciseFinished.current || difficulty === null) return;
    const activeLang = language || 'pt';
    const pool = getPool(activeLang, difficulty);

    const masteredList = masteredSyllables || [];
    let unmasteredPool = pool.filter(s => !masteredList.includes(s.toUpperCase()));
    if (unmasteredPool.length < 3) unmasteredPool = pool;

    const selectedTargets: string[] = [];
    const poolCopy = [...unmasteredPool];
    while (selectedTargets.length < 3 && poolCopy.length > 0) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      selectedTargets.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, [challengesCompleted, language, masteredSyllables, difficulty]);

  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      startNewRound(queue[currentIndex]);
    }
  }, [currentIndex, queue, language]);

  const startNewRound = (syllable: string) => {
    setTargetSyllable(syllable);
    setRoundCompleted(false);
    hadErrorInRound.current = false;
    roundStartTimeRef.current = Date.now();

    speak(syllable, language);

    Object.keys(anims).forEach(key => {
      const idx = Number(key) as keyof typeof anims;
      Animated.timing(anims[idx], { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(opacities[idx], { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });

    const activeLang = language || 'pt';
    const pool = getPool(activeLang, difficulty ?? 0);
    const candidatePool = pool.filter(s => s !== syllable);

    const selectedWrong: string[] = [];
    const poolCopy = [...candidatePool].sort(() => Math.random() - 0.5);
    while (selectedWrong.length < 3 && poolCopy.length > 0) {
      selectedWrong.push(poolCopy.shift()!);
    }

    const slots = [syllable, ...selectedWrong].sort(() => Math.random() - 0.5);

    const newItemsData: ItemData[] = slots.map((syl, index) => {
      const firstLetter = syl[0].toUpperCase();
      const emojiMap = LETTER_EMOJI[firstLetter];
      const emoji = emojiMap ? (emojiMap[activeLang] || emojiMap['pt']) : '🔤';
      return { slotIndex: index, syllable: syl, emoji, revealed: false };
    });

    setItemsData(newItemsData);
  };

  const handleTapItem = (slotIndex: number, itemSyllable: string) => {
    if (roundCompleted) return;

    setItemsData(prev => prev.map((item, idx) => idx === slotIndex ? { ...item, revealed: true } : item));

    const animRef = anims[slotIndex as keyof typeof anims];
    const opacityRef = opacities[slotIndex as keyof typeof opacities];

    Animated.parallel([
      Animated.timing(animRef, { toValue: -85, duration: 350, useNativeDriver: true }),
      Animated.timing(opacityRef, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();

    const isCorrect = itemSyllable === targetSyllable;
    const responseTime = Date.now() - roundStartTimeRef.current;

    logEvent({
      event_type: 'answer',
      target: targetSyllable,
      target_type: 'syllable',
      response_value: itemSyllable,
      correct: isCorrect,
      response_time_ms: responseTime,
      error_type: isCorrect ? undefined : (responseTime < 500 ? 'impulsiva' : 'substituicao'),
    });

    if (isCorrect) {
      playSound('success', soundEnabled);
      setRoundCompleted(true);

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
          exerciseFinished.current = true;
          finishSession();
          await completeChallenge('syllable', targetSyllable);
          if (!hadErrorEver.current) {
            setShowPerfect(true);
          } else {
            handleBack();
          }
        }
      }, 2500);
    } else {
      hadErrorInRound.current = true;
      hadErrorEver.current = true;
      playSound('pop', soundEnabled);
      Animated.sequence([
        Animated.timing(animRef, { toValue: -75, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -95, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -85, duration: 100, useNativeDriver: true }),
      ]).start(() => {
        speak(t('tryAgain'), language);
      });
    }
  };

  const handleBack = () => {
    abandonSession();
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game1Prompt')} />

      <TouchableOpacity
        style={styles.listenButton}
        onPress={() => speak(targetSyllable, language)}
      >
        <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
      </TouchableOpacity>

      <View style={styles.forestScene}>
        {itemsData.map((item) => {
          const animStyle = {
            transform: [{ translateY: anims[item.slotIndex as keyof typeof anims] }],
            opacity: opacities[item.slotIndex as keyof typeof opacities],
          };

          return (
            <View key={item.slotIndex} style={styles.itemWrapper}>
              <View style={styles.letterContainer}>
                {item.revealed && (
                  <Text style={[
                    styles.letterText,
                    item.syllable === targetSyllable ? styles.letterSuccess : styles.letterWrong,
                    item.syllable.length > 2 ? { fontSize: 22 } : null,
                  ]}>
                    {item.syllable}
                  </Text>
                )}
              </View>

              <Animated.View style={[styles.coverContainer, animStyle]} pointerEvents={item.revealed ? 'none' : 'auto'}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={item.revealed || roundCompleted}
                  onPress={() => handleTapItem(item.slotIndex, item.syllable)}
                  style={styles.coverButton}
                >
                  <Text style={styles.coverEmoji}>{item.emoji}</Text>
                  <Text style={[styles.coverLabel, item.syllable.length > 2 ? { fontSize: 18 } : null]}>
                    {item.syllable}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })}
      </View>
      <PerfectRun visible={showPerfect} onClose={handleBack} />
    </SafeAreaView>
  );
};

// Manter export com o nome antigo para compatibilidade com App.tsx até ser atualizado
export { MundoDasSilabas as MundoDasLetras };

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
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
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
    fontSize: 48,
  },
  coverLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2E7D32',
    marginTop: 6,
    textAlign: 'center',
  },
});
