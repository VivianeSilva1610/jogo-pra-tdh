import { THEME_COLORS } from '../../styles/theme';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';
import { PerfectRun } from '../../components/PerfectRun';
import Svg, { Rect, Path, Polygon, G, Circle } from 'react-native-svg';
import { startGameSession, endGameSession, logGameEvent } from '../../services/database';

interface CasteloFrasesProps {
  onBack: () => void;
}

interface PhraseOption {
  sentence: string;
  shuffledPt: string[];
  langMap: Record<string, { sentence: string; words: string[] }>;
}

const PHRASES_POOL: PhraseOption[] = [
  // ─── FÁCIL (3 palavras em PT) ─────────────────────────────────────────────
  {
    sentence: 'O gato corre.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O gato corre.',    words: ['O', 'gato', 'corre.']    },
      en: { sentence: 'The cat runs.',    words: ['The', 'cat', 'runs.']    },
      it: { sentence: 'Il gatto corre.',  words: ['Il', 'gatto', 'corre.']  },
      es: { sentence: 'El gato corre.',   words: ['El', 'gato', 'corre.']   },
    }
  },
  {
    sentence: 'O cão brinca.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O cão brinca.',    words: ['O', 'cão', 'brinca.']    },
      en: { sentence: 'The dog plays.',   words: ['The', 'dog', 'plays.']   },
      it: { sentence: 'Il cane gioca.',   words: ['Il', 'cane', 'gioca.']   },
      es: { sentence: 'El perro juega.',  words: ['El', 'perro', 'juega.']  },
    }
  },
  {
    sentence: 'O sol brilha.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O sol brilha.',    words: ['O', 'sol', 'brilha.']    },
      en: { sentence: 'The sun shines.',  words: ['The', 'sun', 'shines.']  },
      it: { sentence: 'Il sole splende.', words: ['Il', 'sole', 'splende.'] },
      es: { sentence: 'El sol brilla.',   words: ['El', 'sol', 'brilla.']   },
    }
  },
  {
    sentence: 'A flor cresce.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A flor cresce.',   words: ['A', 'flor', 'cresce.']   },
      en: { sentence: 'The flower grows.',words: ['The', 'flower', 'grows.']},
      it: { sentence: 'Il fiore cresce.', words: ['Il', 'fiore', 'cresce.'] },
      es: { sentence: 'La flor crece.',   words: ['La', 'flor', 'crece.']   },
    }
  },
  {
    sentence: 'O pássaro voa.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O pássaro voa.',   words: ['O', 'pássaro', 'voa.']   },
      en: { sentence: 'The bird flies.',  words: ['The', 'bird', 'flies.']  },
      it: { sentence: "L'uccello vola.",  words: ["L'uccello", 'vola.']     },
      es: { sentence: 'El pájaro vuela.', words: ['El', 'pájaro', 'vuela.'] },
    }
  },
  {
    sentence: 'O sapo pula.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O sapo pula.',     words: ['O', 'sapo', 'pula.']     },
      en: { sentence: 'The frog jumps.',  words: ['The', 'frog', 'jumps.']  },
      it: { sentence: 'La rana salta.',   words: ['La', 'rana', 'salta.']   },
      es: { sentence: 'El sapo salta.',   words: ['El', 'sapo', 'salta.']   },
    }
  },
  {
    sentence: 'A lua brilha.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A lua brilha.',    words: ['A', 'lua', 'brilha.']    },
      en: { sentence: 'The moon shines.', words: ['The', 'moon', 'shines.'] },
      it: { sentence: 'La luna brilla.',  words: ['La', 'luna', 'brilla.']  },
      es: { sentence: 'La luna brilla.',  words: ['La', 'luna', 'brilla.']  },
    }
  },
  {
    sentence: 'O pato nada.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O pato nada.',     words: ['O', 'pato', 'nada.']     },
      en: { sentence: 'The duck swims.',  words: ['The', 'duck', 'swims.']  },
      it: { sentence: "L'anatra nuota.",  words: ["L'anatra", 'nuota.']     },
      es: { sentence: 'El pato nada.',    words: ['El', 'pato', 'nada.']    },
    }
  },
  {
    sentence: 'O vento sopra.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O vento sopra.',   words: ['O', 'vento', 'sopra.']   },
      en: { sentence: 'The wind blows.',  words: ['The', 'wind', 'blows.']  },
      it: { sentence: 'Il vento soffia.', words: ['Il', 'vento', 'soffia.'] },
      es: { sentence: 'El viento sopla.', words: ['El', 'viento', 'sopla.'] },
    }
  },
  {
    sentence: 'O peixe nada.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O peixe nada.',    words: ['O', 'peixe', 'nada.']    },
      en: { sentence: 'The fish swims.',  words: ['The', 'fish', 'swims.']  },
      it: { sentence: 'Il pesce nuota.',  words: ['Il', 'pesce', 'nuota.']  },
      es: { sentence: 'El pez nada.',     words: ['El', 'pez', 'nada.']     },
    }
  },
  {
    sentence: 'A chuva cai.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A chuva cai.',     words: ['A', 'chuva', 'cai.']     },
      en: { sentence: 'The rain falls.',  words: ['The', 'rain', 'falls.']  },
      it: { sentence: 'La pioggia cade.', words: ['La', 'pioggia', 'cade.'] },
      es: { sentence: 'La lluvia cae.',   words: ['La', 'lluvia', 'cae.']   },
    }
  },
  {
    sentence: 'O urso dorme.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O urso dorme.',    words: ['O', 'urso', 'dorme.']    },
      en: { sentence: 'The bear sleeps.', words: ['The', 'bear', 'sleeps.'] },
      it: { sentence: "L'orso dorme.",    words: ["L'orso", 'dorme.']       },
      es: { sentence: 'El oso duerme.',   words: ['El', 'oso', 'duerme.']   },
    }
  },
  {
    sentence: 'O lobo uiva.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O lobo uiva.',     words: ['O', 'lobo', 'uiva.']     },
      en: { sentence: 'The wolf howls.',  words: ['The', 'wolf', 'howls.']  },
      it: { sentence: 'Il lupo ulula.',   words: ['Il', 'lupo', 'ulula.']   },
      es: { sentence: 'El lobo aúlla.',   words: ['El', 'lobo', 'aúlla.']   },
    }
  },
  {
    sentence: 'A vaca come.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A vaca come.',     words: ['A', 'vaca', 'come.']     },
      en: { sentence: 'The cow eats.',    words: ['The', 'cow', 'eats.']    },
      it: { sentence: 'La vacca mangia.', words: ['La', 'vacca', 'mangia.'] },
      es: { sentence: 'La vaca come.',    words: ['La', 'vaca', 'come.']    },
    }
  },
  {
    sentence: 'O bebê dorme.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O bebê dorme.',    words: ['O', 'bebê', 'dorme.']    },
      en: { sentence: 'The baby sleeps.', words: ['The', 'baby', 'sleeps.'] },
      it: { sentence: 'Il bimbo dorme.',  words: ['Il', 'bimbo', 'dorme.']  },
      es: { sentence: 'El bebé duerme.',  words: ['El', 'bebé', 'duerme.']  },
    }
  },

  // ─── DIFÍCIL (4+ palavras em PT) ──────────────────────────────────────────
  {
    sentence: 'A casa é bela.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A casa é bela.',         words: ['A', 'casa', 'é', 'bela.']           },
      en: { sentence: 'The house is beautiful.', words: ['The', 'house', 'is', 'beautiful.']  },
      it: { sentence: 'La casa è bella.',        words: ['La', 'casa', 'è', 'bella.']         },
      es: { sentence: 'La casa es bella.',       words: ['La', 'casa', 'es', 'bella.']        },
    }
  },
  {
    sentence: 'A maçã é doce.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A maçã é doce.',          words: ['A', 'maçã', 'é', 'doce.']           },
      en: { sentence: 'The apple is sweet.',     words: ['The', 'apple', 'is', 'sweet.']       },
      it: { sentence: 'La mela è dolce.',        words: ['La', 'mela', 'è', 'dolce.']          },
      es: { sentence: 'La manzana es dulce.',    words: ['La', 'manzana', 'es', 'dulce.']      },
    }
  },
  {
    sentence: 'O bolo é gostoso.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O bolo é gostoso.',       words: ['O', 'bolo', 'é', 'gostoso.']         },
      en: { sentence: 'The cake is tasty.',      words: ['The', 'cake', 'is', 'tasty.']         },
      it: { sentence: 'La torta è buona.',       words: ['La', 'torta', 'è', 'buona.']          },
      es: { sentence: 'El pastel es rico.',      words: ['El', 'pastel', 'es', 'rico.']         },
    }
  },
  {
    sentence: 'O sol é bonito.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O sol é bonito.',         words: ['O', 'sol', 'é', 'bonito.']            },
      en: { sentence: 'The sun is beautiful.',   words: ['The', 'sun', 'is', 'beautiful.']      },
      it: { sentence: 'Il sole è bello.',        words: ['Il', 'sole', 'è', 'bello.']           },
      es: { sentence: 'El sol es bonito.',       words: ['El', 'sol', 'es', 'bonito.']          },
    }
  },
  {
    sentence: 'A lua é linda.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A lua é linda.',          words: ['A', 'lua', 'é', 'linda.']             },
      en: { sentence: 'The moon is lovely.',     words: ['The', 'moon', 'is', 'lovely.']        },
      it: { sentence: 'La luna è bella.',        words: ['La', 'luna', 'è', 'bella.']           },
      es: { sentence: 'La luna es linda.',       words: ['La', 'luna', 'es', 'linda.']          },
    }
  },
  {
    sentence: 'O leão é forte.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O leão é forte.',         words: ['O', 'leão', 'é', 'forte.']            },
      en: { sentence: 'The lion is strong.',     words: ['The', 'lion', 'is', 'strong.']        },
      it: { sentence: 'Il leone è forte.',       words: ['Il', 'leone', 'è', 'forte.']          },
      es: { sentence: 'El león es fuerte.',      words: ['El', 'león', 'es', 'fuerte.']         },
    }
  },
  {
    sentence: 'O gato bebe leite.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O gato bebe leite.',      words: ['O', 'gato', 'bebe', 'leite.']         },
      en: { sentence: 'The cat drinks milk.',    words: ['The', 'cat', 'drinks', 'milk.']        },
      it: { sentence: 'Il gatto beve latte.',    words: ['Il', 'gatto', 'beve', 'latte.']       },
      es: { sentence: 'El gato bebe leche.',     words: ['El', 'gato', 'bebe', 'leche.']        },
    }
  },
  {
    sentence: 'O urso come mel.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O urso come mel.',        words: ['O', 'urso', 'come', 'mel.']           },
      en: { sentence: 'The bear eats honey.',    words: ['The', 'bear', 'eats', 'honey.']       },
      it: { sentence: "L'orso mangia miele.",    words: ["L'orso", 'mangia', 'miele.']          },
      es: { sentence: 'El oso come miel.',       words: ['El', 'oso', 'come', 'miel.']          },
    }
  },
  {
    sentence: 'A chuva cai forte.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A chuva cai forte.',      words: ['A', 'chuva', 'cai', 'forte.']         },
      en: { sentence: 'The rain falls hard.',    words: ['The', 'rain', 'falls', 'hard.']        },
      it: { sentence: 'La pioggia cade forte.',  words: ['La', 'pioggia', 'cade', 'forte.']     },
      es: { sentence: 'La lluvia cae fuerte.',   words: ['La', 'lluvia', 'cae', 'fuerte.']      },
    }
  },
  {
    sentence: 'O livro é grande.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O livro é grande.',       words: ['O', 'livro', 'é', 'grande.']           },
      en: { sentence: 'The book is big.',        words: ['The', 'book', 'is', 'big.']            },
      it: { sentence: 'Il libro è grande.',      words: ['Il', 'libro', 'è', 'grande.']          },
      es: { sentence: 'El libro es grande.',     words: ['El', 'libro', 'es', 'grande.']         },
    }
  },
  {
    sentence: 'O pato é amarelo.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O pato é amarelo.',       words: ['O', 'pato', 'é', 'amarelo.']           },
      en: { sentence: 'The duck is yellow.',     words: ['The', 'duck', 'is', 'yellow.']         },
      it: { sentence: "L'anatra è gialla.",      words: ["L'anatra", 'è', 'gialla.']             },
      es: { sentence: 'El pato es amarillo.',    words: ['El', 'pato', 'es', 'amarillo.']        },
    }
  },
  {
    sentence: 'O cão é amigo.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O cão é amigo.',          words: ['O', 'cão', 'é', 'amigo.']              },
      en: { sentence: 'The dog is a friend.',    words: ['The', 'dog', 'is', 'friendly.']        },
      it: { sentence: 'Il cane è amico.',        words: ['Il', 'cane', 'è', 'amico.']            },
      es: { sentence: 'El perro es amigo.',      words: ['El', 'perro', 'es', 'amigo.']          },
    }
  },
  {
    sentence: 'A menina lê bem.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A menina lê bem.',        words: ['A', 'menina', 'lê', 'bem.']            },
      en: { sentence: 'The girl reads well.',    words: ['The', 'girl', 'reads', 'well.']        },
      it: { sentence: 'La bambina legge bene.',  words: ['La', 'bambina', 'legge', 'bene.']      },
      es: { sentence: 'La niña lee bien.',       words: ['La', 'niña', 'lee', 'bien.']           },
    }
  },
  {
    sentence: 'O menino corre rápido.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O menino corre rápido.',  words: ['O', 'menino', 'corre', 'rápido.']      },
      en: { sentence: 'The boy runs fast.',      words: ['The', 'boy', 'runs', 'fast.']          },
      it: { sentence: 'Il bambino corre veloce.',words: ['Il', 'bambino', 'corre', 'veloce.']   },
      es: { sentence: 'El niño corre rápido.',   words: ['El', 'niño', 'corre', 'rápido.']       },
    }
  },
  {
    sentence: 'A rosa é vermelha.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A rosa é vermelha.',      words: ['A', 'rosa', 'é', 'vermelha.']          },
      en: { sentence: 'The rose is red.',        words: ['The', 'rose', 'is', 'red.']            },
      it: { sentence: 'La rosa è rossa.',        words: ['La', 'rosa', 'è', 'rossa.']            },
      es: { sentence: 'La rosa es roja.',        words: ['La', 'rosa', 'es', 'roja.']            },
    }
  },
  // ─── DIFÍCIL / AVANÇADO (5+ palavras) ──────────────────────────────────────
  {
    sentence: 'O jacaré bebe água na lagoa.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O jacaré bebe água na lagoa.', words: ['O', 'jacaré', 'bebe', 'água', 'na', 'lagoa.'] },
      en: { sentence: 'The gator drinks water in the pond.', words: ['The', 'gator', 'drinks', 'water', 'in', 'the', 'pond.'] },
      it: { sentence: 'Il coccodrillo beve acqua nel lago.', words: ['Il', 'coccodrillo', 'beve', 'acqua', 'nel', 'lago.'] },
      es: { sentence: 'El caimán bebe agua en la laguna.', words: ['El', 'caimán', 'bebe', 'agua', 'en', 'la', 'laguna.'] }
    }
  },
  {
    sentence: 'A linda borboleta voa alto no céu.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'A linda borboleta voa alto no céu.', words: ['A', 'linda', 'borboleta', 'voa', 'alto', 'no', 'céu.'] },
      en: { sentence: 'The beautiful butterfly flies high in the sky.', words: ['The', 'beautiful', 'butterfly', 'flies', 'high', 'in', 'the', 'sky.'] },
      it: { sentence: 'La bella farfalla vola alto nel cielo.', words: ['La', 'bella', 'farfalla', 'vola', 'alto', 'nel', 'cielo.'] },
      es: { sentence: 'La linda mariposa vuela alto en el cielo.', words: ['La', 'linda', 'mariposa', 'vuela', 'alto', 'en', 'el', 'cielo.'] }
    }
  },
  {
    sentence: 'O grande elefante cinza come muitas folhas.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O grande elefante cinza come muitas folhas.', words: ['O', 'grande', 'elefante', 'cinza', 'come', 'muitas', 'folhas.'] },
      en: { sentence: 'The big grey elephant eats many leaves.', words: ['The', 'big', 'grey', 'elephant', 'eats', 'many', 'leaves.'] },
      it: { sentence: 'Il grande elefante grigio mangia molte foglie.', words: ['Il', 'grande', 'elefante', 'grigio', 'mangia', 'molte', 'foglie.'] },
      es: { sentence: 'El gran elefante gris come muchas hojas.', words: ['El', 'gran', 'elefante', 'gris', 'come', 'muchas', 'hojas.'] }
    }
  },
  {
    sentence: 'O cão brincalhão corre feliz no grande parque.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O cão brincalhão corre feliz no grande parque.', words: ['O', 'cão', 'brincalhão', 'corre', 'feliz', 'no', 'grande', 'parque.'] },
      en: { sentence: 'The playful dog runs happily in the big park.', words: ['The', 'playful', 'dog', 'runs', 'happily', 'in', 'the', 'big', 'park.'] },
      it: { sentence: 'Il cane giocherellone corre felice nel grande parco.', words: ['Il', 'cane', 'giocherellone', 'corre', 'felice', 'nel', 'grande', 'parco.'] },
      es: { sentence: 'El perro juguetón corre feliz en el gran parque.', words: ['El', 'perro', 'juguetón', 'corre', 'feliz', 'en', 'el', 'gran', 'parque.'] }
    }
  },
  {
    sentence: 'O gato dorme na cadeira macia da sala.',
    shuffledPt: [],
    langMap: {
      pt: { sentence: 'O gato dorme na cadeira macia da sala.', words: ['O', 'gato', 'dorme', 'na', 'cadeira', 'macia', 'da', 'sala.'] },
      en: { sentence: 'The cat sleeps on the soft living room chair.', words: ['The', 'cat', 'sleeps', 'on', 'the', 'soft', 'living', 'room', 'chair.'] },
      it: { sentence: 'Il gatto dorme sulla sedia morbida del soggiorno.', words: ['Il', 'gatto', 'dorme', 'sulla', 'sedia', 'morbida', 'del', 'soggiorno.'] },
      es: { sentence: 'El gato duerme en la silla suave de la sala.', words: ['El', 'gato', 'duerme', 'en', 'la', 'silla', 'suave', 'de', 'la', 'sala.'] }
    }
  }
];


