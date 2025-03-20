import React from 'react';
import {
  IconSun,
  IconTree,
  IconRipple,
  IconConfetti,
  IconRocket,
} from '@tabler/icons-react';
import { Card } from '../types';

interface GameCardProps {
  card: Card;
  size?: number; // base width in px, e.g., 100
  shadow?: boolean;
  onClick?: () => void;
  disabled?: boolean; 
  isTask?: boolean;
  showHoverAnimation?: boolean; 
}

const colorStyles = {
  yellow: { background: '#FFEB3B', dark: '#FBC02D' },
  green: { background: '#4CAF50', dark: '#388E3C' },
  pink: { background: '#EC407A', dark: '#D81B60' },
  blue: { background: '#42A5F5', dark: '#1976D2' },
  black: { background: '#212121', dark: '#616161' },
};


const iconMap = {
  yellow: IconSun,
  green: IconTree,
  blue: IconRipple,
  pink: IconConfetti,
  black: IconRocket,
};

export const GameCard: React.FC<GameCardProps> = ({ card, size = 100, shadow = true, onClick, disabled, isTask, showHoverAnimation }) => {
  const { color, number } = card;
  const { background, dark } = colorStyles[color];
  const IconComponent = iconMap[color];
  const height = size * (isTask ? 1.2 : 1.4); // Aspect ratio 5:7 for cards, 5:6 for tasks
  const isBlack = color === 'black';
  const numberStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: size * 0.2,
    color: isBlack ? 'white' : dark,

    textShadow: isBlack ? '0 0 4px white' : 'none', // glow effect
  };

  const isInteractive = onClick && !disabled;
  const canHover = isInteractive && showHoverAnimation;

  const cardStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${height}px`,
    backgroundColor: background,
    border: '2px solid white',
    borderRadius: '12px',
    boxShadow: shadow ? '0 4px 12px rgba(255, 255, 255, 0.6)' : 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    cursor: isInteractive ? 'pointer' : 'default',
    transition: 'transform 0.15s ease, filter 0.15s ease',
  };
  
  const shiftUp = size * (isTask ? 1.2 : 1.4) * 0.25; // 25% of height
  const cardHoverStyle: React.CSSProperties = {
    transform: `scale(1.03) translateY(-${shiftUp}px)`,
    filter: 'brightness(1.05)',
  };

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    ...numberStyle,
  };

  const displayNumber = (number === 6 || number === 9) ? `${number}.` : `${number}`;

  return (
    <div
      style={cardStyle}
      onClick={isInteractive ? onClick : undefined}
      onMouseEnter={(e) => {
        if (canHover) Object.assign(e.currentTarget.style, cardHoverStyle);
      }}
      onMouseLeave={(e) => {
        if (canHover) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.filter = '';
        }
      }}
    >
      {/* Number Corners */}
      <span style={{ ...cornerStyle, top: '6px', left: '8px' }}>{displayNumber}</span>
      <span style={{ ...cornerStyle, top: '6px', right: '8px' }}>{displayNumber}</span>
      <span style={{ ...cornerStyle, bottom: '6px', left: '8px', transform: 'rotate(180deg)' }}>{displayNumber}</span>
      <span style={{ ...cornerStyle, bottom: '6px', right: '8px', transform: 'rotate(180deg)' }}>{displayNumber}</span>
  
      {/* Center Icon */}
      <IconComponent size={size * 0.5} color={dark} />
    </div>
  );
};
