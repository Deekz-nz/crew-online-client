import React from 'react';
import { IconOmega, IconCheck, IconX } from '@tabler/icons-react';
import { SimpleTask } from '../types';
import { Avatar } from '@mantine/core';

// Reuse the colorStyles from GameCard
const colorStyles = {
  yellow: { background: '#FFEB3B', dark: '#F57F17' },
  green: { background: '#4CAF50', dark: '#2E7D32' },
  pink:  { background: '#EC407A', dark: '#AD1457' },
  blue:  { background: '#42A5F5', dark: '#0D47A1' },
  black: { background: '#212121', dark: '#616161' },
};

interface SimpleTaskCardProps {
  task: SimpleTask;
  width: number;
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
  bigToken?: boolean;
}

export const SimpleTaskCard: React.FC<SimpleTaskCardProps> = ({
  task,
  width,
  onClick,
  disabled,
  ownerDisplayName,
  bigToken, 
}) => {
  const { card, taskCategory, sequenceIndex, completed, failed } = task;
  const { color, number } = card;
  const { background, dark } = colorStyles[color];

  const tokenHeight = bigToken ? width : width * 0.6; // circle token size
  const tokenGap = 4;
  const cardHeight = width * 1.1;
  const wrapperHeight = tokenHeight + tokenGap + cardHeight;
  const isBlack = color === 'black';

  // Token content at top
  let circleContent: React.ReactNode = null;
  if (taskCategory === 'ordered') {
    circleContent = <span style={{ fontWeight: 'bold' }}>{sequenceIndex}</span>;
  } else if (taskCategory === 'sequence') {
    const chevrons = Array(sequenceIndex).fill('›').join('');
    circleContent = <span style={{ fontWeight: 'bold' }}>{chevrons}</span>;
  } else if (taskCategory === 'must_be_last') {
    circleContent = <IconOmega size={width * 0.2} stroke={2} />;
  }

  const isInteractive = onClick && !disabled;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: wrapperHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Token Circle */}
      <div
        style={{
          width: tokenHeight,
          height: tokenHeight,
          marginBottom: tokenGap,
          borderRadius: '50%',
          backgroundColor: circleContent ? 'white' : 'transparent',
          color: 'black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: tokenHeight * 0.6,
          border: circleContent ? '2px solid black' : 'none',
          boxShadow: circleContent ? '0 0 4px rgba(0, 0, 0, 0.4)' : 'none',
        }}
      >
        {circleContent}
      </div>

      {/* Refactored Task Card Face */}
      <div
        style={{
          width,
          height: cardHeight,
          backgroundColor: background,
          border: '2px solid white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          cursor: isInteractive ? 'pointer' : 'default',
          opacity: completed || failed ? 0.5 : 1,
          transition: 'transform 0.15s ease, filter 0.15s ease',
          flexDirection: 'column', // Stack number and icon vertically
        }}
        onClick={isInteractive ? onClick : undefined}
      >
        {/* Big Center Number */}
        <span
          style={{
            fontWeight: 'bold',
            fontSize: width * 0.5,
            color: isBlack ? 'white' : dark,
            textShadow: isBlack ? '0 0 4px white' : 'none',
            zIndex: 1, // Ensure it's above the icon
          }}
        >
          {(number === 6 || number === 9) ? `${number}.` : `${number}`}
        </span>
        {/* Completed / Failed Overlay */}
        {(completed || failed) && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            {completed && (
              <Avatar radius="xl" size={width * 0.4} color="green" variant="filled">
                <IconCheck size={width * 0.25} stroke={2} />
              </Avatar>
            )}
            {failed && (
              <Avatar radius="xl" size={width * 0.4} color="red" variant="filled">
                <IconX size={width * 0.25} stroke={2} />
              </Avatar>
            )}
          </div>
        )}
      </div>

      {/* Owner Display Name */}
      {ownerDisplayName && (
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: '0.85rem' }}>
          {ownerDisplayName}
        </div>
      )}
    </div>
  );
};
