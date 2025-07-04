import React from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ExpansionTask } from '../types';
import { Avatar, Text } from '@mantine/core';

interface ExpansionTaskCardProps {
  task: ExpansionTask;
  width: number;
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
  bigToken?: boolean;
}

export const ExpansionTaskCard: React.FC<ExpansionTaskCardProps> = ({
  task,
  width,
  onClick,
  disabled,
  ownerDisplayName,
  bigToken, 
}) => {
  const { displayName, description, evaluationDescription, completed, failed } = task;

  const tokenHeight = bigToken ? width : width * 0.6; // circle token size
  const tokenGap = 4;
  const cardHeight = width * 1.1;
  const wrapperHeight = tokenHeight + tokenGap + cardHeight;


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
      {/* Refactored Task Card Face */}
      <div
        style={{
          width,
          height: cardHeight,
          backgroundColor: "white",
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
        <Text>
          {displayName}
        </Text>
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
