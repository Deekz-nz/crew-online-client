// CardStack.tsx
import React from 'react';
import { Card } from '../types';
import { GameCard } from './GameCard';

export type Direction = 
  | 'bottom' 
  | 'left' 
  | 'top-left' 
  | 'top-middle' 
  | 'top-right' 
  | 'right';

interface CardStackProps {
  startingDirection: Direction;
  cardFromThisDirection: Partial<Record<Direction, Card>>;
  size?: number;
}

const CLOCKWISE_DIRECTIONS: Direction[] = [
  'bottom',
  'left',
  'top-left',
  'top-middle',
  'top-right',
  'right',
];

// Translation offsets for each direction
const translationMap: Record<Direction, { x: number; y: number }> = {
  bottom: { x: 0, y: 20 },
  left: { x: -20, y: 0 },
  "top-left": { x: -15, y: -15 },
  "top-middle": { x: 0, y: -20 },
  "top-right": { x: 15, y: -15 },
  right: { x: 20, y: 0 },
};

export const CardStack: React.FC<CardStackProps> = ({ 
  startingDirection, 
  cardFromThisDirection, 
  size = 100 
}) => {
  // Reorder directions starting from startingDirection
  const startIndex = CLOCKWISE_DIRECTIONS.indexOf(startingDirection);
  const orderedDirections = [
    ...CLOCKWISE_DIRECTIONS.slice(startIndex),
    ...CLOCKWISE_DIRECTIONS.slice(0, startIndex),
  ];

  return (
    <div style={{ position: 'relative', width: size * 1.5, height: size * 2, display: 'inline-block' }}>
      {orderedDirections.map((direction, index) => {
        const card = cardFromThisDirection[direction];
        if (!card) return null;

        const { x, y } = translationMap[direction];
        const cardStyle: React.CSSProperties = {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          zIndex: index,
        };

        return (
          <div key={direction} style={cardStyle}>
            <GameCard card={card} size={size} shadow />
          </div>
        );
      })}
    </div>
  );
};
