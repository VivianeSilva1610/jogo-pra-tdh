import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Rect, Path, Polygon, G, Circle } from 'react-native-svg';

interface CasteloFrasesProps {
  onBack: () => void;
}

interface PhraseOption {
  sentence: string;
  shuffledPt: string[];
  langMap: Record<string, { sentence: string; words: string[] }>;
}

const PHRASES_POOL: PhraseOption[] = [
  {
    sentence: 'O gato corre.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O gato corre.', words: ['O', 'gato', 'corre.'] },
      en: { sentence: 'The cat runs.', words: ['The', 'cat', 'runs.'] },
      it: { sentence: 'Il gatto corre.', words: ['Il', 'gatto', 'corre.'] },
      es: { sentence: 'El gato corre.', words: ['El', 'gato', 'corre.'] }
    }
  },
  {
    sentence: 'A casa é bela.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A casa é bela.', words: ['A', 'casa', 'é', 'bela.'] },
      en: { sentence: 'The house is beautiful.', words: ['The', 'house', 'is', 'beautiful.'] },
      it: { sentence: 'La casa è bella.', words: ['La', 'casa', 'è', 'bella.'] },
      es: { sentence: 'La casa es bella.', words: ['La', 'casa', 'es', 'bella.'] }
    }
  },
  {
    sentence: 'O cão brinca.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O cão brinca.', words: ['O', 'cão', 'brinca.'] },
      en: { sentence: 'The dog plays.', words: ['The', 'dog', 'plays.'] },
      it: { sentence: 'Il cane gioca.', words: ['Il', 'cane', 'gioca.'] },
      es: { sentence: 'El perro juega.', words: ['El', 'perro', 'juega.'] }
    }
  },
  {
    sentence: 'O sol brilha.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O sol brilha.', words: ['O', 'sol', 'brilha.'] },
      en: { sentence: 'The sun shines.', words: ['The', 'sun', 'shines.'] },
      it: { sentence: 'Il sole splende.', words: ['Il', 'sole', 'splende.'] },
      es: { sentence: 'El sol brilla.', words: ['El', 'sol', 'brilla.'] }
    }
  },
  {
    sentence: 'A maçã é doce.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A maçã é doce.', words: ['A', 'maçã', 'é', 'doce.'] },
      en: { sentence: 'The apple is sweet.', words: ['The', 'apple', 'is', 'sweet.'] },
      it: { sentence: 'La mela è dolce.', words: ['La', 'mela', 'è', 'dolce.'] },
      es: { sentence: 'La manzana es dulce.', words: ['La', 'manzana', 'es', 'dulce.'] }
    }
  },
  {
    sentence: 'A flor cresce.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A flor cresce.', words: ['A', 'flor', 'cresce.'] },
      en: { sentence: 'The flower grows.', words: ['The', 'flower', 'grows.'] },
      it: { sentence: 'Il fiore cresce.', words: ['Il', 'fiore', 'cresce.'] },
      es: { sentence: 'La flor crece.', words: ['La', 'flor', 'crece.'] }
    }
  },
  {
    sentence: 'O pássaro voa.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O pássaro voa.', words: ['O', 'pássaro', 'voa.'] },
      en: { sentence: 'The bird flies.', words: ['The', 'bird', 'flies.'] },
      it: { sentence: 'L uccello vola.', words: ['L uccello', 'vola.'] },
      es: { sentence: 'El pájaro vuela.', words: ['El', 'pájaro', 'vuela.'] }
    }
  },
  {
    sentence: 'O bolo é gostoso.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O bolo é gostoso.', words: ['O', 'bolo', 'é', 'gostoso.'] },
      en: { sentence: 'The cake is tasty.', words: ['The', 'cake', 'is', 'tasty.'] },
      it: { sentence: 'La torta è buona.', words: ['La', 'torta', 'è', 'buona.'] },
      es: { sentence: 'El pastel es rico.', words: ['El', 'pastel', 'es', 'rico.'] }
    }
  }
];

