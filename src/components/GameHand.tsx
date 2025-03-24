import React from 'react';
import { GameCard } from './GameCard';
import { Card, CardColor } from '../types';

interface GameHandProps {
  hand: Card[];
  overlap?: boolean;
  cardWidth?: number;
  disabled?: boolean;
  onCardClick?: (card: Card, index: number) => void;
  colorOrder?: CardColor[];
  lowToHigh?: boolean; 
  disableShadow?: boolean;
}

export const GameHand: React.FC<GameHandProps> = ({
  hand,
  overlap = false,
  cardWidth = 100,
  disabled = false,
  onCardClick,
  colorOrder,
  lowToHigh,
  disableShadow
}) => {
  const defaultColorOrder: CardColor[] = ["black", "pink", "blue", "yellow", "green"];
  const colorPriority = (colorOrder ?? defaultColorOrder).reduce<Record<CardColor, number>>(
    (acc, color, index) => {
      acc[color] = index;
      return acc;
    },
    { yellow: 0, green: 0, pink: 0, blue: 0, black: 0 }
  );

  const sortedHand = [...hand].sort((a, b) => {
    const colorDiff = colorPriority[a.color] - colorPriority[b.color];
    if (colorDiff !== 0) return colorDiff;
  
    // Same color, sort by number
    return lowToHigh !== false ? a.number - b.number : b.number - a.number;
  });
  
  if (overlap) {
    // Overlapping layout
    const containerWidth = cardWidth + (hand.length - 1) * (cardWidth * 0.6);
    const cardOffset = cardWidth * 0.6; // Change this to make cards overlap more or less

    return (
      <div style={{ position: 'relative', width: containerWidth, height: cardWidth * 1.4 }}>
        {sortedHand.map((card, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${index * cardOffset}px`,
              zIndex: index,
            }}
          >
            <GameCard
              card={card}
              size={cardWidth}
              shadow={disableShadow ? false : true}
              showHoverAnimation
              disabled={disabled}
              onClick={() => onCardClick?.(card, index)}
            />
          </div>
        ))}
      </div>
    );
  } else {
    // Non-overlapping layout (inline row)
    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        {sortedHand.map((card, index) => (
          <GameCard
            key={index}
            card={card}
            size={cardWidth}
            shadow={disableShadow ? false : true}
            showHoverAnimation
            disabled={disabled}
            onClick={() => onCardClick?.(card, index)}
          />
        ))}
      </div>
    );
  }
};
