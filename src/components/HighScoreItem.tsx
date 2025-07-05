import { useMemo } from "react";
import { HighScore } from "../types";
import { Card, Group, Stack, Text, Tooltip } from "@mantine/core";

export function HighScoreItem({ score }: { score: HighScore }) {
  const { createdAt, players, difficulty, undoUsed } = score;

  /** alphabetical player list, comma-separated */
  const playerLine = useMemo(
    () => [...players].sort().join(", "),
    [players]
  );

  return (
    <Card withBorder radius="md" px="md" py="xs">
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Text fw={600}>{playerLine}</Text>
          <Text size="sm" c="dimmed">
            {new Date(createdAt).toLocaleDateString()}
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
  );
}