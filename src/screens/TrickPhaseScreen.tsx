import { Button, Center, Text } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import PlayerGridLayout from "./PlayerGridLayout";
import { TRICK_PHASE_GRID } from "./GridTemplates";
import { GameCard } from "../components/GameCard"; // Assuming GameCard renders a Card

export default function TrickPhaseScreen() {
  const {
    activePlayer,
    currentPlayer,
    room,
    currentTrick,
    playerOrder,
    players,
    sendPlayCard,
    sendFinishTrick
  } = useGameContext();

  if (!activePlayer || !room || !playerOrder.length || !currentTrick) return null;

  const isMyTurn = currentPlayer === activePlayer.sessionId;

  // Determine which grid area each played card goes into
  const activeIndex = playerOrder.findIndex(id => id === activePlayer.sessionId);
  const rotatedOrder = [
    ...playerOrder.slice(activeIndex),
    ...playerOrder.slice(0, activeIndex)
  ];

  const seatPositionsByCount: Record<number, string[]> = {
    2: ["top-left", "top-right"],
    3: ["left", "right", "top-middle"],
    4: ["left", "right", "top-left", "top-right"]
  };

  const seatCardAreasBySeat: Record<string, string> = {
    "left": "left-card",
    "right": "right-card",
    "top-middle": "top-middle-card",
    "top-left": "top-left-card",
    "top-right": "top-right-card"
  };

  const nonActivePlayers = rotatedOrder.slice(1);
  const seatMap = seatPositionsByCount[nonActivePlayers.length] || [];

  const playedCardElements = rotatedOrder.map((playerId, idx) => {
    // Get seat/grid area for this player
    let gridArea = "active-card";
    if (idx === 0) {
      gridArea = "active-card";
    } else {
      const seat = seatMap[idx - 1];
      gridArea = seatCardAreasBySeat[seat];
    }
  
    // Check if this player has played a card
    const playedIndex = currentTrick.playerOrder.indexOf(playerId);
    const hasPlayed = playedIndex !== -1;
    const card = hasPlayed ? currentTrick.playedCards[playedIndex] : null;
  
    const isThisPlayerTurn = currentPlayer === playerId;
  
    if (card) {
      return (
        <Center key={`card-${playerId}`} style={{ gridArea }}>
          <GameCard card={card} size={100} />
        </Center>
      );
    } else if (isThisPlayerTurn) {
      return (
        <Center key={`waiting-${playerId}`} style={{ gridArea }}>
          <Text size="lg" fw={700} c="red">
            Waiting...
          </Text>
        </Center>
      );
    } else {
      return null;
    }
  });
  
  
  

  const allCardsPlayed = currentTrick.playedCards.length === rotatedOrder.length;
  const isTrickWinner = currentTrick.trickWinner === activePlayer.sessionId;

  return (
    <PlayerGridLayout
      gridTemplateAreas={TRICK_PHASE_GRID}
      isMyTurn={isMyTurn}
      onCardClick={(card) => {
        if (isMyTurn) sendPlayCard(card);
      }}
    >
      {/* Only render trick-specific content here */}

      {/* Played Cards */}
      {playedCardElements}

      {/* Next Trick Button */}
      {allCardsPlayed && (
      <Center style={{ gridArea: "center" }}>
        {isTrickWinner ? (
          <Button onClick={sendFinishTrick} color="green">
            Next Trick
          </Button>
        ) : (
          <Text size="lg" fw={700} c="gray">
            Waiting for {players.find(p => p.sessionId === currentTrick.trickWinner)?.displayName}
          </Text>
        )}
      </Center>
    )}

    </PlayerGridLayout>

  );
}
