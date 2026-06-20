import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useLocalization } from '../../context/LocalizationContext';
import { useGame } from '../../context/GameContext';
import { MascotLumi } from '../../components/MascotLumi';
import { ProgressBar } from '../../components/ProgressBar';
import { playSound } from '../../services/audio';
import { speak } from '../../services/speech';
import { ArrowLeft } from 'lucide-react-native';

interface MonteAPalavraProps {
  onBack: () => void;
}

interface WordOption {
  emoji: string;
  langMap: Record<string, { word: string; soundText: string }>;
}

const WORDS_POOL: WordOption[] = [
  { emoji: '🏠', langMap: { pt: { word: 'CASA', soundText: 'Casa' }, en: { word: 'HOUSE', soundText: 'House' }, it: { word: 'CASA', soundText: 'Casa' }, es: { word: 'CASA', soundText: 'Casa' } } },
  { emoji: '⚽', langMap: { pt: { word: 'BOLA', soundText: 'Bola' }, en: { word: 'BALL', soundText: 'Ball' }, it: { word: 'PALLA', soundText: 'Palla' }, es: { word: 'BOLA', soundText: 'Bola' } } },
  { emoji: '🚂', langMap: { pt: { word: 'TREM', soundText: 'Trem' }, en: { word: 'TRAIN', soundText: 'Train' }, it: { word: 'TRENO', soundText: 'Treno' }, es: { word: 'TREN', soundText: 'Tren' } } },
  { emoji: '🐱', langMap: { pt: { word: 'GATO', soundText: 'Gato' }, en: { word: 'CAT', soundText: 'Cat' }, it: { word: 'GATTO', soundText: 'Gatto' }, es: { word: 'GATO', soundText: 'Gato' } } },
  { emoji: '🍎', langMap: { pt: { word: 'MAÇÃ', soundText: 'Maçã' }, en: { word: 'APPLE', soundText: 'Apple' }, it: { word: 'MELA', soundText: 'Mela' }, es: { word: 'MANZANA', soundText: 'Manzana' } } },
  { emoji: '🐶', langMap: { pt: { word: 'CÃO', soundText: 'Cão' }, en: { word: 'DOG', soundText: 'Dog' }, it: { word: 'CANE', soundText: 'Cane' }, es: { word: 'PERRO', soundText: 'Perro' } } },
  { emoji: '☀️', langMap: { pt: { word: 'SOL', soundText: 'Sol' }, en: { word: 'SUN', soundText: 'Sun' }, it: { word: 'SOLE', soundText: 'Sole' }, es: { word: 'SOL', soundText: 'Sol' } } },
  { emoji: '🌙', langMap: { pt: { word: 'LUA', soundText: 'Lua' }, en: { word: 'MOON', soundText: 'Moon' }, it: { word: 'LUNA', soundText: 'Luna' }, es: { word: 'LUNA', soundText: 'Luna' } } },
  { emoji: '🎲', langMap: { pt: { word: 'DADO', soundText: 'Dado' }, en: { word: 'DICE', soundText: 'Dice' }, it: { word: 'DADO', soundText: 'Dado' }, es: { word: 'DADO', soundText: 'Dado' } } },
  { emoji: '🎂', langMap: { pt: { word: 'BOLO', soundText: 'Bolo' }, en: { word: 'CAKE', soundText: 'Cake' }, it: { word: 'TORTA', soundText: 'Torta' }, es: { word: 'PASTEL', soundText: 'Pastel' } } },
  { emoji: '🐸', langMap: { pt: { word: 'SAPO', soundText: 'Sapo' }, en: { word: 'FROG', soundText: 'Frog' }, it: { word: 'RANA', soundText: 'Rana' }, es: { word: 'SAPO', soundText: 'Sapo' } } },
  { emoji: '🔥', langMap: { pt: { word: 'FOGO', soundText: 'Fogo' }, en: { word: 'FIRE', soundText: 'Fire' }, it: { word: 'FUOCO', soundText: 'Fuoco' }, es: { word: 'FUEGO', soundText: 'Fuego' } } },
  { emoji: '🦁', langMap: { pt: { word: 'LEÃO', soundText: 'Leão' }, en: { word: 'LION', soundText: 'Lion' }, it: { word: 'LEONE', soundText: 'Leone' }, es: { word: 'LEÓN', soundText: 'León' } } },
  { emoji: '🍇', langMap: { pt: { word: 'UVA', soundText: 'Uva' }, en: { word: 'GRAPE', soundText: 'Grape' }, it: { word: 'UVA', soundText: 'Uva' }, es: { word: 'UVA', soundText: 'Uva' } } },
  { emoji: '🐻', langMap: { pt: { word: 'URSO', soundText: 'Urso' }, en: { word: 'BEAR', soundText: 'Bear' }, it: { word: 'ORSO', soundText: 'Orso' }, es: { word: 'OSO', soundText: 'Oso' } } },
  { emoji: '🐵', langMap: { pt: { word: 'MACACO', soundText: 'Macaco' }, en: { word: 'MONKEY', soundText: 'Monkey' }, it: { word: 'SCIMMIA', soundText: 'Scimmia' }, es: { word: 'MONO', soundText: 'Mono' } } },
  { emoji: '🐟', langMap: { pt: { word: 'PEIXE', soundText: 'Peixe' }, en: { word: 'FISH', soundText: 'Fish' }, it: { word: 'PESCE', soundText: 'Pesce' }, es: { word: 'PEZ', soundText: 'Pez' } } },
  { emoji: '🐺', langMap: { pt: { word: 'LOBO', soundText: 'Lobo' }, en: { word: 'WOLF', soundText: 'Wolf' }, it: { word: 'LUPO', soundText: 'Lupo' }, es: { word: 'LOBO', soundText: 'Lobo' } } },
  { emoji: '🦆', langMap: { pt: { word: 'PATO', soundText: 'Pato' }, en: { word: 'DUCK', soundText: 'Duck' }, it: { word: 'ANATRA', soundText: 'Anatra' }, es: { word: 'PATO', soundText: 'Pato' } } },
  { emoji: '🐭', langMap: { pt: { word: 'RATO', soundText: 'Rato' }, en: { word: 'MOUSE', soundText: 'Mouse' }, it: { word: 'TOPO', soundText: 'Topo' }, es: { word: 'RATÓN', soundText: 'Ratón' } } },
  { emoji: '🐮', langMap: { pt: { word: 'VACA', soundText: 'Vaca' }, en: { word: 'COW', soundText: 'Cow' }, it: { word: 'VACCA', soundText: 'Vacca' }, es: { word: 'VACA', soundText: 'Vaca' } } },
  { emoji: '🌹', langMap: { pt: { word: 'ROSA', soundText: 'Rosa' }, en: { word: 'ROSE', soundText: 'Rose' }, it: { word: 'ROSA', soundText: 'Rosa' }, es: { word: 'ROSA', soundText: 'Rosa' } } },
  { emoji: '🥤', langMap: { pt: { word: 'SUCO', soundText: 'Suco' }, en: { word: 'JUICE', soundText: 'Juice' }, it: { word: 'SUCCO', soundText: 'Succo' }, es: { word: 'JUGO', soundText: 'Jugo' } } },
  { emoji: '🥚', langMap: { pt: { word: 'OVO', soundText: 'Ovo' }, en: { word: 'EGG', soundText: 'Egg' }, it: { word: 'UOVO', soundText: 'Uovo' }, es: { word: 'HUEVO', soundText: 'Huevo' } } },
  { emoji: '🥾', langMap: { pt: { word: 'BOTA', soundText: 'Bota' }, en: { word: 'BOOT', soundText: 'Boot' }, it: { word: 'STIVALE', soundText: 'Stivale' }, es: { word: 'BOTA', soundText: 'Bota' } } },
  { emoji: '🚗', langMap: { pt: { word: 'CARRO', soundText: 'Carro' }, en: { word: 'CAR', soundText: 'Car' }, it: { word: 'AUTO', soundText: 'Auto' }, es: { word: 'COCHE', soundText: 'Coche' } } },
  { emoji: '🍌', langMap: { pt: { word: 'BANANA', soundText: 'Banana' }, en: { word: 'BANANA', soundText: 'Banana' }, it: { word: 'BANANA', soundText: 'Banana' }, es: { word: 'PLÁTANO', soundText: 'Plátano' } } },
  { emoji: '📚', langMap: { pt: { word: 'LIVRO', soundText: 'Livro' }, en: { word: 'BOOK', soundText: 'Book' }, it: { word: 'LIBRO', soundText: 'Libro' }, es: { word: 'LIBRO', soundText: 'Libro' } } },
  { emoji: '🍐', langMap: { pt: { word: 'PERA', soundText: 'Pera' }, en: { word: 'PEAR', soundText: 'Pear' }, it: { word: 'PERA', soundText: 'Pera' }, es: { word: 'PERA', soundText: 'Pera' } } },
  { emoji: '🥝', langMap: { pt: { word: 'KIWI', soundText: 'Kiwi' }, en: { word: 'KIWI', soundText: 'Kiwi' }, it: { word: 'KIWI', soundText: 'Kiwi' }, es: { word: 'KIWI', soundText: 'Kiwi' } } },
  { emoji: '🪁', langMap: { pt: { word: 'PIPA', soundText: 'Pipa' }, en: { word: 'KITE', soundText: 'Kite' }, it: { word: 'AQUILONE', soundText: 'Aquilone' }, es: { word: 'COMETA', soundText: 'Cometa' } } },
  { emoji: '🍞', langMap: { pt: { word: 'PÃO', soundText: 'Pão' }, en: { word: 'BREAD', soundText: 'Bread' }, it: { word: 'PANE', soundText: 'Pane' }, es: { word: 'PAN', soundText: 'Pan' } } },
  { emoji: '🍯', langMap: { pt: { word: 'MEL', soundText: 'Mel' }, en: { word: 'HONEY', soundText: 'Honey' }, it: { word: 'MIELE', soundText: 'Miele' }, es: { word: 'MIEL', soundText: 'Miel' } } },
  { emoji: '🪑', langMap: { pt: { word: 'MESA', soundText: 'Mesa' }, en: { word: 'TABLE', soundText: 'Table' }, it: { word: 'TAVOLO', soundText: 'Tavolo' }, es: { word: 'MESA', soundText: 'Mesa' } } },
  { emoji: '🛏️', langMap: { pt: { word: 'CAMA', soundText: 'Cama' }, en: { word: 'BED', soundText: 'Bed' }, it: { word: 'LETTO', soundText: 'Letto' }, es: { word: 'CAMA', soundText: 'Cama' } } },
  { emoji: '🍬', langMap: { pt: { word: 'BALA', soundText: 'Bala' }, en: { word: 'CANDY', soundText: 'Candy' }, it: { word: 'CARAMELLA', soundText: 'Caramella' }, es: { word: 'DULCE', soundText: 'Dulce' } } },
  { emoji: '🧊', langMap: { pt: { word: 'GELO', soundText: 'Gelo' }, en: { word: 'ICE', soundText: 'Ice' }, it: { word: 'GHIACCIO', soundText: 'Ghiaccio' }, es: { word: 'HIELO', soundText: 'Hielo' } } },
  { emoji: '🪵', langMap: { pt: { word: 'LAMA', soundText: 'Lama' }, en: { word: 'MUD', soundText: 'Mud' }, it: { word: 'FANGO', soundText: 'Fango' }, es: { word: 'LODO', soundText: 'Lodo' } } },
  { emoji: '🗑️', langMap: { pt: { word: 'LIXO', soundText: 'Lixo' }, en: { word: 'TRASH', soundText: 'Trash' }, it: { word: 'RIFIUTI', soundText: 'Rifiuti' }, es: { word: 'BASURA', soundText: 'Basura' } } },
  { emoji: '💼', langMap: { pt: { word: 'MALA', soundText: 'Mala' }, en: { word: 'BAG', soundText: 'Bag' }, it: { word: 'BORSA', soundText: 'Borsa' }, es: { word: 'MALETA', soundText: 'Maleta' } } },
  { emoji: '🗺️', langMap: { pt: { word: 'MAPA', soundText: 'Mapa' }, en: { word: 'MAP', soundText: 'Map' }, it: { word: 'MAPPA', soundText: 'Mappa' }, es: { word: 'MAPA', soundText: 'Mapa' } } },
  { emoji: '🌀', langMap: { pt: { word: 'MOLA', soundText: 'Mola' }, en: { word: 'SPRING', soundText: 'Spring' }, it: { word: 'MOLLA', soundText: 'Molla' }, es: { word: 'RESORTE', soundText: 'Resorte' } } },
  { emoji: '🏍️', langMap: { pt: { word: 'MOTO', soundText: 'Moto' }, en: { word: 'BIKE', soundText: 'Bike' }, it: { word: 'MOTO', soundText: 'Moto' }, es: { word: 'MOTO', soundText: 'Moto' } } },
  { emoji: '🧱', langMap: { pt: { word: 'MURO', soundText: 'Muro' }, en: { word: 'WALL', soundText: 'Wall' }, it: { word: 'MURO', soundText: 'Muro' }, es: { word: 'MURO', soundText: 'Muro' } } },
  { emoji: '🪺', langMap: { pt: { word: 'NINHO', soundText: 'Ninho' }, en: { word: 'NEST', soundText: 'Nest' }, it: { word: 'NIDO', soundText: 'Nido' }, es: { word: 'NIDO', soundText: 'Nido' } } },
  { emoji: '☁️', langMap: { pt: { word: 'NUVEM', soundText: 'Nuvem' }, en: { word: 'CLOUD', soundText: 'Cloud' }, it: { word: 'NUVOLA', soundText: 'Nuvola' }, es: { word: 'NUBE', soundText: 'Nube' } } },
  { emoji: '👁️', langMap: { pt: { word: 'OLHO', soundText: 'Olho' }, en: { word: 'EYE', soundText: 'Eye' }, it: { word: 'OCCHIO', soundText: 'Occhio' }, es: { word: 'OJO', soundText: 'Ojo' } } },
  { emoji: '🪙', langMap: { pt: { word: 'OURO', soundText: 'Ouro' }, en: { word: 'GOLD', soundText: 'Gold' }, it: { word: 'ORO', soundText: 'Oro' }, es: { word: 'ORO', soundText: 'Oro' } } },
  { emoji: '🧹', langMap: { pt: { word: 'PANO', soundText: 'Pano' }, en: { word: 'CLOTH', soundText: 'Cloth' }, it: { word: 'PANNO', soundText: 'Panno' }, es: { word: 'PAÑO', soundText: 'Paño' } } },
  { emoji: '🍲', langMap: { pt: { word: 'POTE', soundText: 'Pote' }, en: { word: 'POT', soundText: 'Pot' }, it: { word: 'PENTOLA', soundText: 'Pentola' }, es: { word: 'OLLA', soundText: 'Olla' } } },
  { emoji: '🕸️', langMap: { pt: { word: 'REDE', soundText: 'Rede' }, en: { word: 'NET', soundText: 'Net' }, it: { word: 'RETE', soundText: 'Rete' }, es: { word: 'RED', soundText: 'Red' } } },
  { emoji: '🛞', langMap: { pt: { word: 'RODA', soundText: 'Roda' }, en: { word: 'WHEEL', soundText: 'Wheel' }, it: { word: 'RUOTA', soundText: 'Ruota' }, es: { word: 'RUEDA', soundText: 'Rueda' } } },
  { emoji: '🔔', langMap: { pt: { word: 'SINO', soundText: 'Sino' }, en: { word: 'BELL', soundText: 'Bell' }, it: { word: 'CAMPANA', soundText: 'Campana' }, es: { word: 'CAMPANA', soundText: 'Campana' } } },
  { emoji: '🥣', langMap: { pt: { word: 'SOPA', soundText: 'Sopa' }, en: { word: 'SOUP', soundText: 'Soup' }, it: { word: 'ZUPPA', soundText: 'Zuppa' }, es: { word: 'SOPA', soundText: 'Sopa' } } },
  { emoji: '🛋️', langMap: { pt: { word: 'SOFÁ', soundText: 'Sofá' }, en: { word: 'SOFA', soundText: 'Sofa' }, it: { word: 'DIVANO', soundText: 'Divano' }, es: { word: 'SOFÁ', soundText: 'Sofá' } } },
  { emoji: '🕷️', langMap: { pt: { word: 'TEIA', soundText: 'Teia' }, en: { word: 'WEB', soundText: 'Web' }, it: { word: 'RAGNATELA', soundText: 'Ragnatela' }, es: { word: 'TELARAÑA', soundText: 'Telaraña' } } },
  { emoji: '🕯️', langMap: { pt: { word: 'VELA', soundText: 'Vela' }, en: { word: 'CANDLE', soundText: 'Candle' }, it: { word: 'CANDELA', soundText: 'Candela' }, es: { word: 'VELA', soundText: 'Vela' } } },
  { emoji: '💨', langMap: { pt: { word: 'VENTO', soundText: 'Vento' }, en: { word: 'WIND', soundText: 'Wind' }, it: { word: 'VENTO', soundText: 'Vento' }, es: { word: 'VIENTO', soundText: 'Viento' } } },
  { emoji: '0️⃣', langMap: { pt: { word: 'ZERO', soundText: 'Zero' }, en: { word: 'ZERO', soundText: 'Zero' }, it: { word: 'ZERO', soundText: 'Zero' }, es: { word: 'CERO', soundText: 'Cero' } } },
  { emoji: '💍', langMap: { pt: { word: 'ANEL', soundText: 'Anel' }, en: { word: 'RING', soundText: 'Ring' }, it: { word: 'ANELLO', soundText: 'Anello' }, es: { word: 'ANILLO', soundText: 'Anillo' } } },
  { emoji: '🏹', langMap: { pt: { word: 'ARCO', soundText: 'Arco' }, en: { word: 'BOW', soundText: 'Bow' }, it: { word: 'ARCO', soundText: 'Arco' }, es: { word: 'ARCO', soundText: 'Arco' } } },
  { emoji: '📦', langMap: { pt: { word: 'BAÚ', soundText: 'Baú' }, en: { word: 'CHEST', soundText: 'Chest' }, it: { word: 'BAULE', soundText: 'Baule' }, es: { word: 'COFRE', soundText: 'Cofre' } } },
  { emoji: '☕', langMap: { pt: { word: 'CAFÉ', soundText: 'Café' }, en: { word: 'COFFEE', soundText: 'Coffee' }, it: { word: 'CAFFÈ', soundText: 'Caffè' }, es: { word: 'CAFÉ', soundText: 'Café' } } },
  { emoji: '🧥', langMap: { pt: { word: 'CAPA', soundText: 'Capa' }, en: { word: 'CAPE', soundText: 'Cape' }, it: { word: 'MANTELLO', soundText: 'Mantello' }, es: { word: 'CAPA', soundText: 'Capa' } } },
  { emoji: '🥥', langMap: { pt: { word: 'COCO', soundText: 'Coco' }, en: { word: 'COCONUT', soundText: 'Coconut' }, it: { word: 'COCCO', soundText: 'Cocco' }, es: { word: 'COCO', soundText: 'Coco' } } },
  { emoji: '🍭', langMap: { pt: { word: 'DOCE', soundText: 'Doce' }, en: { word: 'SWEET', soundText: 'Sweet' }, it: { word: 'DOLCE', soundText: 'Dolce' }, es: { word: 'DULCE', soundText: 'Dulce' } } },
  { emoji: '🔪', langMap: { pt: { word: 'FACA', soundText: 'Faca' }, en: { word: 'KNIFE', soundText: 'Knife' }, it: { word: 'COLTELLO', soundText: 'Coltello' }, es: { word: 'CUCHILLO', soundText: 'Cuchillo' } } },
  { emoji: '👦', langMap: { pt: { word: 'GURI', soundText: 'Guri' }, en: { word: 'BOY', soundText: 'Boy' }, it: { word: 'BIMBO', soundText: 'Bimbo' }, es: { word: 'CHICO', soundText: 'Chico' } } },
  { emoji: '⏰', langMap: { pt: { word: 'HORA', soundText: 'Hora' }, en: { word: 'HOUR', soundText: 'Hour' }, it: { word: 'ORA', soundText: 'Ora' }, es: { word: 'HORA', soundText: 'Hora' } } },
  { emoji: '🥭', langMap: { pt: { word: 'MANGA', soundText: 'Manga' }, en: { word: 'MANGO', soundText: 'Mango' }, it: { word: 'MANGO', soundText: 'Mango' }, es: { word: 'MANGA', soundText: 'Manga' } } },
  { emoji: '💎', langMap: { pt: { word: 'JÓIA', soundText: 'Jóia' }, en: { word: 'JEWEL', soundText: 'Jewel' }, it: { word: 'GIOIELLO', soundText: 'Gioiello' }, es: { word: 'JOYA', soundText: 'Joya' } } },
  { emoji: '🥛', langMap: { pt: { word: 'LEITE', soundText: 'Leite' }, en: { word: 'MILK', soundText: 'Milk' }, it: { word: 'LATTE', soundText: 'Latte' }, es: { word: 'LECHE', soundText: 'Leche' } } },
  { emoji: '🍋', langMap: { pt: { word: 'LIMA', soundText: 'Lima' }, en: { word: 'LIME', soundText: 'Lime' }, it: { word: 'LIMETTA', soundText: 'Limetta' }, es: { word: 'LIMA', soundText: 'Lima' } } },
  { emoji: '🧪', langMap: { pt: { word: 'TUBO', soundText: 'Tubo' }, en: { word: 'TUBE', soundText: 'Tube' }, it: { word: 'TUBO', soundText: 'Tubo' }, es: { word: 'TUBO', soundText: 'Tubo' } } },
  { emoji: '👑', langMap: { pt: { word: 'REI', soundText: 'Rei' }, en: { word: 'KING', soundText: 'King' }, it: { word: 'RE', soundText: 'Re' }, es: { word: 'REY', soundText: 'Rey' } } },
  { emoji: '🐤', langMap: { pt: { word: 'BICO', soundText: 'Bico' }, en: { word: 'BEAK', soundText: 'Beak' }, it: { word: 'BECCO', soundText: 'Becco' }, es: { word: 'PICO', soundText: 'Pico' } } },
  { emoji: '👟', langMap: { pt: { word: 'TENIS', soundText: 'Tênis' }, en: { word: 'SHOE', soundText: 'Shoe' }, it: { word: 'SCARPA', soundText: 'Scarpa' }, es: { word: 'ZAPATO', soundText: 'Zapato' } } },
  { emoji: '🦶', langMap: { pt: { word: 'PÉ', soundText: 'Pé' }, en: { word: 'FOOT', soundText: 'Foot' }, it: { word: 'PIEDE', soundText: 'Piede' }, es: { word: 'PIE', soundText: 'Pie' } } },
  { emoji: '🪶', langMap: { pt: { word: 'PENA', soundText: 'Pena' }, en: { word: 'FEATHER', soundText: 'Feather' }, it: { word: 'PIUMA', soundText: 'Piuma' }, es: { word: 'PLUMA', soundText: 'Pluma' } } },
  { emoji: '💧', langMap: { pt: { word: 'POÇA', soundText: 'Poça' }, en: { word: 'PUDDLE', soundText: 'Puddle' }, it: { word: 'POZZA', soundText: 'Pozza' }, es: { word: 'CHARCO', soundText: 'Charco' } } },
  { emoji: '⚡', langMap: { pt: { word: 'RAIO', soundText: 'Raio' }, en: { word: 'BOLT', soundText: 'Bolt' }, it: { word: 'RAIO', soundText: 'Raio' }, es: { word: 'RAYO', soundText: 'Rayo' } } },
  { emoji: '🧂', langMap: { pt: { word: 'SAL', soundText: 'Sal' }, en: { word: 'SALT', soundText: 'Salt' }, it: { word: 'SALE', soundText: 'Sale' }, es: { word: 'SAL', soundText: 'Sal' } } },
  { emoji: '✉️', langMap: { pt: { word: 'SELO', soundText: 'Selo' }, en: { word: 'STAMP', soundText: 'Stamp' }, it: { word: 'BOLLO', soundText: 'Bollo' }, es: { word: 'SELLO', soundText: 'Sello' } } },
  { emoji: '🎨', langMap: { pt: { word: 'TINTA', soundText: 'Tinta' }, en: { word: 'PAINT', soundText: 'Paint' }, it: { word: 'TINTA', soundText: 'Tinta' }, es: { word: 'PINTURA', soundText: 'Pintura' } } },
  { emoji: '🐂', langMap: { pt: { word: 'TOURO', soundText: 'Touro' }, en: { word: 'BULL', soundText: 'Bull' }, it: { word: 'TORO', soundText: 'Toro' }, es: { word: 'TORO', soundText: 'Toro' } } },
  { emoji: '🏺', langMap: { pt: { word: 'VASO', soundText: 'Vaso' }, en: { word: 'VASE', soundText: 'Vase' }, it: { word: 'VASO', soundText: 'Vaso' }, es: { word: 'VASO', soundText: 'Vaso' } } },
  { emoji: '🛠️', langMap: { pt: { word: 'CAIXA', soundText: 'Caixa' }, en: { word: 'BOX', soundText: 'Box' }, it: { word: 'CASSA', soundText: 'Cassa' }, es: { word: 'CAJA', soundText: 'Caja' } } },
  { emoji: '🔑', langMap: { pt: { word: 'CHAVE', soundText: 'Chave' }, en: { word: 'KEY', soundText: 'Key' }, it: { word: 'CHIAVE', soundText: 'Chiave' }, es: { word: 'LLAVE', soundText: 'Llave' } } },
  { emoji: '🦷', langMap: { pt: { word: 'DENTE', soundText: 'Dente' }, en: { word: 'TOOTH', soundText: 'Tooth' }, it: { word: 'DENTE', soundText: 'Dente' }, es: { word: 'DIENTE', soundText: 'Diente' } } },
  { emoji: '🍃', langMap: { pt: { word: 'FOLHA', soundText: 'Folha' }, en: { word: 'LEAF', soundText: 'Leaf' }, it: { word: 'FOGLIA', soundText: 'Foglia' }, es: { word: 'HOJA', soundText: 'Hoja' } } },
  { emoji: '🍴', langMap: { pt: { word: 'GARFO', soundText: 'Garfo' }, en: { word: 'FORK', soundText: 'Fork' }, it: { word: 'FORCHETTA', soundText: 'Forchetta' }, es: { word: 'TENEDOR', soundText: 'Tenedor' } } },
  { emoji: '✏️', langMap: { pt: { word: 'LAPIS', soundText: 'Lápis' }, en: { word: 'PENCIL', soundText: 'Pencil' }, it: { word: 'MATITA', soundText: 'Matita' }, es: { word: 'LÁPIZ', soundText: 'Lápiz' } } },
  { emoji: '🍋', langMap: { pt: { word: 'LIMÃO', soundText: 'Limão' }, en: { word: 'LEMON', soundText: 'Lemon' }, it: { word: 'LIMONE', soundText: 'Limone' }, es: { word: 'LIMÓN', soundText: 'Limón' } } },
  { emoji: '🌽', langMap: { pt: { word: 'MILHO', soundText: 'Milho' }, en: { word: 'CORN', soundText: 'Corn' }, it: { word: 'MAIS', soundText: 'Mais' }, es: { word: 'MAÍZ', soundText: 'Maíz' } } },
  { emoji: '🚢', langMap: { pt: { word: 'NAVIO', soundText: 'Navio' }, en: { word: 'SHIP', soundText: 'Ship' }, it: { word: 'NAVE', soundText: 'Nave' }, es: { word: 'BARCO', soundText: 'Barco' } } },
  { emoji: '👓', langMap: { pt: { word: 'OCULOS', soundText: 'Óculos' }, en: { word: 'GLASS', soundText: 'Glasses' }, it: { word: 'OCCHIALI', soundText: 'Occhiali' }, es: { word: 'GAFAS', soundText: 'Gafas' } } },
  { emoji: '🚪', langMap: { pt: { word: 'PORTA', soundText: 'Porta' }, en: { word: 'DOOR', soundText: 'Door' }, it: { word: 'PORTA', soundText: 'Porta' }, es: { word: 'PUERTA', soundText: 'Puerta' } } },
  { emoji: '🍽️', langMap: { pt: { word: 'PRATO', soundText: 'Prato' }, en: { word: 'PLATE', soundText: 'Plate' }, it: { word: 'PIATTO', soundText: 'Piatto' }, es: { word: 'PLATO', soundText: 'Plato' } } },
  { emoji: '⌚', langMap: { pt: { word: 'RELOGIO', soundText: 'Relógio' }, en: { word: 'WATCH', soundText: 'Watch' }, it: { word: 'OROLOGIO', soundText: 'Orologio' }, es: { word: 'RELOJ', soundText: 'Reloj' } } }
];

