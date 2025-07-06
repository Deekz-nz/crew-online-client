import { Box, Button, Center, Stack, Text, Title } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import Confetti from 'react-confetti';
import { useViewportSize } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { useState } from "react";
import { PlayerRecap } from "../components/PlayerRecap";
import { TaskCard } from "../components/TaskCard";
import { getInspirationalQuote, getSuccessQuote } from "../utils/quotes";

export default function GameOverScreen() {
  const {
    activePlayer,
    players,
    gameFinished,
    sendRestartGame,
    gameSucceeded,
    playerHistoryStats,
    playExpansion,
    expansionDifficulty,
  } = useGameContext();

  const [showRecap, setShowRecap] = useState(false);
  const { width, height } = useViewportSize();

  if (!gameFinished || !activePlayer) return null;

  const isHost = activePlayer?.isHost;
  const hostPlayer = players.find(p => p.isHost);
  const resultEmoji = gameSucceeded ? "🎉" : "💥";
  const resultText = gameSucceeded ? "Mission Successful!" : "Mission Failed";

  const toggleRecap = () => setShowRecap(!showRecap);
  const [inspirationalQuote] = useState(() => getInspirationalQuote());
  const [successQuote] = useState(() => getSuccessQuote());


  const playerDisplayNames: Record<string, string> = {};
  players.forEach(player => {
    playerDisplayNames[player.sessionId] = player.displayName;
  });

  const handleRestart = () => {
    sendRestartGame();
  }

  const allocatedTitle = playExpansion ? `Allocated Task (Difficulty: ${expansionDifficulty})` : "Allocated Tasks";

  return (
    <motion.div
      initial={gameSucceeded ? {} : { x: 0 }}
      animate={gameSucceeded ? {} : { x: [-10, 10, -6, 6, -3, 3, 0] }}
      transition={
        gameSucceeded
          ? {}
          : {
              duration: 0.4,
              repeat: 5,       // Shake 5 times
              repeatType: "loop",
            }
      }
      style={{ position: "relative" }}
    >
      {!gameSucceeded && (
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{
            backgroundColor: ["#ff0000", "#ff6600", "#ffff00", "#ff0000"],
            opacity: [0.9, 0.4, 0.7, 0],
          }}
          transition={{ duration: 1.2 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
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
              <Text size="3rem" fw={900} c="teal" ta="center">
                {resultEmoji} {resultText} {resultEmoji}
              </Text>
              <Text size="xl" fw={600} mt="sm" c="gray.7" ta="center">
                {successQuote}
              </Text>
            </motion.div>
          ) : (
            <>
              {/* Explosion Animation */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.5, 0.9], opacity: [0, 1, 1] }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center' }}
              >
                <Text size="3rem" fw={900} c="red">
                  💥 Mission Failed 💥
                </Text>
              </motion.div>

              <Text size="xl" fw={600} mt="sm" c="gray.7">
                Better luck next time.
              </Text>

              <Text mt="md" c="gray.6" ta="center" maw={600}>
                {inspirationalQuote}
              </Text>
            </>
          )}

          <Box mt="lg" mb="lg" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {isHost && (
              <Button onClick={handleRestart} color="teal" size="lg">
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

          {showRecap && playerHistoryStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%" }}
            >
              <Title order={2} mb="lg" ta="center">{allocatedTitle}</Title>

              <Box mb="xl">
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
                  {Object.entries(playerHistoryStats).map(([playerId, history]) => (
                    history.tasks.length > 0 && (
                      <Box key={playerId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {history.tasks.map((task, index) => (
                            <TaskCard key={`${playerId}-${index}`} task={task} size="sm" disabled />
                          ))}
                        </Box>
                        <Text size="md" fw={600} mt="sm" c="gray.7" ta="center">
                          {playerDisplayNames[playerId] || `Player ${playerId}`}
                        </Text>
                      </Box>
                    )
                  ))}
                </Box>
              </Box>

              <Title order={2} mb="md" ta="center">Starting Hands</Title>

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
    </motion.div>
  );
}
