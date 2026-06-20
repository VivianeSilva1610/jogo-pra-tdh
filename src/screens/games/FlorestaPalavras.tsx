import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';
import { PerfectRun } from '../../components/PerfectRun';

interface FlorestaPalavrasProps {
  onBack: () => void;
}

interface ForestItem {
  emoji: string;
  wordKeys: Record<string, string>; // e.g. { pt: 'MAÇÃ', en: 'APPLE', it: 'MELA', es: 'MANZANA' }
  wrongWordKeys: Record<string, string[]>;
}

const ITEMS_POOL: ForestItem[] = [
  {
    emoji: '🍎',
    wordKeys: { pt: 'MAÇÃ', en: 'APPLE', it: 'MELA', es: 'MANZANA' },
    wrongWordKeys: {
      pt: ['BOLA', 'CASA'],
      en: ['BALL', 'HOUSE'],
      it: ['PALLA', 'CASA'],
      es: ['BOLA', 'CASA']
    }
  },
  {
    emoji: '🌳',
    wordKeys: { pt: 'ÁRVORE', en: 'TREE', it: 'ALBERO', es: 'ÁRBOL' },
    wrongWordKeys: {
      pt: ['FLOR', 'PEDRA'],
      en: ['FLOWER', 'ROCK'],
      it: ['FIORE', 'PIETRA'],
      es: ['FLOR', 'PIEDRA']
    }
  },
  {
    emoji: '🐱',
    wordKeys: { pt: 'GATO', en: 'CAT', it: 'GATTO', es: 'GATO' },
    wrongWordKeys: {
      pt: ['CÃO', 'RATO'],
      en: ['DOG', 'MOUSE'],
      it: ['CANE', 'TOPO'],
      es: ['PERRO', 'RATÓN']
    }
  },
  {
    emoji: '⚽',
    wordKeys: { pt: 'BOLA', en: 'BALL', it: 'PALLA', es: 'PELOTA' },
    wrongWordKeys: {
      pt: ['BOLO', 'BOTA'],
      en: ['CAKE', 'BOOT'],
      it: ['TORTA', 'STIVALE'],
      es: ['PASTEL', 'BOTA']
    }
  },
  {
    emoji: '🏠',
    wordKeys: { pt: 'CASA', en: 'HOUSE', it: 'CASA', es: 'CASA' },
    wrongWordKeys: {
      pt: ['CARRO', 'PORTA'],
      en: ['CAR', 'DOOR'],
      it: ['AUTO', 'PORTA'],
      es: ['COCHE', 'PUERTA']
    }
  },
  {
    emoji: '☀️',
    wordKeys: { pt: 'SOL', en: 'SUN', it: 'SOLE', es: 'SOL' },
    wrongWordKeys: {
      pt: ['LUA', 'NUVEM'],
      en: ['MOON', 'CLOUD'],
      it: ['LUNA', 'NUVOLA'],
      es: ['LUNA', 'NUBE']
    }
  },
  {
    emoji: '🚗',
    wordKeys: { pt: 'CARRO', en: 'CAR', it: 'AUTO', es: 'COCHE' },
    wrongWordKeys: {
      pt: ['TREM', 'MOTO'],
      en: ['TRAIN', 'BIKE'],
      it: ['TRENO', 'MOTO'],
      es: ['TREN', 'MOTO']
    }
  },
  {
    emoji: '🐸',
    wordKeys: { pt: 'SAPO', en: 'FROG', it: 'RANA', es: 'SAPO' },
    wrongWordKeys: {
      pt: ['PEIXE', 'PATO'],
      en: ['FISH', 'DUCK'],
      it: ['PESCE', 'ANATRA'],
      es: ['PEZ', 'PATO']
    }
  },
  {
    emoji: '🍦',
    wordKeys: { pt: 'SORVETE', en: 'ICE CREAM', it: 'GELATO', es: 'HELADO' },
    wrongWordKeys: {
      pt: ['DOCE', 'BOLO'],
      en: ['SWEET', 'CAKE'],
      it: ['DOLCE', 'TORTA'],
      es: ['DULCE', 'PASTEL']
    }
  },
  {
    emoji: '🦁',
    wordKeys: { pt: 'LEÃO', en: 'LION', it: 'LEONE', es: 'LEÓN' },
    wrongWordKeys: {
      pt: ['TIGRE', 'GATO'],
      en: ['TIGER', 'CAT'],
      it: ['TIGRE', 'GATTO'],
      es: ['TIGRE', 'GATO']
    }
  },
  {
    emoji: '🍌',
    wordKeys: { pt: 'BANANA', en: 'BANANA', it: 'BANANA', es: 'PLÁTANO' },
    wrongWordKeys: {
      pt: ['MAÇÃ', 'UVA'],
      en: ['APPLE', 'GRAPE'],
      it: ['MELA', 'UVA'],
      es: ['MANZANA', 'UVA']
    }
  },
  {
    emoji: '📚',
    wordKeys: { pt: 'LIVRO', en: 'BOOK', it: 'LIBRO', es: 'LIBRO' },
    wrongWordKeys: {
      pt: ['PAPEL', 'CANETA'],
      en: ['PAPER', 'PEN'],
      it: ['CARTA', 'PENNA'],
      es: ['PAPEL', 'PLUMA']
    }
  }
];

