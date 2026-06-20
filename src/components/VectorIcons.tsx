import React from 'react';
import Svg, { Circle, Rect, Path, G, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  accessory?: string | null;
}

// Estrelas
export const StarIcon: React.FC<IconProps> = ({ size = 24, color = '#FFD700' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon
      points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
      fill={color}
      stroke="#E6B800"
      strokeWidth="1.5"
    />
  </Svg>
);

// Moedas
export const CoinIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#FFC72C" stroke="#D99B00" strokeWidth="2" />
    <Circle cx="12" cy="12" r="7" fill="#FFE082" />
    <Path d="M12 7V17M9 10H14C15 10 15 12 12 12C9 12 9 14 12 14H15" stroke="#D99B00" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Baú Surpresa
export const ChestIcon: React.FC<{ size?: number; isOpen?: boolean }> = ({ size = 100, isOpen = false }) => {
  if (isOpen) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Baú Aberto */}
        {/* Fundo de brilho */}
        <Circle cx="50" cy="50" r="45" fill="#FFE082" opacity="0.3" />
        {/* Base */}
        <Path d="M15 50V80C15 82.2 16.8 84 19 84H81C83.2 84 85 82.2 85 80V50H15Z" fill="#8D6E63" stroke="#4E342E" strokeWidth="3" />
        {/* Detalhes de ferro na base */}
        <Rect x="25" y="50" width="10" height="34" fill="#CFD8DC" />
        <Rect x="65" y="50" width="10" height="34" fill="#CFD8DC" />
        <Rect x="15" y="50" width="70" height="6" fill="#5D4037" />
        {/* Tampa aberta suspensa */}
        <Path d="M15 42C15 25 30 20 50 20C70 20 85 25 85 42H15Z" fill="#A1887F" stroke="#4E342E" strokeWidth="3" />
        <Path d="M25 21C35 24 65 24 75 21" stroke="#5D4037" strokeWidth="3" fill="none" />
        {/* Joias saltando */}
        <Circle cx="40" cy="45" r="6" fill="#E91E63" />
        <Polygon points="50,38 54,44 50,50 46,44" fill="#00E676" />
        <Circle cx="60" cy="47" r="5" fill="#29B6F6" />
        <StarIcon size={24} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Baú Fechado */}
      <Path d="M15 50V80C15 82.2 16.8 84 19 84H81C83.2 84 85 82.2 85 80V50H15Z" fill="#8D6E63" stroke="#4E342E" strokeWidth="3" />
      {/* Tampa fechada */}
      <Path d="M15 50C15 32 25 24 50 24C75 24 85 32 85 50H15Z" fill="#A1887F" stroke="#4E342E" strokeWidth="3" />
      {/* Cintas de ferro */}
      <Rect x="25" y="25" width="10" height="59" fill="#B0BEC5" stroke="#37474F" strokeWidth="1.5" />
      <Rect x="65" y="25" width="10" height="59" fill="#B0BEC5" stroke="#37474F" strokeWidth="1.5" />
      {/* Fechadura dourada */}
      <Rect x="44" y="44" width="12" height="15" rx="3" fill="#FFC72C" stroke="#D99B00" strokeWidth="2" />
      <Circle cx="50" cy="49" r="2.5" fill="#4E342E" />
      <Rect x="49" y="51" width="2" height="5" fill="#4E342E" />
    </Svg>
  );
};

// Categorias de acessórios para ordenação de camadas
const isBackAccessory = (acc: string | null | undefined) => 
  acc === 'backpack_rocket' || acc === 'balloon';

const isBodyAccessory = (acc: string | null | undefined) => 
  acc === 'cape_wizard' || acc === 'princess_dress' || acc === 'superhero_cape' || acc === 'dino_costume' || acc === 'toy_train';

