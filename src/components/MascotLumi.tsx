import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LumiIcon } from './VectorIcons';
import { speak } from '../services/speech';
import { useLocalization } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { Volume2 } from 'lucide-react-native';

interface MascotLumiProps {
  text: string;
}

export const MascotLumi: React.FC<MascotLumiProps> = ({ text }) => {
  const { language } = useLocalization();
  const { soundEnabled } = useGame();
  
  // Animação de flutuação de Lumi (efeito suave)
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Iniciar animação contínua de flutuação
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Falar as instruções quando o texto mudar ou o componente montar
  useEffect(() => {
    if (text) {
      speak(text, language);
    }
  }, [text, language]);

  const handleReplaySpeech = () => {
    speak(text, language);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleReplaySpeech}>
          <LumiIcon size={55} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bubbleContainer}>
        <View style={styles.bubbleArrow} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{text}</Text>
          <TouchableOpacity 
            style={styles.speakerButton} 
            onPress={handleReplaySpeech}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {/* Usamos um ícone simples desenhado ou do Lucide */}
            <Volume2 size={18} color="#5D4037" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 12,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  bubbleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: '#FFFDF0',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFDF0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#FFE082',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4037',
    lineHeight: 20,
    fontFamily: 'System',
  },
  speakerButton: {
    backgroundColor: '#FFF9C4',
    padding: 6,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: '#FFF59D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
