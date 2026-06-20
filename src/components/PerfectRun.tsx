import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { getAvatarComponent } from './VectorIcons';
import { speak } from '../services/speech';
import { useLocalization } from '../context/LocalizationContext';

interface PerfectRunProps {
  visible: boolean;
  onClose: () => void;
}

const PERFECT_MESSAGES: Record<string, string[]> = {
  pt: ['Perfeito!!! 🌟', 'Incrível! Você mandou bem!', 'Arrasou! 3 de 3! 🏆'],
  en: ['Perfect!!! 🌟', 'Amazing! You nailed it!', 'Flawless! 3 for 3! 🏆'],
  it: ['Perfetto!!! 🌟', 'Incredibile! Ce l\'hai fatta!', 'Perfetto! 3 su 3! 🏆'],
  es: ['¡Perfecto!!! 🌟', '¡Increíble! ¡Lo lograste!', '¡Sin errores! 3 de 3! 🏆'],
};

export const PerfectRun: React.FC<PerfectRunProps> = ({ visible, onClose }) => {
  const { character, equippedClothing } = useGame();
  const { language } = useLocalization();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  const messages = PERFECT_MESSAGES[language] || PERFECT_MESSAGES.pt;
  const message = messages[Math.floor(Math.random() * messages.length)];

  useEffect(() => {
    if (!visible) {
      scaleAnim.setValue(0);
      floatAnim.setValue(0);
      star1.setValue(0);
      star2.setValue(0);
      star3.setValue(0);
      bgOpacity.setValue(0);
      return;
    }

    // Speak celebration message
    speak(message, language);

    // Entry animation sequence
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Stars pop in sequence
      Animated.stagger(150, [
        Animated.spring(star1, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.spring(star2, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.spring(star3, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
      ]).start();

      // Avatar float loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -14, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });

    // Auto-dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: bgOpacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          
          {/* Stars Row */}
          <View style={styles.starsRow}>
            {[star1, star2, star3].map((anim, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.star,
                  { transform: [{ scale: anim }], opacity: anim },
                ]}
              >
                ⭐
              </Animated.Text>
            ))}
          </View>

          {/* Avatar jumping */}
          <Animated.View style={[styles.avatarWrapper, { transform: [{ translateY: floatAnim }] }]}>
            {getAvatarComponent(character, 130, equippedClothing)}
          </Animated.View>

          {/* Message */}
          <Text style={styles.title}>{message}</Text>
          <Text style={styles.subtitle}>Acertou tudo na primeira tentativa! 🎉</Text>

          {/* Confetti emojis */}
          <Text style={styles.confetti}>🎊 🎈 🏅 🎊</Text>

          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnText}>Continuar ➡️</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 60, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '86%',
    maxWidth: 420,
    backgroundColor: '#FFFDF0',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFD54F',
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 10,
  },
  star: {
    fontSize: 40,
  },
  avatarWrapper: {
    marginVertical: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E65100',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  confetti: {
    fontSize: 28,
    marginVertical: 12,
    letterSpacing: 4,
  },
  btn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 4,
  },
  btnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
