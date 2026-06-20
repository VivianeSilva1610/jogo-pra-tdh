import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StarIcon, ChestIcon } from './VectorIcons';

interface ProgressBarProps {
  current: number; // 0 a 4
  total?: number;  // padrão 5
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total = 5 }) => {
  // Garantir limites
  const safeCurrent = Math.max(0, Math.min(current % total, total));

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barProgress, 
            { width: `${(safeCurrent / total) * 100}%` }
          ]} 
        />
      </View>
      
      <View style={styles.checkpoints}>
        {Array.from({ length: total }).map((_, index) => {
          const isCompleted = index < safeCurrent;
          const isCurrent = index === safeCurrent;

          return (
            <View key={index} style={styles.starWrapper}>
              <StarIcon 
                size={isCurrent ? 28 : 22} 
                color={isCompleted ? '#FFD700' : '#E0E0E0'} 
              />
              {isCurrent && <View style={styles.activeDot} />}
            </View>
          );
        })}
        
        {/* Ícone de Baú no final da barra */}
        <View style={styles.chestWrapper}>
          <ChestIcon size={34} isOpen={false} />
          <Text style={styles.chestText}>{total - safeCurrent}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginVertical: 5,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '85%',
    position: 'absolute',
    top: 22,
    zIndex: 1,
  },
  barProgress: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 4,
  },
  checkpoints: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  starWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#29B6F6',
    position: 'absolute',
    bottom: -8,
  },
  chestWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  chestText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E65100',
    marginTop: -2,
  },
});
