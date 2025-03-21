import "@mantine/core/styles.css";
import { MantineProvider, Text, Button, Group, Container, Input, Stack, Divider, Title, Checkbox, NumberInput } from "@mantine/core";
import { theme } from "./theme";
import { useState } from "react";
import * as Colyseus from "colyseus.js";
import { Card, CommunicationRank, GameState, Player, SimpleTask, Trick } from "./types"; // You'll need to update your types to reflect schema
import { GameHand } from "./components/GameHand";
import { TaskCard } from "./components/TaskCard";
import { Notifications, notifications } from '@mantine/notifications';
import { CommunicatedCard } from "./components/CommunicatedCard";

export default function App() {
  const [client] = useState(() => new Colyseus.Client("ws://localhost:2567"));
  const [room, setRoom] = useState<Colyseus.Room<GameState> | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [joined, setJoined] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

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

  const [communicateMode, setCommunicateMode] = useState(false);

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
        state.players.forEach((player: any) => { //TODO: this should have a type?
          updatedPlayers.push({
            sessionId: player.sessionId,
            displayName: player.displayName,
            hand: [],
            hasCommunicated: player.hasCommunicated,
            communicationCard: player.communicationCard,
            communicationRank: player.communicationRank
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
          setActivePlayer({
            sessionId: player.sessionId,
            displayName: player.displayName,
            hand: cards,
            hasCommunicated: player.hasCommunicated,
            communicationCard: player.communicationCard,
            communicationRank: player.communicationRank,
          });
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

        // Turn off communication mode is the state changes
        setCommunicateMode(false); 
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

  const handleCommunicateCard = (
    card: Card,
    hand: Card[],
    room: Colyseus.Room<GameState> | null,
    setCommunicateMode: (value: boolean) => void
  ) => {
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
  
    // Send backend message
    const sendCard = {
      color: card.color,
      number: card.number,
    };
    room?.send("communicate", { card: sendCard, cardRank: rank });
    setCommunicateMode(false);
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
      <Notifications />
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
                <GameHand
                  hand={hand}
                  overlap
                  cardWidth={120}
                  disabled={false}
                  onCardClick={(card) => {
                    if (communicateMode && activePlayer) {
                      handleCommunicateCard(card, hand, room, setCommunicateMode);
                    } else {
                      if (isMyTurn && (gameStage === "trick_start" || gameStage === "trick_middle")) {
                        playCard(card);
                      }
                    }
                  }}
                />
                <Divider my="sm" />
                {(gameStage === "trick_start" || gameStage === "trick_end") && (
                  <Button
                    onClick={() => {
                      if (!activePlayer?.hasCommunicated) {
                        setCommunicateMode(prev => !prev);
                      }
                    }}
                    disabled={activePlayer?.hasCommunicated}
                    color={activePlayer?.hasCommunicated ? 'gray' : 'blue'}
                    mb="sm"
                  >
                    {activePlayer?.hasCommunicated ? 'Communicate' : communicateMode ? 'Cancel' : 'Communicate'}
                  </Button>
                )}
                <Divider my="sm" />
                <Text fw={500}>Tasks:</Text>
                <Group mb="sm" wrap="wrap">
                  {allTasks.map((task, index) => {
                    const taskOwner = players.find(p => p.sessionId === task.player);
                    const isOwnedByMe = task.player === room?.sessionId;
                    const isTaskPhase = gameStage === "game_setup";

                    const handleTaskClick = () => {
                      if (!isTaskPhase) return;
                      if (!task.player) takeTask(task);
                      else if (isOwnedByMe) returnTask(task);
                    };

                    return (
                      <TaskCard
                        key={index}
                        task={task}
                        width={100}
                        onClick={handleTaskClick}
                        disabled={!isTaskPhase}
                        ownerDisplayName={taskOwner ? taskOwner.displayName : 'Unclaimed'} // NEW
                      />
                    );
                  })}
                </Group>
                <Divider my="sm" />
                <Text fw={500}>Communications:</Text>
                <Group mb="sm" wrap="wrap">
                  {players.map((p) => (
                    <CommunicatedCard key={p.sessionId} player={p} width={100} />
                  ))}
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
        {/* <GameHand
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


        <GameCard card={{color:'yellow', number:6}} size={100} shadow isTask onClick={() => console.log("TASK yellow 6")} /> */}
      </Container>
    </MantineProvider>
  );
}
