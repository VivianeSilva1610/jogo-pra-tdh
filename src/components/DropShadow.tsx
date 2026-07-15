import React from 'react';
import Svg, { Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

interface DropShadowProps {
  width: number;
  height?: number;
  color?: string;
  opacity?: number;
  style?: any;
}

// Sombra elíptica sob elementos flutuantes (nós, prédios, badges).
// Usa gradiente radial pré-computado em vez de feGaussianBlur para manter
// performance estável em Android mais antigo.
export const DropShadow: React.FC<DropShadowProps> = ({
  width,
  height,
  color = '#0c1e02',
  opacity = 0.2,
  style,
}) => {
  const h = height ?? width * 0.35;
  const gradientId = `dropShadowGradient-${width}-${h}`;

  return (
    <Svg width={width} height={h} style={style} pointerEvents="none">
      <Defs>
        <RadialGradient id={gradientId} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="70%" stopColor={color} stopOpacity={opacity * 0.6} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={h / 2} rx={width / 2} ry={h / 2} fill={`url(#${gradientId})`} />
    </Svg>
  );
};
