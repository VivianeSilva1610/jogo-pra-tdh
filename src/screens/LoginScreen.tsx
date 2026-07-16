import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, Platform, ActivityIndicator, Alert, SafeAreaView, Easing, TextInput, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { useLocalization } from '../context/LocalizationContext';
import { MascotLumi } from '../components/MascotLumi';
import { LumiIcon } from '../components/VectorIcons';
import Svg, { Path, G } from 'react-native-svg';
import { EnchantedBackground } from '../components/EnchantedBackground';
import { THEME_COLORS, FONT_SIZES } from '../styles/theme';
import { playSound } from '../services/audio';
import { speak } from '../services/speech';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const { t, language } = useLocalization();
  const [loading, setLoading] = useState(false);

  // Animação do Lumi flutuar
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Animação de pulsação da aura do Lumi
  const auraScale = useRef(new Animated.Value(0.95)).current;
  // Animação do botão Google ao pressionar
  const buttonScale = useRef(new Animated.Value(1)).current;
  // Animação do botão Email
  const emailButtonScale = useRef(new Animated.Value(1)).current;

  // Estados para email e senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('O app foi atualizado! Se você já tinha conta, talvez precise redefinir sua senha.');

  useEffect(() => {
    // 1. Loop de flutuação de Lumi
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Loop de pulsação da aura
    Animated.loop(
      Animated.sequence([
        Animated.timing(auraScale, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(auraScale, {
          toValue: 0.95,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Falar a instrução de boas-vindas ao carregar (usa idioma detectado do sistema)
    speak(`${t('loginWelcomeTitle')} ${t('loginWelcomeText')} ${t('loginHelpText')}`, language);
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailPressIn = () => {
    Animated.spring(emailButtonScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailPressOut = () => {
    Animated.spring(emailButtonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const migratedEmails = [
    'vivianemiriane.dasilva.14791@studenti.iuline.it',
    'claramirianecaca@gmail.com',
    'nicolajmellace5@gmail.com',
    'casaalmelhordobrasil@gmail.com'
  ];

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email) {
      Alert.alert('Atenção', 'Preencha o email');
      return;
    }

    try {
      setLoading(true);

      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: Platform.OS === 'web' ? window.location.origin + '/' : 'aventuradasletras://',
        });
        if (error) throw error;
        Alert.alert('Sucesso!', 'Verifique seu email para redefinir a senha.');
        setIsResetMode(false);
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        // The family and child_profiles creation will happen via createChildWithProfile called elsewhere
        // But for "Caso A", the family must be created. We do this automatically in createChildWithProfile now.
        Alert.alert('Conta criada', 'Sua conta foi criada! Faça login agora.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
             if (migratedEmails.includes(email.trim().toLowerCase())) {
                setIsResetMode(true);
                Alert.alert('Atualização de Segurança', 'Sua conta foi migrada para o novo sistema Interativo. Por favor, redefina sua senha enviando um link para o seu email.');
             } else {
                Alert.alert('Erro', 'Senha ou email incorretos.');
             }
          } else {
            throw error;
          }
        }
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err.message);
      if (Platform.OS === 'web') {
        alert('Erro ao autenticar: ' + err.message);
      } else {
        Alert.alert('Erro', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const redirectUri = Platform.OS === 'web' 
        ? window.location.origin + '/' 
        : 'aventuradasletras://';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) throw error;

      // Se for ambiente nativo, abre o navegador seguro
      if (Platform.OS !== 'web' && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        
        if (result.type === 'success' && result.url) {
          const parsedUrl = new URL(result.url);
          const accessToken = parsedUrl.searchParams.get('access_token') || parsedUrl.hash.match(/access_token=([^&]+)/)?.[1];
          const refreshToken = parsedUrl.searchParams.get('refresh_token') || parsedUrl.hash.match(/refresh_token=([^&]+)/)?.[1];
          
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (sessionError) throw sessionError;
          }
        }
      }
    } catch (err: any) {
      console.error('Erro no login com Google:', err.message);
      if (Platform.OS === 'web') {
        alert('Erro ao realizar login: ' + err.message);
      } else {
        Alert.alert('Erro no Login', 'Não foi possível autenticar com a conta Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <EnchantedBackground>
      <SafeAreaView style={styles.safeArea}>
        
        {/* LOGO BUBBLY INFANTIL */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={[styles.logoLetter, { color: THEME_COLORS.natureGreen }]}>A</Text>
            <Text style={[styles.logoLetter, { color: THEME_COLORS.goldenYellow }]}>B</Text>
            <Text style={[styles.logoLetter, { color: THEME_COLORS.magicPurple }]}>C</Text>
          </View>
          <Text style={styles.logoTitle}>{t('appName')}</Text>
        </View>

        {/* MASCOTE LUMI GIGANTE FLUTUANTE */}
        <View style={styles.lumiSection}>
          <Animated.View style={[styles.lumiWrapper, { transform: [{ translateY: floatAnim }] }]}>
            {/* Círculo de Brilho de Fundo */}
            <Animated.View style={[styles.lumiGlowCircle, { transform: [{ scale: auraScale }] }]} />
            <LumiIcon size={120} />
          </Animated.View>

          {/* BALÃO DE DIÁLOGO */}
          <View style={styles.speechBubble}>
            <View style={styles.speechArrow} />
            <View style={styles.bubbleInner}>
              <Text style={styles.welcomeTitle}>{t('loginWelcomeTitle')}</Text>
              <Text style={styles.welcomeText}>{t('loginWelcomeText')}</Text>
              <Text style={[styles.helpText, { color: THEME_COLORS.orangeDark, marginBottom: 5 }]}>{updateMessage}</Text>
            </View>
          </View>
        </View>

        {/* FORMULÁRIO DE EMAIL/SENHA */}
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Seu Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!isResetMode && (
            <TextInput
              style={styles.input}
              placeholder="Sua Senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          )}

          <View style={styles.emailButtonsRow}>
            <TouchableWithoutFeedback
              onPressIn={handleEmailPressIn}
              onPressOut={handleEmailPressOut}
              onPress={() => handleEmailAuth(false)}
              disabled={loading}
            >
              <Animated.View style={[styles.emailButton, { transform: [{ scale: emailButtonScale }] }]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.emailButtonText}>{isResetMode ? 'Enviar Email de Redefinição' : 'Entrar'}</Text>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>

            {!isResetMode && (
              <TouchableWithoutFeedback
                onPressIn={handleEmailPressIn}
                onPressOut={handleEmailPressOut}
                onPress={() => handleEmailAuth(true)}
                disabled={loading}
              >
                <Animated.View style={[styles.emailButton, styles.signupButton, { transform: [{ scale: emailButtonScale }] }]}>
                  <Text style={styles.emailButtonText}>Criar Conta</Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            )}
          </View>

          {!isResetMode && (
            <TouchableOpacity onPress={() => setIsResetMode(true)} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          )}
          {isResetMode && (
            <TouchableOpacity onPress={() => setIsResetMode(false)} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Voltar ao Login</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.orText}>ou</Text>

        {/* BOTÃO DE LOGIN GOOGLE */}
        <View style={styles.actionSection}>
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Animated.View style={[styles.googleButton, { transform: [{ scale: buttonScale }] }]}>
              {loading ? (
                <ActivityIndicator size="small" color="#5D4037" />
              ) : (
                <>
                  {/* Ícone Google em SVG */}
                  <Svg width={24} height={24} viewBox="0 0 24 24" style={styles.googleIcon}>
                    <G>
                      <Path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <Path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <Path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <Path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </G>
                  </Svg>
                  <Text style={styles.googleButtonText}>{t('loginGoogleBtn')}</Text>
                </>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
          <Text style={styles.footerText}>{t('loginFooter')}</Text>
        </View>

        {/* PRÉ-VISUALIZAÇÃO DO MAPA */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>{t('loginPreviewTitle')}</Text>
          <View style={styles.worldsRow}>
            <View style={styles.worldCol}>
              <Text style={styles.worldEmoji}>🌳</Text>
              <Text style={styles.worldName}>{t('worldGarden')}</Text>
            </View>
            <View style={[styles.worldCol, styles.worldLocked]}>
              <View style={styles.lockBadge}><Text style={styles.lockText}>🔒</Text></View>
              <Text style={styles.worldEmoji}>🌲</Text>
              <Text style={styles.worldName}>{t('worldForest')}</Text>
            </View>
            <View style={[styles.worldCol, styles.worldLocked]}>
              <View style={styles.lockBadge}><Text style={styles.lockText}>🔒</Text></View>
              <Text style={styles.worldEmoji}>🏡</Text>
              <Text style={styles.worldName}>{t('worldVale')}</Text>
            </View>
            <View style={[styles.worldCol, styles.worldLocked]}>
              <View style={styles.lockBadge}><Text style={styles.lockText}>🔒</Text></View>
              <Text style={styles.worldEmoji}>🏰</Text>
              <Text style={styles.worldName}>{t('worldCastle')}</Text>
            </View>
            <View style={[styles.worldCol, styles.worldLocked]}>
              <View style={styles.lockBadge}><Text style={styles.lockText}>🔒</Text></View>
              <Text style={styles.worldEmoji}>📚</Text>
              <Text style={styles.worldName}>{t('worldLibrary')}</Text>
            </View>
          </View>
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
    paddingVertical: 15,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '900',
    marginHorizontal: 4,
    textShadowColor: 'rgba(93, 64, 55, 0.4)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 3,
  },
  logoTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
    textAlign: 'center',
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  lumiSection: {
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    marginVertical: 15,
  },
  lumiWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  lumiGlowCircle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 235, 59, 0.3)',
    shadowColor: '#FFF9C4',
    shadowRadius: 15,
    shadowOpacity: 0.8,
    zIndex: -1,
  },
  speechBubble: {
    width: '100%',
    backgroundColor: THEME_COLORS.softWhite,
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: THEME_COLORS.goldenYellow,
    padding: 16,
    shadowColor: THEME_COLORS.brownDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    position: 'relative',
  },
  speechArrow: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -12,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: THEME_COLORS.goldenYellow,
  },
  bubbleInner: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.subheading,
    fontWeight: '900',
    color: THEME_COLORS.orangeDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: THEME_COLORS.brownDark,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  helpText: {
    fontSize: FONT_SIZES.micro,
    fontWeight: 'bold',
    color: '#78909C',
    textAlign: 'center',
  },
  actionSection: {
    width: '85%',
    maxWidth: 360,
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#E0E0E0',
    borderBottomWidth: 7,
    paddingVertical: 12,
    paddingHorizontal: 22,
    shadowColor: THEME_COLORS.brownDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    width: '100%',
  },
  formSection: {
    width: '85%',
    maxWidth: 360,
    alignItems: 'center',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 22,
    fontSize: FONT_SIZES.body,
    color: THEME_COLORS.brownDark,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif',
  },
  emailButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  emailButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.magicPurple,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#7E57C2',
    borderBottomWidth: 6,
    paddingVertical: 12,
    marginHorizontal: 5,
  },
  signupButton: {
    backgroundColor: THEME_COLORS.natureGreen,
    borderColor: '#388E3C',
  },
  emailButtonText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  forgotBtn: {
    marginTop: 10,
  },
  forgotText: {
    color: THEME_COLORS.brownDark,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  orText: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    color: '#78909C',
    marginVertical: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: FONT_SIZES.micro,
    color: '#78909C',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 8,
    fontWeight: 'bold',
  },
  previewContainer: {
    width: '92%',
    maxWidth: 460,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  previewTitle: {
    fontSize: FONT_SIZES.micro,
    fontWeight: '900',
    color: THEME_COLORS.brownDark,
    letterSpacing: 1,
    marginBottom: 6,
  },
  worldsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  worldCol: {
    alignItems: 'center',
    width: '18%',
    position: 'relative',
  },
  worldLocked: {
    opacity: 0.55,
  },
  lockBadge: {
    position: 'absolute',
    top: -5,
    right: 2,
    backgroundColor: THEME_COLORS.goldenYellow,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#FFF',
    zIndex: 2,
  },
  // Exceção intencional à escala FONT_SIZES: este é o emoji 🔒 dentro de um
  // badge decorativo de 14x14px, não texto de leitura. Forçar para 12px
  // estouraria o badge.
  lockText: {
    fontSize: 8,
  },
  worldEmoji: {
    fontSize: FONT_SIZES.heading,
  },
  worldName: {
    fontSize: FONT_SIZES.micro,
    fontWeight: '800',
    color: THEME_COLORS.brownDark,
    marginTop: 2,
    textAlign: 'center',
  },
});
