import "@mantine/core/styles.css";
import { MantineProvider, Text, Button, Group, Container, Input, Stack, Divider, Title, Checkbox, NumberInput } from "@mantine/core";
import { theme } from "./theme";
import { useEffect, useState } from "react";
import * as Colyseus from "colyseus.js";
import { Card, GameState, Player, SimpleTask, Trick } from "./types"; // You'll need to update your types to reflect schema
import { GameCard } from "./components/GameCard";
import { GameHand } from "./components/GameHand";

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

  const [allTasks, setAllTasks] = useState<SimpleTask[]>([]);
  const [allTasksClaimed, setAllTasksClaimed] = useState(false);
  
  const [completedTricks, setCompletedTricks] = useState<Trick[]>([]);

  // State for game setup
  const [includeTasks, setIncludeTasks] = useState(true);
  const [lastTask, setLastTask] = useState(false);
  const [plainTasks, setPlainTasks] = useState(1);
  const [orderedTasks, setOrderedTasks] = useState(0);
  const [sequencedTasks, setSequencedTasks] = useState(0);

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

        // Update tasks
        const tasks: SimpleTask[] = Array.from(state.allTasks);
        setAllTasks(tasks);

        // Show start button if all tasks claimed
        const unassignedTasks = tasks.filter(task => task.player === "");
        setAllTasksClaimed(unassignedTasks.length === 0);

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
    const gameSetupInstructions = {
      includeTasks,
      taskInstructions: {
        plainTasks,
        orderedTasks,
        sequencedTasks,
        lastTask
      }
    };
  
    room?.send("start_game", gameSetupInstructions);
  };

  const playCard = (card: Card) => {
    room?.send("play_card", card);
  };

  const finishTrick = () => {
    room?.send("finish_trick");
  };

  const takeTask = (task: SimpleTask) => {
    room?.send("take_task", task);
  };
  
  const returnTask = (task: SimpleTask) => {
    room?.send("return_task", task);
  };
  
  const finishTaskAllocation = () => {
    room?.send("finish_task_allocation");
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
                  <Stack mb="sm">
                    <Text fw={500}>Game Setup:</Text>
                    <Checkbox
                      label="Include Tasks"
                      checked={includeTasks}
                      onChange={(e) => setIncludeTasks(e.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Include Last Trick Task"
                      checked={lastTask}
                      onChange={(e) => setLastTask(e.currentTarget.checked)}
                      disabled={!includeTasks}
                    />
                    <Group grow>
                    <NumberInput
                      label="Plain Tasks"
                      value={plainTasks}
                      onChange={(val) => setPlainTasks(typeof val === "number" ? val : 0)}
                      min={0}
                      max={8}
                      disabled={!includeTasks}
                    />

                    <NumberInput
                      label="Ordered Tasks"
                      value={orderedTasks}
                      onChange={(val) => setOrderedTasks(typeof val === "number" ? val : 0)}
                      min={0}
                      max={8}
                      disabled={!includeTasks}
                    />

                    <NumberInput
                      label="Sequenced Tasks"
                      value={sequencedTasks}
                      onChange={(val) => setSequencedTasks(typeof val === "number" ? val : 0)}
                      min={0}
                      max={8}
                      disabled={!includeTasks}
                    />
                    </Group>

                    <Button onClick={startGame} mt="md" color="blue">
                      Start Game
                    </Button>
                  </Stack>
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
                <Divider my="sm" />
                <Text fw={500}>Tasks:</Text>
                <Group mb="sm" wrap="wrap">
                  {allTasks.map((task, index) => {
                    const taskOwner = players.find(p => p.sessionId === task.player);
                    const isOwnedByMe = task.player === room?.sessionId;
                    const isTaskPhase = gameStage === "game_setup";

                    // Build category label
                    let categoryLabel = task.taskCategory;
                    if (task.taskCategory === "ordered" || task.taskCategory === "sequence") {
                      categoryLabel += ` #${task.sequenceIndex}`;
                    }

                    // Final button label
                    const playerLabel = taskOwner ? taskOwner.displayName : "Unclaimed";
                    const statusIcon = task.completed ? "✅" : task.failed ? "❌" : "";
                    const buttonLabel = `${task.card.color} ${task.card.number} (${playerLabel}) [${categoryLabel}] ${statusIcon}`;

                    return (
                      <Button
                        key={index}
                        onClick={() => {
                          if (!isTaskPhase) return;
                          if (!task.player) takeTask(task);
                          else if (isOwnedByMe) returnTask(task);
                        }}
                        disabled={!isTaskPhase}
                        color={task.card.color}
                      >
                        {buttonLabel}
                      </Button>
                    );
                  })}
                </Group>

                {gameStage === "game_setup" && allTasksClaimed && (
                  <Button onClick={finishTaskAllocation} color="teal">
                    Start Playing
                  </Button>
                )}

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
        <GameHand
          hand={[
            { color: 'blue', number: 7 },
            { color: 'black', number: 4 },
            { color: 'green', number: 9 },
            { color: 'pink', number: 1 },
            { color: 'yellow', number: 6 },
          ]}
          overlap
          cardWidth={120}
          onCardClick={(card) => console.log(`${card.color} ${card.number}`)}
        />


        <GameCard card={{color:'yellow', number:6}} size={100} shadow isTask onClick={() => console.log("TASK yellow 6")} />
      </Container>
    </MantineProvider>
  );
}
