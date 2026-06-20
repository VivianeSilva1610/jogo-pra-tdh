import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { StarIcon, CoinIcon } from '../../components/VectorIcons';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface MundoDasLetrasProps {
  onBack: () => void;
}

const ITEMS = [
  { id: 'tree', label: '🌳', name: 'Árvore' },
  { id: 'flower', label: '🌸', name: 'Flor' },
  { id: 'stone', label: '🪨', name: 'Pedra' },
  { id: 'chest', label: '📦', name: 'Baú' }
];

const TARGET_LETTERS = ['A', 'E', 'I', 'O', 'U', 'B', 'M', 'P', 'T'];

export const MundoDasLetras: React.FC<MundoDasLetrasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [targetLetter, setTargetLetter] = useState('A');
  const [itemsData, setItemsData] = useState<{ id: string; letter: string; revealed: boolean }[]>([]);
  const [round, setRound] = useState(1);
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Animações de revelação (posição Y) para cada um dos 4 itens
  const anims = {
    tree: useRef(new Animated.Value(0)).current,
    flower: useRef(new Animated.Value(0)).current,
    stone: useRef(new Animated.Value(0)).current,
    chest: useRef(new Animated.Value(0)).current
  };

  // Animações de opacidade para cada um dos 4 itens (fadem para revelar o fundo)
  const opacities = {
    tree: useRef(new Animated.Value(1)).current,
    flower: useRef(new Animated.Value(1)).current,
    stone: useRef(new Animated.Value(1)).current,
    chest: useRef(new Animated.Value(1)).current
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
      Animated.timing(anims[key as keyof typeof anims], { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(opacities[key as keyof typeof opacities], { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });

    // Distribuir letras nos itens
    const shuffledItems = [...ITEMS].sort(() => Math.random() - 0.5);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== selectedTarget);
    
    const newItemsData = shuffledItems.map((item, idx) => {
      // O primeiro item embaralhado ganha a letra alvo
      const letter = idx === 0 ? selectedTarget : alphabet[Math.floor(Math.random() * alphabet.length)];
      return { id: item.id, letter, revealed: false };
    });

    setItemsData(newItemsData);
  };

  const handleTapItem = (itemId: string, itemLetter: string) => {
    if (roundCompleted) return;

    // Revelar o item específico
    setItemsData(prev => prev.map(item => item.id === itemId ? { ...item, revealed: true } : item));
    
    // Animação paralela: deslizar para cima e sumir (fade-out)
    const animRef = anims[itemId as keyof typeof anims];
    const opacityRef = opacities[itemId as keyof typeof opacities];

    Animated.parallel([
      Animated.timing(animRef, {
        toValue: -80, // desliza mais para cima
        duration: 350,
        useNativeDriver: true
      }),
      Animated.timing(opacityRef, {
        toValue: 0, // desaparece por completo revelando a letra perfeitamente
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
        Animated.timing(animRef, { toValue: -70, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -90, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -80, duration: 100, useNativeDriver: true })
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

      {/* CENÁRIO FLORESTA INTERATIVA */}
      <View style={styles.forestScene}>
        {ITEMS.map((item) => {
          const itemState = itemsData.find(i => i.id === item.id);
          const letterBehind = itemState ? itemState.letter : '';
          const isRevealed = itemState ? itemState.revealed : false;
          
          const animStyle = {
            transform: [{ translateY: anims[item.id as keyof typeof anims] }],
            opacity: opacities[item.id as keyof typeof opacities]
          };

          return (
            <View key={item.id} style={styles.itemWrapper}>
              {/* Letra Oculta de Trás (fica no centro do wrapper) */}
              <View style={styles.letterContainer}>
                {isRevealed && (
                  <Text style={[
                    styles.letterText,
                    letterBehind === targetLetter ? styles.letterSuccess : styles.letterWrong
                  ]}>
                    {letterBehind}
                  </Text>
                )}
              </View>

              {/* Elemento Interativo da Frente (Árvore, Flor...) */}
              <Animated.View style={[styles.coverContainer, animStyle]} pointerEvents={isRevealed ? 'none' : 'auto'}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isRevealed || roundCompleted}
                  onPress={() => handleTapItem(item.id, letterBehind)}
                  style={styles.coverButton}
                >
                  <Text style={styles.coverEmoji}>{item.label}</Text>
                  <Text style={styles.coverLabel}>{item.name}</Text>
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
    marginVertical: 15,
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
    color: '#B0BEC5', // Letra errada cinza suave (sem punição visual!)
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
  },
  coverEmoji: {
    fontSize: 52,
  },
  coverLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
});
