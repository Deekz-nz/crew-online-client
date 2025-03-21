import React from 'react';
import { GameCard } from './GameCard';
import { Avatar } from '@mantine/core';
import { IconSatellite } from '@tabler/icons-react';
import { Player } from '../types';

interface CommunicatedCardProps {
  player: Player;
  width: number;
}

export const CommunicatedCard: React.FC<CommunicatedCardProps> = ({ player, width }) => {
  const cardHeight = width * 1.4;

  const tokenSize = width * 0.4;
  const iconSize = width * 0.25;

  const showCard = player.communicationCard != null;

  const tokenPositionStyle: React.CSSProperties = (() => {
    switch (player.communicationRank) {
      case "highest":
        return { top: 0, left: '50%', transform: 'translate(-50%, -50%)' };
      case "lowest":
        return { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' };
      case "only":
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case "unknown":
      default:
        return {}; // Will be used to skip rendering
    }
  })();

  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Card or Outline */}
      <div style={{ position: 'relative', width, height: cardHeight }}>
        {showCard ? (
          <>
            <GameCard
              card={player.communicationCard!}
              size={width}
              shadow
              showHoverAnimation={false}
              disabled
            />
            {/* Token based on rank */}
            {player.communicationRank !== "unknown" && (
              <div
                style={{
                  position: 'absolute',
                  ...tokenPositionStyle,
                  width: tokenSize,
                  height: tokenSize,
                  pointerEvents: 'none',
                }}
              >
                <Avatar radius="xl" size={tokenSize} color="green" variant="filled">
                  <IconSatellite size={iconSize} stroke={2} />
                </Avatar>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              width,
              height: cardHeight,
              border: '2px dashed white',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Avatar radius="xl" size={tokenSize} color={player.hasCommunicated ? 'red' : 'green'} variant="filled">
              <IconSatellite size={iconSize} stroke={2} />
            </Avatar>
          </div>
        )}
      </div>

      {/* Player Name */}
      <div style={{ textAlign: 'center', marginTop: 4, fontSize: '0.85rem' }}>
        {player.displayName}
      </div>
    </div>
  );
};