const renderAccessoryGroup = (accessory: string | null | undefined, filterFn: (acc: string) => boolean) => {
  if (!accessory) return null;
  const list = accessory.split(',').map(x => x.trim()).filter(Boolean);
  return (
    <>
      {list.filter(filterFn).map(acc => (
        <G key={acc}>
          {renderAccessory(acc)}
        </G>
      ))}
    </>
  );
};

// Renderizar acessórios sobre os personagens
const renderAccessory = (accessory: string | null | undefined) => {
  if (!accessory) return null;
  switch (accessory) {
    case 'hat_explorer':
      return (
        <G id="accessory-explorer-hat" transform="translate(0, -18)">
          <Path d="M25 45C25 45 35 25 50 25C65 25 75 45 75 45Z" fill="#8D6E63" stroke="#4E342E" strokeWidth="2" />
          <Ellipse cx="50" cy="44" rx="33" ry="5" fill="#A1887F" stroke="#4E342E" strokeWidth="2" />
          <Rect x="30" y="38" width="40" height="4" fill="#FF5252" />
        </G>
      );
    case 'crown':
      return (
        <G id="accessory-crown" transform="translate(0, -18)">
          <Polygon points="30,42 35,26 43,36 50,22 57,36 65,26 70,42" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
          <Circle cx="35" cy="25" r="2" fill="#FF5252" />
          <Circle cx="50" cy="21" r="2" fill="#00E676" />
          <Circle cx="65" cy="25" r="2" fill="#29B6F6" />
          <Rect x="30" y="40" width="40" height="3" fill="#E6B800" />
        </G>
      );
    case 'sunglasses':
      return (
        <G id="accessory-sunglasses" transform="translate(0, 10)">
          <Path d="M30 35H48V42C48 45 42 45 42 42V35" fill="#212121" stroke="#FFD700" strokeWidth="1.5" />
          <Path d="M52 35H70V42C70 45 64 45 64 42V35" fill="#212121" stroke="#FFD700" strokeWidth="1.5" />
          <Rect x="47" y="36" width="6" height="2" fill="#FFD700" />
          {/* Reflexo */}
          <Path d="M33 37L39 41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M55 37L61 41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </G>
      );
    case 'cape_wizard':
      return (
        <G id="accessory-cape" transform="translate(0, 52)">
          <Path d="M22 10L10 40H90L78 10Z" fill="#5E35B1" opacity="0.95" stroke="#311B92" strokeWidth="2" />
          <StarIcon size={12} color="#FFF" />
          <G transform="translate(65, 15)">
            <Polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8,10 5,8 2,10 2.5,6.5 0,4 3.5,3.5" fill="#FFD700" />
          </G>
          <G transform="translate(25, 20)">
            <Polygon points="4,0 5.2,2.8 8,3.2 6,5.2 6.4,8 4,6.4 1.6,8 2,5.2 0,3.2 2.8,2.8" fill="#FFD700" />
          </G>
        </G>
      );
    case 'backpack_rocket':
      return (
        <G id="accessory-rocket" transform="translate(-18, 30)">
          {/* Mochila Foguete na lateral esquerda/atrás */}
          <Rect x="0" y="0" width="16" height="35" rx="8" fill="#B0BEC5" stroke="#37474F" strokeWidth="2" />
          <Circle cx="8" cy="10" r="4" fill="#E53935" />
          {/* Fogo */}
          <Path d="M4 35L8 47L12 35Z" fill="#FF3D00" />
          <Path d="M6 35L8 42L10 35Z" fill="#FFEA00" />
        </G>
      );
    case 'teddy_bear':
      return (
        <G id="accessory-teddy-bear">
          {/* Corpo do Ursinho de Pelúcia */}
          <Circle cx="72" cy="78" r="10.5" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5" />
          <Circle cx="72" cy="78" r="5.5" fill="#D7CCC8" />
          {/* Cabeça */}
          <Circle cx="72" cy="63" r="8" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5" />
          {/* Orelhas */}
          <Circle cx="65" cy="56" r="3" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5" />
          <Circle cx="65" cy="56" r="1.5" fill="#FF8A80" />
          <Circle cx="79" cy="56" r="3" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5" />
          <Circle cx="79" cy="56" r="1.5" fill="#FF8A80" />
          {/* Focinho */}
          <Path d="M69 65C69 63.5 70.3 63 72 63C73.7 63 75 63.5 75 65C75 66.5 73.7 67 72 67C70.3 67 69 66.5 69 65Z" fill="#D7CCC8" />
          <Circle cx="72" cy="64.5" r="0.8" fill="#3E2723" />
          {/* Olhos */}
          <Circle cx="69" cy="61" r="1" fill="#3E2723" />
          <Circle cx="75" cy="61" r="1" fill="#3E2723" />
          {/* Patas/Braços */}
          <Circle cx="62" cy="74" r="3.5" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
          <Circle cx="82" cy="74" r="3.5" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
        </G>
      );
    case 'toy_train':
      return (
        <G id="accessory-toy-train">
          {/* Trilho */}
          <Rect x="22" y="87" width="56" height="2" fill="#78909C" />
          {/* Cabine */}
          <Rect x="35" y="68" width="14" height="16" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5" rx="1" />
          <Rect x="38" y="71" width="8" height="6" fill="#81D4FA" />
          {/* Caldeira/Motor */}
          <Rect x="49" y="74" width="16" height="10" fill="#1E88E5" stroke="#0D47A1" strokeWidth="1.5" rx="1" />
          {/* Chaminé */}
          <Rect x="60" y="67" width="3" height="7" fill="#FFB300" />
          <Path d="M58 67H65V69H58V67Z" fill="#FF8F00" />
          {/* Rodas */}
          <Circle cx="40" cy="85" r="4.5" fill="#37474F" stroke="#212121" strokeWidth="1" />
          <Circle cx="40" cy="85" r="1.5" fill="#ECEFF1" />
          <Circle cx="52" cy="85" r="4.5" fill="#37474F" stroke="#212121" strokeWidth="1" />
          <Circle cx="52" cy="85" r="1.5" fill="#ECEFF1" />
          <Circle cx="62" cy="85" r="4.5" fill="#37474F" stroke="#212121" strokeWidth="1" />
          <Circle cx="62" cy="85" r="1.5" fill="#ECEFF1" />
          {/* Limpa-trilhos */}
          <Polygon points="65,80 70,84 65,84" fill="#FFB300" />
        </G>
      );
    case 'balloon':
      return (
        <G id="accessory-balloon">
          {/* Fio do balão */}
          <Path d="M78 36 Q82 52 72 64 T68 76" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeDasharray="2,2" />
          {/* Balão */}
          <Path d="M68 24C68 17.4 72.5 12 78 12C83.5 12 88 17.4 88 24C88 30.6 83.5 36 78 36C72.5 36 68 30.6 68 24Z" fill="#FF1744" stroke="#D50000" strokeWidth="1.5" />
          {/* Nó */}
          <Polygon points="76,36 80,36 78,39" fill="#FF1744" stroke="#D50000" strokeWidth="1" />
          {/* Brilho */}
          <Path d="M74 18 A 6 8 0 0 1 78 15" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        </G>
      );
    case 'magic_wand':
      return (
        <G id="accessory-magic-wand" transform="translate(68, 62) rotate(-25)">
          {/* Bastão */}
          <Rect x="-2" y="0" width="4" height="24" rx="1" fill="#8D6E63" stroke="#4E342E" strokeWidth="1" />
          <Rect x="-2" y="-4" width="4" height="4" fill="#FFD54F" />
          {/* Estrela */}
          <Polygon points="0,-16 3,-9 10,-9 5,-4 7,3 0,-1 -7,3 -5,-4 -10,-9 -3,-9" fill="#FFD700" stroke="#FFA000" strokeWidth="1.2" />
          {/* Brilhos extras */}
          <Circle cx="-12" cy="-14" r="1.2" fill="#FFF" />
          <Circle cx="12" cy="-12" r="1.5" fill="#FFF" />
          <Circle cx="0" cy="-24" r="1" fill="#FFF" />
        </G>
      );
    case 'gamepad':
      return (
        <G id="accessory-gamepad">
          {/* Corpo do Controle */}
          <Rect x="36" y="73" width="28" height="14" rx="7" fill="#37474F" stroke="#212121" strokeWidth="1.5" />
          {/* Direcional D-Pad */}
          <Path d="M41 77H43V79H45V81H43V83H41V81H39V79H41Z" fill="#ECEFF1" />
          {/* Botões A/B */}
          <Circle cx="57" cy="81" r="1.5" fill="#4CAF50" />
          <Circle cx="60.5" cy="78" r="1.5" fill="#F44336" />
          {/* Analógicos */}
          <Circle cx="47" cy="81" r="2.2" fill="#212121" />
          <Circle cx="53" cy="81" r="2.2" fill="#212121" />
        </G>
      );
    case 'princess_dress':
      return (
        <G id="accessory-princess-dress">
          {/* Saia rodada */}
          <Path d="M33 70L23 92H77L67 70Z" fill="#F48FB1" stroke="#C2185B" strokeWidth="2" />
          {/* Parte superior */}
          <Path d="M33 70C33 70 37 64 50 64C63 64 67 70 67 70L60 78H40Z" fill="#F06292" stroke="#C2185B" strokeWidth="1.5" />
          {/* Cinto dourado */}
          <Rect x="36.5" y="69.5" width="27" height="3" fill="#FFD700" />
          {/* Decote/Colar branco */}
          <Path d="M42 65C45 68 55 68 58 65" stroke="#FFF" strokeWidth="1.8" fill="none" />
          {/* Brilhos na saia */}
          <Polygon points="32,83 34,80 36,83 34,86" fill="#FFF" />
          <Polygon points="68,81 70,78 72,81 70,84" fill="#FFF" />
        </G>
      );
    case 'superhero_cape':
      return (
        <G id="accessory-superhero-cape" transform="translate(0, 52)">
          {/* Capa */}
          <Path d="M25 15L12 40H88L75 15Z" fill="#D50000" stroke="#900C3F" strokeWidth="2" />
          {/* Gola/Alça */}
          <Path d="M31 15C37 9 63 9 69 15" stroke="#FFD700" strokeWidth="3.5" fill="none" />
          {/* Escudo no peito */}
          <Polygon points="50,22 56,17 56,25 50,29 44,25 44,17" fill="#FFD700" stroke="#D50000" strokeWidth="1.2" />
          <Path d="M47 19H53L47 24H53" stroke="#D50000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </G>
      );
    case 'dino_costume':
      return (
        <G id="accessory-dino-costume" transform="translate(0, 52)">
          {/* Corpo do dinossauro */}
          <Path d="M30 18C30 18 35 15 50 15C65 15 70 18 70 18V38H30V18Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2" />
          {/* Espinhos laterais */}
          <Polygon points="26,22 30,20 30,24" fill="#FF9800" />
          <Polygon points="74,22 70,20 70,24" fill="#FF9800" />
          {/* Barriga amarela/verde claro */}
          <Circle cx="50" cy="28" r="7.5" fill="#C8E6C9" />
          {/* Cauda */}
          <Path d="M28 32 C20 32 15 25 15 20 C18 20 22 25 28 28" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5" />
          <Polygon points="15,20 18,17 18,22" fill="#FF9800" />
        </G>
      );
    case 'pirate_hat':
      return (
        <G id="accessory-pirate-hat" transform="translate(0, -18)">
          {/* Brim do chapéu de pirata */}
          <Path d="M20 44C32 30 68 30 80 44C68 38 32 38 20 44Z" fill="#212121" stroke="#000" strokeWidth="2" />
          <Path d="M32 40 C42 22 58 22 68 40 Z" fill="#212121" stroke="#000" strokeWidth="2" />
          {/* Detalhe dourado */}
          <Path d="M20 44C32 30 68 30 80 44" stroke="#FFD700" strokeWidth="1.5" fill="none" />
          <Path d="M32 40C42 22 58 22 68 40" stroke="#FFD700" strokeWidth="1.5" fill="none" />
          {/* Caveira e ossos cruzados */}
          <Path d="M44 28L56 36M56 28L44 36" stroke="#FFF" strokeWidth="1" />
          <Circle cx="50" cy="31" r="3.2" fill="#FFF" />
          <Rect x="48.5" y="33.8" width="3" height="2" rx="0.5" fill="#FFF" />
          <Circle cx="48.7" cy="31" r="0.6" fill="#000" />
          <Circle cx="51.3" cy="31" r="0.6" fill="#000" />
        </G>
      );
    case 'detective_lens':
      return (
        <G id="accessory-detective-lens" transform="translate(0, 10)">
          {/* Lente e anel no olho esquerdo (X=41) */}
          <Circle cx="41" cy="36" r="7.5" stroke="#795548" strokeWidth="2" fill="#81D4FA" fillOpacity="0.4" />
          {/* Cabo da lupa */}
          <Path d="M36 40L29 47C28.2 47.8 28.2 49 29 49.8C29.8 50.6 31 50.6 31.8 49.8L38.8 42.8Z" fill="#795548" />
          {/* Brilho da lente */}
          <Path d="M41 30C43 30 46 32 46 35" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </G>
      );
    default:
      return null;
  }
};

