import { Button, Center, Group } from "@mantine/core";
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
    activePlayer
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
              width={100}
              onClick={() => sendTakeTask(task)}
            />
          ))}
        </Group>
      </Center>

      {/* Start Game Button for Host */}
      {allTasksClaimed && activePlayer?.isHost && (
        <Center style={{ gridArea: "center" }}>
          <Button onClick={sendFinishTaskAllocation}>
            Start Playing
          </Button>
        </Center>
      )}
    </PlayerGridLayout>
  );
}
