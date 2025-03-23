import { Box, Center, Group, Text } from "@mantine/core";
import { ReactNode } from "react";
import { useGameContext } from "../hooks/GameProvider";
import PlayerStatus from "../components/PlayerStatus";
import { TaskCard } from "../components/TaskCard";
import { GameHand } from "../components/GameHand";
import { CommunicatedCard } from "../components/CommunicatedCard";
import { Card } from "../types";

interface PlayerGridLayoutProps {
  gridTemplateAreas: string;
  children: ReactNode;
  isMyTurn?: boolean;
  onCardClick?: (card: Card) => void;
  onCommunicateCardClick?: (card: Card) => void;
  communicateMode?: boolean;
}


/**
 * PlayerGridLayout
 * ----------------
 * Shared layout wrapper for gameplay screens using a 5x5 CSS Grid.
 *
 * - Handles rendering of all PlayerStatus components around the grid (left, right, top, etc.),
 *   based on playerOrder and rotating it so the active player is always "bottom."
 * - Renders active player's hand in the bottom row (grid area: "bottom-hand").
 * - Renders active player's communicated card and tasks in defined grid areas.
 *
 * Props:
 * - gridTemplateAreas: Defines the layout structure for the current phase (task/trick).
 * - children: Phase-specific content (e.g., unclaimed tasks, played cards, etc.).
 *
 * This component ensures consistent layout across game phases and avoids repeated layout logic.
 */
export default function PlayerGridLayout({ gridTemplateAreas, children, isMyTurn, onCardClick, communicateMode, onCommunicateCardClick }: PlayerGridLayoutProps) {
  const {
    players,
    activePlayer,
    commanderPlayer,
    hand,
    tasks,
    room,
    playerOrder,
    sendReturnTask,
    gameStage,
    setCommunicateMode
  } = useGameContext();

  if (!activePlayer || !room || !playerOrder.length) return null;

  const activeIndex = playerOrder.findIndex(id => id === activePlayer.sessionId);
  const rotatedOrder = [
    ...playerOrder.slice(activeIndex),
    ...playerOrder.slice(0, activeIndex)
  ];

  const seatPositionsByCount: Record<number, string[]> = {
    2: ["top-left", "top-right"],
    3: ["left", "top-middle", "right"],
    4: ["left", "top-left", "top-right", "right"]
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
              textSize="xl"
              isCommander={commanderPlayer === player.sessionId}
            />
          </Box>
        );
      })}

      {/* Active Player's Communicated Card */}
      <Center style={{ gridArea: "active-comm" }}>
      <CommunicatedCard
        player={activePlayer}
        width={80}
        onClick={() => {
          // Only allow if stage is trick_start or trick_end AND not already communicated
          const canCommunicate =
            !activePlayer.hasCommunicated &&
            (gameStage === "trick_start" || gameStage === "trick_end");

          if (canCommunicate) {
            setCommunicateMode(prev => !prev);
          }
        }}
      />
      </Center>

      {/* Active Player's Tasks */}
      <Center style={{ gridArea: "active-task" }}>
        <Group gap="md">
          {activePlayerTasks.map((task, idx) => (
            <TaskCard
              key={idx}
              task={task}
              width={80}
              onClick={
                gameStage === "game_setup"
                  ? () => sendReturnTask(task)
                  : undefined // Disable click outside setup
              }
            />
          ))}
        </Group>
      </Center>

      {/* Active Player's Hand */}
      <Box
        style={{
          gridArea: "bottom-hand",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        {communicateMode ? (
          <Text mb="md" size="md" c="blue" fw={700}>
            PICK A CARD TO COMMUNICATE
          </Text>
        ) : isMyTurn ? (
          <Text mb="md" size="md">Your Turn</Text>
        ) : null}

        <GameHand
          hand={hand}
          cardWidth={120}
          overlap
          disabled={!isMyTurn && !communicateMode}
          onCardClick={(card) => {
            if (communicateMode && onCommunicateCardClick) {
              onCommunicateCardClick(card);
            } else if (isMyTurn && onCardClick) {
              onCardClick(card);
            }
          }}
        />
      </Box>



      {/* Slot for phase-specific content */}
      {children}
    </Box>
  );
}
