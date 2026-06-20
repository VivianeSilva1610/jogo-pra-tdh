import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================================
// CONFIGURAÇÃO DA CHAVE DE API DO GEMINI
// ========================================================
// Você pode configurar a chave inserindo-a diretamente abaixo
// ou definindo a variável de ambiente EXPO_PUBLIC_GEMINI_API_KEY.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Inicializa o SDK do Gemini apenas se a chave estiver presente
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Instrução de Sistema para o Lumi (Mascote Adaptada para TDAH Infantil)
const LUMI_SYSTEM_INSTRUCTION = `
Você é o Lumi, uma pequena luz mágica que acompanha a criança no jogo "Aventura das Letras".
Seu objetivo é ser um companheiro de aprendizado acolhedor, positivo e divertido.

Regras de comportamento e comunicação:
1. Foco em TDAH: Responda em no máximo 2 ou 3 frases curtas e diretas. Crianças com TDAH perdem o foco muito rápido se a resposta for longa.
2. Tom de Voz: Extremamente animado, brincalhão, doce e encorajador.
3. Emojis: Use muitos emojis divertidos em cada frase (ex: 🌟, 🧚‍♂️, 🚀, 🎈, 🧸).
4. Sem Erros: Nunca critique ou diga que a criança falhou. Se ela errar, diga que faz parte da aventura e que juntos vão conseguir!
5. Linguagem: Adequada para crianças de 4 a 8 anos de idade.
6. Idioma: Responda sempre no mesmo idioma em que a pergunta foi feita.
`;

/**
 * 1. LUMI CONVERSACIONAL
 * Gera uma resposta mágica e adaptada de Lumi para qualquer frase enviada pela criança ou responsável.
 */
export async function askLumi(message: string, childName?: string, childAge?: number): Promise<string> {
  if (!genAI) {
    console.warn('A API Key do Gemini não está configurada.');
    return 'Lumi diz: Você é incrível! Continue brilhando! 🌟✨';
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: LUMI_SYSTEM_INSTRUCTION
    });

    const contextPrompt = `
      Nome da Criança: ${childName || 'Pequeno Aventureiro'}
      Idade: ${childAge ? `${childAge} anos` : 'Não informada'}
      Mensagem da Criança: "${message}"
    `;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Erro ao chamar o Gemini:', error);
    return 'Estou adorando nossa aventura! Vamos jogar mais? 🌟🚀';
  }
}

/**
 * 2. GERAR HISTÓRIA CURTA COM PALAVRA APRENDIDA
 * Cria uma micro-história de 3 frases para praticar a leitura com a palavra que a criança acabou de aprender.
 */
export async function generateMiniStory(word: string): Promise<string> {
  if (!genAI) {
    return `O ${word} é muito amigo de toda a floresta! Ele gosta de passear no arco-íris e brincar com Lumi. 🌟🍎`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Escreva uma micro-história de exatamente 3 frases curtas e simples para uma criança de 6 anos ler.
      A história DEVE conter a palavra "${word.toUpperCase()}" de forma destacada.
      Use emojis divertidos. Responda em português.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Erro ao gerar história com Gemini:', error);
    return `O ${word} é muito amigo de toda a floresta! Ele gosta de passear no arco-íris e brincar com Lumi. 🌟🍎`;
  }
}

/**
 * 3. DICAS DEDUTIVAS DE SILABAS E FONEMAS
 * Ajuda a criança com dicas lúdicas para encontrar uma letra.
 */
export async function generateLetterHint(letter: string): Promise<string> {
  if (!genAI) {
    return `Dica de Lumi: Que tal procurar por um emoji fofo que começa com a letra ${letter}? 🌟`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Escreva uma única frase super curta dando uma dica divertida de qual palavra começa com a letra "${letter.toUpperCase()}".
      Exemplo para A: "Ela faz mel e voa no jardim! Começa com A de Abelha! 🐝"
      Exemplo para B: "Ela rola no campo e a gente adora chutar! Começa com BO de Bola! ⚽"
      Use emojis. Responda em português.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Erro ao gerar dica de letra com Gemini:', error);
    return `Dica de Lumi: Procure o objeto divertido que começa com a letra ${letter}! 🌟`;
  }
}
