import { THEME_COLORS } from '../../styles/theme';
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

interface FlorestaPalavrasProps {
  onBack: () => void;
}

interface ForestItem {
  emoji: string;
  wordKeys: Record<string, string>; // e.g. { pt: 'MAÇÃ', en: 'APPLE', it: 'MELA', es: 'MANZANA' }
  wrongWordKeys: Record<string, string[]>;
}

const ITEMS_POOL: ForestItem[] = [
  // ─── FÁCIL (≤ 4 letras em PT) ─────────────────────────────────────────────
  { emoji: '🍎', wordKeys: { pt: 'MAÇÃ',  en: 'APPLE',  it: 'MELA',   es: 'MANZANA' }, wrongWordKeys: { pt: ['BOLA','CASA'],   en: ['BALL','HOUSE'],   it: ['PALLA','CASA'],    es: ['BOLA','CASA']    } },
  { emoji: '⚽', wordKeys: { pt: 'BOLA',  en: 'BALL',   it: 'PALLA',  es: 'PELOTA'  }, wrongWordKeys: { pt: ['BOLO','BOTA'],   en: ['CAKE','BOOT'],    it: ['TORTA','STIVALE'], es: ['PASTEL','BOTA']  } },
  { emoji: '🏠', wordKeys: { pt: 'CASA',  en: 'HOUSE',  it: 'CASA',   es: 'CASA'    }, wrongWordKeys: { pt: ['CARRO','PORTA'], en: ['CAR','DOOR'],     it: ['AUTO','PORTA'],    es: ['COCHE','PUERTA'] } },
  { emoji: '☀️', wordKeys: { pt: 'SOL',   en: 'SUN',    it: 'SOLE',   es: 'SOL'     }, wrongWordKeys: { pt: ['LUA','NUVEM'],   en: ['MOON','CLOUD'],   it: ['LUNA','NUVOLA'],   es: ['LUNA','NUBE']    } },
  { emoji: '🐸', wordKeys: { pt: 'SAPO',  en: 'FROG',   it: 'RANA',   es: 'SAPO'    }, wrongWordKeys: { pt: ['PEIXE','PATO'], en: ['FISH','DUCK'],    it: ['PESCE','ANATRA'],  es: ['PEZ','PATO']     } },
  { emoji: '🌙', wordKeys: { pt: 'LUA',   en: 'MOON',   it: 'LUNA',   es: 'LUNA'    }, wrongWordKeys: { pt: ['SOL','NUVEM'],   en: ['SUN','CLOUD'],    it: ['SOLE','NUVOLA'],   es: ['SOL','NUBE']     } },
  { emoji: '🐶', wordKeys: { pt: 'CÃO',   en: 'DOG',    it: 'CANE',   es: 'PERRO'   }, wrongWordKeys: { pt: ['GATO','SAPO'],  en: ['CAT','FROG'],     it: ['GATTO','RANA'],    es: ['GATO','SAPO']    } },
  { emoji: '🥚', wordKeys: { pt: 'OVO',   en: 'EGG',    it: 'UOVO',   es: 'HUEVO'   }, wrongWordKeys: { pt: ['UVA','BOLA'],   en: ['GRAPE','BALL'],   it: ['UVA','PALLA'],     es: ['UVA','BOLA']     } },
  { emoji: '🔥', wordKeys: { pt: 'FOGO',  en: 'FIRE',   it: 'FUOCO',  es: 'FUEGO'   }, wrongWordKeys: { pt: ['ÁGUA','VELA'],  en: ['WATER','CANDLE'], it: ['ACQUA','CANDELA'], es: ['AGUA','VELA']    } },
  { emoji: '🌹', wordKeys: { pt: 'ROSA',  en: 'ROSE',   it: 'ROSA',   es: 'ROSA'    }, wrongWordKeys: { pt: ['FLOR','BOLA'],  en: ['FLOWER','BALL'],  it: ['FIORE','PALLA'],   es: ['FLOR','BOLA']    } },
  { emoji: '🎲', wordKeys: { pt: 'DADO',  en: 'DICE',   it: 'DADO',   es: 'DADO'    }, wrongWordKeys: { pt: ['BOLA','PIÃO'],  en: ['BALL','TOP'],     it: ['PALLA','TROTTOLA'],es: ['BOLA','TROMPO']  } },
  { emoji: '🍐', wordKeys: { pt: 'PERA',  en: 'PEAR',   it: 'PERA',   es: 'PERA'    }, wrongWordKeys: { pt: ['MAÇÃ','UVA'],   en: ['APPLE','GRAPE'],  it: ['MELA','UVA'],      es: ['MANZANA','UVA']  } },
  { emoji: '🐮', wordKeys: { pt: 'VACA',  en: 'COW',    it: 'MUCCA',  es: 'VACA'    }, wrongWordKeys: { pt: ['SAPO','GATO'],  en: ['FROG','CAT'],     it: ['RANA','GATTO'],    es: ['SAPO','GATO']    } },
  { emoji: '🐺', wordKeys: { pt: 'LOBO',  en: 'WOLF',   it: 'LUPO',   es: 'LOBO'    }, wrongWordKeys: { pt: ['GATO','URSO'],  en: ['CAT','BEAR'],     it: ['GATTO','ORSO'],    es: ['GATO','OSO']     } },
  { emoji: '🍇', wordKeys: { pt: 'UVA',   en: 'GRAPE',  it: 'UVA',    es: 'UVA'     }, wrongWordKeys: { pt: ['MAÇÃ','PERA'],  en: ['APPLE','PEAR'],   it: ['MELA','PERA'],     es: ['MANZANA','PERA'] } },
  { emoji: '🍞', wordKeys: { pt: 'PÃO',   en: 'BREAD',  it: 'PANE',   es: 'PAN'     }, wrongWordKeys: { pt: ['BOLO','BALA'],  en: ['CAKE','CANDY'],   it: ['TORTA','DOLCE'],   es: ['PASTEL','DULCE'] } },
  { emoji: '🐭', wordKeys: { pt: 'RATO',  en: 'MOUSE',  it: 'TOPO',   es: 'RATÓN'   }, wrongWordKeys: { pt: ['GATO','SAPO'],  en: ['CAT','FROG'],     it: ['GATTO','RANA'],    es: ['GATO','SAPO']    } },
  { emoji: '🎂', wordKeys: { pt: 'BOLO',  en: 'CAKE',   it: 'TORTA',  es: 'PASTEL'  }, wrongWordKeys: { pt: ['DOCE','BALA'],  en: ['SWEET','CANDY'],  it: ['DOLCE','CARAMELLA'],es: ['DULCE','CARAMELO']} },
  { emoji: '🦆', wordKeys: { pt: 'PATO',  en: 'DUCK',   it: 'ANATRA', es: 'PATO'    }, wrongWordKeys: { pt: ['SAPO','PEIXE'], en: ['FROG','FISH'],    it: ['RANA','PESCE'],    es: ['SAPO','PEZ']     } },
  { emoji: '🐻', wordKeys: { pt: 'URSO',  en: 'BEAR',   it: 'ORSO',   es: 'OSO'     }, wrongWordKeys: { pt: ['LOBO','GATO'],  en: ['WOLF','CAT'],     it: ['LUPO','GATTO'],    es: ['LOBO','GATO']    } },
  { emoji: '🍯', wordKeys: { pt: 'MEL',   en: 'HONEY',  it: 'MIELE',  es: 'MIEL'    }, wrongWordKeys: { pt: ['SAL','SUCO'],   en: ['SALT','JUICE'],   it: ['SALE','SUCCO'],    es: ['SAL','JUGO']     } },
  { emoji: '💧', wordKeys: { pt: 'ÁGUA',  en: 'WATER',  it: 'ACQUA',  es: 'AGUA'    }, wrongWordKeys: { pt: ['SUCO','LEITE'], en: ['JUICE','MILK'],   it: ['SUCCO','LATTE'],   es: ['JUGO','LECHE']   } },
  { emoji: '🐱', wordKeys: { pt: 'GATO',  en: 'CAT',    it: 'GATTO',  es: 'GATO'    }, wrongWordKeys: { pt: ['CÃO','RATO'],   en: ['DOG','MOUSE'],    it: ['CANE','TOPO'],     es: ['PERRO','RATÓN']  } },
  { emoji: '🦁', wordKeys: { pt: 'LEÃO',  en: 'LION',   it: 'LEONE',  es: 'LEÓN'    }, wrongWordKeys: { pt: ['TIGRE','GATO'], en: ['TIGER','CAT'],    it: ['TIGRE','GATTO'],   es: ['TIGRE','GATO']   } },
  { emoji: '🐟', wordKeys: { pt: 'ATUM',  en: 'TUNA',   it: 'TONNO',  es: 'ATÚN'    }, wrongWordKeys: { pt: ['SAPO','PATO'],  en: ['FROG','DUCK'],    it: ['RANA','ANATRA'],   es: ['SAPO','PATO']    } },
  { emoji: '🐵', wordKeys: { pt: 'MICO',  en: 'MONKEY', it: 'SCIMIA', es: 'MONO'    }, wrongWordKeys: { pt: ['URSO','LOBO'],  en: ['BEAR','WOLF'],    it: ['ORSO','LUPO'],     es: ['OSO','LOBO']     } },

  // ─── MÉDIO (5-6 letras em PT) ─────────────────────────────────────────────
  { emoji: '🌳', wordKeys: { pt: 'ÁRVORE', en: 'TREE',     it: 'ALBERO',  es: 'ÁRBOL'   }, wrongWordKeys: { pt: ['FLOR','PEDRA'],   en: ['FLOWER','ROCK'],   it: ['FIORE','PIETRA'],  es: ['FLOR','PIEDRA']  } },
  { emoji: '🍦', wordKeys: { pt: 'DOCE',   en: 'SWEET',    it: 'DOLCE',   es: 'DULCE'   }, wrongWordKeys: { pt: ['BOLO','BALA'],    en: ['CAKE','CANDY'],    it: ['TORTA','CARAMELLA'],es: ['PASTEL','CARAMELO']} },
  { emoji: '📚', wordKeys: { pt: 'LIVRO',  en: 'BOOK',     it: 'LIBRO',   es: 'LIBRO'   }, wrongWordKeys: { pt: ['PAPEL','CANETA'], en: ['PAPER','PEN'],     it: ['CARTA','PENNA'],   es: ['PAPEL','PLUMA']  } },
  { emoji: '☁️', wordKeys: { pt: 'NUVEM',  en: 'CLOUD',    it: 'NUVOLA',  es: 'NUBE'    }, wrongWordKeys: { pt: ['CHUVA','VENTO'],  en: ['RAIN','WIND'],     it: ['PIOGGIA','VENTO'], es: ['LLUVIA','VIENTO'] } },
  { emoji: '🐠', wordKeys: { pt: 'PEIXE',  en: 'FISH',     it: 'PESCE',   es: 'PEZ'     }, wrongWordKeys: { pt: ['SAPO','PATO'],    en: ['FROG','DUCK'],     it: ['RANA','ANATRA'],   es: ['SAPO','PATO']    } },
  { emoji: '🦊', wordKeys: { pt: 'RAPOSA', en: 'FOX',      it: 'VOLPE',   es: 'ZORRA'   }, wrongWordKeys: { pt: ['LOBO','URSO'],    en: ['WOLF','BEAR'],     it: ['LUPO','ORSO'],     es: ['LOBO','OSO']     } },
  { emoji: '🐍', wordKeys: { pt: 'COBRA',  en: 'SNAKE',    it: 'COBRA',   es: 'COBRA'   }, wrongWordKeys: { pt: ['SAPO','PEIXE'],   en: ['FROG','FISH'],     it: ['RANA','PESCE'],    es: ['SAPO','PEZ']     } },
  { emoji: '🌿', wordKeys: { pt: 'PLANTA', en: 'PLANT',    it: 'PIANTA',  es: 'PLANTA'  }, wrongWordKeys: { pt: ['ÁRVORE','FLOR'],  en: ['TREE','FLOWER'],   it: ['ALBERO','FIORE'],  es: ['ÁRBOL','FLOR']   } },
  { emoji: '🏖️', wordKeys: { pt: 'PRAIA',  en: 'BEACH',    it: 'SPIAGGIA',es: 'PLAYA'   }, wrongWordKeys: { pt: ['PARQUE','CAMPO'], en: ['PARK','FIELD'],    it: ['PARCO','CAMPO'],   es: ['PARQUE','CAMPO'] } },
  { emoji: '🐊', wordKeys: { pt: 'JACARÉ', en: 'GATOR',    it: 'CAIMANO', es: 'CAIMÁN'  }, wrongWordKeys: { pt: ['COBRA','SAPO'],   en: ['SNAKE','FROG'],    it: ['COBRA','RANA'],    es: ['COBRA','SAPO']   } },
  { emoji: '🌸', wordKeys: { pt: 'FLOR',   en: 'FLOWER',   it: 'FIORE',   es: 'FLOR'    }, wrongWordKeys: { pt: ['ROSA','PLANTA'],  en: ['ROSE','PLANT'],    it: ['ROSA','PIANTA'],   es: ['ROSA','PLANTA']  } },
  { emoji: '🐋', wordKeys: { pt: 'BALEIA', en: 'WHALE',    it: 'BALENA',  es: 'BALLENA' }, wrongWordKeys: { pt: ['PEIXE','TUBARÃO'],en: ['FISH','SHARK'],    it: ['PESCE','SQUALO'],  es: ['PEZ','TIBURÓN']  } },
  { emoji: '🐦', wordKeys: { pt: 'PÁSSARO',en: 'BIRD',     it: 'UCCELLO', es: 'PÁJARO'  }, wrongWordKeys: { pt: ['PATO','POMBO'],   en: ['DUCK','PIGEON'],   it: ['ANATRA','PICCIONE'],es: ['PATO','PALOMA']  } },
  { emoji: '🍌', wordKeys: { pt: 'BANANA', en: 'BANANA',   it: 'BANANA',  es: 'PLÁTANO' }, wrongWordKeys: { pt: ['MAÇÃ','UVA'],     en: ['APPLE','GRAPE'],   it: ['MELA','UVA'],      es: ['MANZANA','UVA']  } },
  { emoji: '🚗', wordKeys: { pt: 'CARRO',  en: 'CAR',      it: 'AUTO',    es: 'COCHE'   }, wrongWordKeys: { pt: ['TREM','MOTO'],    en: ['TRAIN','BIKE'],    it: ['TRENO','MOTO'],    es: ['TREN','MOTO']    } },

  // ─── DIFÍCIL (≥ 7 letras em PT) ───────────────────────────────────────────
  { emoji: '🍦', wordKeys: { pt: 'SORVETE',   en: 'ICE CREAM',  it: 'GELATO',    es: 'HELADO'     }, wrongWordKeys: { pt: ['DOCE','BOLO'],      en: ['SWEET','CAKE'],    it: ['DOLCE','TORTA'],    es: ['DULCE','PASTEL']   } },
  { emoji: '🐘', wordKeys: { pt: 'ELEFANTE',  en: 'ELEPHANT',   it: 'ELEFANTE',  es: 'ELEFANTE'   }, wrongWordKeys: { pt: ['GIRAFA','HIPOPÓTAMO'], en: ['GIRAFFE','HIPPO'], it: ['GIRAFFA','IPPOPOTAMO'],es: ['JIRAFA','HIPOPÓTAMO']} },
  { emoji: '🦋', wordKeys: { pt: 'BORBOLETA', en: 'BUTTERFLY',  it: 'FARFALLA',  es: 'MARIPOSA'   }, wrongWordKeys: { pt: ['ABELHA','JOANINHA'], en: ['BEE','LADYBUG'],   it: ['APE','COCCINELLA'], es: ['ABEJA','MARIQUITA'] } },
  { emoji: '🐬', wordKeys: { pt: 'GOLFINHO',  en: 'DOLPHIN',    it: 'DELFINO',   es: 'DELFÍN'     }, wrongWordKeys: { pt: ['BALEIA','TUBARÃO'], en: ['WHALE','SHARK'],   it: ['BALENA','SQUALO'],  es: ['BALLENA','TIBURÓN'] } },
  { emoji: '🏰', wordKeys: { pt: 'CASTELO',   en: 'CASTLE',     it: 'CASTELLO',  es: 'CASTILLO'   }, wrongWordKeys: { pt: ['PALÁCIO','TORRE'],  en: ['PALACE','TOWER'],  it: ['PALAZZO','TORRE'],  es: ['PALACIO','TORRE']  } },
  { emoji: '🌈', wordKeys: { pt: 'ARCO-ÍRIS', en: 'RAINBOW',    it: 'ARCOBALENO',es: 'ARCOÍRIS'   }, wrongWordKeys: { pt: ['NUVEM','CHUVA'],    en: ['CLOUD','RAIN'],    it: ['NUVOLA','PIOGGIA'], es: ['NUBE','LLUVIA']    } },
  { emoji: '🐧', wordKeys: { pt: 'PINGUIM',   en: 'PENGUIN',    it: 'PINGUINO',  es: 'PINGÜINO'   }, wrongWordKeys: { pt: ['POMBO','PATO'],     en: ['PIGEON','DUCK'],   it: ['PICCIONE','ANATRA'],es: ['PALOMA','PATO']    } },
  { emoji: '🦜', wordKeys: { pt: 'PAPAGAIO',  en: 'PARROT',     it: 'PAPPAGALLO',es: 'LORO'       }, wrongWordKeys: { pt: ['POMBO','PATO'],     en: ['PIGEON','DUCK'],   it: ['PICCIONE','ANATRA'],es: ['PALOMA','PATO']    } },
  { emoji: '🌻', wordKeys: { pt: 'GIRASSOL',  en: 'SUNFLOWER',  it: 'GIRASOLE',  es: 'GIRASOL'    }, wrongWordKeys: { pt: ['ROSA','MARGARIDA'], en: ['ROSE','DAISY'],    it: ['ROSA','MARGHERITA'],es: ['ROSA','MARGARITA'] } },
];


