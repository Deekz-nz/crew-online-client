import { Button, Center, Group, Text } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import PlayerGridLayout from "./PlayerGridLayout";
import { TaskCard } from "../components/TaskCard";
import { TASK_PHASE_GRID } from "./GridTemplates";

/**
 * TaskPhaseScreen
 * ---------------
 * Screen for the task selection phase ("game_setup").
 *
 * - Uses PlayerGridLayout for shared layout.
 * - Displays unclaimed tasks in the center of the grid.
 * - Allows the active player to claim or return tasks by clicking.
 * - When all tasks are claimed, shows a "Start Playing" button for the host in the same grid area.
 *
 * Transitions to trick play once the host starts the game.
 */

export default function TaskPhaseScreen() {
  const {
    tasks,
    sendTakeTask,
    sendFinishTaskAllocation,
    activePlayer,
    players
  } = useGameContext();

  const unclaimedTasks = tasks.filter(task => task.player === "");
  const allTasksClaimed = unclaimedTasks.length === 0;

  return (
    <PlayerGridLayout gridTemplateAreas={TASK_PHASE_GRID}>
      {/* Unclaimed Tasks */}
      <Center style={{ gridArea: "center" }}>
        <Group gap="sm">
          {unclaimedTasks.map((task, idx) => (
            <TaskCard
              key={idx}
              task={task}
              size="lg"
              onClick={() => sendTakeTask(task)}
            />
          ))}
        </Group>
      </Center>

    {/* Start Game Button for Host or Waiting for Others */}
    {allTasksClaimed && (
      <Center style={{ gridArea: "center" }}>
        {activePlayer?.isHost ? (
          <Button onClick={sendFinishTaskAllocation} size="xl">
            Start Playing
          </Button>
        ) : (
          <Text size="lg" fw={700} c="gray">
            Waiting for {players.find(p => p.isHost)?.displayName}
          </Text>
        )}
      </Center>
    )}
    </PlayerGridLayout>
  );
}
