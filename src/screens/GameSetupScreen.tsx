import {
  ActionIcon,
  Button,
  Checkbox,
  CopyButton,
  Group,
  NumberInput,
  Radio,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useGameContext } from "../hooks/GameProvider";
import { IconX } from "@tabler/icons-react";

// --- Local-storage keys -----------------------------------------------------
const LS_SETTINGS = "gameTaskSettings";
export const LS_PREVIOUS_TASKS = "previousTaskIDs";

// --- Defaults ---------------------------------------------------------------
const defaultTaskSettings = {
  includeTasks: true,
  lastTask: false,
  plainTasks: 1,
  orderedTasks: 0,
  sequencedTasks: 0,
};

const defaultExpansionSettings = {
  playExpansion: false,
  expansionDifficulty: 8,
  gameVersionValue: "base",
};

export default function GameSetupScreen() {
  const { players, room, startGame, activePlayer, sendKickPlayer } = useGameContext();
  const isHost = activePlayer?.isHost;

  // ----- BASE-GAME state ----------------------------------------------------
  const [includeTasks, setIncludeTasks] = useState(
    defaultTaskSettings.includeTasks,
  );
  const [lastTask, setLastTask] = useState(defaultTaskSettings.lastTask);
  const [plainTasks, setPlainTasks] = useState(defaultTaskSettings.plainTasks);
  const [orderedTasks, setOrderedTasks] = useState(
    defaultTaskSettings.orderedTasks,
  );
  const [sequencedTasks, setSequencedTasks] = useState(
    defaultTaskSettings.sequencedTasks,
  );

  // ----- EXPANSION state ----------------------------------------------------
  const [playExpansion, setPlayExpansion] = useState(
    defaultExpansionSettings.playExpansion,
  );
  const [expansionDifficulty, setExpansionDifficulty] = useState<number>(
    defaultExpansionSettings.expansionDifficulty,
  );
  const [gameVersionValue, setGameVersionValue] = useState(
    defaultExpansionSettings.gameVersionValue,
  );

  // ----- “use previous tasks” state ----------------------------------------
  const [storedTaskIDs, setStoredTaskIDs] = useState<string[]>([]);
  const [usePreviousTasks, setUsePreviousTasks] = useState(false);

  // -------------------------------------------------------------------------
  // Load settings + previous tasks once on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    // ---------- main settings
    const rawSettings = localStorage.getItem(LS_SETTINGS);
    if (rawSettings) {
      try {
        const s = JSON.parse(rawSettings);
        setIncludeTasks(s.includeTasks ?? defaultTaskSettings.includeTasks);
        setLastTask(s.lastTask ?? defaultTaskSettings.lastTask);
        setPlainTasks(s.plainTasks ?? defaultTaskSettings.plainTasks);
        setOrderedTasks(s.orderedTasks ?? defaultTaskSettings.orderedTasks);
        setSequencedTasks(
          s.sequencedTasks ?? defaultTaskSettings.sequencedTasks,
        );
        setPlayExpansion(
          s.playExpansion ?? defaultExpansionSettings.playExpansion,
        );
        setExpansionDifficulty(
          s.expansionDifficulty ?? defaultExpansionSettings.expansionDifficulty,
        );
        setGameVersionValue(
          s.gameVersionValue ?? defaultExpansionSettings.gameVersionValue,
        );
      } catch (err) {
        console.warn("Could not parse gameTaskSettings", err);
      }
    }

    // ---------- previous tasks
    const rawPrev = localStorage.getItem(LS_PREVIOUS_TASKS);
    if (rawPrev) {
      try {
        const parsed = JSON.parse(rawPrev);
        // we support either a raw array or {previousTaskIDs:[...]}
        const ids: unknown =
          Array.isArray(parsed) ? parsed : parsed?.previousTaskIDs;
        if (Array.isArray(ids) && ids.length) {
          setStoredTaskIDs(ids);
          setUsePreviousTasks(true); // auto-tick if we have them
        }
      } catch (err) {
        console.warn("Could not parse previousTaskIDs", err);
      }
    }
  }, []);

  // -------------------------------------------------------------------------
  // Keep expansion / includeTasks mutually exclusive
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (gameVersionValue === "expansion") {
      setPlayExpansion(true);
      setIncludeTasks(false);
    } else {
      setPlayExpansion(false);
      setIncludeTasks(true);
    }
  }, [gameVersionValue]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const saveSettings = () => {
    localStorage.setItem(
      LS_SETTINGS,
      JSON.stringify({
        includeTasks,
        lastTask,
        plainTasks,
        orderedTasks,
        sequencedTasks,
        playExpansion,
        expansionDifficulty,
        gameVersionValue,
      }),
    );
  };

  const handleStartGame = () => {
    saveSettings();
    startGame({
      includeTasks,
      taskInstructions: {
        plainTasks,
        orderedTasks,
        sequencedTasks,
        lastTask,
      },
      useExpansion: playExpansion,
      difficultyScore: expansionDifficulty,
      startingTasks: usePreviousTasks ? storedTaskIDs : undefined,
    });
  };

  const handleResetDefaults = () => {
    setIncludeTasks(defaultTaskSettings.includeTasks);
    setLastTask(defaultTaskSettings.lastTask);
    setPlainTasks(defaultTaskSettings.plainTasks);
    setOrderedTasks(defaultTaskSettings.orderedTasks);
    setSequencedTasks(defaultTaskSettings.sequencedTasks);

    setPlayExpansion(defaultExpansionSettings.playExpansion);
    setExpansionDifficulty(defaultExpansionSettings.expansionDifficulty);
    setGameVersionValue(defaultExpansionSettings.gameVersionValue);

    setUsePreviousTasks(false);
  };

  const handleKickPlayer = (clientId: string) => {
    sendKickPlayer(clientId);
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const roomUrl = `${window.location.origin}/${room?.roomId ?? ""}`;

  return (
    <Stack>
      <Title order={2}>Game Setup</Title>

      <Text fw={500}>Players:</Text>
      <Stack>
        {players.map((p) => (
          <Group align="center">
            {isHost && p.sessionId != room?.sessionId && (
              <ActionIcon variant="transparent" onClick={() => handleKickPlayer(p.sessionId)}><IconX/></ActionIcon>
            )}
            <Text key={p.sessionId}>
              {p.displayName} {p.isHost && "(Host)"}{" "}
              {p.sessionId === room?.sessionId && "(You)"}
            </Text>
          </Group>
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
        </Stack>
      )}

      {/* Host-only controls -------------------------------------------------- */}
      {isHost ? (
        <>
          {/* Which version are we playing? */}
          <Text fw={500} mt="md">
            Game Version:
          </Text>
          <Radio.Group
            value={gameVersionValue}
            onChange={setGameVersionValue}
            name="gameVersion"
            withAsterisk
            size="md"
          >
            <Stack gap="sm">
              <Radio value="base" label="Base Game" />
              <Radio value="expansion" label="Expansion" />
            </Stack>
          </Radio.Group>

          {/* ---------------- BASE GAME ---------------- */}
          {gameVersionValue === "base" && (
            <>
              <Text fw={500} mt="md">
                Base Game Settings:
              </Text>
              <Checkbox
                label="Include Last-Trick Task"
                checked={lastTask}
                onChange={(e) => setLastTask(e.currentTarget.checked)}
                disabled={!includeTasks}
              />
              <Group grow>
                <NumberInput
                  label="Plain Tasks"
                  value={plainTasks}
                  onChange={(v) => setPlainTasks(Number(v) || 0)}
                  min={0}
                  max={8}
                  disabled={!includeTasks}
                />
                <NumberInput
                  label="Ordered Tasks"
                  value={orderedTasks}
                  onChange={(v) => setOrderedTasks(Number(v) || 0)}
                  min={0}
                  max={8}
                  disabled={!includeTasks}
                />
                <NumberInput
                  label="Sequenced Tasks"
                  value={sequencedTasks}
                  onChange={(v) => setSequencedTasks(Number(v) || 0)}
                  min={0}
                  max={8}
                  disabled={!includeTasks}
                />
              </Group>
            </>
          )}

          {/* ---------------- EXPANSION ---------------- */}
          {gameVersionValue === "expansion" && (
            <>
              <Text fw={500} mt="md">
                Expansion Settings:
              </Text>
              <Checkbox
                label="Use same tasks as last game"
                checked={usePreviousTasks}
                disabled={!storedTaskIDs.length}
                onChange={(e) => setUsePreviousTasks(e.currentTarget.checked)}
              />

              {/* Show IDs only if the user ticked the box OR hovered */}
              {storedTaskIDs.length > 0 && usePreviousTasks && (
                <Stack gap={0} pl="sm">
                  <Text size="sm" c="dimmed">
                    Previous Task IDs:
                  </Text>
                  {storedTaskIDs.map((id) => (
                    <Text key={id} size="sm">
                      • {id}
                    </Text>
                  ))}
                </Stack>
              )}

              <NumberInput
                label="Difficulty Score"
                value={expansionDifficulty}
                onChange={(v) => setExpansionDifficulty(Number(v) || 1)}
                min={1}
                max={30}
              />
            </>
          )}

          {/* --------------------------------------------------------------- */}
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
        <Text mt="md" c="dimmed">
          Waiting for the host to start the game…
        </Text>
      )}
    </Stack>
  );
}
