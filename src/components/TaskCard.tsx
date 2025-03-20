import React from 'react';
import { GameCard } from './GameCard';
import { IconOmega, IconCheck, IconX } from '@tabler/icons-react';
import { SimpleTask } from '../types';
import { Avatar } from '@mantine/core';

interface TaskCardProps {
  task: SimpleTask;
  width: number;
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
}


export const TaskCard: React.FC<TaskCardProps> = ({ task, width, onClick, disabled, ownerDisplayName }) => {
  const { taskCategory, sequenceIndex, completed, failed } = task;

  let circleContent: React.ReactNode = null;
  if (taskCategory === "ordered") {
    circleContent = <span style={{ fontWeight: 'bold' }}>{sequenceIndex}</span>;
  } else if (taskCategory === "sequence") {
    const chevrons = Array(sequenceIndex).fill('›').join('');
    circleContent = <span style={{ fontWeight: 'bold' }}>{chevrons}</span>;
  } else if (taskCategory === "must_be_last") {
    circleContent = <IconOmega size={width * 0.2} stroke={2} />;
  }

  const tokenHeight = width * 0.3;     // space for circle token
  const tokenGap = 4;                  // gap between token and card
  const cardHeight = width * 1.4;      // standard GameCard height
  const wrapperHeight = tokenHeight + tokenGap + cardHeight;

  return (
    <div style={{ position: 'relative', width, height: wrapperHeight, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Token Circle (positioned at top) */}
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
          fontSize: width * 0.15,
          border: circleContent ? '2px solid black' : 'none',
          boxShadow: circleContent ? '0 0 4px rgba(0, 0, 0, 0.4)' : 'none',
        }}
      >
        {circleContent}
      </div>
  
      {/* GameCard */}
      <div style={{ position: 'relative' }}>
        <GameCard
          card={task.card}
          size={width}
          shadow
          isTask
          showHoverAnimation={false}
          onClick={onClick}
          disabled={disabled}
          faded={completed || failed}
        />
  
        {/* Overlay Icon */}
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
  
      {/* Owner Name */}
      {ownerDisplayName && (
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: '0.85rem' }}>
          {ownerDisplayName}
        </div>
      )}
    </div>
  );
  
};