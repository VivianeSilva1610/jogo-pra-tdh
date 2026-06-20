import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type LanguageType = 'pt' | 'en' | 'it' | 'es';

export interface Translations {
  appName: string;
  play: string;
  collection: string;
  profile: string;
  parents: string;
  back: string;
  chooseCharacter: string;
  unisexGirl: string;
  unisexBoy: string;
  fox: string;
  panda: string;
  kitten: string;
  robot: string;
  lumiGreeting: string;
  lumiTip: string;
  lettersLearned: string;
  syllablesMastered: string;
  wordsRead: string;
  weeklyProgress: string;
  timePlayed: string;
  minutes: string;
  parentsTitle: string;
  parentsGateTitle: string;
  parentsGateSubtitle: string;
  parentsGatePlaceholder: string;
  parentsGateIncorrect: string;
  parentsGateQuestion: string;
  gameListTitle: string;
  soundToggle: string;
  languageSelect: string;
  resetProgress: string;
  resetConfirm: string;
  stickerBook: string;
  avatarShop: string;
  buy: string;
  equipped: string;
  equip: string;
  coins: string;
  stars: string;
  notEnoughCoins: string;
  itemUnlocked: string;
  chestTitle: string;
  chestInstructions: string;
  chestAlreadyClaimed: string;
  attention: string;
  chestOpen: string;
  chestClaim: string;
  premiumClub: string;
  premiumSubtitle: string;
  tryAgain: string;
  wellDone: string;
  fantastic: string;
  amazing: string;
  youCanDoIt: string;
  timeForBreak: string;
  breakSubtitle: string;
  continuePlaying: string;
  game1Title: string;
  game1Desc: string;
  game1Prompt: string;
  game2Title: string;
  game2Desc: string;
  game2Prompt: string;
  game3Title: string;
  game3Desc: string;
  game3Prompt: string;
  game4Title: string;
  game4Desc: string;
  game4Prompt: string;
  game5Title: string;
  game5Desc: string;
  game5Prompt: string;
  game6Title: string;
  game6Desc: string;
  game6Prompt: string;
  game7Title: string;
  game7Desc: string;
  game7Prompt: string;
  listenAgain: string;
  castleOpened: string;
}

