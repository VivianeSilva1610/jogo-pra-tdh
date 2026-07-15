import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { THEME_COLORS, FONT_SIZES } from '../styles/theme';
import { DropShadow } from './DropShadow';

export type LevelNodeState = 'locked' | 'freemiumLocked' | 'current' | 'completed' | 'available';

interface LevelNodeProps {
  size?: number;
  emoji: string;
  title: string;
  state: LevelNodeState;
  color: string;
  disabled?: boolean;
  onPress: () => void;
  titleSide: 'left' | 'right';
  style?: any;
}

const STATE_FILL: Record<LevelNodeState, string> = {
  locked: '#CFD8DC',
  freemiumLocked: '#E8D5F5',
  current: '#FFFFFF', // sobrescrito por `color` via prop
  completed: '#FFFFFF',
  available: '#FFFFFF',
};

// Nó de nível em 3 camadas: anel externo dourado (sticker), reflexo de
// brilho na metade superior e círculo interno com a cor/ícone do estado.
export const LevelNode: React.FC<LevelNodeProps> = ({
  size = 64,
  emoji,
  title,
  state,
  color,
  disabled = false,
  onPress,
  titleSide,
  style,
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== 'current') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  const innerFill = state === 'locked' || state === 'freemiumLocked' ? STATE_FILL[state] : color;
  const gradientId = `levelNodeRing-${state}-${size}`;
  const radius = size / 2;
  const ringWidth = size * 0.09;
  const innerRadius = radius - ringWidth - 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size + size * 0.35 }, style]}>
      <DropShadow width={size * 0.9} height={size * 0.28} style={{ position: 'absolute', top: size - size * 0.12, left: size * 0.05 }} />
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <TouchableOpacity
          activeOpacity={disabled ? 1 : 0.75}
          disabled={disabled}
          onPress={onPress}
          style={{ width: size, height: size }}
        >
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#ffe9a8" />
                <Stop offset="55%" stopColor="#f5c451" />
                <Stop offset="100%" stopColor="#d99a1f" />
              </LinearGradient>
            </Defs>
            {/* Anel externo dourado */}
            <Circle cx={radius} cy={radius} r={radius - 1.5} fill={`url(#${gradientId})`} stroke="#a3730f" strokeWidth={1.5} />
            {/* Círculo interno com a cor do estado */}
            <Circle cx={radius} cy={radius} r={innerRadius} fill={innerFill} stroke="#5D4037" strokeOpacity={0.25} strokeWidth={1.5} />
            {/* Reflexo de brilho no anel externo (metade superior) */}
            <Path
              d={`M ${radius - radius * 0.75} ${radius - radius * 0.15} A ${radius - 1.5} ${radius - 1.5} 0 0 1 ${radius + radius * 0.75} ${radius - radius * 0.15}`}
              stroke="#FFFFFF"
              strokeOpacity={0.5}
              strokeWidth={ringWidth * 0.7}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.centerContent}>
              {state === 'locked' ? (
                <Text style={styles.lockText}>🔒</Text>
              ) : state === 'freemiumLocked' ? (
                <Text style={styles.lockText}>⭐🔒</Text>
              ) : (
                <Text style={styles.emoji}>{emoji}</Text>
              )}
            </View>
          </View>
          {state === 'completed' && (
            <View style={styles.checkmarkBadge}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      <View
        style={[
          styles.titleBubble,
          { top: size / 2 - 10 },
          titleSide === 'left' ? styles.titleLeft : styles.titleRight,
        ]}
      >
        <Text style={styles.titleBubbleText}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 20,
  },
  emoji: {
    fontSize: 26,
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: FONT_SIZES.micro,
    fontWeight: '900',
    lineHeight: FONT_SIZES.micro,
  },
  titleBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: '#D7CCC8',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  titleRight: {
    left: 70,
  },
  titleLeft: {
    right: 70,
  },
  titleBubbleText: {
    fontSize: FONT_SIZES.micro,
    fontWeight: '800',
    color: THEME_COLORS.brownDark,
    textAlign: 'center',
  },
});
