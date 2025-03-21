import { Box, Center, Group } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import PlayerStatus from "../components/PlayerStatus";
import { TaskCard } from "../components/TaskCard";
import { GameHand } from "../components/GameHand";
import { CommunicatedCard } from "../components/CommunicatedCard";

export default function GameplayScreen() {
  const {
    players,
    activePlayer,
    hand,
    tasks,
    room,
    sendTakeTask,
    sendReturnTask,
    playerOrder // from state
  } = useGameContext();

  if (!activePlayer || !room || !playerOrder.length) return null;

  const unclaimedTasks = tasks.filter(task => task.player === "");
  const activeIndex = playerOrder.findIndex(id => id === activePlayer.sessionId);

  // Rotate the playerOrder so active player is first
  const rotatedOrder = [
    ...playerOrder.slice(activeIndex),
    ...playerOrder.slice(0, activeIndex)
  ];

  // Map seat positions based on rotated order (excluding active player)
  const seatPositionsByCount: Record<number, string[]> = {
    2: ["left", "right"],
    3: ["left", "right", "top-middle"],
    4: ["left", "right", "top-left", "top-right"]
  };
  
  const nonActivePlayers = rotatedOrder.slice(1); // everyone after active player
  const seatMap = seatPositionsByCount[nonActivePlayers.length] || [];
  
  const otherPlayers = nonActivePlayers.map((sessionId, idx) => {
    const player = players.find(p => p.sessionId === sessionId);
    if (!player || !seatMap[idx]) return null;
    return { player, gridArea: seatMap[idx] };
  }).filter(Boolean) as { player: typeof players[number], gridArea: string }[];
  

  const activePlayerTasks = tasks.filter(t => t.player === activePlayer.sessionId);

  return (
    <Box
      w="100vw"
      h="100vh"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr 1fr 1fr",
        gridTemplateAreas: `
          ". top-left top-middle top-right ."
          ". center center center ."
          "left center center center right"
          ". active-comm . active-task ."
          "bottom-hand bottom-hand bottom-hand bottom-hand bottom-hand"
        `,
      
      }}
      p="sm"
    >
      {/* Other Players' Status */}
      {otherPlayers.map(({ player, gridArea }) => {
        const assignedTasks = tasks.filter(t => t.player === player.sessionId);

        return (
          <Box
            key={player.sessionId}
            style={{
              gridArea,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",  // align to top
              alignItems: "center",          // center horizontally
              height: "100%",                // ensure it fills the cell vertically
            }}
          >
            <PlayerStatus
              player={player}
              assignedTasks={assignedTasks}
              communicateWidth={80}
              taskWidth={60}
              textSize="lg"
            />
          </Box>
        );
      })}

      {/* Center: Unclaimed Tasks */}
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

      {/* Active Player's Communicated Card */}
      <Center style={{ gridArea: "active-comm" }}>
        <CommunicatedCard player={activePlayer} width={80} />
      </Center>

      {/* Active Player's Tasks */}
      <Center style={{ gridArea: "active-task" }}>
        <Group gap="md">
          {activePlayerTasks.map((task, idx) => (
            <TaskCard
              key={idx}
              task={task}
              width={80}
              onClick={() => sendReturnTask(task)}
            />
          ))}
        </Group>
      </Center>

      {/* Active Player's Hand */}
      <Box
        style={{
          gridArea: "bottom-hand",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end", // Align to bottom of cell
          width: "100%",
        }}
      >
        <GameHand
          hand={hand}
          cardWidth={120}
          overlap
          disabled
          onCardClick={() => {}}
        />
      </Box>
    </Box>
  );
}