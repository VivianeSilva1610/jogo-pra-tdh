import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LocalizationProvider, useLocalization } from './src/context/LocalizationContext';
import { GameProvider, useGame } from './src/context/GameContext';
import { fetchChildren } from './src/services/supabase';
import { ChildSelectorScreen } from './src/screens/ChildSelectorScreen';

// Import Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen';
import { GameMapScreen } from './src/screens/GameMapScreen';
import { ParentsPanelScreen } from './src/screens/ParentsPanelScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';

// Import Minigames
import { MundoDasSilabas } from './src/screens/games/MundoDasLetras';
import { SilabasCamufladas } from './src/screens/games/LetrasCamufladas';
import { CapturaDeSilabas } from './src/screens/games/CapturaLetras';
import { SomESilabas } from './src/screens/games/SomELetra';
import { MonteAPalavra } from './src/screens/games/MonteAPalavra';
import { FlorestaPalavras } from './src/screens/games/FlorestaPalavras';
import { CasteloFrases } from './src/screens/games/CasteloFrases';

// Import Components & Services
import { RewardChest } from './src/components/RewardChest';
import { MascotLumi } from './src/components/MascotLumi';
import { CustomButton } from './src/components/CustomButton';
import { startBgMusic, stopBgMusic } from './src/services/audio';
import { supabase } from './src/services/supabase';

