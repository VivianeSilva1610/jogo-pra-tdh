import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Modal } from 'react-native';
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
    avatarName,
    setAvatarName,
    equippedClothing,
    challengesCompleted,
    unlockedStickers,
    unlockedClothing,
  } = useGame();

  const [motivationPhrase, setMotivationPhrase] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleStartEditName = () => {
    const currentName = avatarName || t(character as any);
    setTempName(currentName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    await setAvatarName(tempName);
    setIsEditingName(false);
  };

  const MOTIVATIONAL_PHRASES = [
    t('wellDone') + ' ' + t('youCanDoIt') + ' 🚀',
    t('profilePhrase1'),
    t('profilePhrase2'),
    t('profilePhrase3'),
    t('profilePhrase4'),
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
            <TouchableOpacity 
              style={styles.avatarNameContainer} 
              onPress={handleStartEditName}
              activeOpacity={0.7}
            >
              <Text style={styles.avatarName}>
                {avatarName || t(character as any)}
              </Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
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
          <Text style={styles.statsTitle}>{t('myAchievements')}</Text>
          
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
              <Text style={styles.statLabel}>{t('challenges')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🖼️</Text>
              <Text style={styles.statValue}>
                {unlockedStickers.length}/{STICKERS_LIST.length}
              </Text>
              <Text style={styles.statLabel}>{t('stickers')}</Text>
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

      <Modal
        visible={isEditingName}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingName(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('enterAvatarName')}</Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              maxLength={20}
              placeholder={t('enterAvatarName')}
              autoFocus={true}
              selectTextOnFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsEditingName(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveName}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonSaveText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 6,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFE082',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#FFD54F',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#37474F',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '47%',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#ECEFF1',
    borderWidth: 1.5,
    borderColor: '#CFD8DC',
  },
  modalButtonCancelText: {
    color: '#546E7A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalButtonSave: {
    backgroundColor: '#FF9800',
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  modalButtonSaveText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
