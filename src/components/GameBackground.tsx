import React from 'react';
import { ImageBackground, View, StyleSheet, ImageSourcePropType } from 'react-native';

interface GameBackgroundProps {
  source: ImageSourcePropType;
}

// Fundo ilustrado de tela inteira por jogo, com véu translúcido para manter
// o texto/botões legíveis sobre a arte.
export const GameBackground: React.FC<GameBackgroundProps> = ({ source }) => (
  <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover">
    <View style={styles.scrim} />
  </ImageBackground>
);

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
