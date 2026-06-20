import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface CapturaLetrasProps {
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
const TARGET_LETTERS = ['B', 'C', 'G', 'H', 'J', 'K', 'Q', 'W', 'Y'];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export const CapturaLetras: React.FC<CapturaLetrasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [targetLetter, setTargetLetter] = useState('B');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const bubbleIdRef = useRef(0);
  const gameIntervalRef = useRef<any>(null);

  // Iniciar jogo
  useEffect(() => {
    // Escolher letra alvo
    const selectedTarget = TARGET_LETTERS[Math.floor(Math.random() * TARGET_LETTERS.length)];
    setTargetLetter(selectedTarget);
    setCaughtCount(0);
    setIsDone(false);
    setBubbles([]);

    // Spawna uma bolha a cada 1.8 segundos
    gameIntervalRef.current = setInterval(() => {
      spawnBubble(selectedTarget);
    }, 1800);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  // Monitorar se atingiu 5 capturas
  useEffect(() => {
    if (caughtCount >= 5 && !isDone) {
      setIsDone(true);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      
      // Sucesso total!
      playSound('success', soundEnabled);
      setTimeout(async () => {
        await completeChallenge('letter', targetLetter);
        onBack();
      }, 2000);
    }
  }, [caughtCount, isDone]);

  const spawnBubble = (target: string) => {
    // 50% de chance de spawnar a letra certa
    const isTarget = Math.random() > 0.5;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== target);
    const letter = isTarget ? target : alphabet[Math.floor(Math.random() * alphabet.length)];

    const id = bubbleIdRef.current++;
    const anim = new Animated.Value(SCREEN_HEIGHT); // Começa na base da tela
    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    
    // Calcular posição horizontal randômica segura (20px de margem)
    const maxX = Math.max(SCREEN_WIDTH - 90, 100);
    const x = Math.floor(Math.random() * (maxX - 20)) + 20;

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

    if (bubble.letter === targetLetter) {
      playSound('pop', soundEnabled);
      setCaughtCount(prev => prev + 1);
    } else {
      // Tocou na bolha errada: estoura normalmente mas Lumi dá instrução de reforço
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
        <Text style={styles.headerTitle}>{t('game3Title')}</Text>
        <Text style={styles.roundText}>Pegou: {caughtCount}/5</Text>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game3Prompt', { letter: targetLetter })} />

      {/* ÁREA DE JOGO DAS BOLHAS */}
      <View style={styles.gameArea}>
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
                <Text style={styles.bubbleText}>{bubble.letter}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#B3E5FC',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  roundText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
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
