import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGame, CharacterType } from '../context/GameContext';
import { useLocalization } from '../context/LocalizationContext';
import { getAvatarComponent } from '../components/VectorIcons';
import { CustomButton } from '../components/CustomButton';
import { speak } from '../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface CharacterSelectScreenProps {
  onNavigate: (screen: string) => void;
}

const CHARACTERS: { id: CharacterType; nameKey: 'unisexBoy' | 'unisexGirl' | 'fox' | 'panda' | 'kitten' | 'robot' }[] = [
  { id: 'boy', nameKey: 'unisexBoy' },
  { id: 'girl', nameKey: 'unisexGirl' },
  { id: 'fox', nameKey: 'fox' },
  { id: 'panda', nameKey: 'panda' },
  { id: 'kitten', nameKey: 'kitten' },
  { id: 'robot', nameKey: 'robot' },
];

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({ onNavigate }) => {
  const { selectCharacter, character } = useGame();
  const { t, language } = useLocalization();
  const [selected, setSelected] = useState<CharacterType>(character || 'panda');

  const handleSelect = (charId: CharacterType, nameKey: string) => {
    setSelected(charId);
    speak(t(nameKey as any), language);
  };

  const handleConfirm = async () => {
    await selectCharacter(selected);
    onNavigate(character ? 'profile' : 'home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {character !== null && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigate('profile')}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <ArrowLeft size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('chooseCharacter')}</Text>
        
        <View style={styles.grid}>
          {CHARACTERS.map((char) => {
            const isSelected = selected === char.id;
            return (
              <TouchableOpacity
                key={char.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(char.id, char.nameKey)}
              >
                <View style={styles.avatarWrapper}>
                  {getAvatarComponent(char.id, 90)}
                </View>
                <Text style={[styles.name, isSelected && styles.nameSelected]}>
                  {t(char.nameKey as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton 
            title={t('play')} 
            color="#FF9800" 
            borderColor="#FFE082" 
            size="large"
            onPress={handleConfirm} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Verde clarinho relaxante
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'System',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    marginVertical: 10,
  },
  card: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#C8E6C9',
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF9C4',
    borderWidth: 4,
    transform: [{ scale: 1.03 }],
  },
  avatarWrapper: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E342E',
    marginTop: 10,
    textAlign: 'center',
  },
  nameSelected: {
    color: '#E65100',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
});
