import React, { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ExpansionTask } from '../types';
import { Avatar, Text, Rating, Button, Modal } from '@mantine/core';
import { useGameContext } from '../hooks/GameProvider';
import { ColorizedTaskTitle } from './ColourTaskTitle';

interface ExpansionTaskCardProps {
  task: ExpansionTask;
  size: 'lg' | 'md' | 'sm';
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
  const { displayName, completed, failed, evaluationDescription, difficulty, player } = task;

  const { activePlayer } = useGameContext();

  const [opened, setOpened] = useState(false);

  const sizeConfig = {
    sm: {
      width: 70,
      textSize: 'sm',
    },
    md: {
      width: 95,
      textSize: 'md',
    },
    lg: {
      width: 120,
      textSize: 'lg',
    },
  };

  const currentSize = sizeConfig[size] ?? sizeConfig['md'];
  const { width, textSize } = currentSize;
  const wrapperHeight = width;
  const isInteractive = !!onClick && !disabled;

  const handleClick = () => {
    setOpened(true);
  };

  const renderButtonLabel = () => {
    if (!isInteractive) return null;
    if (!player) return 'Claim task';
    if (player === activePlayer?.sessionId) return 'Return task';
    return null;
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          width,
          height: wrapperHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          background: 'linear-gradient(135deg, #cbe6f5 0%, #f2f2f2 100%)',
          border: '4px solid white',
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: 2,
          boxSizing: 'border-box',
          cursor: 'pointer',
          opacity: completed || failed ? 0.6 : 1,
          transition: 'transform 0.15s ease, filter 0.15s ease',
          overflow: 'hidden',
        }}
        onClick={handleClick}
      >
        <ColorizedTaskTitle text={displayName} size={textSize} />

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

        {ownerDisplayName && (
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#222', textAlign: 'center' }}>
            {ownerDisplayName}
          </div>
        )}
      </div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={displayName}
        centered
      >
        <Text size="sm">Evaluation description:</Text>
        <Text size="lg" mb="sm">
          {evaluationDescription}
        </Text>

        <Text size="lg" fw={500} mt="sm" mb={4}>
          Difficulty:
        </Text>
        <Rating value={difficulty} readOnly />

        {renderButtonLabel() && (
          <Button
            size="lg"
            fullWidth
            mt="md"
            onClick={() => {
              onClick?.();
              setOpened(false);
            }}
          >
            {renderButtonLabel()}
          </Button>
        )}
      </Modal>
    </>
  );
};
