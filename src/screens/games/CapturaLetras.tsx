import { THEME_COLORS } from '../../styles/theme';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';
import { PerfectRun } from '../../components/PerfectRun';
import { startGameSession, endGameSession, logGameEvent } from '../../services/database';

interface CapturaDeSilabasProps {
  onBack: () => void;
}

interface Bubble {
  id: number;
  letter: string;
  x: number;
  anim: Animated.Value;
  popped: boolean;
  color: string;
}

const BUBBLE_COLORS = ['#E1F5FE', '#E8F5E9', '#FFFDE7', '#FCE4EC', '#F3E5F5', '#FFF3E0'];
const TARGET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

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

export const CapturaDeSilabas: React.FC<CapturaDeSilabasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { childId, soundEnabled, completeChallenge, challengesCompleted, stars, masteredSyllables } = useGame();

  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetLetter, setTargetLetter] = useState('B');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const bubbleIdRef = useRef(0);
  const gameIntervalRef = useRef<any>(null);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false); // Rastreia erros em TODAS as rodadas
  const exerciseFinished = useRef(false); // Trava a fila após a 3ª rodada (evita narrar uma "próxima rodada" fantasma)
  const [showPerfect, setShowPerfect] = useState(false);
  const gameAreaWidthRef = useRef(SCREEN_WIDTH > 600 ? 500 : SCREEN_WIDTH);
  const sessionIdRef = useRef<string | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    if (childId) {
      startGameSession(childId, 'aventura_das_letras')
        .then(id => { if (isMounted) sessionIdRef.current = id; })
        .catch(err => console.warn('Erro iniciar sessao CapturaLetras:', err));
    }
    return () => { isMounted = false; };
  }, [childId]);

  // Inicializar fila com base na dificuldade
  useEffect(() => {
    if (exerciseFinished.current) return;
    const activeLang = language || 'pt';
    const syllablesPool = LOCALIZED_SYLLABLES[activeLang] || LOCALIZED_SYLLABLES['pt'];
    const difficulty = Math.floor(challengesCompleted / 7) % 3; // 0: Fácil, 1: Médio, 2: Difícil

    let pool: string[];
    if (difficulty === 0) pool = [...syllablesPool.easy];
    else if (difficulty === 1) pool = [...syllablesPool.medium];
    else pool = [...syllablesPool.hard];

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
  }, [challengesCompleted, masteredSyllables, language]);

  // Iniciar nova rodada quando muda o índice na fila
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      startNewRound(queue[currentIndex]);
    }
  }, [currentIndex, queue]);

  const startNewRound = (selectedTarget: string) => {
    setTargetLetter(selectedTarget);
    setCaughtCount(0);
    setIsDone(false);
    setBubbles([]);
    hadErrorInRound.current = false;
    roundStartTimeRef.current = Date.now();

    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    
    // Spawna uma bolha a cada 1.8 segundos
    gameIntervalRef.current = setInterval(() => {
      spawnBubble(selectedTarget);
    }, 1800);

    // Tocar a letra automaticamente no começo da rodada
    speak(selectedTarget, language);
  };

  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  // Monitorar se atingiu 3 capturas
  useEffect(() => {
    if (caughtCount >= 3 && !isDone) {
      setIsDone(true);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      
      // Sucesso total!
      playSound('success', soundEnabled);
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
          exerciseFinished.current = true;
          if (childId && sessionIdRef.current) {
            logGameEvent({
              profile_id: childId,
              session_id: sessionIdRef.current,
              game_key: 'aventura_das_letras',
              event_type: 'activity_complete',
            }).catch(console.warn);
            endGameSession(sessionIdRef.current).catch(console.warn);
          }
          await completeChallenge('syllable', targetLetter);
          if (!hadErrorEver.current) {
            setShowPerfect(true);
          } else {
            handleBack();
          }
        }
      }, 2000);
    }
  }, [caughtCount, isDone]);

  const spawnBubble = (target: string) => {
    // 50% de chance de spawnar a letra certa
    const isTarget = Math.random() > 0.5;
    const id = bubbleIdRef.current++;
    const anim = new Animated.Value(SCREEN_HEIGHT); // Começa na base da tela
    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    
    // Obter pool apropriado de distratores baseado na dificuldade
    const difficulty = Math.floor(challengesCompleted / 7) % 3;
    
    const activeLang = language || 'pt';
    const syllablesPool = LOCALIZED_SYLLABLES[activeLang] || LOCALIZED_SYLLABLES['pt'];
    let levelPool: string[];
    if (difficulty === 0) levelPool = syllablesPool.easy;
    else if (difficulty === 1) levelPool = syllablesPool.medium;
    else levelPool = syllablesPool.hard;

    const distractors = levelPool.filter(s => s !== target);
    const letter = isTarget ? target : distractors[Math.floor(Math.random() * distractors.length)];
    
    // Calcular posição horizontal randômica segura baseada na largura medida da área do jogo
    const currentWidth = gameAreaWidthRef.current;
    const maxX = Math.max(currentWidth - 85, 100);
    const x = Math.floor(Math.random() * (maxX - 25)) + 15;

    const newBubble: Bubble = {
      id,
      letter,
      x,
      anim,
      popped: false,
      color,
    };

    setBubbles(prev => [...prev, newBubble]);

    // Animação de subir lentamente (TDAH amigável: lento e previsível, 6 segundos)
    Animated.timing(anim, {
      toValue: -100, // sobe até sumir no topo
      duration: 6500,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // Remover bolha se ela saiu da tela sem ser estourada
        setBubbles(prev => prev.filter(b => b.id !== id));
      }
    });
  };

  const handlePop = (bubble: Bubble) => {
    if (bubble.popped || isDone) return;

    // Marcar como estourada para sumir visualmente
    setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, popped: true } : b));
    
    // Parar animação de subida e descarregar
    bubble.anim.stopAnimation();

    const isCorrect = bubble.letter === targetLetter;
    const responseTime = Date.now() - roundStartTimeRef.current;

    if (childId && sessionIdRef.current) {
      logGameEvent({
        profile_id: childId,
        session_id: sessionIdRef.current,
        game_key: 'aventura_das_letras',
        event_type: 'answer',
        target: targetLetter,
        target_type: targetLetter.length > 1 ? 'syllable' : 'letter',
        response_value: bubble.letter,
        correct: isCorrect,
        response_time_ms: responseTime,
        error_type: isCorrect ? undefined : (responseTime < 500 ? 'impulsiva' : 'substituicao'),
      }).catch(err => console.warn('Erro logGameEvent answer Captura:', err));
    }

    if (isCorrect) {
      playSound('pop', soundEnabled);
      setCaughtCount(prev => prev + 1);
    } else {
      // Tocou na bolha errada: estoura normalmente mas Lumi dá instrução de reforço
      hadErrorInRound.current = true;
      hadErrorEver.current = true;
      playSound('pop', soundEnabled);
      speak(t('tryAgain'), language);
    }
  };

  const handleBack = () => {
    if (childId && sessionIdRef.current && !exerciseFinished.current) {
      logGameEvent({
        profile_id: childId,
        session_id: sessionIdRef.current,
        game_key: 'aventura_das_letras',
        event_type: 'abandon',
      }).catch(console.warn);
      endGameSession(sessionIdRef.current).catch(console.warn);
    }
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game3Title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeText}>⭐ {stars}</Text>
          </View>
          <Text style={styles.roundText}>Pegou: {caughtCount}/3 ({currentIndex + 1}/{queue.length})</Text>
        </View>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game3Prompt')} />

      <TouchableOpacity 
        style={styles.listenButton} 
        onPress={() => speak(targetLetter, language)}
      >
        <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
      </TouchableOpacity>

      {/* ÁREA DE JOGO DAS BOLHAS */}
      <View 
        style={styles.gameArea}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          if (width > 0) {
            gameAreaWidthRef.current = width;
          }
        }}
      >
        {bubbles.map((bubble) => {
          if (bubble.popped) return null;

          const animatedStyle = {
            transform: [
              { translateY: bubble.anim }
            ],
            left: bubble.x,
          };

          return (
            <Animated.View key={bubble.id} style={[styles.bubbleWrapper, animatedStyle]}>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => handlePop(bubble)}
                style={[styles.bubbleCircle, { backgroundColor: bubble.color }]}
              >
                <Text style={[styles.bubbleText, bubble.letter.length > 2 ? { fontSize: 20 } : bubble.letter.length > 1 ? { fontSize: 24 } : null]}>
                  {bubble.letter}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      <PerfectRun visible={showPerfect} onClose={handleBack} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1F5FE', // Azul água clarinho
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
    zIndex: 10,
  },
  listenButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bubbleWrapper: {
    position: 'absolute',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0277BD',
  },
});

export { CapturaDeSilabas as CapturaLetras };
