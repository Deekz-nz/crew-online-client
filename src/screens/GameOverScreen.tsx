import { Box, Button, Center, Stack, Text, Title } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import Confetti from 'react-confetti';
import { useViewportSize } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { useState } from "react";
import { PlayerRecap } from "../components/PlayerRecap";
import { TaskCard } from "../components/TaskCard";

export default function GameOverScreen() {
  const {
    activePlayer,
    players,
    gameFinished,
    sendRestartGame,
    gameSucceeded,
    playerHistoryStats
  } = useGameContext();

  const [showRecap, setShowRecap] = useState(false);
  const { width, height } = useViewportSize();

  if (!gameFinished || !activePlayer) return null;

  const isHost = activePlayer?.isHost;
  const hostPlayer = players.find(p => p.isHost);
  const resultEmoji = gameSucceeded ? "🎉" : "💥";
  const resultText = gameSucceeded ? "Mission Successful!" : "Mission Failed";

  const toggleRecap = () => {
    setShowRecap(!showRecap);
  };

  // Get player display names mapping from session IDs
  const playerDisplayNames: Record<string, string> = {};
  players.forEach(player => {
    playerDisplayNames[player.sessionId] = player.displayName;
  });

  return (
    <Center w="100vw" h="100vh" style={{ padding: "20px", overflowY: "auto" }}>
      {gameSucceeded && <Confetti width={width} height={height} numberOfPieces={600} recycle={false} />}

      <Stack align="center" gap="md" style={{ width: "100%", maxWidth: "1000px" }}>
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

        <Box mt="lg" mb="lg" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isHost && (
            <Button onClick={sendRestartGame} color="teal" size="lg">
              Restart Game
            </Button>
          )}
          
          {playerHistoryStats && (
            <Button onClick={toggleRecap} color="blue" size="lg">
              {showRecap ? "Hide Game Recap" : "Show Game Recap"}
            </Button>
          )}
        </Box>

        {!isHost && !showRecap && (
          <Text size="md" c="gray">
            Waiting for {hostPlayer?.displayName} to restart...
          </Text>
        )}

      {/* Recap Section */}
      {showRecap && playerHistoryStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <Title order={2} mb="lg" ta="center">Allocated Tasks</Title>

          {/* Tasks Row */}
          <Box mb="xl">
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {Object.entries(playerHistoryStats).flatMap(([playerId, history]) =>
                history.tasks.map((task, index) => (
                  <Box key={`${playerId}-${index}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TaskCard task={task} width={60} disabled />
                    <Text size="xs" mt="xs" c="gray.6">
                      {playerDisplayNames[playerId] || `Player ${playerId}`}
                    </Text>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Title order={2} mb="md" ta="center">Starting Hands</Title>

          {/* Hands Recap - stacked vertically */}
          <Stack gap="sm" align="center">
            {Object.entries(playerHistoryStats).map(([playerId, history]) => (
              <PlayerRecap
                key={playerId}
                playerName={playerDisplayNames[playerId] || `Player ${playerId}`}
                hand={history.cards}
              />
            ))}
          </Stack>
        </motion.div>
      )}
      </Stack>
    </Center>
  );
}