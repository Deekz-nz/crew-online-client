/* src/components/highScoreItem.tsx */
import { useMemo } from "react";
import {
  Box,
  Card,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HighScore, ExpansionTask } from "../types";
import { TaskCard } from "./TaskCard";

export function HighScoreItem({ score }: { score: HighScore }) {
  const { createdAt, players, difficulty, undoUsed, tasks } = score;
  const [opened, { open, close }] = useDisclosure(false);

  /* alphabetical player list */
  const playerLine = useMemo(() => [...players].sort().join(", "), [players]);

  /* HighScore-task → ExpansionTask stubs (just enough for TaskCard) */
  const expansionTasks: ExpansionTask[] = useMemo(
    () =>
      tasks.map((t) => ({
        taskId: t.taskId,
        player: t.player,
        failed: false,
        completed: false,
        completedAtTrickIndex: undefined,
        displayName: t.displayName,
        description: "", // placeholder
        evaluationDescription: t.evaluationDescription,
        difficulty: t.difficulty,
        interestedPlayers: [],
      })),
    [tasks]
  );

  /* group those tasks by player for the modal layout */
  const tasksByPlayer = useMemo(() => {
    const map: Record<string, ExpansionTask[]> = {};
    expansionTasks.forEach((t) => {
      if (!map[t.player]) map[t.player] = [];
      map[t.player].push(t);
    });
    return map;
  }, [expansionTasks]);

  /* ───────────────── summary card ───────────────── */
  return (
    <>
      <Card
        withBorder
        radius="md"
        px="md"
        py="xs"
        onClick={open}
        style={{ cursor: "pointer" }}
      >
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text fw={600}>{playerLine}</Text>
            <Text size="sm" c="dimmed">
              {new Date(createdAt).toLocaleString()}
            </Text>
          </Stack>

          <Group gap={4}>
            {undoUsed && (
              <Tooltip label="Undo was used at least once during this run">
                <span style={{ fontSize: 22 }}>😡</span>
              </Tooltip>
            )}
            <Text size="xl" fw={700}>
              {difficulty}
            </Text>
          </Group>
        </Group>
      </Card>

      {/* ───────────────── detail modal ───────────────── */}
      <Modal
        opened={opened}
        onClose={close}
        title="Run details"
        size="lg"
        centered
      >
        <Stack gap="sm">
          <Group gap="xs">
            <Text fw={600}>Players:</Text>
            <Text>{playerLine}</Text>
          </Group>

          <Text fw={600}>
            Total Difficulty: {difficulty}
          </Text>

          <Group gap="xs">
            <Text fw={600}>Date / time:</Text>
            <Text>{new Date(createdAt).toLocaleString()}</Text>
          </Group>

          <Group gap="xs">
            <Text fw={600}>Undo:</Text>
            <Text>{undoUsed ? "😡 Undo used" : "🎉 No undo"}</Text>
          </Group>

          <Divider my="sm" />

          {/* tasks grouped by owner */}
          <Box
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "30px",
              justifyContent: "center",
            }}
          >
            {Object.entries(tasksByPlayer).map(([playerId, playerTasks]) =>
              playerTasks.length ? (
                <Box
                  key={playerId}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    {playerTasks.map((task) => (
                      <TaskCard
                        key={task.taskId}
                        task={task}
                        size="lg"
                        disabled
                      />
                    ))}
                  </Box>
                  <Text
                    size="md"
                    fw={600}
                    mt="sm"
                    ta="center"
                  >
                    {playerId}
                  </Text>
                </Box>
              ) : null
            )}
          </Box>
        </Stack>
      </Modal>
    </>
  );
}
