import React from 'react';
import { IconOmega, IconCheck, IconX } from '@tabler/icons-react';
import { SimpleTask } from '../types';
import { Avatar } from '@mantine/core';

const colorStyles = {
  yellow: { background: '#FFEB3B', dark: '#F57F17' },
  green: { background: '#4CAF50', dark: '#2E7D32' },
  pink:  { background: '#EC407A', dark: '#AD1457' },
  blue:  { background: '#42A5F5', dark: '#0D47A1' },
  black: { background: '#212121', dark: '#616161' },
};

interface SimpleTaskCardProps {
  task: SimpleTask;
  size: "lg" | "md" | "sm"
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
  bigToken?: boolean;
  hideIfClaimed?: boolean;
}

export const SimpleTaskCard: React.FC<SimpleTaskCardProps> = ({
  task,
  size,
  onClick,
  disabled,
  ownerDisplayName,
  bigToken,
  hideIfClaimed
}) => {

  const hideDetails = hideIfClaimed && task.player != "";
  let simpleWidth = 80;
  if (size === "lg") simpleWidth = 100;
  if (size === "md") simpleWidth = 80;
  if (size === "sm") simpleWidth = 60;

  const { card, taskCategory, sequenceIndex, completed, failed } = task;
  const { color, number } = card;
  const { background, dark } = colorStyles[color];

  const tokenHeight = bigToken ? simpleWidth : simpleWidth * 0.6;
  const tokenGap = 4;
  const cardHeight = simpleWidth * 1.1;
  const wrapperHeight = tokenHeight + tokenGap + cardHeight;
  const isBlack = color === 'black';

  // Content for top token
  let circleContent: React.ReactNode = null;
  if (taskCategory === 'ordered') {
    circleContent = <span style={{ fontWeight: 'bold' }}>{sequenceIndex}</span>;
  } else if (taskCategory === 'sequence') {
    const chevrons = Array(sequenceIndex).fill('›').join('');
    circleContent = <span style={{ fontWeight: 'bold' }}>{chevrons}</span>;
  } else if (taskCategory === 'must_be_last') {
    circleContent = <IconOmega size={simpleWidth * 0.2} stroke={2} />;
  }

  const showOnlyBorder = !!hideDetails;
  const isInteractive = onClick && !disabled && !showOnlyBorder;

  return (
    <div
      style={{
        position: 'relative',
        width: simpleWidth,
        height: wrapperHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Token Circle or invisible spacer to preserve layout */}
      {showOnlyBorder ? (
        <div style={{ width: tokenHeight, height: tokenHeight, marginBottom: tokenGap }} />
      ) : (
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
      )}

      {/* Task Card Face – show only the border when hideDetails */}
      <div
        style={{
          width: simpleWidth,
          height: cardHeight,
          backgroundColor: showOnlyBorder ? 'transparent' : background,
          border: '2px solid white',
          borderRadius: '12px',
          boxShadow: showOnlyBorder ? 'none' : '0 2px 8px rgba(255, 255, 255, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          cursor: isInteractive ? 'pointer' : 'default',
          opacity: showOnlyBorder ? 1 : (completed || failed ? 0.5 : 1),
          transition: 'transform 0.15s ease, filter 0.15s ease',
          flexDirection: 'column',
        }}
        onClick={isInteractive ? onClick : undefined}
      >
        {!showOnlyBorder && (
          <>
            <span
              style={{
                fontWeight: 'bold',
                fontSize: simpleWidth * 0.5,
                color: isBlack ? 'white' : dark,
                textShadow: isBlack ? '0 0 4px white' : 'none',
                zIndex: 1,
              }}
            >
              {(number === 6 || number === 9) ? `${number}.` : `${number}`}
            </span>

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
                  <Avatar radius="xl" size={simpleWidth * 0.4} color="green" variant="filled">
                    <IconCheck size={simpleWidth * 0.25} stroke={2} />
                  </Avatar>
                )}
                {failed && (
                  <Avatar radius="xl" size={simpleWidth * 0.4} color="red" variant="filled">
                    <IconX size={simpleWidth * 0.25} stroke={2} />
                  </Avatar>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Owner Display Name */}
      {!showOnlyBorder && ownerDisplayName && (
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: '0.85rem' }}>
          {ownerDisplayName}
        </div>
      )}
    </div>
  );
};
