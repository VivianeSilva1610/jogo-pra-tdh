import React from 'react';
import Svg, { Circle, Ellipse, Rect, Path, G, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';

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

// Brilho "sticker" — realce translúcido no canto superior da cabeça
const Shine: React.FC<{ cx: number; cy: number; rx: number; ry: number }> = ({ cx, cy, rx, ry }) => (
  <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={0.3} />
);

// 1. Capybara (Capivara)
export const CapybaraAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Orelhas */}
      <Circle cx="23" cy="35" r="11" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
      <Circle cx="77" cy="35" r="11" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
      <Circle cx="23" cy="35" r="5.5" fill="#5D4037" />
      <Circle cx="77" cy="35" r="5.5" fill="#5D4037" />

      {/* Cabeça */}
      <Circle cx="50" cy="55" r="36" fill="#A47B5B" stroke="#6D4C41" strokeWidth="2.5" />

      {/* Focinho */}
      <Ellipse cx="50" cy="69" rx="24" ry="17" fill="#C9A876" />
      <Path d="M26 69 A 24 17 0 0 1 74 69" stroke="#6D4C41" strokeWidth="2" fill="none" />

      {/* Olhos contentes (fechados), traço grosso e escuro sobre pelo claro */}
      <Path d="M35 49 Q 41 44 47 49" stroke="#3E2723" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <Path d="M53 49 Q 59 44 65 49" stroke="#3E2723" strokeWidth="3.2" strokeLinecap="round" fill="none" />

      {/* Narinas */}
      <Ellipse cx="44" cy="66" rx="3" ry="2.2" fill="#3E2723" />
      <Ellipse cx="56" cy="66" rx="3" ry="2.2" fill="#3E2723" />

      {/* Boca */}
      <Path d="M50 71 V 76 M 44 76 Q 50 81 56 76" stroke="#3E2723" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Bochechas */}
      <Circle cx="27" cy="61" r="6" fill="#FF8A65" opacity="0.5" />
      <Circle cx="73" cy="61" r="6" fill="#FF8A65" opacity="0.5" />

      <Shine cx={35} cy={33} rx={10} ry={6} />

      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 2. Turtle (Tartaruga)
export const TurtleAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Casco traseiro */}
      <Circle cx="50" cy="62" r="36" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2.5" />
      <Path d="M50 30 L 68 46 L 62 68 L 38 68 L 32 46 Z" fill="#43A047" stroke="#1B5E20" strokeWidth="2" strokeLinejoin="round" />
      <Path d="M18 62 L 32 46 L 38 68 Z" fill="#388E3C" stroke="#1B5E20" strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M82 62 L 68 46 L 62 68 Z" fill="#388E3C" stroke="#1B5E20" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Cabeça */}
      <Circle cx="50" cy="38" r="21" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2.5" />

      {/* Olhos grandes */}
      <Circle cx="42" cy="34" r="5" fill="#FFF" stroke="#1B5E20" strokeWidth="1" />
      <Circle cx="58" cy="34" r="5" fill="#FFF" stroke="#1B5E20" strokeWidth="1" />
      <Circle cx="42" cy="35" r="2.6" fill="#1B5E20" />
      <Circle cx="58" cy="35" r="2.6" fill="#1B5E20" />
      <Circle cx="41" cy="34" r="1" fill="#FFF" />
      <Circle cx="57" cy="34" r="1" fill="#FFF" />

      {/* Bochechas */}
      <Circle cx="34" cy="42" r="3.5" fill="#81D683" opacity="0.7" />
      <Circle cx="66" cy="42" r="3.5" fill="#81D683" opacity="0.7" />

      {/* Sorriso simpático */}
      <Path d="M43 44 Q 50 50 57 44" stroke="#1B5E20" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      <Shine cx={38} cy={30} rx={6} ry={4} />
      <Shine cx={38} cy={52} rx={8} ry={5} />

      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 3. Sloth (Bicho Preguiça)
