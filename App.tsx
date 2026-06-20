import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LocalizationProvider, useLocalization } from './src/context/LocalizationContext';
import { GameProvider, useGame } from './src/context/GameContext';

// Import Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen';
import { GameMapScreen } from './src/screens/GameMapScreen';
import { ParentsPanelScreen } from './src/screens/ParentsPanelScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';

// Import Minigames
import { MundoDasLetras } from './src/screens/games/MundoDasLetras';
import { LetrasCamufladas } from './src/screens/games/LetrasCamufladas';
import { CapturaLetras } from './src/screens/games/CapturaLetras';
import { SomELetra } from './src/screens/games/SomELetra';
import { MonteAPalavra } from './src/screens/games/MonteAPalavra';
import { FlorestaPalavras } from './src/screens/games/FlorestaPalavras';
import { CasteloFrases } from './src/screens/games/CasteloFrases';

// Import Components & Services
import { RewardChest } from './src/components/RewardChest';
import { MascotLumi } from './src/components/MascotLumi';
import { CustomButton } from './src/components/CustomButton';
import { startBgMusic, stopBgMusic } from './src/services/audio';
import { supabase } from './src/services/supabase';

function GameAppContent() {
  const { character, soundEnabled } = useGame();
  const { t } = useLocalization();

  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Estados para Controle de Sessão TDAH (Pausa recomendada a cada 5 min)
  const [secondsPlayed, setSecondsPlayed] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Estados de Autenticação Supabase
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Monitorar estado de autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitorar carregamento do personagem inicial
  useEffect(() => {
    // Só exige seleção se já estiver logado e não tiver personagem salvo
    if (session && character === null) {
      setCurrentScreen('character_select');
    } else if (character !== null && currentScreen === 'character_select') {
      setCurrentScreen('home');
    }
  }, [character, session]);

  // Trilha sonora de fundo
  useEffect(() => {
    // Só toca música se estiver logado
    if (session && soundEnabled) {
      startBgMusic(true);
    } else {
      stopBgMusic();
    }
    return () => {
      stopBgMusic();
    };
  }, [soundEnabled, session]);

  // Cronômetro para TDAH: Lembrete de descanso a cada 5 minutos (300 segundos)
  useEffect(() => {
    // Só conta tempo se estiver logado
    if (!session) return;

    const interval = setInterval(() => {
      setSecondsPlayed((prev) => {
        const next = prev + 5;
        if (next >= 300) {
          setShowBreakModal(true);
          return 0; // reset
        }
        return next;
      });
    }, 5000); // rodar a cada 5s para controle interno

    return () => clearInterval(interval);
  }, [session]);

  const handleSelectGame = (gameId: string) => {
    setActiveGameId(gameId);
    setCurrentScreen(gameId);
  };

  const handleResumeFromBreak = () => {
    setShowBreakModal(false);
    setSecondsPlayed(0);
  };

  // Roteador de Telas por Estado
  const renderScreen = () => {
    if (checkingAuth) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando o mundo das letras...</Text>
        </View>
      );
    }

    if (!session) {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'character_select':
        return <CharacterSelectScreen onNavigate={setCurrentScreen} />;
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'map':
        return (
          <GameMapScreen 
            onNavigate={setCurrentScreen} 
            onSelectGame={handleSelectGame} 
          />
        );
      case 'parents':
        return <ParentsPanelScreen onNavigate={setCurrentScreen} />;
      case 'collection':
        return <CollectionScreen onNavigate={setCurrentScreen} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      
      // Minijogos
      case 'game_1':
        return <MundoDasLetras onBack={() => setCurrentScreen('map')} />;
      case 'game_2':
        return <LetrasCamufladas onBack={() => setCurrentScreen('map')} />;
      case 'game_3':
        return <CapturaLetras onBack={() => setCurrentScreen('map')} />;
      case 'game_4':
        return <SomELetra onBack={() => setCurrentScreen('map')} />;
      case 'game_5':
        return <MonteAPalavra onBack={() => setCurrentScreen('map')} />;
      case 'game_6':
        return <FlorestaPalavras onBack={() => setCurrentScreen('map')} />;
      case 'game_7':
        return <CasteloFrases onBack={() => setCurrentScreen('map')} />;
        
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  const isWeb = Platform.OS === 'web';

  const content = (
    <View style={[styles.appContainer, isWeb && styles.appContainerWeb]}>
      <StatusBar style="auto" />
      {renderScreen()}

      {/* Baú de Recompensas Surpresa Global */}
      <RewardChest />

      {/* Modal de Sessão TDAH (Pausa de Descanso após 5 min) */}
      <Modal
        visible={showBreakModal}
        transparent={true}
        animationType="slide"
      >
        <SafeAreaView style={styles.breakOverlay}>
          <View style={[styles.breakCard, isWeb && { maxWidth: 500 }]}>
            <Text style={styles.breakTitle}>🧸 {t('timeForBreak')}</Text>
            
            <MascotLumi text={t('breakSubtitle')} />
            
            <View style={styles.breakAnimCircle}>
              <Text style={styles.breakEmoji}>💧🧘‍♂️🍎</Text>
            </View>

            <View style={{ width: '80%', marginTop: 20 }}>
              <CustomButton
                title={t('continuePlaying')}
                color="#4CAF50"
                borderColor="#388E3C"
                onPress={handleResumeFromBreak}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );

  if (isWeb) {
    return (
      <View style={styles.outerContainer}>
        {content}
      </View>
    );
  }

  return content;
}

export default function App() {
  return (
    <LocalizationProvider>
      <GameProvider>
        <GameAppContent />
      </GameProvider>
    </LocalizationProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Sleek soft cool gray background for desktop margins
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  appContainerWeb: {
    width: '100%',
    maxWidth: 600,
    height: '100%',
    alignSelf: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  breakOverlay: {
    flex: 1,
    backgroundColor: 'rgba(126, 87, 194, 0.9)', // Roxo acolhedor semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakCard: {
    width: '85%',
    backgroundColor: '#FFFDF0',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#BA68C8',
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  breakTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 10,
    textAlign: 'center',
  },
  breakAnimCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1BEE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    borderWidth: 3,
    borderColor: '#BA68C8',
  },
  breakEmoji: {
    fontSize: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