// Auxiliar: Elipse para o react-native-svg
const Ellipse: React.FC<any> = (props) => <Circle {...props} />;

// 1. Menino Aventureiro
export const BoyAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Cabelo de Trás */}
      <Path d="M25 40C25 40 18 60 25 70" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
      <Path d="M75 40C75 40 82 60 75 70" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
      {/* Pescoço */}
      <Rect x="44" y="65" width="12" height="15" fill="#FFCCBC" />
      {/* Rosto */}
      <Circle cx="50" cy="50" r="25" fill="#FFE0B2" stroke="#E0A96D" strokeWidth="2" />
      {/* Orelhas */}
      <Circle cx="23" cy="50" r="5" fill="#FFE0B2" />
      <Circle cx="77" cy="50" r="5" fill="#FFE0B2" />
      {/* Olhos Sorridentes */}
      <Circle cx="42" cy="46" r="3.5" fill="#3E2723" />
      <Circle cx="58" cy="46" r="3.5" fill="#3E2723" />
      {/* Bochechas Coradas (Acolhedor / TDAH amigável) */}
      <Circle cx="37" cy="52" r="3" fill="#FF8A80" opacity="0.6" />
      <Circle cx="63" cy="52" r="3" fill="#FF8A80" opacity="0.6" />
      {/* Boca Feliz */}
      <Path d="M44 56C44 56 47 62 50 62C53 62 56 56 56 56" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Cabelo Franja */}
      <Path d="M24 40C28 28 40 28 50 32C60 28 72 28 76 40C76 40 65 30 50 35C35 30 24 40 24 40Z" fill="#5D4037" />
      {/* Roupa (Corpo) */}
      <Path d="M30 78C30 78 35 70 50 70C65 70 70 78 70 78V90H30V78Z" fill="#4CAF50" />
      <Path d="M42 70L50 78L58 70" stroke="#FFE0B2" strokeWidth="2" fill="none" />
      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 2. Menina Aventureira