export const FlorestaPalavras: React.FC<FlorestaPalavrasProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted, stars, readWords } = useGame();

  const [queue, setQueue] = useState<ForestItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<ForestItem>(ITEMS_POOL[0]);
  const [choices, setChoices] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false); // Rastreia erros em TODAS as rodadas
  const exerciseFinished = useRef(false); // Trava a fila após a 3ª rodada (evita narrar uma "próxima rodada" fantasma)
  const [showPerfect, setShowPerfect] = useState(false);
  const roundStartTimeRef = useRef<number>(0);
  const { difficulty, logEvent, finishSession, abandonSession } = useGameSession('aventura_das_letras');

  // Inicializar fila com base na dificuldade
  useEffect(() => {
    if (exerciseFinished.current || difficulty === null) return;
    const activeLang = language || 'pt';

    // Filtrar ITEMS_POOL com base na dificuldade
    let pool = ITEMS_POOL.filter(item => {
      const w = item.wordKeys[activeLang] || item.wordKeys['pt'];
      if (difficulty === 0) {
        return w.length <= 4;
      } else if (difficulty === 1) {
        return w.length === 5 || w.length === 6;
      } else {
        return w.length >= 7;
      }
    });

    const readList = readWords || [];
    let unreadPool = pool.filter(item => {
      const w = item.wordKeys[activeLang] || item.wordKeys['pt'];
      return !readList.includes(w.toUpperCase());
    });

    if (unreadPool.length < 3) {
      unreadPool = pool;
    }

    const selectedTargets: ForestItem[] = [];
    const poolCopy = [...unreadPool];
    while (selectedTargets.length < 3 && poolCopy.length > 0) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      selectedTargets.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, [challengesCompleted, language, readWords, difficulty]);

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
    roundStartTimeRef.current = Date.now();

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

    const isCorrect = choice === correctWord;
    const responseTime = Date.now() - roundStartTimeRef.current;

    logEvent({
      event_type: 'answer',
      target: correctWord,
      target_type: 'word',
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
          const earnedStars = await completeChallenge('word', correctWord);
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game6Title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeText}>⭐ {stars}</Text>
          </View>
          <Text style={styles.roundText}>{t('roundLabel')} {currentIndex + 1}/{queue.length}</Text>
        </View>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game6Prompt')} />

      <TouchableOpacity 
        style={styles.listenButton} 
        onPress={() => {
          logEvent({ event_type: 'help_request' });
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
      <PerfectRun visible={showPerfect} onClose={handleBack} />
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
