import { Button, Checkbox, CopyButton, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useGameContext } from "../hooks/GameProvider";

/**
 * GameSetupScreen
 * ----------------
 * Screen shown after joining a room, before the game starts ("not_started" stage).
 *
 * - Displays list of players in the room and indicates who the host is.
 * - If the user is the host:
 *     - Shows game setup form to configure number/type of tasks.
 *     - Displays a "Start Game" button to begin task allocation.
 * - Non-host players see a "Waiting for host to start the game" message.
 *
 * Transitions to TaskPhaseScreen when the game is started.
 */

// Local storage key
const LOCAL_STORAGE_KEY = "gameTaskSettings";

// Default task settings
const defaultTaskSettings = {
  includeTasks: true,
  lastTask: false,
  plainTasks: 1,
  orderedTasks: 0,
  sequencedTasks: 0,
};

export default function GameSetupScreen() {
  const { players, room, startGame, activePlayer } = useGameContext();

  const [includeTasks, setIncludeTasks] = useState(defaultTaskSettings.includeTasks);
  const [lastTask, setLastTask] = useState(defaultTaskSettings.lastTask);
  const [plainTasks, setPlainTasks] = useState(defaultTaskSettings.plainTasks);
  const [orderedTasks, setOrderedTasks] = useState(defaultTaskSettings.orderedTasks);
  const [sequencedTasks, setSequencedTasks] = useState(defaultTaskSettings.sequencedTasks);

  const isHost = activePlayer?.isHost;
  const roomUrl = `${window.location.origin}/${room?.roomId || ""}`;

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object") {
          setIncludeTasks(parsed.includeTasks ?? defaultTaskSettings.includeTasks);
          setLastTask(parsed.lastTask ?? defaultTaskSettings.lastTask);
          setPlainTasks(parsed.plainTasks ?? defaultTaskSettings.plainTasks);
          setOrderedTasks(parsed.orderedTasks ?? defaultTaskSettings.orderedTasks);
          setSequencedTasks(parsed.sequencedTasks ?? defaultTaskSettings.sequencedTasks);
        }
      } catch (e) {
        console.warn("Failed to parse task settings from local storage", e);
      }
    }
  }, []);

  // Save settings to local storage
  const saveToLocalStorage = () => {
    const settings = {
      includeTasks,
      lastTask,
      plainTasks,
      orderedTasks,
      sequencedTasks,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  };

  // Handle game start
  const handleStartGame = () => {
    saveToLocalStorage();
    startGame({
      includeTasks,
      taskInstructions: {
        plainTasks,
        orderedTasks,
        sequencedTasks,
        lastTask,
      },
    });
  };

  // Reset settings to defaults
  const handleResetDefaults = () => {
    setIncludeTasks(defaultTaskSettings.includeTasks);
    setLastTask(defaultTaskSettings.lastTask);
    setPlainTasks(defaultTaskSettings.plainTasks);
    setOrderedTasks(defaultTaskSettings.orderedTasks);
    setSequencedTasks(defaultTaskSettings.sequencedTasks);
  };

  return (
    <Stack>
      <Title order={2}>Game Setup</Title>
      <Text fw={500}>Players:</Text>
      <Stack>
        {players.map((p) => (
          <Text key={p.sessionId}>
            {p.displayName} {p.isHost ? "(Host)" : ""} {p.sessionId === room?.sessionId ? "(You)" : ""}
          </Text>
        ))}
      </Stack>

      {room && (
        <Stack>
          <Text fw={500}>Room Code:</Text>
          <Group align="center">
            <Text size="xl" fw={700} style={{ letterSpacing: "0.1em" }}>
              {room.roomId}
            </Text>
            <CopyButton value={roomUrl} timeout={2000}>
              {({ copied, copy }) => (
                <Button size="sm" onClick={copy}>
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              )}
            </CopyButton>
          </Group>
          <Text size="sm" c="dimmed">
            Share this code with your friends so they can join.
          </Text>
        </Stack>
      )}

      {isHost ? (
        <>
          <Text fw={500} mt="md">Task Settings:</Text>
          <Checkbox
            label="Include Tasks"
            checked={includeTasks}
            onChange={(e) => setIncludeTasks(e.currentTarget.checked)}
          />
          <Checkbox
            label="Include Last Trick Task"
            checked={lastTask}
            onChange={(e) => setLastTask(e.currentTarget.checked)}
            disabled={!includeTasks}
          />
          <Group grow>
            <NumberInput
              label="Plain Tasks"
              value={plainTasks}
              onChange={(val) => setPlainTasks(typeof val === "number" ? val : 0)}
              min={0}
              max={8}
              disabled={!includeTasks}
            />
            <NumberInput
              label="Ordered Tasks"
              value={orderedTasks}
              onChange={(val) => setOrderedTasks(typeof val === "number" ? val : 0)}
              min={0}
              max={8}
              disabled={!includeTasks}
            />
            <NumberInput
              label="Sequenced Tasks"
              value={sequencedTasks}
              onChange={(val) => setSequencedTasks(typeof val === "number" ? val : 0)}
              min={0}
              max={8}
              disabled={!includeTasks}
            />
          </Group>

          <Group mt="sm">
            <Button variant="default" onClick={handleResetDefaults}>
              Reset to Default
            </Button>
            <Button onClick={handleStartGame} color="blue">
              Start Game
            </Button>
          </Group>
        </>
      ) : (
        <Text mt="md" c="dimmed">Waiting for the host to start the game...</Text>
      )}
    </Stack>
  );
}