export const GirlAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Cabelo Comprido de Trás (Marias chiquinhas) */}
      <Circle cx="20" cy="62" r="12" fill="#FFB74D" />
      <Circle cx="80" cy="62" r="12" fill="#FFB74D" />
      {/* Laços do Cabelo */}
      <Rect x="23" y="50" width="5" height="5" rx="2" fill="#E53935" />
      <Rect x="72" y="50" width="5" height="5" rx="2" fill="#E53935" />
      {/* Pescoço */}
      <Rect x="44" y="65" width="12" height="15" fill="#FFE0B2" />
      {/* Rosto */}
      <Circle cx="50" cy="50" r="25" fill="#FFF3E0" stroke="#E0A96D" strokeWidth="2" />
      {/* Olhos Grandes */}
      <Circle cx="41" cy="46" r="3.5" fill="#3E2723" />
      <Circle cx="59" cy="46" r="3.5" fill="#3E2723" />
      {/* Brilho nos olhos */}
      <Circle cx="39.5" cy="44.5" r="1" fill="#FFF" />
      <Circle cx="57.5" cy="44.5" r="1" fill="#FFF" />
      {/* Bochechas Coradas */}
      <Circle cx="36" cy="52" r="3" fill="#FF8A80" opacity="0.6" />
      <Circle cx="64" cy="52" r="3" fill="#FF8A80" opacity="0.6" />
      {/* Cabelo (Franja) */}
      <Path d="M25 38C30 25 70 25 75 38" stroke="#FFB74D" strokeWidth="6" strokeLinecap="round" fill="none" />
      <Path d="M25 38C35 34 45 38 50 36C55 38 65 34 75 38" stroke="#FFB74D" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Boca Sorridente */}
      <Path d="M43 56C43 56 46 62 50 62C54 62 57 56 57 56" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Roupa */}
      <Path d="M30 78C30 78 35 70 50 70C65 70 70 78 70 78V90H30V78Z" fill="#E91E63" />
      <Circle cx="50" cy="76" r="2.5" fill="#FFF" />
      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 3. Raposa
