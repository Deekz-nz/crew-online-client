import { Button, Checkbox, CopyButton, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
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

export default function GameSetupScreen() {
  const {
    players,
    room,
    startGame,
    activePlayer
  } = useGameContext();

  const [includeTasks, setIncludeTasks] = useState(true);
  const [lastTask, setLastTask] = useState(false);
  const [plainTasks, setPlainTasks] = useState(1);
  const [orderedTasks, setOrderedTasks] = useState(0);
  const [sequencedTasks, setSequencedTasks] = useState(0);

  const isHost = activePlayer?.isHost;
  const roomUrl = `${window.location.origin}/${room?.roomId || ""}`;

  const handleStartGame = () => {
    startGame({
      includeTasks,
      taskInstructions: {
        plainTasks,
        orderedTasks,
        sequencedTasks,
        lastTask
      }
    });
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
          <Button onClick={handleStartGame} mt="md" color="blue">Start Game</Button>
        </>
      ) : (
        <Text mt="md" c="dimmed">Waiting for the host to start the game...</Text>
      )}
    </Stack>
  );
}