const translations: Record<LanguageType, Translations> = {
  pt: {
    appName: "Aventura das Letras",
    play: "Jogar",
    collection: "Coleção",
    profile: "Perfil",
    parents: "Pais",
    back: "Voltar",
    chooseCharacter: "Escolha seu Personagem",
    unisexGirl: "Menina Aventureira",
    unisexBoy: "Menino Aventureira",
    fox: "Raposa",
    panda: "Panda",
    kitten: "Gatinho",
    robot: "Robô Amigável",
    lumiGreeting: "Oi! Eu sou o Lumi! Vamos jogar juntos?",
    lumiTip: "Toque nas coisas para encontrar as letras!",
    lettersLearned: "Letras aprendidas",
    syllablesMastered: "Sílabas dominadas",
    wordsRead: "Palavras lidas",
    weeklyProgress: "Evolução Semanal",
    timePlayed: "Tempo de uso",
    minutes: "minutos",
    parentsTitle: "Painel dos Pais",
    parentsGateTitle: "Área Restrita",
    parentsGateSubtitle: "Resolva o cálculo abaixo para entrar:",
    parentsGatePlaceholder: "Resultado",
    parentsGateIncorrect: "Ops! Cálculo incorreto. Tente novamente!",
    parentsGateQuestion: "Quanto é {num1} mais {num2}?",
    gameListTitle: "Mapa de Aventuras",
    soundToggle: "Sons e Música",
    languageSelect: "Idioma",
    resetProgress: "Reiniciar Progresso",
    resetConfirm: "Tem certeza que deseja apagar todo o progresso?",
    stickerBook: "Livro de Adesivos",
    avatarShop: "Loja de Roupas",
    buy: "Comprar",
    equipped: "Equipado",
    equip: "Equipar",
    coins: "Moedas",
    stars: "Estrelas",
    notEnoughCoins: "Moedas insuficientes!",
    itemUnlocked: "Você desbloqueou um novo item!",
    chestTitle: "Baú Surpresa!",
    chestInstructions: "Toque no baú para abri-lo!",
    chestAlreadyClaimed: "Você já abriu este baú!",
    attention: "Atenção",
    chestOpen: "Abrir Baú",
    chestClaim: "Pegar Recompensa!",
    premiumClub: "Clube das Letras Premium",
    premiumSubtitle: "Desbloqueie mais de 50 adesivos e novos mundos!",
    tryAgain: "Vamos tentar novamente?",
    wellDone: "Muito bem!",
    fantastic: "Fantástico!",
    amazing: "Incrível!",
    youCanDoIt: "Você consegue!",
    timeForBreak: "Hora de um descanso!",
    breakSubtitle: "Que tal esticar os braços e beber um pouco d'água?",
    continuePlaying: "Voltar a jogar",
    game1Title: "Mundo das Letras",
    game1Desc: "Ache as letras escondidas no cenário interativo!",
    game1Prompt: "Ouça e encontre a letra correspondente!",
    game2Title: "Letras Camufladas",
    game2Desc: "Identifique a letra solicitada entre os objetos!",
    game2Prompt: "Ouça a letra e encontre onde ela está!",
    game3Title: "Captura de Letras",
    game3Desc: "Estoure as bolhas da letra certa antes que sumam!",
    game3Prompt: "Ouça e capture as letras corretas!",
    game4Title: "Som e Letra",
    game4Desc: "Ouça a sílaba e selecione a opção correta!",
    game4Prompt: "Ouça a sílaba e escolha a bolha correta!",
    game5Title: "Monte a Palavra",
    game5Desc: "Ordene as letras para construir uma palavra e vê-la ganhar vida!",
    game5Prompt: "Ouça a palavra e soletre!",
    game6Title: "Floresta das Palavras",
    game6Desc: "Selecione o nome correto da figura apresentada!",
    game6Prompt: "Ouça e escolha a imagem certa!",
    game7Title: "Castelo das Frases",
    game7Desc: "Ordene as palavras para ler a frase e abrir o castelo!",
    game7Prompt: "Ouça a frase e monte-a com as palavras abaixo! 🔊",
    listenAgain: "Ouvir Novamente",
    castleOpened: "O portão do castelo se abriu!",
  },
  en: {
    appName: "Letter Adventure",
    play: "Play",
    collection: "Collection",
    profile: "Profile",
    parents: "Parents",
    back: "Back",
    chooseCharacter: "Choose your Character",
    unisexGirl: "Adventurer Girl",
    unisexBoy: "Adventurer Boy",
    fox: "Fox",
    panda: "Panda",
    kitten: "Kitten",
    robot: "Friendly Robot",
    lumiGreeting: "Hi! I'm Lumi! Let's play together!",
    lumiTip: "Tap things to find hidden letters!",
    lettersLearned: "Letters learned",
    syllablesMastered: "Syllables mastered",
    wordsRead: "Words read",
    weeklyProgress: "Weekly Progress",
    timePlayed: "Time played",
    minutes: "minutes",
    parentsTitle: "Parents Panel",
    parentsGateTitle: "Restricted Area",
    parentsGateSubtitle: "Solve the math puzzle to enter:",
    parentsGatePlaceholder: "Result",
    parentsGateIncorrect: "Oops! Incorrect answer. Try again!",
    parentsGateQuestion: "What is {num1} plus {num2}?",
    gameListTitle: "Adventure Map",
    soundToggle: "Sounds & Music",
    languageSelect: "Language",
    resetProgress: "Reset Progress",
    resetConfirm: "Are you sure you want to clear all progress?",
    stickerBook: "Sticker Book",
    avatarShop: "Clothing Shop",
    buy: "Buy",
    equipped: "Equipped",
    equip: "Equip",
    coins: "Coins",
    stars: "Stars",
    notEnoughCoins: "Not enough coins!",
    itemUnlocked: "You unlocked a new item!",
    chestTitle: "Surprise Chest!",
    chestInstructions: "Tap the chest to open it!",
    chestAlreadyClaimed: "You have already opened this chest!",
    attention: "Attention",
    chestOpen: "Open Chest",
    chestClaim: "Claim Reward!",
    premiumClub: "Premium Letter Club",
    premiumSubtitle: "Unlock over 50 stickers and new worlds!",
    tryAgain: "Let's try again?",
    wellDone: "Well done!",
    fantastic: "Fantastic!",
    amazing: "Amazing!",
    youCanDoIt: "You can do it!",
    timeForBreak: "Time for a break!",
    breakSubtitle: "How about stretching your arms and drinking some water?",
    continuePlaying: "Back to playing",
    game1Title: "World of Letters",
    game1Desc: "Find the hidden letters in the interactive scene!",
    game1Prompt: "Listen and find the corresponding letter!",
    game2Title: "Camouflaged Letters",
    game2Desc: "Identify the requested letter among the items!",
    game2Prompt: "Listen to the letter and find where it is!",
    game3Title: "Letter Catch",
    game3Desc: "Pop the bubbles with the correct letter before they disappear!",
    game3Prompt: "Listen and catch the correct letters!",
    game4Title: "Sound and Letter",
    game4Desc: "Listen to the syllable and select the correct bubble!",
    game4Prompt: "Listen to the syllable and pick the correct bubble!",
    game5Title: "Build the Word",
    game5Desc: "Arrange the letters to build a word and see it come alive!",
    game5Prompt: "Listen to the word and spell it!",
    game6Title: "Word Forest",
    game6Desc: "Select the correct name for the image shown!",
    game6Prompt: "Listen and choose the right image!",
    game7Title: "Sentence Castle",
    game7Desc: "Order the words to read the sentence and open the castle!",
    game7Prompt: "Listen to the sentence and build it with the words below! 🔊",
    listenAgain: "Listen Again",
    castleOpened: "The castle gate has opened!",
  },
  it: {
    appName: "Avventura delle Lettere",
    play: "Gioca",
    collection: "Collezione",
    profile: "Profilo",
    parents: "Genitori",
    back: "Indietro",
    chooseCharacter: "Scegli il tuo Personaggio",
    unisexGirl: "Ragazza Avventuriera",
    unisexBoy: "Ragazzo Avventuriero",
    fox: "Volpe",
    panda: "Panda",
    kitten: "Gattino",
    robot: "Robot Amichevole",
    lumiGreeting: "Ciao! Sono Lumi! Giochiamo insieme?",
    lumiTip: "Tocca gli oggetti per trovare le lettere nascoste!",
    lettersLearned: "Lettere imparate",
    syllablesMastered: "Sillabe padroneggiate",
    wordsRead: "Parole lette",
    weeklyProgress: "Progresso Settimanale",
    timePlayed: "Tempo di gioco",
    minutes: "minuti",
    parentsTitle: "Pannello Genitori",
    parentsGateTitle: "Area Riservata",
    parentsGateSubtitle: "Risolvi il calcolo per entrare:",
    parentsGatePlaceholder: "Risultato",
    parentsGateIncorrect: "Oops! Risposta errata. Riprova!",
    parentsGateQuestion: "Quanto fa {num1} più {num2}?",
    gameListTitle: "Mappa delle Avventure",
    soundToggle: "Suoni e Musica",
    languageSelect: "Lingua",
    resetProgress: "Ripristina Progresso",
    resetConfirm: "Sei sicuro di voler cancellare tutti i progressi?",
    stickerBook: "Album degli Adesivi",
    avatarShop: "Negozio dei Vestiti",
    buy: "Compra",
    equipped: "Equipaggiato",
    equip: "Equipaggia",
    coins: "Monete",
    stars: "Stelle",
    notEnoughCoins: "Monete insufficienti!",
    itemUnlocked: "Hai sbloccato un nuovo oggetto!",
    chestTitle: "Baule a Sorpresa!",
    chestInstructions: "Tocca il baule per aprirlo!",
    chestAlreadyClaimed: "Hai già aperto questo baule!",
    attention: "Attenzione",
    chestOpen: "Apri Baule",
    chestClaim: "Prendi la Ricompensa!",
    premiumClub: "Club Premium delle Lettere",
    premiumSubtitle: "Sblocca più di 50 adesivi e nuovi mondi!",
    tryAgain: "Riproviamo?",
    wellDone: "Ben fatto!",
    fantastic: "Fantastico!",
    amazing: "Incredibile!",
    youCanDoIt: "Ce la puoi fare!",
    timeForBreak: "Ora di fare una pausa!",
    breakSubtitle: "Che ne dici di sgranchirti e bere un po' d'acqua?",
    continuePlaying: "Torna a giocare",
    game1Title: "Mondo delle Lettere",
    game1Desc: "Trova le lettere nascoste nello scenario interattivo!",
    game1Prompt: "Ascolta e trova la lettera corrispondente!",
    game2Title: "Lettere Camuffate",
    game2Desc: "Identifica la lettera richiesta tra gli oggetti!",
    game2Prompt: "Ascolta la lettera e trova dov'è!",
    game3Title: "Cattura delle Lettere",
    game3Desc: "Fai scoppiare le bolle con la lettera giusta prima che spariscano!",
    game3Prompt: "Ascolta e cattura le lettere corrette!",
    game4Title: "Suono e Lettera",
    game4Desc: "Ascolta la sillaba e seleziona la bolla corretta!",
    game4Prompt: "Ascolta la sillaba e scegli la bolla corretta!",
    game5Title: "Costruisci la Parola",
    game5Desc: "Ordina le lettere per costruire una parola e vederla prendere vita!",
    game5Prompt: "Ascolta la parola e scrivila!",
    game6Title: "Foresta delle Parole",
    game6Desc: "Seleziona il nome corretto per la figura mostrata!",
    game6Prompt: "Ascolta e scegli l'immagine giusta!",
    game7Title: "Castello delle Frasi",
    game7Desc: "Ordina le parole per leggere la frase e aprire il castello!",
    game7Prompt: "Ascolta la frase e costruiscila con le parole qui sotto! 🔊",
    listenAgain: "Ascolta di Nuovo",
    castleOpened: "Il portone del castello si è aperto!",
  },
  es: {
    appName: "Aventura de las Letras",
    play: "Jugar",
    collection: "Colección",
    profile: "Perfil",
    parents: "Padres",
    back: "Volver",
    chooseCharacter: "Elige tu Personaje",
    unisexGirl: "Chica Aventurera",
    unisexBoy: "Chico Aventurero",
    fox: "Zorro",
    panda: "Panda",
    kitten: "Gatito",
    robot: "Robot Amigable",
    lumiGreeting: "¡Hola! ¡Soy Lumi! ¿Jugamos juntos?",
    lumiTip: "¡Toca los objetos para encontrar las letras ocultas!",
    lettersLearned: "Letras aprendidas",
    syllablesMastered: "Sílabas dominadas",
    wordsRead: "Palabras leídas",
    weeklyProgress: "Progreso Semanal",
    timePlayed: "Tiempo de uso",
    minutes: "minutos",
    parentsTitle: "Panel de Padres",
    parentsGateTitle: "Área Restringida",
    parentsGateSubtitle: "Resuelve el cálculo para ingresar:",
    parentsGatePlaceholder: "Resultado",
    parentsGateIncorrect: "¡Oops! Cálculo incorrecto. ¡Inténtalo de nuevo!",
    parentsGateQuestion: "¿Cuánto es {num1} más {num2}?",
    gameListTitle: "Mapa de Aventuras",
    soundToggle: "Sonidos y Música",
    languageSelect: "Idioma",
    resetProgress: "Reiniciar Progreso",
    resetConfirm: "¿Estás seguro de que deseas borrar todo el progreso?",
    stickerBook: "Libro de Pegatinas",
    avatarShop: "Tienda de Ropa",
    buy: "Comprar",
    equipped: "Equipado",
    equip: "Equipar",
    coins: "Monedas",
    stars: "Estrellas",
    notEnoughCoins: "¡Monedas insuficientes!",
    itemUnlocked: "¡Has desbloqueado un nuevo objeto!",
    chestTitle: "¡Cofre Sorpresa!",
    chestInstructions: "¡Toca el cofre para abrirlo!",
    chestAlreadyClaimed: "¡Ya has abierto este cofre!",
    attention: "Atención",
    chestOpen: "Abrir Cofre",
    chestClaim: "¡Recibir Recompensa!",
    premiumClub: "Club Premium de Letras",
    premiumSubtitle: "¡Desbloquea más de 50 pegatinas y mundos nuevos!",
    tryAgain: "¿Intentamos de nuevo?",
    wellDone: "¡Muy bien!",
    fantastic: "¡Fantástico!",
    amazing: "¡Increíble!",
    youCanDoIt: "¡Tú puedes!",
    timeForBreak: "¡Hora de un descanso!",
    breakSubtitle: "¿Qué tal si estiras los brazos y bebes un poco de agua?",
    continuePlaying: "Volver a jugar",
    game1Title: "Mundo de las Letras",
    game1Desc: "¡Encuentra las letras ocultas en el escenario interactivo!",
    game1Prompt: "¡Escucha y encuentra la letra correspondiente!",
    game2Title: "Letras Camufladas",
    game2Desc: "¡Identifica la letra solicitada entre los objetos!",
    game2Prompt: "¡Escucha la letra y encuentra dónde está!",
    game3Title: "Captura de Letras",
    game3Desc: "¡Explota las burbujas de la letra correcta antes de que desaparezcan!",
    game3Prompt: "¡Escucha y captura las letras correctas!",
    game4Title: "Sonido y Letra",
    game4Desc: "¡Escucha la sílaba y selecciona la opción correcta!",
    game4Prompt: "¡Escucha la sílaba y elige la burbuja correcta!",
    game5Title: "Arma la Palabra",
    game5Desc: "¡Ordena las letras para construir una palabra y verla cobrar vida!",
    game5Prompt: "¡Escucha la palabra y deletréala!",
    game6Title: "Bosque de Palabras",
    game6Desc: "¡Selecciona el nombre correcto del dibujo mostrado!",
    game6Prompt: "¡Escucha y elige la imagen correcta!",
    game7Title: "Castillo de las Frases",
    game7Desc: "¡Ordena las palabras para leer la frase y abrir el castillo!",
    game7Prompt: "¡Escucha la frase y arma con las palabras de abajo! 🔊",
    listenAgain: "Escuchar de Nuevo",
    castleOpened: "¡El portón del castillo se ha abierto!",
  }
};