export const FoxAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Orelhas de Raposa */}
      <Polygon points="26,38 15,10 40,28" fill="#FF6D00" stroke="#D84315" strokeWidth="2" />
      <Polygon points="28,34 20,18 36,28" fill="#FFAB91" />
      <Polygon points="74,38 85,10 60,28" fill="#FF6D00" stroke="#D84315" strokeWidth="2" />
      <Polygon points="72,34 80,18 64,28" fill="#FFAB91" />
      {/* Pescoço */}
      <Rect x="44" y="65" width="12" height="15" fill="#FFAB91" />
      {/* Rosto Principal */}
      <Circle cx="50" cy="50" r="25" fill="#FF6D00" stroke="#D84315" strokeWidth="2" />
      {/* Bochechas brancas laterais */}
      <Path d="M26 52C26 52 35 62 40 60C45 58 35 44 26 44Z" fill="#FFF" />
      <Path d="M74 52C74 52 65 62 60 60C55 58 65 44 74 44Z" fill="#FFF" />
      {/* Olhos Amigáveis */}
      <Circle cx="41" cy="45" r="3.5" fill="#212121" />
      <Circle cx="59" cy="45" r="3.5" fill="#212121" />
      <Circle cx="39.5" cy="43.5" r="1" fill="#FFF" />
      <Circle cx="57.5" cy="43.5" r="1" fill="#FFF" />
      {/* Focinho e Nariz */}
      <Polygon points="46,54 54,54 50,59" fill="#212121" />
      <Path d="M50 59V63" stroke="#212121" strokeWidth="1.5" />
      {/* Sorriso */}
      <Path d="M46 64C48 66 50 66 50 64C50 66 52 66 54 64" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Corpo (Roupa) */}
      <Path d="M30 78C30 78 35 70 50 70C65 70 70 78 70 78V90H30V78Z" fill="#FF8F00" />
      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 4. Panda
