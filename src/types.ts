// File: src/types.ts
import { MapSchema, ArraySchema } from "@colyseus/schema";

export type CardColor = "yellow" | "green" | "pink" | "blue" | "black";

export type GameStage =
  | "not_started"
  | "game_setup"
  | "trick_start"
  | "trick_middle"
  | "trick_end"
  | "game_end";

export type TaskCategory = "ordered" | "plain" | "sequence" | "must_be_last";

export type CommunicationRank = "highest" | "lowest" | "only" | "unknown";

export interface Card {
  color: CardColor;
  number: number;
}

export interface Player {
  sessionId: string;
  displayName: string;
  hand: Card[];
  hasCommunicated: boolean;
  communicationCard: Card | null;
  communicationRank: CommunicationRank;
}


export interface Trick {
  playedCards: Card[];
  playerOrder: string[];
  trickWinner: string;
  trickCompleted: boolean;
}

export interface SimpleTask {
  card: Card;
  player: string;
  taskNumber: number;
  taskCategory: TaskCategory;
  sequenceIndex: number;
  failed: boolean;
  completed: boolean;
  completedAtTrickIndex?: number;
}

export interface GameState {
  gameHost: string;
  gameStarted: boolean;

  players: MapSchema<Player>;           // Colyseus MapSchema
  playerOrder: ArraySchema<string>;     // Colyseus ArraySchema
  currentPlayer: string;

  currentTrick: Trick;
  completedTricks: ArraySchema<Trick>;  // Colyseus ArraySchema

  allTasks: SimpleTask[]; // Colyseus ArraySchema<SimpleTask>

  currentGameStage: GameStage;
}
