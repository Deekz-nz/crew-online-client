import { Group, Stack, Text } from "@mantine/core";
import { BaseTask, Player } from "../types";
import { CommunicatedCard } from "./CommunicatedCard";
import { TaskCard } from "./TaskCard";

interface PlayerStatusProps {
  player: Player;
  assignedTasks: BaseTask[];
  communicateWidth: number;
  taskSize: "lg" | "md" | "sm";
  textSize: "xs" | "sm" | "md" | "lg" | "xl";
  isCommander?: boolean;
}

export default function PlayerStatus({
  player,
  assignedTasks,
  communicateWidth,
  taskSize,
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
            size={taskSize}
            disabled
            bigToken
          />
        ))}
      </Group>
    </Stack>
  );
}