export const PandaAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Orelhas Pretas redondas */}
      <Circle cx="28" cy="28" r="10" fill="#212121" />
      <Circle cx="72" cy="28" r="10" fill="#212121" />
      {/* Pescoço */}
      <Rect x="44" y="65" width="12" height="15" fill="#E0E0E0" />
      {/* Rosto Redondo Branco */}
      <Circle cx="50" cy="50" r="25" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="2" />
      {/* Manchas Negras nos Olhos */}
      <Circle cx="40" cy="47" r="7.5" fill="#212121" />
      <Circle cx="60" cy="47" r="7.5" fill="#212121" />
      {/* Olhos (Brilho Branco) */}
      <Circle cx="40" cy="47" r="2.5" fill="#FFF" />
      <Circle cx="60" cy="47" r="2.5" fill="#FFF" />
      <Circle cx="41.5" cy="45.5" r="0.8" fill="#212121" />
      <Circle cx="61.5" cy="45.5" r="0.8" fill="#212121" />
      {/* Narizinho */}
      <Ellipse cx="50" cy="55" rx="3.5" ry="2" fill="#212121" />
      {/* Boca */}
      <Path d="M47 59C49 61 50 61 50 59C50 61 51 61 53 59" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Bochechas Rosadas */}
      <Circle cx="32" cy="53" r="2.5" fill="#FF8A80" opacity="0.5" />
      <Circle cx="68" cy="53" r="2.5" fill="#FF8A80" opacity="0.5" />
      {/* Corpo (Roupa) */}
      <Path d="M30 78C30 78 35 70 50 70C65 70 70 78 70 78V90H30V78Z" fill="#37474F" />
      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 5. Gatinho
