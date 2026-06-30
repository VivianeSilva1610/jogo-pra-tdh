export const THEME_COLORS = {
  skyBlue: '#BEE9FF',
  natureGreen: '#A8E6A3',
  goldenYellow: '#FFD166',
  magicPurple: '#8E7CFF',
  softWhite: '#F8F7FF',
  // Cores auxiliares cartoon
  errorRed: '#FF8A80',
  orangeDark: '#E65100',
  brownDark: '#5D4037',
  grayNeutral: '#CFD8DC',
  greenDark: '#2E7D32',
};

export const CARTOON_SHADOWS = {
  button: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  }
};

// ========================================================
// ESCALA TIPOGRÁFICA CENTRAL
//
// Fonte única da verdade para tamanhos de fonte do app.
// Antes desta escala, o projeto tinha 25+ valores de fontSize
// soltos (8, 9, 10, 11, 12, 13...90) espalhados por 19 arquivos,
// sem nenhum padrão de hierarquia entre telas.
//
// Regra para o público de 5-8 anos com TDAH: o tamanho mínimo de
// texto legível é 12px (FONT_SIZES.micro). Valores abaixo disso
// foram eliminados da escala porque dificultam a leitura mesmo
// para adultos, e ainda mais para crianças com dificuldade de
// atenção sustentada e leitura em desenvolvimento.
//
// Como usar: import { FONT_SIZES } from '../styles/theme';
// fontSize: FONT_SIZES.body
// ========================================================
export const FONT_SIZES = {
  micro: 12,    // Legendas, rodapés, texto auxiliar (nunca abaixo disso)
  caption: 14,  // Texto secundário, dicas, labels de botões pequenos
  body: 16,     // Texto padrão de leitura (parágrafos, instruções)
  subheading: 18, // Subtítulos de seção, texto de botão principal
  heading: 22,  // Títulos de tela secundários
  title: 28,    // Títulos de tela principais
  display: 34,  // Números de destaque, headers hero
  hero: 54,     // Letras/emojis gigantes de foco do jogo (ex: letra-alvo)
} as const;

// Pesos de fonte padronizados (o app não usa fontFamily customizada,
// então o peso é o principal recurso de hierarquia tipográfica)
export const FONT_WEIGHTS = {
  regular: '500' as const,
  bold: '700' as const,
  extraBold: '900' as const,
};