export const SlothAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Pelo do topo */}
      <Path d="M30 21 Q 50 4 70 21" stroke="#8D6E63" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Cabeça */}
      <Circle cx="50" cy="53" r="36" fill="#BCA284" stroke="#6D4C41" strokeWidth="2.5" />

      {/* Máscara clara do rosto */}
      <Ellipse cx="50" cy="56" rx="27" ry="23" fill="#F1E4D3" />

      {/* Manchas escuras ao redor dos olhos */}
      <Ellipse cx="37" cy="51" rx="10" ry="13" fill="#6D4C41" transform="rotate(-12, 37, 51)" />
      <Ellipse cx="63" cy="51" rx="10" ry="13" fill="#6D4C41" transform="rotate(12, 63, 51)" />

      {/* Olhos sonolentos: traço claro sobre a mancha escura para contraste */}
      <Path d="M32 51 Q 37 47 42 51" stroke="#FFF8E1" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <Path d="M58 51 Q 63 47 68 51" stroke="#FFF8E1" strokeWidth="2.8" strokeLinecap="round" fill="none" />

      {/* Narizinho */}
      <Ellipse cx="50" cy="64" rx="5" ry="4" fill="#3E2723" />

      {/* Sorriso tranquilo */}
      <Path d="M43 71 Q 50 77 57 71" stroke="#6D4C41" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* Bochechas */}
      <Circle cx="30" cy="63" r="5" fill="#FF8A65" opacity="0.4" />
      <Circle cx="70" cy="63" r="5" fill="#FF8A65" opacity="0.4" />

      <Shine cx={36} cy={30} rx={9} ry={5} />

      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 4. Frog (Rã)
export const FrogAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Corpo / Cabeça Principal */}
      <Ellipse cx="50" cy="62" rx="40" ry="30" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2.5" />

      {/* Barriguinha verde claro */}
      <Ellipse cx="50" cy="76" rx="28" ry="16" fill="#C8E6C9" />

      {/* Olhos super grandes no topo */}
      <Circle cx="32" cy="30" r="16" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2" />
      <Circle cx="68" cy="30" r="16" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2" />
      <Circle cx="32" cy="30" r="12" fill="#FFF" />
      <Circle cx="68" cy="30" r="12" fill="#FFF" />

      {/* Pupilas */}
      <Circle cx="32" cy="30" r="5.5" fill="#1B5E20" />
      <Circle cx="68" cy="30" r="5.5" fill="#1B5E20" />
      <Circle cx="30" cy="28" r="2" fill="#FFF" />
      <Circle cx="66" cy="28" r="2" fill="#FFF" />

      {/* Sorriso Gigante */}
      <Path d="M25 55 Q 50 80 75 55" stroke="#1B5E20" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M22 52 L 25 55" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M78 52 L 75 55" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Bochechas Rosadas */}
      <Circle cx="20" cy="60" r="6" fill="#FF8A80" opacity="0.6" />
      <Circle cx="80" cy="60" r="6" fill="#FF8A80" opacity="0.6" />

      <Shine cx={30} cy={26} rx={4} ry={3} />
      <Shine cx={66} cy={26} rx={4} ry={3} />

      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 5. Hedgehog (Porco Espinho)