export const KittenAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Orelhas de Gato */}
      <Polygon points="26,35 18,12 38,28" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="1.5" />
      <Polygon points="27,31 22,20 34,28" fill="#FFCDD2" />
      <Polygon points="74,35 82,12 62,28" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="1.5" />
      <Polygon points="73,31 78,20 66,28" fill="#FFCDD2" />
      {/* Pescoço */}
      <Rect x="44" y="65" width="12" height="15" fill="#CFD8DC" />
      {/* Rosto Redondo Cinza Claro */}
      <Circle cx="50" cy="50" r="25" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="2" />
      {/* Listras na testa */}
      <Path d="M50 25V31M46 26V30M54 26V30" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />
      {/* Olhos Grandes e Fofos */}
      <Circle cx="40" cy="46" r="3.5" fill="#263238" />
      <Circle cx="60" cy="46" r="3.5" fill="#263238" />
      <Circle cx="38.5" cy="44.5" r="1" fill="#FFF" />
      <Circle cx="58.5" cy="44.5" r="1" fill="#FFF" />
      {/* Nariz Rosa */}
      <Polygon points="48,52 52,52 50,55" fill="#FF8A80" />
      {/* Bigodes */}
      <Path d="M28 53H36M29 57L37 55" stroke="#90A4AE" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M72 53H64M71 57L63 55" stroke="#90A4AE" strokeWidth="1.2" strokeLinecap="round" />
      {/* Sorriso de Gatinho */}
      <Path d="M47 57C49 59 50 59 50 57C50 59 51 59 53 57" stroke="#263238" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Corpo (Roupa) */}
      <Path d="M30 78C30 78 35 70 50 70C65 70 70 78 70 78V90H30V78Z" fill="#00ACC1" />
      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 6. Robô Amigável
