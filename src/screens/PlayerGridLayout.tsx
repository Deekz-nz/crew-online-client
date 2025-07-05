import { ActionIcon, Box, Center, Group, Text, Tooltip } from "@mantine/core";
import { ReactNode } from "react";
import { useGameContext } from "../hooks/GameProvider";
import PlayerStatus from "../components/PlayerStatus";
import { TaskCard } from "../components/TaskCard";
import { GameHand } from "../components/GameHand";
import { CommunicatedCard } from "../components/CommunicatedCard";
import { Card } from "../types";
import { IconInfoCircle, IconArrowBackUp } from "@tabler/icons-react";
import { InfoModal } from "../components/InfoModal";
import { useDisclosure } from "@mantine/hooks";
import EmojiSendPanel from "../components/EmojiSendPanel";
import EmojiReceiveArea from "../components/EmojiReceiveArea";

interface PlayerGridLayoutProps {
  gridTemplateAreas: string;
  children: ReactNode;
  isMyTurn?: boolean;
  onCardClick?: (card: Card) => void;
  onCommunicateCardClick?: (card: Card) => void;
  communicateMode?: boolean;
  onUndo?: () => void;
  canUndo?: boolean;
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
export default function PlayerGridLayout({ gridTemplateAreas, children, isMyTurn, onCardClick, communicateMode, onCommunicateCardClick, onUndo, canUndo }: PlayerGridLayoutProps) {
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

  const [infoOpened, { open: openInfo, close: closeInfo }] = useDisclosure(false);
  
  if (!activePlayer || !room || !playerOrder.length) return null;

  const activeIndex = playerOrder.findIndex(id => id === activePlayer.sessionId);
  const rotatedOrder = [
    ...playerOrder.slice(activeIndex),
    ...playerOrder.slice(0, activeIndex)
  ];

  // NOTE: ALSO CHANGE THIS IN TRICKPHASESCREEN.TSX
  const seatPositionsByCount: Record<number, string[]> = {
    2: ["top-left", "top-right"],
    3: ["left", "top-middle", "right"],
    4: ["left", "top-left", "top-right", "right"]
  };

  const nonActivePlayers = rotatedOrder.slice(1);
  const seatMap = seatPositionsByCount[nonActivePlayers.length] || [];

  const someoneCommunicating = players.some(p => p.intendsToCommunicate);

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
      {/* Emoji Receive Area */}
      <Box style={{ gridArea: "emoji-receive" }}>
        <EmojiReceiveArea />
      </Box>

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
              taskSize="md"
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
            setCommunicateMode(prev => {
              const next = !prev;
              if (next) {
                room.send("intend_communication");
              } else {
                room.send("cancel_intention");
              }
              return next;
            });
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
              size={"md"}
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
        ) : isMyTurn && !someoneCommunicating ? (
          <Text mb="md" size="md">Your Turn</Text>
        ) : null}

        <GameHand
          hand={hand}
          cardWidth={120}
          overlap
          disabled={(!isMyTurn || someoneCommunicating) && !communicateMode}
          onCardClick={(card) => {
            if (communicateMode && onCommunicateCardClick) {
              onCommunicateCardClick(card);
            } else if (isMyTurn && onCardClick) {
              onCardClick(card);
            }
          }}
        />
      </Box>
      {/* Emoji Send Panel */}
      <Box style={{ gridArea: "emoji-send" }}><EmojiSendPanel /></Box>




      {/* Undo & Info Buttons */}
      <div style={{ gridArea: 'info-button', justifySelf: 'end', padding: '8px' }}>
        <Group gap="xs">
          {canUndo && onUndo && (
            <Tooltip label="Undo Card" withArrow>
              <ActionIcon variant="outline" onClick={onUndo} size={56}>
                <IconArrowBackUp size={36} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Game Info" withArrow>
            <ActionIcon variant="outline" onClick={openInfo} size={56} >
              <IconInfoCircle size={36} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>
      <InfoModal opened={infoOpened} onClose={closeInfo} />
      {/* Slot for phase-specific content */}
      {children}
    </Box>
  );
}
