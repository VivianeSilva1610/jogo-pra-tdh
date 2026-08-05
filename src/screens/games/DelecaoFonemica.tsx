import { THEME_COLORS, FONT_SIZES } from '../../styles/theme';
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
import { useGameSession } from '../../hooks/useGameSession';
import { GameBackground } from '../../components/GameBackground';

interface DeletionProps {
  onBack: () => void;
}

interface DeletionItem {
  emoji: string;
  word: string;
  removedPart: string;
  instruction: string;
  answer: string;
  distractors: string[];
}

// Deleção fonêmica: a criança ouve a instrução ("fala X sem Y") e escolhe a
// palavra resultante. Nível fácil remove sílaba do início/fim; médio remove
// do meio — teste clássico de consciência fonêmica.
const DELETION_POOL: Record<string, { easy: DeletionItem[]; medium: DeletionItem[] }> = {
  pt: {
    easy: [
      { emoji: '🧥', word: 'CASACO', removedPart: 'CA', instruction: 'Fala CASACO sem o CA', answer: 'SACO', distractors: ['CACO', 'ACO'] },
      { emoji: '🎎', word: 'BONECA', removedPart: 'BO', instruction: 'Fala BONECA sem o BO', answer: 'NECA', distractors: ['BONE', 'ECA'] },
      { emoji: '🎒', word: 'MOCHILA', removedPart: 'MO', instruction: 'Fala MOCHILA sem o MO', answer: 'CHILA', distractors: ['MOCHI', 'CHIA'] },
      { emoji: '👟', word: 'SAPATO', removedPart: 'TO', instruction: 'Fala SAPATO sem o TO', answer: 'SAPA', distractors: ['SAPATO', 'APATO'] },
      { emoji: '🪟', word: 'JANELA', removedPart: 'LA', instruction: 'Fala JANELA sem o LA', answer: 'JANE', distractors: ['JANELA', 'ANELA'] },
      { emoji: '🪑', word: 'CADEIRA', removedPart: 'RA', instruction: 'Fala CADEIRA sem o RA', answer: 'CADEI', distractors: ['CADEIRA', 'ADEIRA'] },
      { emoji: '🐴', word: 'CAVALO', removedPart: 'LO', instruction: 'Fala CAVALO sem o LO', answer: 'CAVA', distractors: ['CAVALO', 'VALO'] },
      { emoji: '🐵', word: 'MACACO', removedPart: 'MA', instruction: 'Fala MACACO sem o MA', answer: 'CACO', distractors: ['MACACO', 'MACO'] },
      { emoji: '🍅', word: 'TOMATE', removedPart: 'TO', instruction: 'Fala TOMATE sem o TO', answer: 'MATE', distractors: ['TOMATE', 'TOMA'] },
      { emoji: '🐐', word: 'BODE', removedPart: 'BO', instruction: 'Fala BODE sem o BO', answer: 'DE', distractors: ['BODE', 'BOTE'] },
      { emoji: '🎲', word: 'DADO', removedPart: 'DA', instruction: 'Fala DADO sem o DA', answer: 'DO', distractors: ['DADO', 'DÃO'] },
      { emoji: '☝️', word: 'DEDO', removedPart: 'DO', instruction: 'Fala DEDO sem o DO', answer: 'DE', distractors: ['DEDO', 'DÃO'] },
      { emoji: '⚽', word: 'BOLA', removedPart: 'BO', instruction: 'Fala BOLA sem o BO', answer: 'LA', distractors: ['BOLA', 'LO'] },
      { emoji: '🪣', word: 'BALDE', removedPart: 'DE', instruction: 'Fala BALDE sem o DE', answer: 'BAL', distractors: ['BALDE', 'DAL'] },
      { emoji: '🐄', word: 'VACA', removedPart: 'CA', instruction: 'Fala VACA sem o CA', answer: 'VA', distractors: ['VACA', 'FA'] },
      { emoji: '🔪', word: 'FACA', removedPart: 'CA', instruction: 'Fala FACA sem o CA', answer: 'FA', distractors: ['FACA', 'VA'] },
      { emoji: '📸', word: 'FOTO', removedPart: 'TO', instruction: 'Fala FOTO sem o TO', answer: 'FO', distractors: ['FOTO', 'VO'] },
      { emoji: '🏠', word: 'TETO', removedPart: 'TE', instruction: 'Fala TETO sem o TE', answer: 'TO', distractors: ['TETO', 'DO'] },
      { emoji: '🐀', word: 'RATO', removedPart: 'RA', instruction: 'Fala RATO sem o RA', answer: 'TO', distractors: ['RATO', 'DO'] },
      { emoji: '🦆', word: 'PATA', removedPart: 'PA', instruction: 'Fala PATA sem o PA', answer: 'TA', distractors: ['PATA', 'BA'] },
      { emoji: '👢', word: 'BOTA', removedPart: 'BO', instruction: 'Fala BOTA sem o BO', answer: 'TA', distractors: ['BOTA', 'DA'] },
      { emoji: '👄', word: 'BOCA', removedPart: 'CA', instruction: 'Fala BOCA sem o CA', answer: 'BO', distractors: ['BOCA', 'PO'] },
      { emoji: '🐈', word: 'GATO', removedPart: 'TO', instruction: 'Fala GATO sem o TO', answer: 'GA', distractors: ['GATO', 'CA'] },
      { emoji: '👕', word: 'GOLA', removedPart: 'GO', instruction: 'Fala GOLA sem o GO', answer: 'LA', distractors: ['GOLA', 'CO'] },
      { emoji: '🗳️', word: 'VOTO', removedPart: 'TO', instruction: 'Fala VOTO sem o TO', answer: 'VO', distractors: ['VOTO', 'FO'] },
      { emoji: '🔥', word: 'FOGO', removedPart: 'GO', instruction: 'Fala FOGO sem o GO', answer: 'FO', distractors: ['FOGO', 'VO'] },
      { emoji: '🎀', word: 'FITA', removedPart: 'TA', instruction: 'Fala FITA sem o TA', answer: 'FI', distractors: ['FITA', 'VI'] },
      { emoji: '🏡', word: 'VILA', removedPart: 'LA', instruction: 'Fala VILA sem o LA', answer: 'VI', distractors: ['VILA', 'FI'] },
    ],
    medium: [
      { emoji: '🍿', word: 'PIPOCA', removedPart: 'PO', instruction: 'Fala PIPOCA sem o PO', answer: 'PICA', distractors: ['PIPOCA', 'POCA'] },
      { emoji: '☎️', word: 'TELEFONE', removedPart: 'LE', instruction: 'Fala TELEFONE sem o LE', answer: 'TEFONE', distractors: ['TELEFO', 'FONETE'] },
      { emoji: '🪳', word: 'BARATA', removedPart: 'RA', instruction: 'Fala BARATA sem o RA', answer: 'BATA', distractors: ['BARATA', 'BARTAA'] },
      { emoji: '🐫', word: 'CAMELO', removedPart: 'ME', instruction: 'Fala CAMELO sem o ME', answer: 'CALO', distractors: ['CAMELO', 'CAMO'] },
      { emoji: '🦒', word: 'GIRAFA', removedPart: 'RA', instruction: 'Fala GIRAFA sem o RA', answer: 'GIFA', distractors: ['GIRAFA', 'GIARA'] },
      { emoji: '👗', word: 'CABIDE', removedPart: 'BI', instruction: 'Fala CABIDE sem o BI', answer: 'CADE', distractors: ['CABIDE', 'CABE'] },
      { emoji: '🧃', word: 'BEBIDA', removedPart: 'BI', instruction: 'Fala BEBIDA sem o BI', answer: 'BEDA', distractors: ['BEBIDA', 'BIDA'] },
      { emoji: '🧔', word: 'BIGODE', removedPart: 'GO', instruction: 'Fala BIGODE sem o GO', answer: 'BIDE', distractors: ['BIGODE', 'BIGO'] },
      { emoji: '🧅', word: 'CEBOLA', removedPart: 'BO', instruction: 'Fala CEBOLA sem o BO', answer: 'CELA', distractors: ['CEBOLA', 'CEBA'] },
      { emoji: '🪙', word: 'MOEDA', removedPart: 'E', instruction: 'Fala MOEDA sem o E', answer: 'MODA', distractors: ['MOEDA', 'MEDA'] },
      { emoji: '🧶', word: 'NOVELO', removedPart: 'VE', instruction: 'Fala NOVELO sem o VE', answer: 'NOLO', distractors: ['NOVELO', 'NOFO'] },
      { emoji: '🗣️', word: 'FOFOCA', removedPart: 'FO', instruction: 'Fala FOFOCA sem a primeira sílaba FO', answer: 'FOCA', distractors: ['FOFOCA', 'VOCA'] },
      { emoji: '🥔', word: 'BATATA', removedPart: 'TA', instruction: 'Fala BATATA sem a primeira sílaba TA', answer: 'BATA', distractors: ['BATATA', 'BADA'] },
      { emoji: '💇‍♀️', word: 'CABELO', removedPart: 'BE', instruction: 'Fala CABELO sem o BE', answer: 'CALO', distractors: ['CABELO', 'CAPO'] },
      { emoji: '🍄', word: 'COGUMELO', removedPart: 'GU', instruction: 'Fala COGUMELO sem o GU', answer: 'COMELO', distractors: ['COGUMELO', 'COCU'] },
      { emoji: '🗄️', word: 'GAVETA', removedPart: 'VE', instruction: 'Fala GAVETA sem o VE', answer: 'GATA', distractors: ['GAVETA', 'GAFA'] },
      { emoji: '🧸', word: 'FOFURA', removedPart: 'FU', instruction: 'Fala FOFURA sem o FU', answer: 'FORA', distractors: ['FOFURA', 'VORA'] },
      { emoji: '🚀', word: 'FOGUETE', removedPart: 'GUE', instruction: 'Fala FOGUETE sem o GUE', answer: 'FOTE', distractors: ['FOGUETE', 'VOTE'] },
    ],
  },
  en: {
    easy: [
      { emoji: '🧁', word: 'CUPCAKE', removedPart: 'CUP', instruction: 'Say CUPCAKE without CUP', answer: 'CAKE', distractors: ['CUPCAKE', 'CAKECUP'] },
      { emoji: '🌈', word: 'RAINBOW', removedPart: 'RAIN', instruction: 'Say RAINBOW without RAIN', answer: 'BOW', distractors: ['RAINBOW', 'ROW'] },
      { emoji: '🎒', word: 'BACKPACK', removedPart: 'BACK', instruction: 'Say BACKPACK without BACK', answer: 'PACK', distractors: ['BACKPACK', 'PACKBACK'] },
      { emoji: '🚗', word: 'CARPET', removedPart: 'PET', instruction: 'Say CARPET without PET', answer: 'CAR', distractors: ['CARPET', 'CARP'] },
      { emoji: '🧺', word: 'BASKET', removedPart: 'ET', instruction: 'Say BASKET without ET', answer: 'BASK', distractors: ['BASKET', 'KET'] },
      { emoji: '🧦', word: 'NAPKIN', removedPart: 'KIN', instruction: 'Say NAPKIN without KIN', answer: 'NAP', distractors: ['NAPKIN', 'KIN'] },
      { emoji: '🌻', word: 'SUNFLOWER', removedPart: 'SUN', instruction: 'Say SUNFLOWER without SUN', answer: 'FLOWER', distractors: ['SUNFLOWER', 'FLOWERSSUN'] },
      { emoji: '⚾', word: 'BASEBALL', removedPart: 'BASE', instruction: 'Say BASEBALL without BASE', answer: 'BALL', distractors: ['BASEBALL', 'BALLBASE'] },
      { emoji: '⛄', word: 'SNOWMAN', removedPart: 'SNOW', instruction: 'Say SNOWMAN without SNOW', answer: 'MAN', distractors: ['SNOWMAN', 'MANSNOW'] },
    ],
    medium: [
      { emoji: '🦋', word: 'BUTTERFLY', removedPart: 'TER', instruction: 'Say BUTTERFLY without TER', answer: 'BUTFLY', distractors: ['BUTTERFLY', 'BUTFLYER'] },
      { emoji: '🍫', word: 'CHOCOLATE', removedPart: 'O', instruction: 'Say CHOCOLATE without O', answer: 'CHOCLATE', distractors: ['CHOCOLATE', 'CHOLATE'] },
      { emoji: '🐘', word: 'ELEPHANT', removedPart: 'LE', instruction: 'Say ELEPHANT without LE', answer: 'EPHANT', distractors: ['ELEPHANT', 'PHANTELE'] },
      { emoji: '🍅', word: 'TOMATO', removedPart: 'MA', instruction: 'Say TOMATO without MA', answer: 'TOTO', distractors: ['TOMATO', 'TOMO'] },
    ],
  },
  es: {
    easy: [
      { emoji: '👟', word: 'ZAPATO', removedPart: 'ZA', instruction: 'Di ZAPATO sin ZA', answer: 'PATO', distractors: ['ZAPATO', 'PATOZA'] },
      { emoji: '🎒', word: 'MOCHILA', removedPart: 'MO', instruction: 'Di MOCHILA sin MO', answer: 'CHILA', distractors: ['MOCHILA', 'CHIMO'] },
      { emoji: '👕', word: 'CAMISETA', removedPart: 'CA', instruction: 'Di CAMISETA sin CA', answer: 'MISETA', distractors: ['CAMISETA', 'MISECA'] },
      { emoji: '🎩', word: 'SOMBRERO', removedPart: 'RO', instruction: 'Di SOMBRERO sin RO', answer: 'SOMBRE', distractors: ['SOMBRERO', 'BRERO'] },
      { emoji: '🪟', word: 'VENTANA', removedPart: 'NA', instruction: 'Di VENTANA sin NA', answer: 'VENTA', distractors: ['VENTANA', 'TANA'] },
      { emoji: '🥄', word: 'CUCHARA', removedPart: 'RA', instruction: 'Di CUCHARA sin RA', answer: 'CUCHA', distractors: ['CUCHARA', 'CHARA'] },
      { emoji: '⚽', word: 'PELOTA', removedPart: 'TA', instruction: 'Di PELOTA sin TA', answer: 'PELO', distractors: ['PELOTA', 'LOTA'] },
      { emoji: '🍬', word: 'CARAMELO', removedPart: 'CA', instruction: 'Di CARAMELO sin CA', answer: 'RAMELO', distractors: ['CARAMELO', 'MELO'] },
      { emoji: '🍎', word: 'MANZANA', removedPart: 'MAN', instruction: 'Di MANZANA sin MAN', answer: 'ZANA', distractors: ['MANZANA', 'MANZA'] },
    ],
    medium: [
      { emoji: '☎️', word: 'TELÉFONO', removedPart: 'LE', instruction: 'Di TELÉFONO sin LE', answer: 'TEFONO', distractors: ['TELÉFONO', 'FOTELE'] },
      { emoji: '👟', word: 'ZAPATILLA', removedPart: 'PA', instruction: 'Di ZAPATILLA sin PA', answer: 'ZATILLA', distractors: ['ZAPATILLA', 'TILLAZA'] },
      { emoji: '🐴', word: 'CABALLO', removedPart: 'BA', instruction: 'Di CABALLO sin BA', answer: 'CALLO', distractors: ['CABALLO', 'CABLO'] },
      { emoji: '🐰', word: 'CONEJO', removedPart: 'NE', instruction: 'Di CONEJO sin NE', answer: 'COJO', distractors: ['CONEJO', 'CONO'] },
      { emoji: '🤡', word: 'PAYASO', removedPart: 'YA', instruction: 'Di PAYASO sin YA', answer: 'PASO', distractors: ['PAYASO', 'PAYSO'] },
    ],
  },
  it: {
    easy: [
      { emoji: '🧢', word: 'CAPPELLO', removedPart: 'CAP', instruction: "Di' CAPPELLO senza CAP", answer: 'PELLO', distractors: ['CAPPELLO', 'PELLOCAP'] },
      { emoji: '🍦', word: 'GELATO', removedPart: 'TO', instruction: "Di' GELATO senza TO", answer: 'GELA', distractors: ['GELATO', 'LATO'] },
      { emoji: '👶', word: 'BAMBINO', removedPart: 'BAM', instruction: "Di' BAMBINO senza BAM", answer: 'BINO', distractors: ['BAMBINO', 'BINOBAM'] },
      { emoji: '🪟', word: 'FINESTRA', removedPart: 'FI', instruction: "Di' FINESTRA senza FI", answer: 'NESTRA', distractors: ['FINESTRA', 'NESTRAFI'] },
      { emoji: '👞', word: 'SCARPA', removedPart: 'PA', instruction: "Di' SCARPA senza PA", answer: 'SCAR', distractors: ['SCARPA', 'CARPA'] },
      { emoji: '🚗', word: 'MACCHINA', removedPart: 'NA', instruction: "Di' MACCHINA senza NA", answer: 'MACCHI', distractors: ['MACCHINA', 'CHINA'] },
      { emoji: '👦', word: 'FRATELLO', removedPart: 'FRA', instruction: "Di' FRATELLO senza FRA", answer: 'TELLO', distractors: ['FRATELLO', 'TELLOFRA'] },
      { emoji: '👧', word: 'SORELLA', removedPart: 'SO', instruction: "Di' SORELLA senza SO", answer: 'RELLA', distractors: ['SORELLA', 'RELLASO'] },
      { emoji: '🛋️', word: 'DIVANO', removedPart: 'DI', instruction: "Di' DIVANO senza DI", answer: 'VANO', distractors: ['DIVANO', 'VANODI'] },
    ],
    medium: [
      { emoji: '☎️', word: 'TELEFONO', removedPart: 'LE', instruction: "Di' TELEFONO senza LE", answer: 'TEFONO', distractors: ['TELEFONO', 'FOTELE'] },
      { emoji: '🦋', word: 'FARFALLA', removedPart: 'FAL', instruction: "Di' FARFALLA senza FAL", answer: 'FARLA', distractors: ['FARFALLA', 'LAFAR'] },
      { emoji: '🐜', word: 'FORMICA', removedPart: 'MI', instruction: "Di' FORMICA senza MI", answer: 'FORCA', distractors: ['FORMICA', 'FOCA'] },
      { emoji: '🐌', word: 'LUMACA', removedPart: 'MA', instruction: "Di' LUMACA senza MA", answer: 'LUCA', distractors: ['LUMACA', 'LUMA'] },
      { emoji: '✏️', word: 'MATITA', removedPart: 'TI', instruction: "Di' MATITA senza TI", answer: 'MATA', distractors: ['MATITA', 'MATI'] },
    ],
  },
};