export const RobotAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Antena */}
      <Rect x="48" y="14" width="4" height="12" fill="#78909C" />
      <Circle cx="50" cy="12" r="4" fill="#FFD54F" />
      {/* Pescoço Metálico */}
      <Rect x="45" y="65" width="10" height="15" fill="#90A4AE" stroke="#607D8B" strokeWidth="1.5" />
      {/* Cabeça Quadrada com cantos arredondados */}
      <Rect x="26" y="26" width="48" height="40" rx="10" fill="#B0BEC5" stroke="#607D8B" strokeWidth="3" />
      {/* Orelhas de Parafuso */}
      <Rect x="21" y="41" width="5" height="10" rx="2" fill="#78909C" />
      <Rect x="74" y="41" width="5" height="10" rx="2" fill="#78909C" />
      {/* Tela Azul do Rosto */}
      <Rect x="32" y="32" width="36" height="28" rx="5" fill="#80DEEA" stroke="#00ACC1" strokeWidth="1.5" />
      {/* Olhos Digitais (Leds Verdes ou Brancos) */}
      <Circle cx="42" cy="42" r="3" fill="#00E676" />
      <Circle cx="58" cy="42" r="3" fill="#00E676" />
      {/* Boca Digital (Tracejada) */}
      <Path d="M40 51H60" stroke="#00E676" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,3" />
      {/* Parafusos decorativos na cabeça */}
      <Circle cx="30" cy="30" r="1" fill="#78909C" />
      <Circle cx="70" cy="30" r="1" fill="#78909C" />
      {/* Corpo (Metal) */}
      <Path d="M30 78C30 78 35 70 50 70C65 70 70 78 70 78V90H30V78Z" fill="#78909C" stroke="#607D8B" strokeWidth="2" />
      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// Mascote Lumi (Luz mágica flutuante)
export const LumiIcon: React.FC<{ size?: number; glowAnim?: boolean }> = ({ size = 60 }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <Defs>
      <RadialGradient id="lumiGlow" cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0%" stopColor="#FFF9C4" stopOpacity={1} />
        <Stop offset="50%" stopColor="#FFF176" stopOpacity={0.8} />
        <Stop offset="100%" stopColor="#FFEE58" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    {/* Auréola de Brilho */}
    <Circle cx="30" cy="30" r="28" fill="url(#lumiGlow)" />
    {/* Corpo central brilhante */}
    <Circle cx="30" cy="30" r="14" fill="#FFF59D" stroke="#FFEE58" strokeWidth="2" />
    {/* Asinhas mágicas (pequenas e fofas) */}
    <Path d="M16 30C16 30 8 26 10 20C12 14 18 20 18 25" stroke="#FFF" strokeWidth="2" strokeLinecap="round" fill="#FFF9C4" opacity="0.9" />
    <Path d="M44 30C44 30 52 26 50 20C48 14 42 20 42 25" stroke="#FFF" strokeWidth="2" strokeLinecap="round" fill="#FFF9C4" opacity="0.9" />
    {/* Rostinho feliz do Lumi */}
    <Circle cx="26" cy="28" r="1.5" fill="#5D4037" />
    <Circle cx="34" cy="28" r="1.5" fill="#5D4037" />
    {/* Sorriso */}
    <Path d="M28 33C29 34 31 34 32 33" stroke="#5D4037" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    {/* Brilhos pequenos extras ao redor */}
    <Circle cx="12" cy="12" r="1.5" fill="#FFF" />
    <Circle cx="48" cy="15" r="1" fill="#FFF" />
    <Circle cx="45" cy="45" r="2" fill="#FFF" />
    <Circle cx="15" cy="48" r="1.5" fill="#FFF" />
  </Svg>
);

// Obter avatar por ID
export const getAvatarComponent = (id: 'boy' | 'girl' | 'fox' | 'panda' | 'kitten' | 'robot' | null, size = 80, accessory: string | null = null) => {
  switch (id) {
    case 'boy': return <BoyAvatar size={size} accessory={accessory} />;
    case 'girl': return <GirlAvatar size={size} accessory={accessory} />;
    case 'fox': return <FoxAvatar size={size} accessory={accessory} />;
    case 'panda': return <PandaAvatar size={size} accessory={accessory} />;
    case 'kitten': return <KittenAvatar size={size} accessory={accessory} />;
    case 'robot': return <RobotAvatar size={size} accessory={accessory} />;
    default: return <PandaAvatar size={size} accessory={accessory} />;
  }
};
