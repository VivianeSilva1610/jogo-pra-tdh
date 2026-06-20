import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame, STICKERS_LIST, CLOTHING_LIST } from '../context/GameContext';
import { getAvatarComponent } from '../components/VectorIcons';
import { CustomButton } from '../components/CustomButton';
import { MascotLumi } from '../components/MascotLumi';
import { ArrowLeft } from 'lucide-react-native';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { t } = useLocalization();
  const {
    coins,
    stars,
    character,
    equippedClothing,
    challengesCompleted,
    unlockedStickers,
    unlockedClothing,
  } = useGame();

  const [motivationPhrase, setMotivationPhrase] = useState('');

  const MOTIVATIONAL_PHRASES = [
    t('wellDone') + ' ' + t('youCanDoIt') + ' 🚀',
    t('fantastic') + ' Você está indo muito bem! 🌟',
    t('amazing') + ' Que orgulho de ver você aprender! ❤️',
    'Você é um aventureiro incrível das letras! 🗺️',
    'Uau, quantas estrelas brilhantes você tem! ✨',
  ];

  useEffect(() => {
    // Escolhe uma frase aleatória toda vez que entra no perfil
    const randomIdx = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    setMotivationPhrase(MOTIVATIONAL_PHRASES[randomIdx]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <MascotLumi text={motivationPhrase} />

      <View style={styles.content}>
        {/* Avatar Display */}
        {character && (
          <View style={styles.avatarCard}>
            <View style={styles.avatarGlow} />
            {getAvatarComponent(character, 130, equippedClothing)}
            <Text style={styles.avatarName}>
              {t(
                character === 'boy' ? 'unisexBoy' :
                character === 'girl' ? 'unisexGirl' :
                (character as any)
              )}
            </Text>
            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={() => onNavigate('character_select')}
              activeOpacity={0.8}
            >
              <Text style={styles.changeAvatarBtnText}>✏️ {t('changeAvatar')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estatísticas do Jogador */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Minhas Conquistas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{stars}</Text>
              <Text style={styles.statLabel}>{t('stars')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.statValue}>{coins}</Text>
              <Text style={styles.statLabel}>{t('coins')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statValue}>{challengesCompleted}</Text>
              <Text style={styles.statLabel}>Desafios</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🖼️</Text>
              <Text style={styles.statValue}>
                {unlockedStickers.length}/{STICKERS_LIST.length}
              </Text>
              <Text style={styles.statLabel}>Adesivos</Text>
            </View>
          </View>
        </View>

        {/* Botão Jogar */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            title={`🚀 ${t('play')}!`}
            color="#FF9800"
            borderColor="#F57C00"
            size="large"
            onPress={() => onNavigate('map')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // Amarelo bem clarinho e acolhedor
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatarCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFE082',
    paddingVertical: 15,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  avatarGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF9C4',
    top: 10,
    opacity: 0.6,
    zIndex: -1,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    marginTop: 10,
  },
  changeAvatarBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB74D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  changeAvatarBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E65100',
  },
  statsCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#F8BBD0',
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C2185B',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    width: '46%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#37474F',
  },
  statLabel: {
    fontSize: 11,
    color: '#78909C',
    marginTop: 2,
  },
  buttonWrapper: {
    width: '90%',
    marginTop: 'auto',
    marginBottom: 10,
  },
});