interface LocalizationContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextProps | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determina o idioma com base na localidade de instalação/download do dispositivo
  const getSystemLanguage = (): LanguageType => {
    try {
      const locales = Localization.getLocales();
      if (locales && locales.length > 0) {
        const langCode = locales[0].languageCode;
        if (langCode === 'pt' || langCode === 'en' || langCode === 'it' || langCode === 'es') {
          return langCode as LanguageType;
        }
      }
    } catch (e) {
      console.warn('Erro ao obter idioma padrão do sistema:', e);
    }
    return 'pt'; // Fallback padrão caso não encontre
  };

  const [language, setLanguageState] = useState<LanguageType>('pt');

  useEffect(() => {
    // Carregar idioma salvo pelo usuário
    AsyncStorage.getItem('game_language').then((savedLang) => {
      if (savedLang && (savedLang === 'pt' || savedLang === 'en' || savedLang === 'it' || savedLang === 'es')) {
        setLanguageState(savedLang);
      } else {
        // Primeiro acesso: define com base na região/idioma do dispositivo
        const initialLang = getSystemLanguage();
        setLanguageState(initialLang);
        AsyncStorage.setItem('game_language', initialLang);
      }
    });
  }, []);

  const setLanguage = async (lang: LanguageType) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('game_language', lang);
  };

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations['pt'][key] || '';
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return text;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
