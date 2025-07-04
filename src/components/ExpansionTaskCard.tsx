import React from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ExpansionTask } from '../types';
import { Avatar, Text } from '@mantine/core';

interface ExpansionTaskCardProps {
  task: ExpansionTask;
  size: "lg" | "md" | "sm"
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
  bigToken?: boolean;
}

export const ExpansionTaskCard: React.FC<ExpansionTaskCardProps> = ({
  task,
  size,
  onClick,
  disabled,
  ownerDisplayName,
}) => {
  const { displayName, completed, failed } = task;

  let width = 100;
  if (size === "sm") width = 100;
  if (size === "md") width = 120;
  if (size === "lg") width = 140;
  const contentHeight = width;
  const wrapperHeight = contentHeight;

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
        justifyContent: 'flex-start',
        background: 'linear-gradient(135deg, #cbe6f5 0%, #f2f2f2 100%)', // cloudy blue-white
        border: '4px solid white',
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: 12,
        boxSizing: 'border-box',
        cursor: isInteractive ? 'pointer' : 'default',
        opacity: completed || failed ? 0.6 : 1,
        transition: 'transform 0.15s ease, filter 0.15s ease',
      }}
      onClick={isInteractive ? onClick : undefined}
    >
      {/* Text directly on the background */}
      <Text size="lg" fw={600} c="black" ta="center">
        {displayName}
      </Text>

      {/* Completed / Failed Icon */}
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

      {/* Optional owner label */}
      {ownerDisplayName && (
        <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#222', textAlign: 'center' }}>
          {ownerDisplayName}
        </div>
      )}
    </div>
  );
};
