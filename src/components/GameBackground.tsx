import React from 'react';
import { ImageBackground, View, StyleSheet, ImageSourcePropType } from 'react-native';

interface GameBackgroundProps {
  source: ImageSourcePropType;
}

// Fundo ilustrado de tela inteira por jogo, com véu translúcido para manter
// o texto/botões legíveis sobre a arte.
export const GameBackground: React.FC<GameBackgroundProps> = ({ source }) => (
  <ImageBackground source={source} style={styles.fill} resizeMode="cover">
    <View style={styles.scrim} />
  </ImageBackground>
);

const styles = StyleSheet.create({
  // width/height 100% explícitos: mais confiável que absoluteFill (que só
  // ancora as bordas) para forçar a Image a preencher o pai em todas as
  // plataformas, mesmo antes do primeiro layout do pai ser medido.
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
