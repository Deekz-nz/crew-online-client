import { Box, Center, Group } from "@mantine/core";
import { ReactNode } from "react";
import { useGameContext } from "../hooks/GameProvider";
import PlayerStatus from "../components/PlayerStatus";
import { TaskCard } from "../components/TaskCard";
import { GameHand } from "../components/GameHand";
import { CommunicatedCard } from "../components/CommunicatedCard";

interface PlayerGridLayoutProps {
  gridTemplateAreas: string;
  children: ReactNode; // phase-specific extras
}

export default function PlayerGridLayout({ gridTemplateAreas, children }: PlayerGridLayoutProps) {
  const {
    players,
    activePlayer,
    hand,
    tasks,
    room,
    playerOrder,
    sendReturnTask
  } = useGameContext();

  if (!activePlayer || !room || !playerOrder.length) return null;

  const activeIndex = playerOrder.findIndex(id => id === activePlayer.sessionId);
  const rotatedOrder = [
    ...playerOrder.slice(activeIndex),
    ...playerOrder.slice(0, activeIndex)
  ];

  const seatPositionsByCount: Record<number, string[]> = {
    2: ["left", "right"],
    3: ["left", "right", "top-middle"],
    4: ["left", "right", "top-left", "top-right"]
  };

  const nonActivePlayers = rotatedOrder.slice(1);
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
        gridTemplateAreas: gridTemplateAreas,
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
              justifyContent: "flex-start",
              alignItems: "center",
              height: "100%",
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
          alignItems: "flex-end",
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

      {/* Slot for phase-specific content */}
      {children}
    </Box>
  );
}
