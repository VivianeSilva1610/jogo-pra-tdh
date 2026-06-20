import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalization, LanguageType } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { CustomButton } from '../components/CustomButton';
import { ArrowLeft, BarChart2, BookOpen, Clock, Settings, Volume2, Shield } from 'lucide-react-native';

interface ParentsPanelScreenProps {
  onNavigate: (screen: string) => void;
}

export const ParentsPanelScreen: React.FC<ParentsPanelScreenProps> = ({ onNavigate }) => {
  const { t, setLanguage, language } = useLocalization();
  const {
    learnedLetters,
    masteredSyllables,
    readWords,
    soundEnabled,
    setSoundEnabled,
    isPremium,
    setIsPremium,
    dailyUsageSeconds,
    resetGameProgress,
  } = useGame();

  const [unlocked, setUnlocked] = useState(false);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [gateError, setGateError] = useState('');

  // Gerar novos números para o cálculo de segurança ao carregar
  useEffect(() => {
    setNum1(Math.floor(Math.random() * 8) + 2); // 2 a 9
    setNum2(Math.floor(Math.random() * 8) + 2);
  }, []);

  const handleVerifyGate = () => {
    const expected = num1 + num2;
    if (parseInt(answer.trim(), 10) === expected) {
      setUnlocked(true);
      setGateError('');
    } else {
      setGateError(t('parentsGateIncorrect'));
      setAnswer('');
      // Gerar nova pergunta
      setNum1(Math.floor(Math.random() * 8) + 2);
      setNum2(Math.floor(Math.random() * 8) + 2);
    }
  };

  const handleReset = () => {
    Alert.alert(
      t('resetProgress'),
      t('resetConfirm'),
      [
        { text: t('back'), style: 'cancel' },
        { 
          text: 'Ok', 
          style: 'destructive',
          onPress: async () => {
            await resetGameProgress();
            setLanguage('pt');
            onNavigate('character_select');
          }
        }
      ]
    );
  };

  // Calcular tempo total de uso em minutos
  const totalSeconds = Object.values(dailyUsageSeconds).reduce((a, b) => a + b, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Tela de bloqueio (Segurança)
  if (!unlocked) {
    return (
      <SafeAreaView style={styles.gateContainer}>
        <View style={styles.gateCard}>
          <Shield size={48} color="#9C27B0" style={{ marginBottom: 10 }} />
          <Text style={styles.gateTitle}>{t('parentsGateTitle')}</Text>
          <Text style={styles.gateSubtitle}>{t('parentsGateSubtitle')}</Text>
          
          <Text style={styles.mathQuestion}>
            {t('parentsGateQuestion', { num1, num2 })}
          </Text>

          <TextInput
            style={styles.textInput}
            keyboardType="number-pad"
            value={answer}
            onChangeText={setAnswer}
            placeholder={t('parentsGatePlaceholder')}
            maxLength={3}
            autoFocus
          />

          {gateError ? <Text style={styles.errorText}>{gateError}</Text> : null}

          <View style={styles.gateButtons}>
            <View style={{ width: '48%' }}>
              <CustomButton
                title={t('back')}
                color="#ECEFF1"
                borderColor="#CFD8DC"
                textColor="#37474F"
                onPress={() => onNavigate('home')}
              />
            </View>
            <View style={{ width: '48%' }}>
              <CustomButton
                title="Ok"
                color="#9C27B0"
                borderColor="#7B1FA2"
                onPress={handleVerifyGate}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Painel dos Pais liberado
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
        <Text style={styles.headerTitle}>{t('parentsTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CARD DE TEMPO E USO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#0288D1" />
            <Text style={[styles.cardTitle, { color: '#0288D1' }]}>{t('timePlayed')}</Text>
          </View>
          <Text style={styles.timeValue}>
            {totalMinutes} <Text style={styles.timeUnit}>{t('minutes')}</Text>
          </Text>
          <View style={styles.weeklyChart}>
            {Object.keys(dailyUsageSeconds).map((day) => {
              const seconds = dailyUsageSeconds[day] || 0;
              const barHeight = Math.min(Math.max((seconds / 300) * 40, 4), 40); // cap a 40px para a barra de progresso do dia
              return (
                <View key={day} style={styles.chartCol}>
                  <View style={[styles.chartBar, { height: barHeight }]} />
                  <Text style={styles.chartDay}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* CARD DE PROGRESSO ACADÊMICO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={20} color="#2E7D32" />
            <Text style={[styles.cardTitle, { color: '#2E7D32' }]}>Relatório Escolar</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{learnedLetters.length}</Text>
              <Text style={styles.statLabel}>{t('lettersLearned')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{masteredSyllables.length}</Text>
              <Text style={styles.statLabel}>{t('syllablesMastered')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{readWords.length}</Text>
              <Text style={styles.statLabel}>{t('wordsRead')}</Text>
            </View>
          </View>

          {learnedLetters.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listLabel}>Letras Conhecidas:</Text>
              <Text style={styles.listTags}>{learnedLetters.join(', ')}</Text>
            </View>
          )}

          {masteredSyllables.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listLabel}>Sílabas Dominadas:</Text>
              <Text style={styles.listTags}>{masteredSyllables.join(', ')}</Text>
            </View>
          )}

          {readWords.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listLabel}>Palavras Lidas:</Text>
              <Text style={styles.listTags}>{readWords.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* CARD DE CONFIGURAÇÕES */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Settings size={20} color="#7B1FA2" />
            <Text style={[styles.cardTitle, { color: '#7B1FA2' }]}>{t('parentsTitle')}</Text>
          </View>

          {/* Controle de áudio */}
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>{t('soundToggle')}</Text>
            <TouchableOpacity 
              style={[styles.toggleBtn, soundEnabled ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setSoundEnabled(!soundEnabled)}
            >
              <Text style={styles.toggleText}>{soundEnabled ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* Controle de Idioma */}
          <Text style={styles.settingGroupLabel}>{t('languageSelect')}</Text>
          <View style={styles.langGrid}>
            {(['pt', 'en', 'it', 'es'] as LanguageType[]).map((lang) => {
              const isSelected = language === lang;
              const labelMap = { pt: 'PT-BR', en: 'EN', it: 'IT', es: 'ES' };
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langBtn, isSelected && styles.langBtnSelected]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                    {labelMap[lang]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Assinatura Premium Simulator */}
          <View style={[styles.settingRow, { marginTop: 15 }]}>
            <View>
              <Text style={[styles.settingText, { color: '#E65100' }]}>{t('premiumClub')} ⭐</Text>
              <Text style={styles.premiumDesc}>{t('premiumSubtitle')}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggleBtn, isPremium ? styles.toggleOn : styles.premiumOff]}
              onPress={() => setIsPremium(!isPremium)}
            >
              <Text style={styles.toggleText}>{isPremium ? 'PRO' : 'FREE'}</Text>
            </TouchableOpacity>
          </View>

          {/* Reiniciar progresso */}
          <View style={{ marginTop: 25 }}>
            <CustomButton
              title={`⚠️ ${t('resetProgress')}`}
              color="#FF5252"
              borderColor="#D32F2F"
              onPress={handleReset}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    backgroundColor: '#7E57C2', // Roxo calmo
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gateCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4E342E',
    marginBottom: 8,
  },
  gateSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  mathQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 15,
  },
  textInput: {
    width: '60%',
    height: 48,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  gateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: '#9C27B0',
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#37474F',
    textAlign: 'center',
    marginBottom: 15,
  },
  timeUnit: {
    fontSize: 16,
    color: '#78909C',
    fontWeight: 'normal',
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    paddingHorizontal: 10,
  },
  chartCol: {
    alignItems: 'center',
  },
  chartBar: {
    width: 14,
    backgroundColor: '#29B6F6',
    borderRadius: 7,
  },
  chartDay: {
    fontSize: 11,
    color: '#78909C',
    marginTop: 6,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 10,
    color: '#78909C',
    textAlign: 'center',
    marginTop: 2,
  },
  listSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    paddingTop: 8,
  },
  listLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#546E7A',
    marginBottom: 3,
  },
  listTags: {
    fontSize: 13,
    color: '#4E342E',
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37474F',
  },
  settingGroupLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#78909C',
    marginTop: 15,
    marginBottom: 8,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#4CAF50',
  },
  toggleOff: {
    backgroundColor: '#B0BEC5',
  },
  premiumOff: {
    backgroundColor: '#FFA726',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  premiumDesc: {
    fontSize: 11,
    color: '#78909C',
    marginTop: 1,
  },
  langGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  langBtn: {
    flex: 1,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#B0BEC5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    backgroundColor: '#FAFAFA',
  },
  langBtnSelected: {
    borderColor: '#7B1FA2',
    backgroundColor: '#E1BEE7',
  },
  langText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#546E7A',
  },
  langTextSelected: {
    color: '#7B1FA2',
  },
});
