import { Group, Stack, Text } from "@mantine/core";
import { Player, SimpleTask } from "../types";
import { CommunicatedCard } from "./CommunicatedCard";
import { TaskCard } from "./TaskCard";

interface PlayerStatusProps {
  player: Player;
  assignedTasks: SimpleTask[];
  communicateWidth: number;
  taskWidth: number;
  textSize: "xs" | "sm" | "md" | "lg" | "xl";
  isCommander?: boolean;
}

export default function PlayerStatus({
  player,
  assignedTasks,
  communicateWidth,
  taskWidth,
  textSize,
  isCommander
}: PlayerStatusProps) {
  return (
    <Stack align="center" gap="xs">
      {/* Communicated Card */}
      <CommunicatedCard player={player} width={communicateWidth} />

      {/* Display Name */}
      <Text size={textSize} fw={700} ta="center">
        {player.displayName}
        {isCommander && " (C)"}
        {!player.isConnected && " (Disconnected)"}
      </Text>

      {/* Tasks */}
      <Group align="center" gap={4}>
        {assignedTasks.map((task, idx) => (
          <TaskCard
            key={idx}
            task={task}
            width={taskWidth}
            disabled
          />
        ))}
      </Group>
    </Stack>
  );
}