export const DelecaoFonemica: React.FC<DeletionProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted, stars } = useGame();

  const [queue, setQueue] = useState<DeletionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<DeletionItem | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false);
  const exerciseFinished = useRef(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const roundStartTimeRef = useRef<number>(0);
  const { difficulty, logEvent, finishSession, abandonSession } = useGameSession('aventura_das_letras');

  // Inicializar fila com 3 itens distintos com base na dificuldade
  useEffect(() => {
    if (exerciseFinished.current || difficulty === null) return;
    const activeLang = language || 'pt';
    const langPool = DELETION_POOL[activeLang] || DELETION_POOL['pt'];
    const pool = difficulty === 0 ? langPool.easy : langPool.medium;

    const selectedTargets: DeletionItem[] = [];
    const poolCopy = [...pool];
    while (selectedTargets.length < 3 && poolCopy.length > 0) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      selectedTargets.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, [language, difficulty]);

  // Iniciar nova rodada quando muda o índice na fila
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      const selected = queue[currentIndex];
      setCurrentItem(selected);
      setRoundCompleted(false);
      setSelectedIdx(null);
      hadErrorInRound.current = false;
      roundStartTimeRef.current = Date.now();

      const allChoices = [selected.answer, ...selected.distractors].sort(() => Math.random() - 0.5);
      setChoices(allChoices);

      // Narrar a instrução automaticamente após 1s para o carregamento da tela
      setTimeout(() => {
        speak(selected.instruction, language);
      }, 1000);
    }
  }, [currentIndex, queue, language]);

  const handleSelect = (choice: string, index: number) => {
    if (roundCompleted || !currentItem) return;
    setSelectedIdx(index);

    const isCorrect = choice === currentItem.answer;
    const responseTime = Date.now() - roundStartTimeRef.current;

    logEvent({
      event_type: 'answer',
      target: `${currentItem.word} sem ${currentItem.removedPart}`,
      target_type: 'deletion',
      response_value: choice,
      correct: isCorrect,
      response_time_ms: responseTime,
      error_type: isCorrect ? undefined : (responseTime < 500 ? 'impulsiva' : 'substituicao'),
    });

    if (isCorrect) {
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
          exerciseFinished.current = true;
          const earnedStars = await completeChallenge('word', currentItem.answer);
          finishSession(earnedStars);
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
      speak(t('tryAgain'), language);
      setTimeout(() => {
        setSelectedIdx(null);
      }, 1000);
    }
  };

  const handleBack = () => {
    abandonSession();
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <GameBackground source={require('../../../assets/games/aventura das letras/bg_delecao-fonemica.png')} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game8Title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeText}>⭐ {stars}</Text>
          </View>
          <Text style={styles.roundText}>{t('roundLabel')} {currentIndex + 1}/{queue.length}</Text>
        </View>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game8Prompt')} />

      {currentItem && (
        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => { logEvent({ event_type: 'help_request' }); speak(currentItem.instruction, language); }}
        >
          <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.gameArea}>
        <View style={styles.imageCard}>
          <Text style={styles.imageEmoji}>{currentItem?.emoji}</Text>
        </View>

        <Text style={styles.instructionText}>{currentItem?.instruction}</Text>

        <View style={styles.choicesContainer}>
          {choices.map((choice, index) => {
            const isSelected = selectedIdx === index;
            const isCorrect = currentItem ? choice === currentItem.answer : false;

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
      <PerfectRun visible={showPerfect} onClose={handleBack} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCE4EC', // Rosa clarinho acolhedor
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
    backgroundColor: '#EC407A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#C2185B',
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
    borderColor: '#F48FB1',
    padding: 20,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EC407A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  imageEmoji: {
    fontSize: 60,
  },
  instructionText: {
    fontSize: FONT_SIZES.subheading,
    fontWeight: '800',
    color: THEME_COLORS.brownDark,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  choicesContainer: {
    width: '100%',
    maxWidth: 350,
  },
  choiceBtn: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: '#F48FB1',
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
    color: '#AD1457',
    fontFamily: 'System',
  },
  choiceTextCorrect: {
    color: '#1B5E20',
  },
});
