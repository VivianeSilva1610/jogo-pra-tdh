import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { MascotLumi } from '../components/MascotLumi';
import { CustomButton } from '../components/CustomButton';
import { getAvatarComponent } from '../components/VectorIcons';
import { EnchantedBackground } from '../components/EnchantedBackground';
import { THEME_COLORS } from '../styles/theme';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { t } = useLocalization();
  const { character, equippedClothing, coins, stars } = useGame();

  return (
    <EnchantedBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={[styles.scoreBadge, { borderColor: THEME_COLORS.goldenYellow }]}>
            <Text style={styles.scoreText}>⭐ {stars}</Text>
          </View>
          <View style={[styles.scoreBadge, { borderColor: THEME_COLORS.goldenYellow }]}>
            <Text style={styles.scoreText}>🪙 {coins}</Text>
          </View>
        </View>

        {/* LOGO */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={[styles.logoLetter, { color: THEME_COLORS.natureGreen }]}>A</Text>
            <Text style={[styles.logoLetter, { color: THEME_COLORS.goldenYellow }]}>B</Text>
            <Text style={[styles.logoLetter, { color: THEME_COLORS.magicPurple }]}>C</Text>
          </View>
          <Text style={styles.logoTitle}>{t('appName')}</Text>
        </View>

        {/* PERSONAGEM */}
        {character && (
          <View style={styles.characterContainer}>
            <View style={styles.characterCircle}>
              {getAvatarComponent(character, 120, equippedClothing)}
            </View>
          </View>
        )}

        {/* MENU E BOTOES COM LUMI */}
        <View style={styles.menuContainer}>
          {/* Lumi posicionado logo acima do botão Jogar */}
          <View style={styles.lumiWrapper}>
            <MascotLumi text={t('lumiGreeting')} />
          </View>

          <CustomButton
            title={`🚀 ${t('play')}!`}
            color={THEME_COLORS.magicPurple}
            borderColor="#715DF5"
            size="large"
            onPress={() => onNavigate('map')}
          />

          <View style={styles.rowButtons}>
            <View style={styles.col}>
              <CustomButton
                title={`🎨 ${t('collection')}`}
                color={THEME_COLORS.natureGreen}
                borderColor="#7CC676"
                textColor="#5D4037"
                onPress={() => onNavigate('collection')}
              />
            </View>
            <View style={styles.col}>
              <CustomButton
                title={`👤 ${t('profile')}`}
                color={THEME_COLORS.goldenYellow}
                borderColor="#F4BD3F"
                textColor="#5D4037"
                onPress={() => onNavigate('profile')}
              />
            </View>
          </View>

          <CustomButton
            title={`🔒 ${t('parents')}`}
            color={THEME_COLORS.skyBlue}
            borderColor="#84D2FA"
            textColor="#5D4037"
            size="small"
            onPress={() => onNavigate('parents')}
          />
        </View>
      </SafeAreaView>
    </EnchantedBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    backgroundColor: THEME_COLORS.softWhite,
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 3,
    shadowColor: THEME_COLORS.brownDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  logoCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  logoLetter: {
    fontSize: 54,
    fontWeight: '900',
    marginHorizontal: 5,
    textShadowColor: 'rgba(93, 64, 55, 0.4)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 3,
  },
  logoTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  characterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 4,
    borderColor: THEME_COLORS.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.brownDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  menuContainer: {
    width: '100%',
    paddingHorizontal: 25,
    maxWidth: 400,
  },
  lumiWrapper: {
    marginBottom: 5,
    marginTop: -5,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  col: {
    width: '48%',
  },
});