export const FlorestaPalavras: React.FC<FlorestaPalavrasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [queue, setQueue] = useState<ForestItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<ForestItem>(ITEMS_POOL[0]);
  const [choices, setChoices] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false); // Rastreia erros em TODAS as rodadas
  const [showPerfect, setShowPerfect] = useState(false);

  // Inicializar fila
  useEffect(() => {
    const selectedTargets: ForestItem[] = [];
    const pool = [...ITEMS_POOL];
    while (selectedTargets.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      selectedTargets.push(pool[idx]);
      pool.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, []);

  // Iniciar nova rodada quando muda o índice na fila
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      startNewRound(queue[currentIndex]);
    }
  }, [currentIndex, queue, language]);

  const startNewRound = (selected: ForestItem) => {
    setCurrentItem(selected);
    setRoundCompleted(false);
    setSelectedIdx(null);
    hadErrorInRound.current = false;

    // Pegar palavra correta no idioma corrente
    const lang = language as string;
    const correctWord = selected.wordKeys[lang] || selected.wordKeys['pt'];
    const wrongs = selected.wrongWordKeys[lang] || selected.wrongWordKeys['pt'];

    // Misturar
    const allChoices = [correctWord, ...wrongs].sort(() => Math.random() - 0.5);
    setChoices(allChoices);

    // Tocar a palavra alvo automaticamente
    speak(correctWord, language);
  };

  const handleSelect = (choice: string, index: number) => {
    if (roundCompleted) return;
    setSelectedIdx(index);

    const lang = language as string;
    const correctWord = currentItem.wordKeys[lang] || currentItem.wordKeys['pt'];

    if (choice === correctWord) {
      playSound('success', soundEnabled);
      setRoundCompleted(true);
      
      speak(choice, language);

      setTimeout(async () => {
        let updatedQueue = [...queue];
        if (hadErrorInRound.current) {
          updatedQueue.push(currentItem);
          setQueue(updatedQueue);
        }

        const nextIdx = currentIndex + 1;
        if (nextIdx < updatedQueue.length) {
          setCurrentIndex(nextIdx);
        } else {
          await completeChallenge('word', correctWord);
          if (!hadErrorEver.current) {
            setShowPerfect(true);
          } else {
            onBack();
          }
        }
      }, 2500);
    } else {
      hadErrorInRound.current = true;
      hadErrorEver.current = true;
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
        <Text style={styles.headerTitle}>{t('game6Title')}</Text>
        <Text style={styles.roundText}>Rodada {currentIndex + 1}/{queue.length}</Text>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game6Prompt')} />

      <TouchableOpacity 
        style={styles.listenButton} 
        onPress={() => {
          const lang = language as string;
          const correctWord = currentItem.wordKeys[lang] || currentItem.wordKeys['pt'];
          speak(correctWord, language);
        }}
      >
        <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
      </TouchableOpacity>

      <View style={styles.gameArea}>
        
        {/* Imagem em Vetor/Emoji Central */}
        <View style={styles.imageCard}>
          <Text style={styles.imageEmoji}>{currentItem.emoji}</Text>
        </View>

        {/* Lista de Opções */}
        <View style={styles.choicesContainer}>
          {choices.map((choice, index) => {
            const isSelected = selectedIdx === index;
            const lang = language as string;
            const correctWord = currentItem.wordKeys[lang] || currentItem.wordKeys['pt'];
            const isCorrect = choice === correctWord;

            let btnStyle: any = styles.choiceBtn;
            let textStyle: any = styles.choiceText;

            if (isSelected) {
              if (isCorrect) {
                btnStyle = [styles.choiceBtn, styles.choiceCorrect];
                textStyle = [styles.choiceText, styles.choiceTextCorrect];
              } else {
                btnStyle = [styles.choiceBtn, styles.choiceIncorrect];
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={btnStyle}
                onPress={() => handleSelect(choice, index)}
                disabled={roundCompleted || isSelected}
              >
                <Text style={textStyle}>{choice}</Text>
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
    backgroundColor: '#F1F8E9', // Verde mata clarinho acolhedor
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#DCEDC8',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#558B2F',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#C5E1A5',
    padding: 25,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8BC34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 35,
  },
  imageEmoji: {
    fontSize: 74,
  },
  choicesContainer: {
    width: '100%',
    maxWidth: 350,
  },
  choiceBtn: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 3,
    borderBottomWidth: 6, // Efeito 3D de placa de madeira
    borderColor: '#81C784',
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  choiceCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    transform: [{ scale: 1.03 }],
  },
  choiceIncorrect: {
    borderColor: '#B0BEC5',
    backgroundColor: '#ECEFF1',
    opacity: 0.6,
  },
  choiceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    fontFamily: 'System',
  },
  choiceTextCorrect: {
    color: '#1B5E20',
  },
});
