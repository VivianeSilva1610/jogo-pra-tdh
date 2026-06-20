import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { useGame } from '../context/GameContext';
import { useLocalization } from '../context/LocalizationContext';
import { ChestIcon } from './VectorIcons';
import { playSound } from '../services/audio';
import { speak } from '../services/speech';

export const RewardChest: React.FC = () => {
  const { showChestModal, claimChestReward, soundEnabled } = useGame();
  const { t, language } = useLocalization();

  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Ao abrir o modal, falar a instrução
  useEffect(() => {
    if (showChestModal) {
      setIsOpen(false);
      setReward(null);
      setIsOpening(false);
      
      const delaySpeak = setTimeout(() => {
        speak(t('chestInstructions'), language);
      }, 500);
      return () => clearTimeout(delaySpeak);
    }
  }, [showChestModal]);

  const handleOpenChest = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);
    
    // Efeito de vibração/agitação do baú antes de abrir (TDAH engajante!)
    playSound('pop', soundEnabled);
    
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, easing: Easing.back(1.5), useNativeDriver: true }),
      ])
    ]).start(async () => {
      // Toca o som do baú abrindo
      playSound('chest', soundEnabled);
      setIsOpen(true);
      
      const unlockedReward = await claimChestReward();
      setReward(unlockedReward);
      
      // Narrar a recompensa obtida
      const rewardSpeak = `${t('wellDone')}! ${t('itemUnlocked')}! ${unlockedReward}`;
      speak(rewardSpeak, language);
      
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const handleClose = () => {
    // Resetar estados
    setIsOpen(false);
    setReward(null);
    setIsOpening(false);
  };

  const shakeStyle = {
    transform: [
      { translateX: shakeAnim },
      { scale: scaleAnim }
    ]
  };

  return (
    <Modal
      visible={showChestModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('chestTitle')}</Text>
          
          <Animated.View style={[styles.chestContainer, shakeStyle]}>
            <TouchableOpacity 
              activeOpacity={isOpen ? 1 : 0.8} 
              onPress={handleOpenChest}
              disabled={isOpen || isOpening}
            >
              <ChestIcon size={140} isOpen={isOpen} />
            </TouchableOpacity>
          </Animated.View>

          {!isOpen && (
            <Text style={styles.instructions}>{t('chestInstructions')}</Text>
          )}

          {isOpen && reward && (
            <View style={styles.rewardContainer}>
              <Text style={styles.rewardLabel}>{t('itemUnlocked')}</Text>
              <Text style={styles.rewardText}>{reward}</Text>
              
              <TouchableOpacity style={styles.claimButton} onPress={handleClose}>
                <Text style={styles.claimButtonText}>{t('chestClaim')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFDF0',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFD54F',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 20,
    textAlign: 'center',
  },
  chestContainer: {
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  instructions: {
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  rewardContainer: {
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'stretch',
  },
  rewardLabel: {
    fontSize: 14,
    color: '#795548',
    fontWeight: 'bold',
  },
  rewardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 10,
    textAlign: 'center',
  },
  claimButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFE082',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
