/* src/components/highScoreItem.tsx */
import { useMemo } from "react";
import {
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

  /** alphabetical, comma-separated player line */
  const playerLine = useMemo(
    () => [...players].sort().join(", "),
    [players]
  );

  /** convert stored tasks → ExpansionTask stubs for TaskCard */
  const expansionTasks: ExpansionTask[] = useMemo(
    () =>
      tasks.map((t) => ({
        taskId: t.taskId,
        player: t.player,
        /* placeholders / defaults                            */
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

  /* ───────────────────── render ───────────────────── */
  return (
    <>
      {/* summary card (click to open) */}
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

      {/* detail modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Run details"
        size="lg"
        centered
      >
        <Stack gap="sm">
          {/* headline details */}
          <Group gap="xs">
            <Text fw={600}>Players:</Text>
            <Text>{playerLine}</Text>
          </Group>

          <Group gap="xs">
            <Text fw={600}>Date / time:</Text>
            <Text>{new Date(createdAt).toLocaleString()}</Text>
          </Group>

          <Group gap="xs">
            <Text fw={600}>Undo:</Text>
            <Text>{undoUsed ? "😡 Undo used" : "🎉 No undo"}</Text>
          </Group>

          <Divider my="sm" />

          {/* tasks list */}
          <Group gap="sm">
            {expansionTasks.map((t) => (
              <TaskCard
                key={t.taskId}
                task={t}
                size="lg"
                ownerDisplayName={t.player}
              />
            ))}
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
