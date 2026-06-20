import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface LetrasCamufladasProps {
  onBack: () => void;
}

const SHUFFLED_EMOJIS = ['🌳', '🐝', '🚗', '🐱', '🐶', '⚽', '🍎', '🧸', '🚀', '⭐', '🎈', '🍉', '🐟'];
const TARGET_LETTERS = ['B', 'D', 'F', 'L', 'N', 'R', 'S', 'V', 'Z'];

export const LetrasCamufladas: React.FC<LetrasCamufladasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [targetLetter, setTargetLetter] = useState('B');
  const [choices, setChoices] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    startNewRound();
  }, [round]);

  const startNewRound = () => {
    const selectedTarget = TARGET_LETTERS[Math.floor(Math.random() * TARGET_LETTERS.length)];
    setTargetLetter(selectedTarget);
    setRoundCompleted(false);
    setSelectedIdx(null);

    // Selecionar 4 emojis aleatórios distintos
    const emojis: string[] = [];
    while (emojis.length < 4) {
      const randomEmoji = SHUFFLED_EMOJIS[Math.floor(Math.random() * SHUFFLED_EMOJIS.length)];
      if (!emojis.includes(randomEmoji)) {
        emojis.push(randomEmoji);
      }
    }

    // Misturar com a letra alvo
    const allChoices = [...emojis, selectedTarget].sort(() => Math.random() - 0.5);
    setChoices(allChoices);
  };

  const handleSelect = (item: string, index: number) => {
    if (roundCompleted) return;
    setSelectedIdx(index);

    if (item === targetLetter) {
      // Correto!
      playSound('success', soundEnabled);
      setRoundCompleted(true);

      setTimeout(async () => {
        if (round < 3) {
          setRound(r => r + 1);
        } else {
          await completeChallenge('letter', targetLetter);
          onBack();
        }
      }, 2000);
    } else {
      // Incorreto
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
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game2Title')}</Text>
        <Text style={styles.roundText}>Rodada {round}/3</Text>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game2Prompt', { letter: targetLetter })} />

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
                <Text style={textStyle}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#FFE082',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  roundText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#FFE082',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    transform: [{ scale: 1.08 }],
  },
  bubbleIncorrect: {
    borderColor: '#B0BEC5', // Erro cinza neutro
    backgroundColor: '#ECEFF1',
    opacity: 0.6,
  },
  bubbleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  bubbleTextCorrect: {
    color: '#2E7D32',
  },
});
