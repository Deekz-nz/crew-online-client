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
  const [gameOver, setGameOver] = useState(false);
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [completedTricks, setCompletedTricks] = useState<Trick[]>([]);
  const [currentTrick, setCurrentTrick] = useState<Trick | null>(null);
  const [communicateMode, setCommunicateMode] = useState(false);

  const joinRoom = async (displayName: string) => {
    if (!displayName.trim()) return;
    try {
      const joinedRoom = await client.joinOrCreate<GameState>("crew", { displayName });
      setRoom(joinedRoom);

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
        setGameStage(state.currentGameStage);
        setCurrentTrick(state.currentTrick);
        setCompletedTricks(Array.from(state.completedTricks));
        setGameOver(state.currentGameStage === "game_end");
      });

    } catch (err) {
      console.error("Failed to join room:", err);
    }
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

  return {
    room,
    joinRoom,
    players,
    playerOrder,
    activePlayer,
    hand,
    playedCards,
    currentPlayer,
    gameStage,
    gameOver,
    tasks,
    currentTrick,
    completedTricks,
    isMyTurn,
    communicateMode,
    setCommunicateMode,
    startGame,
    sendPlayCard,
    sendCommunicateCard,
    sendFinishTrick,
    sendTakeTask,
    sendReturnTask,
    sendFinishTaskAllocation
  };
};
