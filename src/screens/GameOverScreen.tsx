import { Button, Center, Stack, Text } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import Confetti from 'react-confetti';
import { useViewportSize } from '@mantine/hooks';
import { motion } from 'framer-motion';

export default function GameOverScreen() {
  const {
    activePlayer,
    players,
    gameFinished,
    sendRestartGame,
    gameSucceeded
  } = useGameContext();

  const { width, height } = useViewportSize();

  if (!gameFinished || !activePlayer) return null;

  const isHost = activePlayer?.isHost;
  const hostPlayer = players.find(p => p.isHost);
  const resultEmoji = gameSucceeded ? "🎉" : "💥";
  const resultText = gameSucceeded ? "Mission Successful!" : "Mission Failed";


  return (
    <Center w="100vw" h="100vh">
      {gameSucceeded && <Confetti width={width} height={height} numberOfPieces={600} recycle={false} />}

      <Stack align="center" gap="md">
        {gameSucceeded ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Text size="3rem" fw={900} c={gameSucceeded ? "teal" : "red"} ta="center">
              {resultEmoji} {resultText} {resultEmoji}
            </Text>
            <Text size="xl" fw={600} mt="sm" c="gray.7" ta="center">
              {gameSucceeded ? "Great work, crew!" : "Better luck next time."}
            </Text>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Text size="3rem" fw={900} c="red">
              💥 Mission Failed 💥
            </Text>
            <Text size="xl" fw={600} mt="sm" c="gray.7">
              Better luck next time.
            </Text>
          </motion.div>
        )}

        {isHost ? (
          <Button onClick={sendRestartGame} color="teal" size="lg" mt="lg">
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
