import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { THEME_COLORS } from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const EnchantedBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // --- ANIMAÇÃO DE BORBOLETAS ---
  // Borboleta 1
  const b1X = useRef(new Animated.Value(-40)).current;
  const b1Y = useRef(new Animated.Value(SCREEN_HEIGHT * 0.7)).current;
  const b1Flap = useRef(new Animated.Value(1)).current;

  // Borboleta 2
  const b2X = useRef(new Animated.Value(SCREEN_WIDTH + 40)).current;
  const b2Y = useRef(new Animated.Value(SCREEN_HEIGHT * 0.5)).current;
  const b2Flap = useRef(new Animated.Value(1)).current;

  // --- ANIMAÇÃO DE PARTÍCULAS MÁGICAS ---
  const particles = Array.from({ length: 6 }).map(() => ({
    x: Math.random() * SCREEN_WIDTH,
    yStart: SCREEN_HEIGHT * 0.9 - Math.random() * 200,
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
    scale: 0.5 + Math.random() * 0.8,
  }));

  useEffect(() => {
    // 1. Loop Bater Asas Borboleta 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(b1Flap, { toValue: 0.2, duration: 150, useNativeDriver: true }),
        Animated.timing(b1Flap, { toValue: 1, duration: 150, useNativeDriver: true }),
      ])
    ).start();

    // Loop Bater Asas Borboleta 2
    Animated.loop(
      Animated.sequence([
        Animated.timing(b2Flap, { toValue: 0.2, duration: 130, useNativeDriver: true }),
        Animated.timing(b2Flap, { toValue: 1, duration: 130, useNativeDriver: true }),
      ])
    ).start();

    // 2. Caminho de Voo Borboleta 1
    const flyB1 = () => {
      b1X.setValue(-40);
      b1Y.setValue(SCREEN_HEIGHT * 0.7 + Math.random() * 100);
      Animated.parallel([
        Animated.timing(b1X, {
          toValue: SCREEN_WIDTH + 50,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(b1Y, {
            toValue: SCREEN_HEIGHT * 0.4,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(b1Y, {
            toValue: SCREEN_HEIGHT * 0.6,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => flyB1());
    };

    // Caminho de Voo Borboleta 2
    const flyB2 = () => {
      b2X.setValue(SCREEN_WIDTH + 40);
      b2Y.setValue(SCREEN_HEIGHT * 0.4 + Math.random() * 100);
      Animated.parallel([
        Animated.timing(b2X, {
          toValue: -50,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(b2Y, {
            toValue: SCREEN_HEIGHT * 0.6,
            duration: 7500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(b2Y, {
            toValue: SCREEN_HEIGHT * 0.3,
            duration: 7500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => flyB2());
    };

    flyB1();
    // Delay para iniciar a borboleta 2
    const timeoutB2 = setTimeout(() => flyB2(), 4000);

    // 3. Loop das Partículas
    particles.forEach((p, idx) => {
      const runParticle = () => {
        p.translateY.setValue(0);
        p.opacity.setValue(0);

        Animated.sequence([
          Animated.delay(idx * 800),
          Animated.parallel([
            Animated.timing(p.translateY, {
              toValue: -150 - Math.random() * 100,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(p.opacity, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
            ]),
          ]),
        ]).start(() => runParticle());
      };
      runParticle();
    });

    return () => {
      clearTimeout(timeoutB2);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* CÉU */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: THEME_COLORS.skyBlue }]} />

      {/* ARTE DO CENÁRIO (FLORESTA ENCANTADA DE FUNDO) */}
      <View style={styles.svgBackground}>
        <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">
          {/* Montanhas/Colinas distantes */}
          <Path d="M-50 850 C 50 720, 150 740, 250 810 C 320 780, 380 770, 480 850 Z" fill="#C2F0C2" opacity="0.6" />
          <Path d="M-10 850 C 100 760, 280 750, 420 850 Z" fill="#A8E6A3" />

          {/* Árvores Arredondadas (Desenho cartoon fofo) */}
          {/* Árvore Esquerda */}
          <G transform="translate(40, 680)">
            <Path d="M0 0 L0 100" stroke="#795548" strokeWidth="12" strokeLinecap="round" />
            <Circle cx="0" cy="-20" r="35" fill="#81C784" />
            <Circle cx="-15" cy="-35" r="25" fill="#66BB6A" />
            <Circle cx="15" cy="-30" r="22" fill="#4CAF50" />
            {/* Frutinhas brilhantes */}
            <Circle cx="-10" cy="-20" r="3.5" fill="#FFD166" />
            <Circle cx="15" cy="-15" r="3.5" fill="#FF8A80" />
          </G>

          {/* Árvore Direita */}
          <G transform="translate(350, 710)">
            <Path d="M0 0 L0 90" stroke="#795548" strokeWidth="10" strokeLinecap="round" />
            <Circle cx="0" cy="-15" r="30" fill="#AED581" />
            <Circle cx="12" cy="-25" r="20" fill="#9CCC65" />
            <Circle cx="-12" cy="-20" r="18" fill="#8BC34A" />
            <Circle cx="0" cy="-15" r="3" fill="#FFD166" />
          </G>

          {/* Colina Frontal */}
          <Path d="M-20 820 C 120 790, 280 790, 420 820 L420 850 L-20 850 Z" fill="#81C784" />

          {/* Flores animadas nas laterais */}
          {/* Flor 1 (Esq) */}
          <G transform="translate(30, 790)">
            <Path d="M0 0 L0 20" stroke="#4CAF50" strokeWidth="3" />
            <Circle cx="0" cy="0" r="6" fill="#FF8A80" />
            <Circle cx="-5" cy="-5" r="4" fill="#FFB74D" />
            <Circle cx="5" cy="-5" r="4" fill="#FFB74D" />
            <Circle cx="0" cy="-10" r="4" fill="#FFB74D" />
            <Circle cx="-5" cy="5" r="4" fill="#FFB74D" />
            <Circle cx="5" cy="5" r="4" fill="#FFB74D" />
          </G>

          {/* Flor 2 (Dir) */}
          <G transform="translate(360, 785)">
            <Path d="M0 0 L0 25" stroke="#4CAF50" strokeWidth="3" />
            <Circle cx="0" cy="0" r="5" fill="#FFD166" />
            <Circle cx="-4" cy="-4" r="3.5" fill="#8E7CFF" />
            <Circle cx="4" cy="-4" r="3.5" fill="#8E7CFF" />
            <Circle cx="0" cy="-8" r="3.5" fill="#8E7CFF" />
            <Circle cx="-4" cy="4" r="3.5" fill="#8E7CFF" />
            <Circle cx="4" cy="4" r="3.5" fill="#8E7CFF" />
          </G>
        </Svg>
      </View>

      {/* RENDERIZAR PARTÍCULAS MÁGICAS */}
      {particles.map((p, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.yStart,
              opacity: p.opacity,
              transform: [
                { translateY: p.translateY },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}

      {/* RENDERIZAR BORBOLETA 1 */}
      <Animated.View style={[styles.butterfly, { transform: [{ translateX: b1X }, { translateY: b1Y }] }]}>
        <Animated.View style={{ transform: [{ scaleX: b1Flap }] }}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {/* Asa Esquerda */}
            <Path d="M10 10 C 6 2, 2 2, 4 8 C 5 11, 8 10, 10 10 Z" fill="#8E7CFF" opacity="0.9" />
            {/* Asa Direita */}
            <Path d="M10 10 C 14 2, 18 2, 16 8 C 15 11, 12 10, 10 10 Z" fill="#8E7CFF" opacity="0.9" />
            {/* Asa debaixo Esq */}
            <Path d="M10 10 C 7 13, 5 15, 6 11 C 7 9, 9 10, 10 10 Z" fill="#FF8A80" opacity="0.8" />
            {/* Asa debaixo Dir */}
            <Path d="M10 10 C 13 13, 15 15, 14 11 C 13 9, 11 10, 10 10 Z" fill="#FF8A80" opacity="0.8" />
            {/* Corpo */}
            <Path d="M10 5 L10 15" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* RENDERIZAR BORBOLETA 2 */}
      <Animated.View style={[styles.butterfly, { transform: [{ translateX: b2X }, { translateY: b2Y }] }]}>
        <Animated.View style={{ transform: [{ scaleX: b2Flap }] }}>
          <Svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            {/* Asa Esquerda */}
            <Path d="M10 10 C 6 2, 2 2, 4 8 C 5 11, 8 10, 10 10 Z" fill="#FFD166" opacity="0.95" />
            {/* Asa Direita */}
            <Path d="M10 10 C 14 2, 18 2, 16 8 C 15 11, 12 10, 10 10 Z" fill="#FFD166" opacity="0.95" />
            {/* Asa debaixo Esq */}
            <Path d="M10 10 C 7 13, 5 15, 6 11 C 7 9, 9 10, 10 10 Z" fill="#8E7CFF" opacity="0.8" />
            {/* Asa debaixo Dir */}
            <Path d="M10 10 C 13 13, 15 15, 14 11 C 13 9, 11 10, 10 10 Z" fill="#8E7CFF" opacity="0.8" />
            {/* Corpo */}
            <Path d="M10 5 L10 15" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* CONTEÚDO PRINCIPAL SOBRE O FUNDO */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  svgBackground: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  butterfly: {
    position: 'absolute',
    width: 20,
    height: 20,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE082',
    shadowColor: '#FFD166',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
});
