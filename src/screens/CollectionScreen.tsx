import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useGame, STICKERS_LIST, CLOTHING_LIST, StickerItem, ClothingItem } from '../context/GameContext';
import { CustomButton } from '../components/CustomButton';
import { StarIcon, CoinIcon, getAvatarComponent } from '../components/VectorIcons';
import { ArrowLeft, Gift } from 'lucide-react-native';

interface CollectionScreenProps {
  onNavigate: (screen: string) => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onNavigate }) => {
  const { t } = useLocalization();
  const {
    coins,
    stars,
    character,
    unlockedStickers,
    unlockedClothing,
    equippedClothing,
    buySticker,
    buyClothing,
    equipClothing,
    isPremium,
    setIsPremium,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'stickers' | 'shop'>('stickers');
  const [errorMsg, setErrorMsg] = useState('');

  const handleBuySticker = async (sticker: StickerItem) => {
    setErrorMsg('');
    const success = await buySticker(sticker.id, sticker.cost);
    if (!success) {
      setErrorMsg(t('notEnoughCoins'));
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const handleBuyClothing = async (clothing: ClothingItem) => {
    setErrorMsg('');
    const success = await buyClothing(clothing.id, clothing.cost);
    if (!success) {
      setErrorMsg(t('notEnoughCoins'));
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const handleEquip = (clothingId: string) => {
    if (equippedClothing === clothingId) {
      equipClothing(null); // Desequipar
    } else {
      equipClothing(clothingId); // Equipar
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('collection')}</Text>

        <View style={styles.scores}>
          <View style={styles.scoreBadge}>
            <CoinIcon size={18} />
            <Text style={styles.scoreText}>{coins}</Text>
          </View>
        </View>
      </View>

      {/* BANNER PREMIUM (Preparação para Assinatura) */}
      {!isPremium && (
        <TouchableOpacity 
          style={styles.premiumBanner}
          activeOpacity={0.9}
          onPress={() => onNavigate('parents')}
        >
          <Gift size={20} color="#FFF" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumBannerTitle}>{t('premiumClub')}</Text>
            <Text style={styles.premiumBannerSub}>{t('premiumSubtitle')}</Text>
          </View>
          <Text style={styles.premiumBadge}>PRO</Text>
        </TouchableOpacity>
      )}

      {/* TABS SELECTOR */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'stickers' && styles.tabButtonActive]}
          onPress={() => setActiveTab('stickers')}
        >
          <Text style={[styles.tabText, activeTab === 'stickers' && styles.tabTextActive]}>
            🖼️ {t('stickerBook')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'shop' && styles.tabButtonActive]}
          onPress={() => setActiveTab('shop')}
        >
          <Text style={[styles.tabText, activeTab === 'shop' && styles.tabTextActive]}>
            🛍️ {t('avatarShop')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ERROR MESSAGE FLOAT */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'stickers' ? (
          /* TAB 1: ALBUM DE FIGURINHAS */
          <View style={styles.stickersGrid}>
            {STICKERS_LIST.map((sticker) => {
              const isUnlocked = unlockedStickers.includes(sticker.id);
              
              // Figurinha Premium de simulação
              const isPremiumSticker = sticker.id === 'sticker_unicorn' || sticker.id === 'sticker_dragon';
              const shouldBlock = isPremiumSticker && !isPremium;

              return (
                <View key={sticker.id} style={[styles.stickerCard, isUnlocked && styles.stickerUnlocked]}>
                  {shouldBlock ? (
                    <View style={styles.premiumBlock}>
                      <Text style={styles.padlock}>🔒</Text>
                      <Text style={styles.premiumBlockText}>PRO</Text>
                    </View>
                  ) : isUnlocked ? (
                    <View style={styles.stickerEmojiContainer}>
                      <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.stickerLockContainer}
                      onPress={() => handleBuySticker(sticker)}
                    >
                      <Text style={styles.stickerLockEmoji}>❓</Text>
                      <View style={styles.costBadge}>
                        <CoinIcon size={12} />
                        <Text style={styles.costText}>{sticker.cost}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.stickerName}>
                    {isUnlocked ? sticker.id.split('_')[1].toUpperCase() : '???'}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          /* TAB 2: LOJA DE ROUPAS E ACESSORIOS */
          <View style={styles.shopContainer}>
            {/* Visualização em tempo real do Personagem no Provador */}
            {character && (
              <View style={styles.dressingRoom}>
                <Text style={styles.dressingRoomTitle}>Provador Virtual</Text>
                {getAvatarComponent(character, 110, equippedClothing)}
              </View>
            )}

            <View style={styles.clothingList}>
              {CLOTHING_LIST.map((item) => {
                const isUnlocked = unlockedClothing.includes(item.id);
                const isEquipped = equippedClothing === item.id;

                return (
                  <View key={item.id} style={styles.clothingCard}>
                    <View style={styles.clothingIconBg}>
                      <Text style={styles.clothingEmoji}>{item.emoji}</Text>
                    </View>
                    
                    <View style={styles.clothingInfo}>
                      <Text style={styles.clothingName}>
                        {t(item.nameKey as any)}
                      </Text>
                      <Text style={styles.clothingCostText}>
                        {isUnlocked ? t('equipped') : `🪙 ${item.cost}`}
                      </Text>
                    </View>

                    <View style={styles.clothingAction}>
                      {isUnlocked ? (
                        <CustomButton
                          title={isEquipped ? 'Desequipar' : t('equip')}
                          color={isEquipped ? '#ECEFF1' : '#00BCD4'}
                          borderColor={isEquipped ? '#CFD8DC' : '#0097A7'}
                          textColor={isEquipped ? '#37474F' : '#FFF'}
                          size="small"
                          onPress={() => handleEquip(item.id)}
                        />
                      ) : (
                        <CustomButton
                          title={t('buy')}
                          color="#4CAF50"
                          borderColor="#388E3C"
                          size="small"
                          onPress={() => handleBuyClothing(item)}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    color: '#00BCD4',
  },
  scores: {
    flexDirection: 'row',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#37474F',
    marginLeft: 4,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 10,
    borderRadius: 14,
  },
  premiumBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  premiumBannerSub: {
    fontSize: 11,
    color: '#FFE082',
    marginTop: 1,
  },
  premiumBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF9800',
    backgroundColor: '#FFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    padding: 4,
    marginHorizontal: 10,
    borderRadius: 14,
    marginBottom: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#757575',
  },
  tabTextActive: {
    color: '#00BCD4',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 10,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerCard: {
    width: '31%',
    aspectRatio: 0.85,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginVertical: 6,
  },
  stickerUnlocked: {
    backgroundColor: '#E0F7FA',
    borderColor: '#4DD0E1',
  },
  stickerEmojiContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerEmoji: {
    fontSize: 34,
  },
  stickerLockContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerLockEmoji: {
    fontSize: 24,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  costText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginLeft: 2,
  },
  premiumBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padlock: {
    fontSize: 20,
  },
  premiumBlockText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  stickerName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78909C',
    textAlign: 'center',
  },
  shopContainer: {
    width: '100%',
  },
  dressingRoom: {
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#80DEEA',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  dressingRoomTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0097A7',
    marginBottom: 8,
  },
  clothingList: {
    width: '100%',
  },
  clothingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 1,
  },
  clothingIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clothingEmoji: {
    fontSize: 26,
  },
  clothingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clothingName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#37474F',
  },
  clothingCostText: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '700',
    marginTop: 2,
  },
  clothingAction: {
    width: 100,
  },
});
