import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { StarIcon, CoinIcon } from '../../components/VectorIcons';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft, Volume2 } from 'lucide-react-native';

interface SomELetraProps {
  onBack: () => void;
}

const SYLLABLES_POOL = ['MA', 'PA', 'BA', 'LA', 'CA', 'TA', 'DA', 'GA', 'FA', 'SA', 'RA', 'VA'];

export const SomELetra: React.FC<SomELetraProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [targetSyllable, setTargetSyllable] = useState('MA');
  const [choices, setChoices] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Carregar rodada
  useEffect(() => {
    startNewRound();
  }, [round]);

  const startNewRound = () => {
    const selectedTarget = SYLLABLES_POOL[Math.floor(Math.random() * SYLLABLES_POOL.length)];
    setTargetSyllable(selectedTarget);
    setRoundCompleted(false);
    setSelectedIdx(null);

    // Gerar 2 alternativas distintas
    const alternatives: string[] = [];
    while (alternatives.length < 2) {
      const alt = SYLLABLES_POOL[Math.floor(Math.random() * SYLLABLES_POOL.length)];
      if (alt !== selectedTarget && !alternatives.includes(alt)) {
        alternatives.push(alt);
      }
    }

    // Misturar
    const allChoices = [...alternatives, selectedTarget].sort(() => Math.random() - 0.5);
    setChoices(allChoices);

    // Narrar a sílaba automaticamente com delay de 1s para o carregamento da tela
    setTimeout(() => {
      speakSyllable(selectedTarget);
    }, 1000);
  };

  const speakSyllable = (syllable: string) => {
    // Para TDAH, falamos a sílaba devagar
    speak(syllable, language);
  };

  const handleSelect = (choice: string, index: number) => {
    if (roundCompleted) return;
    setSelectedIdx(index);

    if (choice === targetSyllable) {
      playSound('success', soundEnabled);
      setRoundCompleted(true);

      setTimeout(async () => {
        if (round < 3) {
          setRound(r => r + 1);
        } else {
          await completeChallenge('syllable', targetSyllable);
          onBack();
        }
      }, 2000);
    } else {
      playSound('pop', soundEnabled);
      speak(t('tryAgain'), language);
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
        <Text style={styles.headerTitle}>{t('game4Title')}</Text>
        <Text style={styles.roundText}>Rodada {round}/3</Text>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game4Prompt', { syllable: targetSyllable })} />

      <View style={styles.gameArea}>
        {/* Alto-falante Gigante para repetir som */}
        <TouchableOpacity 
          style={styles.speakerButton} 
          activeOpacity={0.8}
          onPress={() => speakSyllable(targetSyllable)}
        >
          <Volume2 size={54} color="#5E35B1" />
          <Text style={styles.speakerText}>Ouvir de novo</Text>
        </TouchableOpacity>

        {/* Botões de Opção das Sílabas */}
        <View style={styles.choicesRow}>
          {choices.map((choice, index) => {
            const isSelected = selectedIdx === index;
            const isCorrect = choice === targetSyllable;

            let choiceStyle: any = styles.choiceBubble;
            let textStyle: any = styles.choiceText;

            if (isSelected) {
              if (isCorrect) {
                choiceStyle = [styles.choiceBubble, styles.choiceCorrect];
                textStyle = [styles.choiceText, styles.choiceTextCorrect];
              } else {
                choiceStyle = [styles.choiceBubble, styles.choiceIncorrect];
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={choiceStyle}
                onPress={() => handleSelect(choice, index)}
                disabled={roundCompleted || isSelected}
              >
                <Text style={textStyle}>{choice}</Text>
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
    backgroundColor: '#F3E5F5', // Lilás clarinho acolhedor
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E1BEE7',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  roundText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  speakerButton: {
    backgroundColor: '#FFF',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#BA68C8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#BA68C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  speakerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginTop: 8,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    maxWidth: 400,
  },
  choiceBubble: {
    backgroundColor: '#FFF',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#BA68C8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  choiceCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    transform: [{ scale: 1.05 }],
  },
  choiceIncorrect: {
    borderColor: '#B0BEC5',
    backgroundColor: '#ECEFF1',
    opacity: 0.6,
  },
  choiceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  choiceTextCorrect: {
    color: '#2E7D32',
  },
});
