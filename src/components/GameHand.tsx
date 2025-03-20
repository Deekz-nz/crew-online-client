import React from 'react';
import { GameCard } from './GameCard';
import { Card } from '../types';

interface GameHandProps {
  hand: Card[];
  overlap?: boolean;
  cardWidth?: number;
  disabled?: boolean;
  onCardClick?: (card: Card, index: number) => void;
}

export const GameHand: React.FC<GameHandProps> = ({
  hand,
  overlap = false,
  cardWidth = 100,
  disabled = false,
  onCardClick,
}) => {
  if (overlap) {
    // Overlapping layout
    const containerWidth = cardWidth + (hand.length - 1) * (cardWidth * 0.5);
    const cardOffset = cardWidth * 0.6; // Change this to make cards overlap more or less

    return (
      <div style={{ position: 'relative', width: containerWidth, height: cardWidth * 1.4 }}>
        {hand.map((card, index) => (
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
              shadow
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
        {hand.map((card, index) => (
          <GameCard
            key={index}
            card={card}
            size={cardWidth}
            shadow
            showHoverAnimation
            disabled={disabled}
            onClick={() => onCardClick?.(card, index)}
          />
        ))}
      </div>
    );
  }
};
