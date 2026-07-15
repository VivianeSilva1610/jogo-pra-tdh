import React from 'react';
import { Path } from 'react-native-svg';

interface TrailPathProps {
  d: string;
  baseColor?: string;
  baseWidth?: number;
  baseOpacity?: number;
  glossColor?: string;
  glossWidth?: number;
}

// Trilha dourada grossa com um traço tracejado por cima para dar
// textura de "pedras"/brilho, no lugar da linha fina pontilhada anterior.
export const TrailPath: React.FC<TrailPathProps> = ({
  d,
  baseColor = '#D99A1F',
  baseWidth = 17,
  baseOpacity = 0.8,
  glossColor = '#FFF8E1',
  glossWidth = 5,
}) => (
  <>
    <Path
      d={d}
      fill="none"
      stroke={baseColor}
      strokeWidth={baseWidth}
      strokeOpacity={baseOpacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d={d}
      fill="none"
      stroke={glossColor}
      strokeWidth={glossWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4, 10"
    />
  </>
);
