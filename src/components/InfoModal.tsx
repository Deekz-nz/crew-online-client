import { Modal, Stack, Text, Divider, Button } from '@mantine/core';
import { useGameContext } from '../hooks/GameProvider';
import { GameHand } from './GameHand';

interface InfoModalProps {
  opened: boolean;
  onClose: () => void;
}

export function InfoModal({ opened, onClose }: InfoModalProps) {
  const { completedTricks, players, expectedTrickCount, activePlayer, sendRestartGame } = useGameContext();

  const tricksRemaining = expectedTrickCount - completedTricks.length;

  const playerWinsMap: Record<string, number> = {};
  completedTricks.forEach(trick => {
    const winnerId = trick.trickWinner;
    playerWinsMap[winnerId] = (playerWinsMap[winnerId] || 0) + 1;
  });

  const isHost = activePlayer?.isHost;
  const lastTrick = completedTricks.length > 0 ? completedTricks[completedTricks.length - 1] : null;

  return (
    <Modal opened={opened} onClose={onClose} title="Game Info" centered>
      <Stack gap="sm">
        <Text fw={600}>Tricks Remaining: {tricksRemaining}</Text>

        <Divider />

        <Text fw={600}>Tricks Won:</Text>
        <Stack pl="md">
          {players.map(player => (
            <Text key={player.sessionId}>
              {player.displayName}: {playerWinsMap[player.sessionId] || 0}
            </Text>
          ))}
        </Stack>

        <Divider />

        <Text fw={600}>Last Trick:</Text>
        {lastTrick ? (
          <Stack>
            <GameHand hand={lastTrick.playedCards} overlap cardWidth={80} />
            <Text>
              Won by:{' '}
              {players.find(p => p.sessionId === lastTrick.trickWinner)?.displayName ?? 'Unknown'}
            </Text>
          </Stack>
        ) : (
          <Text>No tricks completed yet.</Text>
        )}
        {isHost &&
          <Button onClick={sendRestartGame} color="teal">
            Restart Game
          </Button>
        }
      </Stack>
    </Modal>
  );
}