export const CasteloFrases: React.FC<CasteloFrasesProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [queue, setQueue] = useState<PhraseOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhraseObj, setCurrentPhraseObj] = useState<PhraseOption>(PHRASES_POOL[0]);
  const [shuffledWords, setShuffledWords] = useState<{ id: number; word: string; used: boolean }[]>([]);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const hadErrorInRound = useRef(false);

  // Animação para abrir o portão do castelo (desliza para cima ou baixo)
  const gateTranslateY = useRef(new Animated.Value(0)).current;

  // Inicializar fila com 3 frases distintas
  useEffect(() => {
    const selectedTargets: PhraseOption[] = [];
    const pool = [...PHRASES_POOL];
    while (selectedTargets.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      selectedTargets.push(pool[idx]);
      pool.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, []);

  // Iniciar rodada quando muda o índice na fila ou idioma
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      const selected = queue[currentIndex];
      setCurrentPhraseObj(selected);
      setTypedWords([]);
      setRoundCompleted(false);
      hadErrorInRound.current = false;
      gateTranslateY.setValue(0);

      const lang = language as string;
      const phraseData = selected.langMap[lang] || selected.langMap['pt'];
      
      // Preparar palavras embaralhadas
      const wordsList = [...phraseData.words]
        .sort(() => Math.random() - 0.5)
        .map((word, idx) => ({
          id: idx,
          word,
          used: false
        }));

      setShuffledWords(wordsList);

      // Narrar a frase automaticamente após 1.2s para o carregamento da tela
      setTimeout(() => {
        speak(phraseData.sentence, language);
      }, 1200);
    }
  }, [currentIndex, queue, language]);

  const handleWordTap = (wordItem: { id: number; word: string; used: boolean }) => {
    if (roundCompleted || wordItem.used) return;

    const lang = language as string;
    const phraseData = currentPhraseObj.langMap[lang] || currentPhraseObj.langMap['pt'];
    const nextIndex = typedWords.length;
    const expectedWord = phraseData.words[nextIndex];

    if (wordItem.word === expectedWord) {
      playSound('pop', soundEnabled);

      // Marcar palavra usada
      setShuffledWords(prev => prev.map(w => w.id === wordItem.id ? { ...w, used: true } : w));
      
      // Adicionar à frase que está sendo montada
      const newTyped = [...typedWords, wordItem.word];
      setTypedWords(newTyped);

      // Narrar palavra
      speak(wordItem.word, language);

      // Verificar se a frase está completa
      if (newTyped.length === phraseData.words.length) {
        setRoundCompleted(true);
        playSound('success', soundEnabled);

        // Animação de abrir portão (sobe portão em 1s)
        Animated.timing(gateTranslateY, {
          toValue: -32,
          duration: 1000,
          useNativeDriver: true
        }).start(() => {
          // Fala a frase inteira
          speak(phraseData.sentence, language);
        });

        setTimeout(async () => {
          let updatedQueue = [...queue];
          if (hadErrorInRound.current) {
            updatedQueue.push(currentPhraseObj);
            setQueue(updatedQueue);
          }

          const nextIdx = currentIndex + 1;
          if (nextIdx < updatedQueue.length) {
            setCurrentIndex(nextIdx);
          } else {
            await completeChallenge('word', phraseData.sentence);
            onBack();
          }
        }, 3500);
      }
    } else {
      hadErrorInRound.current = true;
      playSound('pop', soundEnabled);
      speak(t('tryAgain'), language);
    }
  };

  const renderCastle = () => {
    return (
      <Svg width={180} height={130} viewBox="0 0 100 80" fill="none">
        {/* Fundo do Castelo (Sol de fundo) */}
        <Circle cx="50" cy="50" r="28" fill="#FFF9C4" opacity="0.6" />
        
        {/* Torres Laterais */}
        <Rect x="15" y="30" width="12" height="40" fill="#90A4AE" stroke="#37474F" strokeWidth="1.5" />
        <Polygon points="13,30 21,15 29,30" fill="#E53935" stroke="#37474F" strokeWidth="1.5" />
        
        <Rect x="73" y="30" width="12" height="40" fill="#90A4AE" stroke="#37474F" strokeWidth="1.5" />
        <Polygon points="71,30 79,15 87,30" fill="#E53935" stroke="#37474F" strokeWidth="1.5" />

        {/* Parede Principal */}
        <Rect x="27" y="40" width="46" height="30" fill="#B0BEC5" stroke="#37474F" strokeWidth="1.5" />
        
        {/* Ameias no topo da parede */}
        <Rect x="30" y="36" width="6" height="5" fill="#78909C" stroke="#37474F" strokeWidth="1" />
        <Rect x="42" y="36" width="6" height="5" fill="#78909C" stroke="#37474F" strokeWidth="1" />
        <Rect x="54" y="36" width="6" height="5" fill="#78909C" stroke="#37474F" strokeWidth="1" />
        <Rect x="64" y="36" width="6" height="5" fill="#78909C" stroke="#37474F" strokeWidth="1" />

        {/* Portão Fundo (Vazio Escuro) */}
        <Path d="M40 70V54C40 50.7 42.7 48 46 48H54C57.3 48 60 50.7 60 70H40Z" fill="#3E2723" />

        {/* Portão Móvel (Subindo com animação) */}
        <Animated.View style={{ transform: [{ translateY: gateTranslateY }], position: 'absolute' }}>
          {/* Usamos desenho inline da grade */}
          <Svg width={100} height={80} viewBox="0 0 100 80" fill="none">
            <Path d="M40 70V54C40 50.7 42.7 48 46 48H54C57.3 48 60 50.7 60 70H40Z" fill="#FFB74D" stroke="#E65100" strokeWidth="1" />
            <Path d="M45 48V70M50 48V70M55 48V70M40 56H60M40 63H60" stroke="#E65100" strokeWidth="1" />
          </Svg>
        </Animated.View>
      </Svg>
    );
  };

  const lang = language as string;
  const phraseData = currentPhraseObj.langMap[lang] || currentPhraseObj.langMap['pt'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game7Title')}</Text>
        <Text style={styles.roundText}>Rodada {currentIndex + 1}/{queue.length}</Text>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game7Prompt')} />

      {/* Botão de Ouvir a Frase — a criança aperta para escutar em vez de ler */}
      {!roundCompleted && (
        <TouchableOpacity
          style={styles.listenBtn}
          onPress={() => speak(phraseData.sentence, language)}
          activeOpacity={0.8}
        >
          <Text style={styles.listenBtnText}>🔊 {language === 'pt' ? 'Ouvir a frase' : language === 'en' ? 'Hear the sentence' : language === 'it' ? 'Ascolta la frase' : 'Escuchar la frase'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.gameArea}>
        
        {/* Desenho do Castelo animado */}
        <View style={styles.castleContainer}>
          {renderCastle()}
          {roundCompleted && (
            <Text style={styles.castleOpenedText}>{t('castleOpened')}</Text>
          )}
        </View>

        {/* Quadro da Frase Montada */}
        <View style={styles.sentenceBoard}>
          <Text style={styles.sentenceText}>
            {typedWords.join(' ')}
          </Text>
        </View>

        {/* Botões das Palavras para Ordenação */}
        {!roundCompleted && (
          <View style={styles.wordsRow}>
            {shuffledWords.map((wordObj) => {
              return (
                <TouchableOpacity
                  key={wordObj.id}
                  activeOpacity={0.8}
                  style={[styles.wordBtn, wordObj.used && styles.wordBtnUsed]}
                  onPress={() => handleWordTap(wordObj)}
                  disabled={wordObj.used}
                >
                  <Text style={[styles.wordBtnText, wordObj.used && styles.wordBtnTextUsed]}>
                    {wordObj.word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D7CCC8', // Cor argila/madeira clara
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#D7CCC8',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  roundText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  castleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  castleOpenedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#388E3C',
    marginTop: 8,
  },
  sentenceBoard: {
    width: '90%',
    minHeight: 60,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#795548',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  sentenceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
    textAlign: 'center',
    fontFamily: 'System',
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '95%',
    maxWidth: 400,
    marginBottom: 20,
  },
  wordBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#8D6E63',
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  wordBtnUsed: {
    backgroundColor: '#E0D4D0',
    borderColor: '#BCAAA4',
    opacity: 0.35,
  },
  wordBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4E342E',
  },
  wordBtnTextUsed: {
    color: '#8D6E63',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D4037',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listenBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
