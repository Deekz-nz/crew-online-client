import React, { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ExpansionTask } from '../types';
import { Avatar, Text, Rating, Button, Modal, Stack } from '@mantine/core';
import { useGameContext } from '../hooks/GameProvider';
import { ColorizedTaskTitle } from './ColourTaskTitle';

interface ExpansionTaskCardProps {
  task: ExpansionTask;
  size: 'lg' | 'md' | 'sm';
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
  bigToken?: boolean;
  hideIfClaimed?: boolean;
}

export const ExpansionTaskCard: React.FC<ExpansionTaskCardProps> = ({
  task,
  size,
  onClick,
  disabled,
  ownerDisplayName,
  hideIfClaimed
}) => {
  const { displayName, completed, failed, evaluationDescription, difficulty, player } = task;

  const hideDetails = hideIfClaimed && task.player != "";

  const {
    activePlayer,
    players,
    sendRegisterInterest,
    sendCancelInterest
  } = useGameContext();

  const [opened, setOpened] = useState(false);

  const sizeConfig = {
    sm: { width: 70,  textSize: 'sm' as const },
    md: { width: 95,  textSize: 'md' as const },
    lg: { width: 120, textSize: 'lg' as const },
  };

  const currentSize = sizeConfig[size] ?? sizeConfig['md'];
  const { width, textSize } = currentSize;
  const wrapperHeight = width;

  const showOnlyBorder = !!hideDetails;
  const isInteractive = !!onClick && !disabled && !showOnlyBorder;

  const isInterested = task.interestedPlayers?.includes(activePlayer?.sessionId ?? "");
  const interestedNames = players
    .filter(p => task.interestedPlayers?.includes(p.sessionId))
    .map(p => p.displayName);

  const handleClick = () => {
    if (!showOnlyBorder) setOpened(true);
  };

  const renderButtonLabel = () => {
    if (!isInteractive) return null;
    if (!player) return 'Claim task';
    if (player === activePlayer?.sessionId) return 'Return task';
    return null;
  };

  return (
    <>
      <Stack gap="xs" align="center">
        {/* Hide the owner name when showing only the border */}
        {!showOnlyBorder && ownerDisplayName && <Text>{ownerDisplayName}</Text>}

        <div
          style={{
            position: 'relative',
            width,
            height: wrapperHeight,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            background: showOnlyBorder
              ? 'transparent'
              : 'linear-gradient(135deg, #cbe6f5 0%, #f2f2f2 100%)',
            border: '4px solid',
            borderColor: showOnlyBorder
              ? 'white'
              : (isInterested && !task.player ? 'green' : 'white'),
            borderRadius: 16,
            boxShadow: showOnlyBorder ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: 2,
            boxSizing: 'border-box',
            cursor: isInteractive ? 'pointer' : 'default',
            opacity: showOnlyBorder ? 1 : (completed || failed ? 0.6 : 1),
            transition: 'transform 0.15s ease, filter 0.15s ease',
            overflow: 'hidden',
          }}
          onClick={handleClick}
        >
          {!showOnlyBorder && (
            <>
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

              {task.interestedPlayers?.length && !task.player ? (
                <Avatar
                  size={width * 0.25}
                  radius="xl"
                  variant="filled"
                  color="green"
                  p={2}
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    fontSize: width * 0.18,
                    fontWeight: 600,
                    lineHeight: 1,
                    pointerEvents: 'none',
                  }}
                >
                  {task.interestedPlayers.length}
                </Avatar>
              ) : null}
            </>
          )}
        </div>
      </Stack>

      {/* Don’t render the modal at all when showing only the border */}
      {!showOnlyBorder && (
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

          {interestedNames.length > 0 && (
            <>
              <Text size="lg" fw={500} mt="sm" mb={4}>
                Interested Players:
              </Text>
              <Text mb="sm">{interestedNames.join(', ')}</Text>
            </>
          )}

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

          {isInteractive && (
            <Button
              size="lg"
              fullWidth
              mt="sm"
              onClick={() => {
                isInterested ? sendCancelInterest(task) : sendRegisterInterest(task);
                setOpened(false);
              }}
            >
              {isInterested ? 'Cancel Interest' : 'Register Interest'}
            </Button>
          )}
        </Modal>
      )}
    </>
  );
};
