import "@mantine/core/styles.css";
import { MantineProvider, Text, Button, Group, Container, Input, Stack, Divider, Title } from "@mantine/core";
import { theme } from "./theme";
import { useEffect, useState } from "react";
import * as Colyseus from "colyseus.js";
import { Card, GameState, Player, Trick } from "./types"; // You'll need to update your types to reflect schema

export default function App() {
  const [client] = useState(() => new Colyseus.Client("ws://localhost:2567"));
  const [room, setRoom] = useState<Colyseus.Room<GameState> | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [joined, setJoined] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [gameStage, setGameStage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const [completedTricks, setCompletedTricks] = useState<Trick[]>([]);

  const joinRoom = async () => {
    if (!displayName.trim()) return;
    try {
      const joinedRoom = await client.joinOrCreate<GameState>("crew", { displayName });
      setRoom(joinedRoom);
      setJoined(true);

      joinedRoom.onStateChange((state: GameState) => {
        console.log("GAME STATE: ", state);
        // Update list of players
        const updatedPlayers: Player[] = [];
        state.players.forEach((player: any) => {
          updatedPlayers.push({
            sessionId: player.sessionId,
            displayName: player.displayName,
            hand: [], // we only care about own hand
          });
        });
        setPlayers(updatedPlayers);

        // Set hand if player exists
        const player = state.players.get(joinedRoom.sessionId);
        if (player) {
          const cards: Card[] = Array.from(player.hand).map((card: any) => ({
            color: card.color,
            number: card.number,
          }));
          setHand(cards);
        }

        // Update trick cards
        let trickCards: Card[] = [];
        if (state.currentTrick && state.currentTrick.playedCards) {
          trickCards = Array.from(state.currentTrick.playedCards).map((card: any) => ({
            color: card.color,
            number: card.number,
          }));
        }
        setPlayedCards(trickCards);

        // Update current player turn and game stage
        console.log("About to set game stage to: ", state.currentGameStage);
        setCurrentPlayer(state.currentPlayer);
        setGameStage(state.currentGameStage);

        setCompletedTricks(Array.from(state.completedTricks));

        // Game over check
        setGameOver(state.currentGameStage === "game_end");
      });
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  };

  const startGame = () => {
    room?.send("start_game");
  };

  const playCard = (card: Card) => {
    room?.send("play_card", card);
  };

  const finishTrick = () => {
    room?.send("finish_trick");
  };

  const isMyTurn = room?.sessionId === currentPlayer;

  console.log("CURRENT GAME STAGE: ", gameStage);
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <Container>
        <Title mb="md">The Crew - Web Edition</Title>

        {!joined ? (
          <Stack>
            <Input
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
            />
            <Button onClick={joinRoom}>Join Room</Button>
          </Stack>
        ) : (
          <>
            {gameOver ? (
              <>
                <Title order={2}>Game Over</Title>
                <Text>The game has ended. Thanks for playing!</Text>
              </>
            ) : (
              <>
                <Text fw={500}>Players in Room:</Text>
                <Group mb="sm">
                  {players.map((p) => (
                    <Text key={p.sessionId}>
                      {p.displayName} {p.sessionId === currentPlayer ? "(Current Turn)" : ""}
                    </Text>
                  ))}
                </Group>

                {gameStage === "not_started" && (
                  <Button onClick={startGame}>Start Game</Button>
                )}

                <Divider my="sm" />
                <Text>Game Stage: {gameStage.replaceAll("_", " ")}</Text>
                <Text>Current Turn: {currentPlayer === room?.sessionId ? "You" : players.find(p => p.sessionId === currentPlayer)?.displayName}</Text>

                <Divider my="sm" />
                <Text fw={500}>Current Trick:</Text>
                <Group mb="sm">
                  {playedCards.map((card, idx) => (
                    <Text key={idx}>
                      {card.color} {card.number}
                    </Text>
                  ))}
                </Group>

                <Text fw={500}>Your Hand:</Text>
                <Group mb="sm">
                  {hand.map((card, index) => (
                    <Button
                      key={index}
                      onClick={() => playCard(card)}
                      disabled={!isMyTurn || gameStage !== "trick_start" && gameStage !== "trick_middle"}
                      color={card.color}
                    >
                      {card.color} {card.number}
                    </Button>
                  ))}
                </Group>

                <Stack mb="sm">
                  {
                    completedTricks
                      .filter((trick) => trick.trickWinner === room?.sessionId)
                      .map((trick, index) => (
                      <Group key={index}>
                        {
                          trick.playedCards.map((card, cardIndex) => (
                            <Text key={cardIndex}>
                              {card.color} {card.number}
                            </Text>
                          ))
                        }
                      </Group>
                    ))
                  }
                </Stack>

                {gameStage === "trick_end" && isMyTurn && (
                  <Button onClick={finishTrick} color="green">
                    Next Trick
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </MantineProvider>
  );
}