export const MonteAPalavra: React.FC<MonteAPalavraProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { soundEnabled, completeChallenge, challengesCompleted } = useGame();

  const [queue, setQueue] = useState<WordOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [currentSoundText, setCurrentSoundText] = useState('');
  const [shuffledLetters, setShuffledLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const hadErrorInRound = useRef(false);

  // Animação para construir/ampliar o item (ex: a casa crescendo na tela)
  const buildScale = useRef(new Animated.Value(0)).current;

  // Inicializar fila com 3 palavras distintas
  useEffect(() => {
    const selectedTargets: WordOption[] = [];
    const pool = [...WORDS_POOL];
    while (selectedTargets.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      selectedTargets.push(pool[idx]);
      pool.splice(idx, 1);
    }
    setQueue(selectedTargets);
    setCurrentIndex(0);
  }, []);

  // Iniciar nova rodada quando muda o índice ou idioma
  useEffect(() => {
    if (queue.length > 0 && currentIndex < queue.length) {
      const selected = queue[currentIndex];
      const activeLang = language || 'pt';
      const wordData = selected.langMap[activeLang] || selected.langMap['pt'];
      
      setCurrentWord(wordData.word);
      setCurrentEmoji(selected.emoji);
      setCurrentSoundText(wordData.soundText);
      setTypedLetters([]);
      setRoundCompleted(false);
      hadErrorInRound.current = false;
      buildScale.setValue(0);

      // Separar letras, atribuir ID e embaralhar
      const letters = wordData.word.split('').map((char, index) => ({
        id: index,
        char,
        used: false
      }));

      setShuffledLetters(letters.sort(() => Math.random() - 0.5));

      // Tocar som da palavra automaticamente no começo
      speak(wordData.soundText, language);
    }
  }, [currentIndex, queue, language]);

  const handleLetterTap = (letterItem: { id: number; char: string; used: boolean }) => {
    if (roundCompleted || letterItem.used) return;

    const nextIndex = typedLetters.length;
    const expectedChar = currentWord[nextIndex];

    if (letterItem.char === expectedChar) {
      // Letra certa!
      playSound('pop', soundEnabled);
      
      // Marcar letra como usada no grid inferior
      setShuffledLetters(prev => prev.map(item => item.id === letterItem.id ? { ...item, used: true } : item));
      
      // Adicionar à palavra montada
      const newTyped = [...typedLetters, letterItem.char];
      setTypedLetters(newTyped);

      // Falar a letra digitada
      speak(letterItem.char, language);

      // Verificar se a palavra foi completamente formada
      if (newTyped.length === currentWord.length) {
        setRoundCompleted(true);
        playSound('success', soundEnabled);
        
        // Animação de construção do elemento (cresce com mola)
        Animated.spring(buildScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true
        }).start(() => {
          // Falar a palavra completa e concluir
          speak(currentSoundText, language);
        });

        setTimeout(async () => {
          let updatedQueue = [...queue];
          if (hadErrorInRound.current) {
            updatedQueue.push(queue[currentIndex]);
            setQueue(updatedQueue);
          }

          const nextIdx = currentIndex + 1;
          if (nextIdx < updatedQueue.length) {
            setCurrentIndex(nextIdx);
          } else {
            await completeChallenge('word', currentWord);
            onBack();
          }
        }, 3500);
      }
    } else {
      // Letra errada
      hadErrorInRound.current = true;
      playSound('pop', soundEnabled);
      speak(t('tryAgain'), language);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('game5Title')}</Text>
        <Text style={styles.roundText}>Rodada {currentIndex + 1}/{queue.length}</Text>
      </View>

      <ProgressBar current={challengesCompleted} />

      <MascotLumi text={t('game5Prompt')} />

      <TouchableOpacity 
        style={styles.listenButton} 
        onPress={() => speak(currentSoundText, language)}
      >
        <Text style={styles.listenButtonText}>🔊 {t('listenAgain')}</Text>
      </TouchableOpacity>

      <View style={styles.gameArea}>
        
        {/* Espaços da Palavra (Slots) */}
        <View style={styles.wordSlotsRow}>
          {currentWord.split('').map((char, index) => {
            const isFilled = index < typedLetters.length;
            return (
              <View key={index} style={[styles.slot, isFilled && styles.slotFilled]}>
                <Text style={styles.slotText}>
                  {isFilled ? typedLetters[index] : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ANIMAÇÃO DE CONSTRUÇÃO DO ELEMENTO (CASA, BOLA, TREM...) */}
        <View style={styles.buildArea}>
          {roundCompleted && (
            <Animated.View style={{ transform: [{ scale: buildScale }], alignItems: 'center' }}>
              <Text style={styles.buildEmoji}>{currentEmoji}</Text>
              <Text style={styles.buildLabel}>{currentWord}</Text>
            </Animated.View>
          )}
        </View>

        {/* Letras Embaralhadas para Clicar */}
        {!roundCompleted && (
          <View style={styles.lettersRow}>
            {shuffledLetters.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[styles.letterBtn, item.used && styles.letterBtnUsed]}
                  onPress={() => handleLetterTap(item)}
                  disabled={item.used}
                >
                  <Text style={[styles.letterBtnText, item.used && styles.letterBtnTextUsed]}>
                    {item.char}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBEE', // Vermelho/Rosa clarinho acolhedor
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#FFCDD2',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  roundText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
  },
  listenButton: {
    backgroundColor: '#81C784',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  listenButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  wordSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  slot: {
    width: 54,
    height: 60,
    borderBottomWidth: 4,
    borderColor: '#FF8A80',
    backgroundColor: '#FFF',
    marginHorizontal: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  slotFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  slotText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2E7D32',
  },
  buildArea: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buildEmoji: {
    fontSize: 90,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  buildLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: '#C2185B',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  lettersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '90%',
    maxWidth: 400,
    marginBottom: 10,
  },
  letterBtn: {
    backgroundColor: '#FFF',
    width: 64,
    height: 64,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FF8A80',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  letterBtnUsed: {
    backgroundColor: '#ECEFF1',
    borderColor: '#B0BEC5',
    opacity: 0.3,
  },
  letterBtnText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  letterBtnTextUsed: {
    color: '#90A4AE',
  },
});
