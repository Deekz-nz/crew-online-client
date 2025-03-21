import { Button, Center, Group } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import PlayerGridLayout from "./PlayerGridLayout";
import { TaskCard } from "../components/TaskCard";
import { TASK_PHASE_GRID } from "./GridTemplates";

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
