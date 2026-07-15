import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FONT_SIZES } from '../styles/theme';

interface HUDBadgeProps {
  icon: React.ReactNode;
  value: number | string;
  height?: number;
}

const PILL_HEIGHT_DEFAULT = 34;

// Cápsula de HUD com acabamento "esmaltado": gradiente dourado vertical,
// borda escura e uma faixa de brilho no terço superior simulando reflexo.
export const HUDBadge: React.FC<HUDBadgeProps> = ({ icon, value, height = PILL_HEIGHT_DEFAULT }) => {
  const gradientId = `hudBadgeGold-${height}`;
  const radius = height / 2;
  const glossHeight = height / 3;

  return (
    <View style={[styles.container, { minHeight: height, borderRadius: radius }]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#ffe9a8" />
            <Stop offset="55%" stopColor="#f5c451" />
            <Stop offset="100%" stopColor="#d99a1f" />
          </LinearGradient>
        </Defs>
        <Rect
          x="1"
          y="1"
          width="99%"
          height={height - 2}
          rx={radius - 1}
          fill={`url(#${gradientId})`}
          stroke="#a3730f"
          strokeWidth={2}
        />
        <Rect
          x="3"
          y="3"
          width="97%"
          height={glossHeight}
          rx={(glossHeight) / 2}
          fill="#FFFFFF"
          opacity={0.35}
        />
      </Svg>
      <View style={styles.content}>
        {icon}
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginLeft: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '900',
    color: '#7a4e08',
    marginLeft: 4,
  },
});
