import { Button, Center, Text } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";
import PlayerGridLayout from "./PlayerGridLayout";
import { TRICK_PHASE_GRID } from "./GridTemplates";
import { Card, CommunicationRank } from "../types";
import { notifications } from '@mantine/notifications';

export default function TrickPhaseScreen() {
  const {
    activePlayer,
    currentPlayer,
    room,
    currentTrick,
    playerOrder,
    players,
    sendPlayCard,
    sendUndoCard,
    sendFinishTrick,
    hand,
    setCommunicateMode,
    communicateMode,
    gameStage
  } = useGameContext();

  
  if (!activePlayer || !room || !playerOrder.length || !currentTrick) return null;

  const isMyTurn = currentPlayer === activePlayer.sessionId;

  // Determine which grid area each played card goes into
  const activeIndex = playerOrder.findIndex(id => id === activePlayer.sessionId);
  const rotatedOrder = [
    ...playerOrder.slice(activeIndex),
    ...playerOrder.slice(0, activeIndex)
  ];

  const someoneCommunicating = players.some(p => p.intendsToCommunicate);
  
  
  const handleCommunicateCard = (card: Card) => {
    if (!room) return;
  
    // 🚫 Block communicating black cards
    if (card.color === "black") {
      notifications.show({
        color: 'red',
        title: 'Invalid Communication',
        message: 'You cannot communicate black cards.',
      });
      return;
    }
  
    const sameColorCards = hand.filter(c => c.color === card.color);
    const sorted = [...sameColorCards].sort((a, b) => a.number - b.number);
  
    const isOnly = sameColorCards.length === 1;
    const isLowest = card.number === sorted[0].number;
    const isHighest = card.number === sorted[sorted.length - 1].number;
  
    let rank: CommunicationRank = "unknown";
    if (isOnly) rank = "only";
    else if (isLowest) rank = "lowest";
    else if (isHighest) rank = "highest";
  
    if (rank === "unknown") {
      notifications.show({
        color: 'red',
        title: 'Invalid Communication',
        message: 'You can only communicate your highest, lowest, or only card of that color.',
      });
      return;
    }
  
    room.send("communicate", { card: { color: card.color, number: card.number }, cardRank: rank });
    room.send("cancel_intention");
    setCommunicateMode(false);
  };
  
  

  const allCardsPlayed = currentTrick.playedCards.length === rotatedOrder.length;
  const lastPlayer = currentTrick.playerOrder[currentTrick.playerOrder.length - 1];
  const canUndo = gameStage === "trick_middle" && lastPlayer === activePlayer.sessionId;
  const isTrickWinner = currentTrick.trickWinner === activePlayer.sessionId;

  return (
    <PlayerGridLayout
      gridTemplateAreas={TRICK_PHASE_GRID}
      isMyTurn={isMyTurn}
      onCardClick={(card) => {
        if (isMyTurn && !someoneCommunicating) sendPlayCard(card);
      }}
      communicateMode={communicateMode}
      onCommunicateCardClick={(card) => {
        // Run communicate logic
        handleCommunicateCard(card);
      }}
      onUndo={sendUndoCard}
      canUndo={canUndo}
    >
      {/* Only render trick-specific content here */}

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
