import { useState } from "react";
import * as Colyseus from "colyseus.js";
import { GameState, Player, Card, SimpleTask, Trick, CommunicationRank, FrontendHistoryStats, BaseTask } from "../types";
import { notifications } from "@mantine/notifications";
import { LS_PREVIOUS_TASKS } from "../screens/GameSetupScreen";

/**
 * useGameRoom
 * -----------
 * Custom React hook for managing Colyseus WebSocket connection and game state.
 *
 * - Connects to Colyseus server and joins/creates the "crew" room.
 * - Listens to server state changes and updates local React state accordingly.
 * - Tracks players, hand, tasks, gameStage, playerOrder, and more.
 * - Provides action functions: sendTakeTask, sendReturnTask, sendPlayCard, sendFinishTaskAllocation.
 *
 * All game state logic is centralized here and shared via GameProvider.
 */

export const useGameRoom = (client: Colyseus.Client) => {
  const [room, setRoom] = useState<Colyseus.Room<GameState> | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [gameStage, setGameStage] = useState("");
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [completedTricks, setCompletedTricks] = useState<Trick[]>([]);
  const [currentTrick, setCurrentTrick] = useState<Trick | null>(null);
  const [expectedTrickCount, setExpectedTrickCount] = useState<number>(0);
  const [communicateMode, setCommunicateMode] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameSucceeded, setGameSucceeded] = useState(false);
  const [commanderPlayer, setCommanderPlayer] = useState("");
  const [playerHistoryStats, setPlayerHistoryStats] = useState<FrontendHistoryStats>({});

  const syncState = (state: GameState, sessionId: string) => {
    if (!state || !state.players) return;
    const updatedPlayers: Player[] = [];
    state.players.forEach((player: Player) => {
      updatedPlayers.push({
        sessionId: player.sessionId,
        displayName: player.displayName,
        hand: [],
        hasCommunicated: player.hasCommunicated,
        intendsToCommunicate: player.intendsToCommunicate,
        communicationCard: player.communicationCard,
        communicationRank: player.communicationRank,
        isHost: player.isHost,
        isConnected: player.isConnected,
      });
    });
    setPlayers(updatedPlayers);
    setPlayerOrder(Array.from(state.playerOrder));

    const player = state.players.get(sessionId);
    if (player) {
      const cards: Card[] = Array.from(player.hand).map((card: Card) => ({
        color: card.color,
        number: card.number,
      }));
      setHand(cards);
      setActivePlayer({
        sessionId: player.sessionId,
        displayName: player.displayName,
        hand: cards,
        hasCommunicated: player.hasCommunicated,
        intendsToCommunicate: player.intendsToCommunicate,
        communicationCard: player.communicationCard,
        communicationRank: player.communicationRank,
        isHost: player.isHost,
        isConnected: player.isConnected,
      });
    }

    setPlayedCards(Array.from(state.currentTrick?.playedCards || []));
    const taskList: BaseTask[] = Array.from(state.allTasks);
    setTasks(taskList);
    setCurrentPlayer(state.currentPlayer);
    setCommanderPlayer(state.commanderPlayer);
    setGameStage(state.currentGameStage);
    setCurrentTrick(state.currentTrick);
    setCompletedTricks(Array.from(state.completedTricks));
    setExpectedTrickCount(state.expectedTrickCount);
    setGameFinished(state.gameFinished);
    setGameSucceeded(state.gameSucceeded);

    const historyStats: Record<string, { cards: Card[]; tasks: SimpleTask[] }> = {};
    state.historyPlayerStats.forEach((history, playerId) => {
      historyStats[playerId] = {
        cards: Array.from(history.cards),
        tasks: Array.from(history.tasks),
      };
    });

    setPlayerHistoryStats(historyStats);
  };

  const createRoom = async (displayName: string) => {
    if (!displayName.trim()) return;
    const roomCode = generateRoomCode();
    try {
      const token = import.meta.env.VITE_SHARED_SECRET;
      const createdRoom = await client.create<GameState>("crew", { displayName, token, roomCode });
      setRoom(createdRoom);
      localStorage.setItem("roomId", createdRoom.roomId);
      localStorage.setItem("reconnectionToken", createdRoom.reconnectionToken);
      setupRoomListeners(createdRoom);
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  const joinRoom = async (displayName: string, roomCode: string) => {
    if (!displayName.trim() || !roomCode.trim()) return;
  
    const sharedToken = import.meta.env.VITE_SHARED_SECRET;
    const savedRoomId = localStorage.getItem("roomId");
    const reconnectionToken = localStorage.getItem("reconnectionToken");
  
    // ✅ Attempt reconnect if same room and reconnectionToken exists
    if (roomCode === savedRoomId && reconnectionToken) {
      try {
        const rejoinedRoom = await client.reconnect(reconnectionToken) as Colyseus.Room<GameState>;
        setRoom(rejoinedRoom);
        setupRoomListeners(rejoinedRoom);

        // 🔥 SAVE the new reconnectionToken!
        localStorage.setItem("reconnectionToken", rejoinedRoom.reconnectionToken);
        console.log("Reconnected successfully to room:", roomCode);
        return; // ✅ Exit early, no need to join again
      } catch (err) {
        console.warn("Reconnect failed, falling back to join:", err);
        // Clear stale token
        localStorage.removeItem("reconnectionToken");
        localStorage.removeItem("roomId");
      }
    }
  
    // 🔄 Regular join fallback
    try {
      const joinedRoom = await client.joinById<GameState>(roomCode, { displayName, token: sharedToken });
      setRoom(joinedRoom);
      localStorage.setItem("roomId", joinedRoom.roomId);
      localStorage.setItem("reconnectionToken", joinedRoom.reconnectionToken);
      setupRoomListeners(joinedRoom);
      console.log("Joined room:", roomCode);
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  };
  
  // The main method responsible for syncing the backend state to the frontend
  const setupRoomListeners = (joinedRoom: Colyseus.Room<GameState>) => {
    syncState(joinedRoom.state, joinedRoom.sessionId);

    joinedRoom.onStateChange((state: GameState) => {
      syncState(state, joinedRoom.sessionId);
    });

    joinedRoom.onMessage("room_closed", (message) => {
      console.log("Room closed due to:", message.reason);
      // Show notification or redirect
    });
  };

  const isMyTurn = room?.sessionId === currentPlayer;

  const startGame = (setupData: {
    includeTasks: boolean;
    taskInstructions: {
      plainTasks: number;
      orderedTasks: number;
      sequencedTasks: number;
      lastTask: boolean;
    };
    useExpansion: boolean;
    difficultyScore: number;
    startingTasks?: string[];
  }) => {
    room?.send("start_game", setupData);
  };

  const sendPlayCard = (card: Card) => {
    room?.send("play_card", card);
  };

  const sendUndoCard = () => {
    room?.send("undo_card");
  };

  const sendCommunicateCard = (card: Card) => {
    const sameColor = hand.filter(c => c.color === card.color);
    const sorted = [...sameColor].sort((a, b) => a.number - b.number);

    let rank: CommunicationRank = "unknown";
    if (sameColor.length === 1) rank = "only";
    else if (card.number === sorted[0].number) rank = "lowest";
    else if (card.number === sorted[sorted.length - 1].number) rank = "highest";

    if (rank === "unknown") {
      notifications.show({
        color: 'red',
        title: 'Invalid Communication',
        message: 'You can only communicate your highest, lowest, or only card of that color.',
      });
      return;
    }

    room?.send("communicate", { card, cardRank: rank });
  };

  const sendFinishTrick = () => {
    room?.send("finish_trick");
  };

  const sendTakeTask = (task: BaseTask) => {
    room?.send("take_task", task);
  };

  const sendReturnTask = (task: BaseTask) => {
    room?.send("return_task", task);
  };

  const sendRegisterInterest = (task: BaseTask) => {
    room?.send("register_interest_in_task", task);
  };

  const sendCancelInterest = (task: BaseTask) => {
    room?.send("cancel_interest_in_task", task);
  };

  const sendFinishTaskAllocation = () => {
    room?.send("finish_task_allocation");
  };

  const sendRestartGame = () => {
    const previousTaskIDs = tasks.map(task => task.taskId);
    localStorage.setItem(LS_PREVIOUS_TASKS, JSON.stringify(previousTaskIDs));
    room?.send("restart_game");
  };

  const sendGiveUp = () => {
    room?.send("give_up");
  }

  return {
    room,
    joinRoom,
    createRoom,
    players,
    playerOrder,
    activePlayer,
    hand,
    playedCards,
    currentPlayer,
    commanderPlayer,
    gameStage,
    tasks,
    currentTrick,
    completedTricks,
    expectedTrickCount,
    isMyTurn,
    communicateMode,
    gameFinished,
    gameSucceeded,
    playerHistoryStats,
    setCommunicateMode,
    startGame,
    sendPlayCard,
    sendUndoCard,
    sendCommunicateCard,
    sendFinishTrick,
    sendTakeTask,
    sendReturnTask,
    sendRegisterInterest,
    sendCancelInterest,
    sendFinishTaskAllocation,
    sendRestartGame,
    sendGiveUp
  };
};

// Utility to generate 6-letter code
const generateRoomCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
};