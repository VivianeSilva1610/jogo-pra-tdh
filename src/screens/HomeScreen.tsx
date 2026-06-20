import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { MascotLumi } from '../components/MascotLumi';
import { CustomButton } from '../components/CustomButton';
import { getAvatarComponent } from '../components/VectorIcons';
import { playSound } from '../services/audio';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { t } = useLocalization();
  const { character, equippedClothing, coins, stars } = useGame();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Placas de pontuação rápidas */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>⭐ {stars}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>🪙 {coins}</Text>
        </View>
      </View>

      <MascotLumi text={t('lumiGreeting')} />

      <View style={styles.logoContainer}>
        {/* Desenho do Logo Estilizado */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>A</Text>
          <Text style={[styles.logoLetter, { color: '#E91E63' }]}>B</Text>
          <Text style={[styles.logoLetter, { color: '#FFEB3B' }]}>C</Text>
        </View>
        <Text style={styles.logoTitle}>{t('appName')}</Text>
      </View>

      {/* Exibir Personagem Escolhido com Acessórios */}
      {character && (
        <View style={styles.characterContainer}>
          {getAvatarComponent(character, 120, equippedClothing)}
        </View>
      )}

      {/* Botões Principais */}
      <View style={styles.menuContainer}>
        <CustomButton
          title={`🚀 ${t('play')}!`}
          color="#FF9800"
          borderColor="#F57C00"
          size="large"
          onPress={() => onNavigate('map')}
        />

        <View style={styles.rowButtons}>
          <View style={styles.col}>
            <CustomButton
              title={`🎨 ${t('collection')}`}
              color="#00BCD4"
              borderColor="#0097A7"
              onPress={() => onNavigate('collection')}
            />
          </View>
          <View style={styles.col}>
            <CustomButton
              title={`👤 ${t('profile')}`}
              color="#E91E63"
              borderColor="#C2185B"
              onPress={() => onNavigate('profile')}
            />
          </View>
        </View>

        <CustomButton
          title={`🔒 ${t('parents')}`}
          color="#9C27B0"
          borderColor="#7B1FA2"
          size="small"
          onPress={() => onNavigate('parents')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Azul celeste calmo
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  scoreBadge: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#BBDEFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#37474F',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logoCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  logoLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4CAF50',
    marginHorizontal: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1565C0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'System',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
  },
  menuContainer: {
    width: '100%',
    paddingHorizontal: 30,
    maxWidth: 400,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  col: {
    width: '48%',
  },
});