export const HedgehogAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Corpo base */}
      <Circle cx="50" cy="54" r="35" fill="#6D4C41" stroke="#4E342E" strokeWidth="2.5" />
      {/* Coroa de espinhos, alinhada ao topo do corpo */}
      <Path
        d="M16 46 L23 24 L30 44 L38 20 L46 42 L50 18 L54 42 L62 20 L70 44 L77 24 L84 46 Z"
        fill="#6D4C41"
        stroke="#4E342E"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Rostinho claro */}
      <Ellipse cx="50" cy="62" rx="26" ry="21" fill="#F1E0C8" stroke="#6D4C41" strokeWidth="2" />

      {/* Orelhinhas, espiando na base dos espinhos */}
      <Circle cx="26" cy="51" r="6" fill="#D7B89C" stroke="#6D4C41" strokeWidth="1.5" />
      <Circle cx="74" cy="51" r="6" fill="#D7B89C" stroke="#6D4C41" strokeWidth="1.5" />

      {/* Olhos fofos */}
      <Circle cx="41" cy="58" r="4.2" fill="#3E2723" />
      <Circle cx="59" cy="58" r="4.2" fill="#3E2723" />
      <Circle cx="39.5" cy="56.5" r="1.4" fill="#FFF" />
      <Circle cx="57.5" cy="56.5" r="1.4" fill="#FFF" />

      {/* Nariz pontudo */}
      <Circle cx="50" cy="66" r="4.5" fill="#3E2723" />

      {/* Boquinha */}
      <Path d="M45 72 Q 50 76 55 72" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Bochechas */}
      <Circle cx="34" cy="65" r="4" fill="#FF8A65" opacity="0.5" />
      <Circle cx="66" cy="65" r="4" fill="#FF8A65" opacity="0.5" />

      <Shine cx={37} cy={55} rx={7} ry={4} />

      {renderAccessoryGroup(accessory, isBodyAccessory)}
      {renderAccessoryGroup(accessory, (acc) => !isBackAccessory(acc) && !isBodyAccessory(acc))}
    </G>
  </Svg>
);

// 6. Koala (Coala)
export const KoalaAvatar: React.FC<IconProps> = ({ size = 80, accessory }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <G>
      {renderAccessoryGroup(accessory, isBackAccessory)}
      {/* Orelhas Grandes Felpudas */}
      <Circle cx="20" cy="35" r="16" fill="#B0BEC5" stroke="#78909C" strokeWidth="2" />
      <Circle cx="20" cy="35" r="9" fill="#ECEFF1" />
      <Circle cx="80" cy="35" r="16" fill="#B0BEC5" stroke="#78909C" strokeWidth="2" />
      <Circle cx="80" cy="35" r="9" fill="#ECEFF1" />

      {/* Cabeça Larga */}
      <Ellipse cx="50" cy="55" rx="36" ry="30" fill="#90A4AE" stroke="#546E7A" strokeWidth="2.5" />

      {/* Olhos espaçados */}
      <Circle cx="32" cy="48" r="4.5" fill="#FFF" />
      <Circle cx="68" cy="48" r="4.5" fill="#FFF" />
      <Circle cx="32" cy="49" r="3.2" fill="#212121" />
      <Circle cx="68" cy="49" r="3.2" fill="#212121" />
      <Circle cx="31" cy="47.5" r="1.2" fill="#FFF" />
      <Circle cx="67" cy="47.5" r="1.2" fill="#FFF" />

      {/* Nariz Grande Oval */}
      <Ellipse cx="50" cy="60" rx="11" ry="15" fill="#37474F" stroke="#212121" strokeWidth="1.5" />
      <Ellipse cx="46" cy="53" rx="3.2" ry="5" fill="#607D8B" />

      {/* Bochechinhas */}
      <Circle cx="26" cy="60" r="4.5" fill="#FF8A80" opacity="0.4" />
      <Circle cx="74" cy="60" r="4.5" fill="#FF8A80" opacity="0.4" />

      {/* Boquinha tímida */}
      <Path d="M46 76 Q 50 79 54 76" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      <Shine cx={38} cy={33} rx={9} ry={5} />

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
export const getAvatarComponent = (id: 'capybara' | 'turtle' | 'sloth' | 'frog' | 'hedgehog' | 'koala' | null, size = 80, accessory: string | null = null) => {
  switch (id) {
    case 'capybara': return <CapybaraAvatar size={size} accessory={accessory} />;
    case 'turtle': return <TurtleAvatar size={size} accessory={accessory} />;
    case 'sloth': return <SlothAvatar size={size} accessory={accessory} />;
    case 'frog': return <FrogAvatar size={size} accessory={accessory} />;
    case 'hedgehog': return <HedgehogAvatar size={size} accessory={accessory} />;
    case 'koala': return <KoalaAvatar size={size} accessory={accessory} />;
    default: return <CapybaraAvatar size={size} accessory={accessory} />;
  }
};

