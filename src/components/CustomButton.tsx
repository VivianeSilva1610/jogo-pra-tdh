import React, { useRef } from 'react';
import { Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { playSound } from '../services/audio';
import { useGame } from '../context/GameContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  borderColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  color = '#4CAF50',
  borderColor = '#81C784',
  textColor = '#FFF',
  size = 'medium',
  disabled = false,
}) => {
  const { soundEnabled } = useGame();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    playSound('pop', soundEnabled);
    onPress();
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32 };
      default: return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 20;
      default: return 17;
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          getPadding(),
          {
            backgroundColor: disabled ? '#B0BEC5' : color,
            borderColor: disabled ? '#CFD8DC' : borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.text, { color: textColor, fontSize: getFontSize() }]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 6, // Efeito 3D de botão fofo
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
    marginVertical: 6,
  },
  text: {
    fontWeight: 'bold',
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
