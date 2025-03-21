import { Button, Center, Stack, Text } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";

export default function GameOverScreen() {
  const {
    activePlayer,
    players,
    gameFinished,
    gameSucceeded,
    sendRestartGame,
  } = useGameContext();

  if (!gameFinished || !activePlayer) return null;

  const isHost = activePlayer.isHost;
  const hostPlayer = players.find(p => p.isHost);
  const resultEmoji = gameSucceeded ? "🎉" : "💥";
  const resultText = gameSucceeded ? "Mission Successful!" : "Mission Failed";

  return (
    <Center w="100vw" h="100vh">
      <Stack align="center" gap="md">
        <Text size="xl" fw={700}>
          {resultEmoji} {resultText}
        </Text>

        {isHost ? (
          <Button onClick={sendRestartGame} color="teal">
            Restart Game
          </Button>
        ) : (
          <Text size="md" c="gray">
            Waiting for {hostPlayer?.displayName} to restart...
          </Text>
        )}
      </Stack>
    </Center>
  );
}
