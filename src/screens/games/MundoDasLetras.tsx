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

  // Animações de revelação para cada um dos 4 itens
  const anims = {
    tree: useRef(new Animated.Value(0)).current,
    flower: useRef(new Animated.Value(0)).current,
    stone: useRef(new Animated.Value(0)).current,
    chest: useRef(new Animated.Value(0)).current
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
    Object.values(anims).forEach(anim => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
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
    
    // Animação de deslizar o objeto para cima/lado revelando a letra
    const animRef = anims[itemId as keyof typeof anims];
    Animated.timing(animRef, {
      toValue: -40, // desliza 40px para cima
      duration: 300,
      useNativeDriver: true
    }).start();

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
      // Fazer o item vibrar levemente para indicar toque
      Animated.sequence([
        Animated.timing(animRef, { toValue: -30, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -45, duration: 100, useNativeDriver: true }),
        Animated.timing(animRef, { toValue: -40, duration: 100, useNativeDriver: true })
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
            transform: [{ translateY: anims[item.id as keyof typeof anims] }]
          };

          return (
            <View key={item.id} style={styles.itemWrapper}>
              {/* Letra Oculta de Trás (aparece quando o item sobe) */}
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
              <Animated.View style={[styles.coverContainer, animStyle]}>
                <TouchableOpacity
                  activeOpacity={0.8}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  letterContainer: {
    position: 'absolute',
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  letterText: {
    fontSize: 36,
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
    backgroundColor: '#C8E6C9',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#81C784',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coverEmoji: {
    fontSize: 50,
  },
  coverLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
});
