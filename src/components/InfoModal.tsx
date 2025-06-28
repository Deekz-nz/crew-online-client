import { Modal, Stack, Text, Divider, Button, Group, CopyButton } from '@mantine/core';
import { useGameContext } from '../hooks/GameProvider';
import { GameHand } from './GameHand';

interface InfoModalProps {
  opened: boolean;
  onClose: () => void;
}

export function InfoModal({ opened, onClose }: InfoModalProps) {
  const { completedTricks, players, expectedTrickCount, activePlayer, room, sendRestartGame, sendGiveUp } = useGameContext();

  const tricksRemaining = expectedTrickCount - completedTricks.length;

  const roomUrl = `${window.location.origin}/${room?.roomId ?? ""}`;

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
        {room && (
          <>
            <Text fw={600}>Room Code:</Text>
            <Group align="center">
              <Text size="lg" fw={700} style={{ letterSpacing: '0.1em' }}>
                {room.roomId}
              </Text>
              <CopyButton value={roomUrl} timeout={2000}>
                {({ copied, copy }) => (
                  <Button size="xs" onClick={copy}>
                    {copied ? 'Copied' : 'Copy Link'}
                  </Button>
                )}
              </CopyButton>
            </Group>
            <Divider />
          </>
        )}
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
          <>
            <Button onClick={sendGiveUp} color="red">
              Give up
            </Button>
            <Button onClick={sendRestartGame} color="teal">
              Restart Game
            </Button>
          </>
        }
      </Stack>
    </Modal>
  );
}
