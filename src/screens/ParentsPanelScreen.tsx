import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { useLocalization, LanguageType } from '../context/LocalizationContext';
import { useGame } from '../context/GameContext';
import { CustomButton } from '../components/CustomButton';
import { ArrowLeft, BookOpen, Clock, Settings, Shield, Users } from 'lucide-react-native';
import { fetchChildren, deleteChild, getParentPinHash, setParentPinHash, syncChildProfile, loadParentSubscription, createStripeSession } from '../services/supabase';
import { Linking } from 'react-native';

interface ParentsPanelScreenProps {
  onNavigate: (screen: string) => void;
  onSwitchChild?: () => void;
}

const AVATAR_EMOJIS: Record<string, string> = {
  panda: '🐼', fox: '🦊', kitten: '🐱', robot: '🤖', boy: '👦', girl: '👧',
};

export const ParentsPanelScreen: React.FC<ParentsPanelScreenProps> = ({ onNavigate, onSwitchChild }) => {
  const { t, setLanguage, language } = useLocalization();
  const {
    childId,
    parentId,
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

  // PIN gate state
  type PinMode = 'loading' | 'verify' | 'setup' | 'setup_confirm';
  const [pinMode, setPinMode] = useState<PinMode>('loading');
  const [storedPinHash, setStoredPinHash] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [setupFirstPin, setSetupFirstPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  const [children, setChildren] = useState<any[]>([]);
  const [loadingKids, setLoadingKids] = useState(false);

  const [subPeriodEnd, setSubPeriodEnd] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  // FNV-1a hash (pure JS — deterministic, no deps)
  const hashPin = useCallback((pin: string, salt: string): string => {
    const str = pin + ':' + salt;
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }, []);

  useEffect(() => {
    if (!parentId) return;
    getParentPinHash(parentId).then((hash) => {
      setStoredPinHash(hash);
      setPinMode(hash ? 'verify' : 'setup');
    });
  }, [parentId]);

  useEffect(() => {
    if (unlocked && parentId) {
      setLoadingKids(true);
      fetchChildren().then((kids) => {
        setChildren(kids);
        setLoadingKids(false);
      });
      loadParentSubscription(parentId).then((sub) => {
        setSubPeriodEnd(sub.currentPeriodEnd);
      });
    }
  }, [unlocked, parentId]);

  const handlePinDigit = useCallback(async (digit: string | 'del') => {
    if (digit === 'del') {
      setEnteredPin(p => p.slice(0, -1));
      setPinError('');
      return;
    }
    const next = enteredPin + digit;
    setEnteredPin(next);

    if (next.length < 4) return;

    // Auto-submit when 4 digits are entered
    const salt = parentId ?? '';

    if (pinMode === 'verify') {
      const entered = hashPin(next, salt);
      if (entered === storedPinHash) {
        setUnlocked(true);
      } else {
        setPinError('PIN incorreto. Tente novamente.');
        setEnteredPin('');
      }
    } else if (pinMode === 'setup') {
      setSetupFirstPin(next);
      setEnteredPin('');
      setPinMode('setup_confirm');
    } else if (pinMode === 'setup_confirm') {
      if (next === setupFirstPin) {
        setSavingPin(true);
        const hash = hashPin(next, salt);
        const ok = await setParentPinHash(salt, hash);
        setSavingPin(false);
        if (ok) {
          setStoredPinHash(hash);
          setUnlocked(true);
        } else {
          setPinError('Erro ao salvar PIN. Verifique sua conexão.');
          setEnteredPin('');
        }
      } else {
        setPinError('Os PINs não combinam. Tente novamente.');
        setEnteredPin('');
        setPinMode('setup');
        setSetupFirstPin('');
      }
    }
  }, [enteredPin, pinMode, setupFirstPin, storedPinHash, parentId, hashPin]);

  const handleResetChild = (child: any) => {
    Alert.alert(
      'Zerar progresso',
      `Zerar todo o progresso de "${child.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Zerar',
          style: 'destructive',
          onPress: async () => {
            if (!parentId) return;
            if (child.id === childId) {
              // Criança ativa: reseta estado local + Supabase
              await resetGameProgress();
            } else {
              // Outra criança: só reseta no Supabase
              await syncChildProfile(child.id, parentId, {
                stars: 0, coins: 0, challengesCompleted: 0,
                character: child.avatar ?? null,
                avatarName: child.name,
                equippedClothing: null,
                unlockedStickers: [], unlockedClothing: [],
                learnedLetters: [], masteredSyllables: [], readWords: [],
                dailyUsageSeconds: {}, isPremium: false,
              });
            }
            Alert.alert('Pronto!', `O progresso de "${child.name}" foi zerado.`);
          },
        },
      ]
    );
  };

  const handleDeleteChild = (child: any) => {
    Alert.alert(
      'Remover criança',
      `Remover o perfil de "${child.name}"? Todo o progresso será perdido.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await deleteChild(child.id);
            const kids = await fetchChildren();
            setChildren(kids);
          },
        },
      ]
    );
  };

  const handleSubscribe = async () => {
    setStripeLoading(true);
    const url = await createStripeSession('checkout');
    setStripeLoading(false);
    if (!url) {
      Alert.alert('Erro', 'Não foi possível abrir o checkout. Tente novamente.');
      return;
    }
    if (Platform.OS === 'web') {
      window.location.href = url; // redireciona na mesma aba (evita bloqueio de popup)
    } else {
      await Linking.openURL(url);
    }
  };

  const handleManageSubscription = async () => {
    setStripeLoading(true);
    const url = await createStripeSession('portal');
    setStripeLoading(false);
    if (!url) {
      Alert.alert('Erro', 'Não foi possível abrir o portal. Tente novamente.');
      return;
    }
    if (Platform.OS === 'web') {
      window.location.href = url;
    } else {
      await Linking.openURL(url);
    }
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Calcular tempo total de uso em minutos
  const totalSeconds = Object.values(dailyUsageSeconds).reduce((a, b) => a + b, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Gate do PIN
  if (!unlocked) {
    const pinTitle = pinMode === 'loading'
      ? 'Carregando...'
      : pinMode === 'setup'
        ? 'Criar PIN de Acesso'
        : pinMode === 'setup_confirm'
          ? 'Confirme seu PIN'
          : t('parentsGateTitle');

    const pinSubtitle = pinMode === 'setup'
      ? 'Escolha um PIN de 4 dígitos para proteger este painel'
      : pinMode === 'setup_confirm'
        ? 'Digite o PIN novamente para confirmar'
        : t('parentsGateSubtitle');

    return (
      <SafeAreaView style={styles.gateContainer}>
        <View style={styles.gateCard}>
          <Shield size={48} color="#9C27B0" style={{ marginBottom: 10 }} />
          <Text style={styles.gateTitle}>{pinTitle}</Text>
          <Text style={styles.gateSubtitle}>{pinSubtitle}</Text>

          {/* 4 dots display */}
          <View style={stylesPP.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[stylesPP.pinDot, i < enteredPin.length && stylesPP.pinDotFilled]}
              />
            ))}
          </View>

          {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

          {/* NumPad */}
          {pinMode !== 'loading' && !savingPin && (
            <View style={stylesPP.numPad}>
              {['1','2','3','4','5','6','7','8','9','','0','del'].map((key) => (
                key === '' ? (
                  <View key="empty" style={stylesPP.numPadEmpty} />
                ) : (
                  <TouchableOpacity
                    key={key}
                    style={stylesPP.numKey}
                    activeOpacity={0.7}
                    onPress={() => handlePinDigit(key as string | 'del')}
                  >
                    <Text style={stylesPP.numKeyText}>{key === 'del' ? '⌫' : key}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          )}

          {savingPin && <ActivityIndicator size="large" color="#9C27B0" style={{ marginVertical: 20 }} />}

          <TouchableOpacity
            style={{ marginTop: 16, padding: 10 }}
            onPress={() => onNavigate('home')}
          >
            <Text style={{ color: '#78909C', fontWeight: 'bold', fontSize: 14 }}>{t('back')}</Text>
          </TouchableOpacity>
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

        {/* CARD DE PROGRESSO ACADÊMICO — premium only */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={20} color="#2E7D32" />
            <Text style={[styles.cardTitle, { color: '#2E7D32' }]}>Relatório Escolar</Text>
            {isPremium && <Text style={stylesPP.premiumBadge}>⭐ Premium</Text>}
          </View>

          {isPremium ? (
            <>
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
            </>
          ) : (
            <View style={stylesPP.reportLocked}>
              {/* Contadores desfocados como teaser */}
              <View style={[styles.statsRow, { opacity: 0.25 }]}>
                <View style={styles.statBox}>
                  <Text style={styles.statCount}>--</Text>
                  <Text style={styles.statLabel}>{t('lettersLearned')}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statCount}>--</Text>
                  <Text style={styles.statLabel}>{t('syllablesMastered')}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statCount}>--</Text>
                  <Text style={styles.statLabel}>{t('wordsRead')}</Text>
                </View>
              </View>
              <View style={stylesPP.reportLockOverlay}>
                <Text style={stylesPP.reportLockEmoji}>🔒</Text>
                <Text style={stylesPP.reportLockTitle}>Disponível no Premium</Text>
                <Text style={stylesPP.reportLockDesc}>
                  Acompanhe letras, sílabas e palavras que a criança dominou com o Plano Premium.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* CARD DE CRIANÇAS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={20} color="#7B1FA2" />
            <Text style={[styles.cardTitle, { color: '#7B1FA2' }]}>Crianças</Text>
          </View>

          {loadingKids ? (
            <ActivityIndicator size="small" color="#7B1FA2" />
          ) : (
            <>
              {children.map((child) => (
                <View key={child.id} style={stylesPP.kidRow}>
                  <Text style={stylesPP.kidEmoji}>{AVATAR_EMOJIS[child.avatar] ?? '😊'}</Text>
                  <Text style={stylesPP.kidName}>{child.name}</Text>
                  <TouchableOpacity
                    style={stylesPP.kidResetBtn}
                    onPress={() => handleResetChild(child)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={stylesPP.kidResetText}>Zerar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[stylesPP.kidDeleteBtn, { marginLeft: 6 }]}
                    onPress={() => handleDeleteChild(child)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={stylesPP.kidDeleteText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {onSwitchChild && children.length > 1 && (
                <View style={{ marginTop: 12 }}>
                  <CustomButton
                    title="Trocar criança ativa"
                    color="#9C27B0"
                    borderColor="#7B1FA2"
                    onPress={onSwitchChild}
                  />
                </View>
              )}

              {onSwitchChild && children.length === 0 && (
                <View style={{ marginTop: 4 }}>
                  <CustomButton
                    title="Criar perfil de criança"
                    color="#9C27B0"
                    borderColor="#7B1FA2"
                    onPress={onSwitchChild}
                  />
                </View>
              )}
            </>
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

          {/* Assinatura Premium */}
          <View style={stylesPP.subCard}>
            <View style={stylesPP.subHeader}>
              <Text style={stylesPP.subTitle}>⭐ {t('premiumClub')}</Text>
              <View style={[stylesPP.subBadge, isPremium ? stylesPP.subBadgePro : stylesPP.subBadgeFree]}>
                <Text style={stylesPP.subBadgeText}>{isPremium ? 'PRO' : 'FREE'}</Text>
              </View>
            </View>

            {isPremium ? (
              <>
                {subPeriodEnd && (
                  <Text style={stylesPP.subExpiry}>
                    Ativo até {formatDate(subPeriodEnd)}
                  </Text>
                )}
                <TouchableOpacity
                  style={[stylesPP.subBtn, { backgroundColor: '#546E7A' }]}
                  onPress={handleManageSubscription}
                  disabled={stripeLoading}
                >
                  {stripeLoading
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={stylesPP.subBtnText}>Gerenciar Assinatura</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={stylesPP.subDesc}>{t('premiumSubtitle')}</Text>
                <TouchableOpacity
                  style={[stylesPP.subBtn, { backgroundColor: '#FF9800' }]}
                  onPress={handleSubscribe}
                  disabled={stripeLoading}
                >
                  {stripeLoading
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={stylesPP.subBtnText}>Assinar Premium ⭐</Text>}
                </TouchableOpacity>
              </>
            )}
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

const stylesPP = StyleSheet.create({
  premiumBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFD54F',
    fontSize: 11,
    fontWeight: '900',
    color: '#E65100',
  },
  reportLocked: {
    position: 'relative',
  },
  reportLockOverlay: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9FBE7',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0F4C3',
    marginTop: 8,
  },
  reportLockEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  reportLockTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#558B2F',
    marginBottom: 4,
  },
  reportLockDesc: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
    lineHeight: 17,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 16,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9C27B0',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#9C27B0',
  },
  numPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 240,
    gap: 12,
    marginTop: 4,
  },
  numKey: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E5F5',
    borderWidth: 2,
    borderColor: '#CE93D8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  numPadEmpty: {
    width: 64,
    height: 64,
  },
  numKeyText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4A148C',
  },
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  kidEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  kidName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#37474F',
  },
  subCard: {
    marginTop: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#E65100',
  },
  subBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  subBadgePro: { backgroundColor: '#4CAF50' },
  subBadgeFree: { backgroundColor: '#B0BEC5' },
  subBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subExpiry: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 10,
  },
  subDesc: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 10,
  },
  subBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  subBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  kidResetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  kidResetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E65100',
  },
  kidDeleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  kidDeleteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C62828',
  },
});
