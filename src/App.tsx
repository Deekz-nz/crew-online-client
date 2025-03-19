// File: src/App.tsx
import "@mantine/core/styles.css";
import { MantineProvider, Text, Button, Group, Container } from "@mantine/core";
import { theme } from "./theme";
import { useEffect, useState } from "react";
import * as Colyseus from "colyseus.js";
import { Card, GameState } from "./types";


export default function App() {
  const [client] = useState(() => new Colyseus.Client("ws://localhost:2567"));
  const [room, setRoom] = useState<Colyseus.Room<GameState> | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const joinRoom = async () => {
    try {
      const joinedRoom = await client.joinOrCreate<GameState>("crew");
      setRoom(joinedRoom);

      joinedRoom.onStateChange((state: GameState) => {
        const player = state.players.get(joinedRoom.sessionId);
        if (player) {
          const cards: Card[] = Array.from(player.hand).map((card: any) => ({
            color: card.color,
            number: card.number,
          }));
          setHand(cards);
          setIsMyTurn(player.isMyTurn);
        }
        setPlayedCards(state.playedCards);
      });
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  };

  const playCard = (card: Card) => {
    if (!room) return;
    room.send("play_card", card);
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <Container>
        <Text size="xl" mb="md">The Crew - Web Edition</Text>
        {!room ? (
          <Button onClick={joinRoom}>Start / Join Room</Button>
        ) : (
          <>
            <Text>Turn: {isMyTurn ? "You": "Waiting"}</Text>
            <Text mb="sm">Your Hand:</Text>
            <Group>
              {hand.map((card, index) => (
                <Button
                  key={index}
                  onClick={() => playCard(card)}
                  disabled={!isMyTurn}
                  color={card.color}
                >
                  {card.color} {card.number}
                </Button>
              ))}
            </Group>
            <Group>
              {playedCards.map((card, index) => (
                <Text key={index}>{card.color} {card.number}</Text>
              ))}
            </Group>
          </>
        )}
      </Container>
    </MantineProvider>
  );
}