function GameAppContent({
  childId,
  parentId,
  initError,
  onRetry,
  onSwitchChild,
  onSelectChild,
  isInitializingChild,
}: {
  childId: string | null;
  parentId: string | null;
  initError: string | null;
  onRetry: () => void;
  onSwitchChild: () => void;
  onSelectChild: (id: string) => void;
  isInitializingChild: boolean;
}) {
  const { character, soundEnabled, isLoadingProfile } = useGame();
  const { t } = useLocalization();

  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Detecta retorno do Stripe Checkout (?payment=success) na web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 4000);
    }
  }, []);

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
    if (checkingAuth || isLoadingProfile || isInitializingChild) {
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

    // Se houver erro de inicialização (ex: falha ao criar perfil), mostra tela de erro e recuperação
    if (initError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: '#D32F2F', textAlign: 'center', marginHorizontal: 20, marginBottom: 10 }]}>
            ⚠️ {initError}
          </Text>
          <View style={{ width: '80%', maxWidth: 300, marginTop: 15 }}>
            <CustomButton
              title="Tentar Novamente"
              color="#4CAF50"
              borderColor="#388E3C"
              onPress={onRetry}
            />
          </View>
          <View style={{ width: '80%', maxWidth: 300, marginTop: 12 }}>
            <CustomButton
              title="Sair da Conta"
              color="#FF5252"
              borderColor="#D32F2F"
              onPress={async () => {
                await supabase.auth.signOut();
              }}
            />
          </View>
        </View>
      );
    }

    // Sem filho selecionado → seletor de perfis (primeiro acesso ou troca)
    if (!childId) {
      return (
        <ChildSelectorScreen
          parentId={parentId ?? ''}
          isPremium={false}
          onSelectChild={onSelectChild}
        />
      );
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
        return <ParentsPanelScreen onNavigate={setCurrentScreen} onSwitchChild={onSwitchChild} />;
      case 'paywall':
        return <PaywallScreen onNavigate={setCurrentScreen} />;
      case 'collection':
        return <CollectionScreen onNavigate={setCurrentScreen} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      
      // Minijogos
      case 'game_1':
        return <MundoDasSilabas onBack={() => setCurrentScreen('map')} />;
      case 'game_2':
        return <SilabasCamufladas onBack={() => setCurrentScreen('map')} />;
      case 'game_3':
        return <CapturaDeSilabas onBack={() => setCurrentScreen('map')} />;
      case 'game_4':
        return <SomESilabas onBack={() => setCurrentScreen('map')} />;
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

      {/* Banner de pagamento confirmado */}
      {paymentSuccess && (
        <View style={stylesApp.paymentBanner}>
          <Text style={stylesApp.paymentBannerText}>🎉 Assinatura Premium ativada!</Text>
        </View>
      )}

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

// ─────────────────────────────────────────────────────────────
// Root App: um único filho por conta, criado automaticamente
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  const [isInitializingChild, setIsInitializingChild] = useState<boolean>(true);
  // Referência para evitar chamadas duplicadas ao initChild para a mesma sessão
  const lastInitedUserId = React.useRef<string | null>(null);

  const handleRetry = () => {
    lastInitedUserId.current = null;
    setActiveChildId(null);
    setInitError(null);
    setIsInitializingChild(true);
    setRetryTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const initChild = async (session: any) => {
      if (!session) {
        setActiveChildId(null);
        setActiveParentId(null);
        setInitError(null);
        setIsInitializingChild(false);
        lastInitedUserId.current = null;
        return;
      }
      setIsInitializingChild(true);

      const parentId = session.user.id;

      // Evitar re-inicializar se já foi feito para este usuário neste ciclo
      if (lastInitedUserId.current === parentId) {
        return;
      }
      lastInitedUserId.current = parentId;

      setActiveParentId(parentId);
      setInitError(null);

      // Garantir que a linha do pai exista na tabela public.parents para evitar erro de chave estrangeira
      try {
        const { data: parentData, error: fetchParentError } = await supabase
          .from('parents')
          .select('id')
          .eq('id', parentId)
          .maybeSingle();

        if (fetchParentError) {
          throw new Error('Falha ao verificar perfil do responsável: ' + fetchParentError.message);
        }

        if (!parentData) {
          console.log('Pai não encontrado na tabela public.parents. Criando...');
          
          const parentEmail = session.user.email || 'sem-email@oauth.com';
          const { error: insertParentError } = await supabase
            .from('parents')
            .insert([{ id: parentId, email: parentEmail }]);

          if (insertParentError) {
            throw new Error('Erro ao cadastrar perfil do responsável: ' + insertParentError.message);
          } else {
            console.log('Cadastro do pai inserido manualmente com sucesso.');
            // Se o trigger da DB falhou ou não existe, criar também a assinatura padrão inicial
            const { error: insertSubError } = await supabase
              .from('subscriptions')
              .insert([{ parent_id: parentId, plan: 'free', status: 'active' }]);
            
            if (insertSubError) {
              console.warn('Aviso ao cadastrar assinatura padrão:', insertSubError.message);
            }
          }
        }
      } catch (err: any) {
        console.error('Erro de permissão ou conexão na verificação do responsável:', err);
        setInitError(err.message || 'Erro ao conectar ao banco de dados do responsável.');
        setIsInitializingChild(false);
        return;
      }

      // Buscar filhos cadastrados
      try {
        const kids = await fetchChildren();

        if (kids.length === 1) {
          // Família com uma criança → auto-selecionar (UX conveniente)
          setActiveChildId(kids[0].id);
        } else {
          // 0 filhos (primeiro acesso) ou 2+ filhos → mostrar ChildSelectorScreen
          setActiveChildId(null);
        }
      } catch (err: any) {
        console.error('Erro de permissão ou conexão na busca da criança:', err);
        setInitError(err.message || 'Erro ao buscar o perfil da criança.');
      } finally {
        setIsInitializingChild(false);
      }
    };

    // Verificar sessão atual primeiro
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      initChild(session);
    });

    // Ouvir mudanças de autenticação (login, logout, token refresh)
    // SIGNED_IN pode duplicar com getSession, por isso usamos a ref lastInitedUserId para deduplicar
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        // Ao sair, limpar tudo
        lastInitedUserId.current = null;
        setActiveChildId(null);
        setActiveParentId(null);
        setInitError(null);
      } else {
        initChild(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [retryTrigger]);

  return (
    <LocalizationProvider>
      <GameProvider childId={activeChildId} parentId={activeParentId}>
        <GameAppContent
          childId={activeChildId}
          parentId={activeParentId}
          initError={initError}
          onRetry={handleRetry}
          onSwitchChild={() => setActiveChildId(null)}
          onSelectChild={setActiveChildId}
          isInitializingChild={isInitializingChild}
        />
      </GameProvider>
    </LocalizationProvider>
  );
}


const stylesApp = StyleSheet.create({
  paymentBanner: {
    position:        'absolute',
    bottom:          40,
    left:            20,
    right:           20,
    backgroundColor: '#2E7D32',
    borderRadius:    14,
    paddingVertical: 14,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    5,
    elevation:       8,
    zIndex:          999,
  },
  paymentBannerText: {
    color:      '#FFF',
    fontSize:   16,
    fontWeight: 'bold',
  },
});

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
