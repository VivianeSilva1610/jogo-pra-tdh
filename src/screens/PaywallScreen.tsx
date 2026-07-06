import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { MascotLumi } from '../components/MascotLumi';
import { FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { useLocalization } from '../context/LocalizationContext';

interface Props {
  onNavigate: (screen: string) => void;
}

export const PaywallScreen: React.FC<Props> = ({ onNavigate }) => {
  const { t } = useLocalization();

  const PERKS = [
    t('paywallPerk1'),
    t('paywallPerk2'),
    t('paywallPerk3'),
    t('paywallPerk4'),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.inner, Platform.OS === 'web' && styles.innerWeb]}>

        <Text style={styles.lockEmoji}>🔐</Text>
        <Text style={styles.title}>{t('paywallTitle')}</Text>

        <MascotLumi text={t('paywallLumiMsg')} />

        <View style={styles.perksCard}>
          <Text style={styles.perksTitle}>{t('paywallPerksTitle')}</Text>
          {PERKS.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => onNavigate('parents')}
        >
          <Text style={styles.ctaBtnText}>{t('paywallCta')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => onNavigate('map')}
        >
          <Text style={styles.backBtnText}>{t('paywallBack')}</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7F6',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  innerWeb: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  lockEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 8,
  },
  perksCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#CE93D8',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  perksTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#6A1B9A',
    marginBottom: 12,
    textAlign: 'center',
  },
  perkRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#F3E5F5',
  },
  perkText: {
    fontSize: FONT_SIZES.body,
    color: '#37474F',
    fontWeight: FONT_WEIGHTS.regular,
  },
  ctaBtn: {
    backgroundColor: '#7B1FA2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#4A148C',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 14,
  },
  ctaBtnText: {
    fontSize: FONT_SIZES.subheading,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: '#FFF',
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backBtnText: {
    fontSize: FONT_SIZES.caption,
    color: '#7E57C2',
    fontWeight: FONT_WEIGHTS.bold,
  },
});
