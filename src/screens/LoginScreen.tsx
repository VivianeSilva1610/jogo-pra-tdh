import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { useLocalization } from '../context/LocalizationContext';
import { MascotLumi } from '../components/MascotLumi';
import Svg, { Path, G } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);

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

      // Se for ambiente nativo (celular), precisamos abrir o navegador seguro manualmente
      if (Platform.OS !== 'web' && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        
        if (result.type === 'success' && result.url) {
          // Processar a URL de redirecionamento contendo os tokens de acesso
          const parsedUrl = new URL(result.url);
          // O token e o refresh token podem vir como parâmetros de busca ou no hash da URL
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
    <View style={styles.container}>
      <View style={styles.welcomeCard}>
        {/* Título Principal */}
        <Text style={styles.title}>Aventura das Letras 🌟</Text>
        
        {/* Lumi Acolhedor */}
        <View style={styles.lumiWrapper}>
          <MascotLumi text="Olá! Sou o Lumi. Para iniciarmos nossa jornada mágica pelo mundo das letras, peça para o papai ou para a mamãe fazer o login!" />
        </View>

        {/* Botão de Login com Google */}
        <View style={styles.buttonWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color="#6A1B9A" style={{ marginVertical: 15 }} />
          ) : (
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleGoogleLogin} 
              style={styles.googleButton}
            >
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
              <Text style={styles.googleButtonText}>Entrar com o Google</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informações adicionais de privacidade */}
        <Text style={styles.footerText}>
          Ao fazer login, você concorda em salvar com segurança o progresso de aprendizado e as métricas do jogo.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Verde clarinho lúdico
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#FFFDF0', // Amarelo bem clarinho fofo
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#81C784', // Borda verde fofa
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  lumiWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 15,
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    borderBottomWidth: 7, // Efeito 3D fofo de botão
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#37474F',
  },
  footerText: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
    lineHeight: 18,
  },
});
