import { useState } from "react";
import * as Colyseus from "colyseus.js";
import { GameState, Player, Card, SimpleTask, Trick, CommunicationRank } from "../types";
import { notifications } from "@mantine/notifications";

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
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [completedTricks, setCompletedTricks] = useState<Trick[]>([]);
  const [currentTrick, setCurrentTrick] = useState<Trick | null>(null);
  const [expectedTrickCount, setExpectedTrickCount] = useState<number>(0);
  const [communicateMode, setCommunicateMode] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameSucceeded, setGameSucceeded] = useState(false);
  const [commanderPlayer, setCommanderPlayer] = useState("");

  const createRoom = async (displayName: string) => {
    if (!displayName.trim()) return;
    const roomCode = generateRoomCode();
    try {
      const token = import.meta.env.VITE_SHARED_SECRET;
      const createdRoom = await client.create<GameState>("crew", { displayName, token, roomCode });
      setRoom(createdRoom);
      localStorage.setItem("roomId", createdRoom.roomId);
      localStorage.setItem("sessionId", createdRoom.sessionId);
      setupRoomListeners(createdRoom);
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  const joinRoom = async (displayName: string, roomCode: string) => {
    if (!displayName.trim() || !roomCode.trim()) return;
    try {
      const token = import.meta.env.VITE_SHARED_SECRET;
      const joinedRoom = await client.joinById<GameState>(roomCode, { displayName, token });
      setRoom(joinedRoom);
      localStorage.setItem("roomId", joinedRoom.roomId);
      localStorage.setItem("sessionId", joinedRoom.sessionId);
      setupRoomListeners(joinedRoom);
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  };

  const setupRoomListeners = (joinedRoom: Colyseus.Room<GameState>) => {
    joinedRoom.onStateChange((state: GameState) => {
      const updatedPlayers: Player[] = [];
      state.players.forEach((player: any) => {
        updatedPlayers.push({
          sessionId: player.sessionId,
          displayName: player.displayName,
          hand: [],
          hasCommunicated: player.hasCommunicated,
          communicationCard: player.communicationCard,
          communicationRank: player.communicationRank,
          isHost: player.isHost
        });
      });
      setPlayers(updatedPlayers);
      setPlayerOrder(Array.from(state.playerOrder));
  
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
          isHost: player.isHost
        });
      }
  
      setPlayedCards(Array.from(state.currentTrick?.playedCards || []));
      const taskList: SimpleTask[] = Array.from(state.allTasks);
      setTasks(taskList);
      setCurrentPlayer(state.currentPlayer);
      setCommanderPlayer(state.commanderPlayer);
      setGameStage(state.currentGameStage);
      setCurrentTrick(state.currentTrick);
      setCompletedTricks(Array.from(state.completedTricks));
      setExpectedTrickCount(state.expectedTrickCount);
      setGameFinished(state.gameFinished);
      setGameSucceeded(state.gameSucceeded);
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
  }) => {
    room?.send("start_game", setupData);
  };

  const sendPlayCard = (card: Card) => {
    room?.send("play_card", card);
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

  const sendTakeTask = (task: SimpleTask) => {
    room?.send("take_task", task);
  };

  const sendReturnTask = (task: SimpleTask) => {
    room?.send("return_task", task);
  };

  const sendFinishTaskAllocation = () => {
    room?.send("finish_task_allocation");
  };

  const sendRestartGame = () => {
    room?.send("restart_game");
  };

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
    setCommunicateMode,
    startGame,
    sendPlayCard,
    sendCommunicateCard,
    sendFinishTrick,
    sendTakeTask,
    sendReturnTask,
    sendFinishTaskAllocation,
    sendRestartGame
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