export const CasteloFrases: React.FC<CasteloFrasesProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { childId, soundEnabled, completeChallenge, challengesCompleted, stars, readWords } = useGame();

  const [queue, setQueue] = useState<PhraseOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhraseObj, setCurrentPhraseObj] = useState<PhraseOption>(PHRASES_POOL[0]);
  const [shuffledWords, setShuffledWords] = useState<{ id: number; word: string; used: boolean }[]>([]);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const hadErrorInRound = useRef(false);
  const hadErrorEver = useRef(false); // Rastreia erros em TODAS as rodadas
  const exerciseFinished = useRef(false); // Trava a fila após a 3ª rodada (evita narrar uma "próxima rodada" fantasma)
  const [showPerfect, setShowPerfect] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // Animação para abrir o portão do castelo (desliza para cima ou baixo)
  const gateTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    if (childId) {
      startGameSession(childId, 'aventura_das_letras')
        .then(id => { if (isMounted) sessionIdRef.current = id; })
        .catch(err => console.warn('Erro iniciar sessao CasteloFrases:', err));
    }
    return () => { isMounted = false; };
  }, [childId]);

  // Inicializar fila com base na dificuldade
  useEffect(() => {
    if (exerciseFinished.current) return;
    const activeLang = language || 'pt';
    const difficulty = Math.floor(challengesCompleted / 7) % 3; // 0: Fácil, 1: Médio, 2: Difícil
    
    // Filtrar PHRASES_POOL com base na contagem de palavras da frase no idioma ativo
    let pool = PHRASES_POOL.filter(item => {
      const phraseData = item.langMap[activeLang] || item.langMap['pt'];
      const wordCount = phraseData.words.length;
      if (difficulty === 0) {
        return wordCount <= 3;
      } else if (difficulty === 1) {
        return wordCount === 4;
      } else {
        return wordCount >= 5;
      }
    });

    const readList = readWords || [];
    let unreadPool = pool.filter(item => {
      const phraseData = item.langMap[activeLang] || item.langMap['pt'];
      return !readList.includes(phraseData.sentence.toUpperCase());
    });

    if (unreadPool.length < 3) {
      unreadPool = pool;
    }

    const selectedTargets: PhraseOption[] = [];
    const poolCopy = [...unreadPool];
    while (selectedTargets.length < 3 && poolCopy.length > 0) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      selectedTargets.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, [challengesCompleted, language, readWords]);

  // Iniciar rodada quando muda o índice na fila ou idioma
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      const selected = queue[currentIndex];
      setCurrentPhraseObj(selected);
      setTypedWords([]);
      setRoundCompleted(false);
      hadErrorInRound.current = false;
      roundStartTimeRef.current = Date.now();
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

    const isCorrect = wordItem.word === expectedWord;
    const responseTime = Date.now() - roundStartTimeRef.current;
    
    // Atualiza o tempo para a próxima palavra
    roundStartTimeRef.current = Date.now();

    if (childId && sessionIdRef.current) {
      logGameEvent({
        profile_id: childId,
        session_id: sessionIdRef.current,
        game_key: 'aventura_das_letras',
        event_type: 'answer',
        target: expectedWord,
        target_type: 'word',
        response_value: wordItem.word,
        correct: isCorrect,
        response_time_ms: responseTime,
        error_type: isCorrect ? undefined : (responseTime < 500 ? 'impulsiva' : 'substituicao'),
      }).catch(err => console.warn('Erro logGameEvent answer Castelo:', err));
    }

    if (isCorrect) {
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
            await completeChallenge('word', phraseData.sentence);
            if (!hadErrorEver.current) {
              setShowPerfect(true);
            } else {
              handleBack();
            }
          }
        }, 3500);
      }
    } else {
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game7Title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeText}>⭐ {stars}</Text>
          </View>
          <Text style={styles.roundText}>{t('roundLabel')} {currentIndex + 1}/{queue.length}</Text>
        </View>
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
          <Text style={styles.listenBtnText}>🔊 {t('listenAgain') || 'Ouvir a frase'}</Text>
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
      <PerfectRun visible={showPerfect} onClose={handleBack} />
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
