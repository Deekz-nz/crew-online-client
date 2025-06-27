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
  width?: number; // base width in px
}

const CLOCKWISE_DIRECTIONS: Direction[] = [
  'bottom',
  'left',
  'top-left',
  'top-middle',
  'top-right',
  'right',
];

export const CardStack: React.FC<CardStackProps> = ({ 
  startingDirection, 
  cardFromThisDirection, 
  width = 100,
}) => {
  const startIndex = CLOCKWISE_DIRECTIONS.indexOf(startingDirection);
  const orderedDirections = [
    ...CLOCKWISE_DIRECTIONS.slice(startIndex),
    ...CLOCKWISE_DIRECTIONS.slice(0, startIndex),
  ];

  const translateAmount = width * 0.5;

  const translationMap: Record<Direction, { x: number; y: number }> = {
    bottom: { x: 0, y: translateAmount },
    left: { x: -translateAmount, y: 0 },
    'top-left': { x: -translateAmount * 0.75, y: -translateAmount * 0.75 },
    'top-middle': { x: 0, y: -translateAmount },
    'top-right': { x: translateAmount * 0.75, y: -translateAmount * 0.75 },
    right: { x: translateAmount, y: 0 },
  };

  return (
    <div style={{ position: 'relative', width: width * 2, height: width * 2.5, display: 'inline-block' }}>
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
            <GameCard card={card} size={width} shadow />
          </div>
        );
      })}
    </div>
  );
};
