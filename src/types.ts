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

export interface Card {
  color: CardColor;
  number: number;
}

export interface Player {
  sessionId: string;
  displayName: string;
  hand: Card[];
}

export interface Trick {
  playedCards: Card[];
  playerOrder: string[];
  trickWinner: string;
  trickCompleted: boolean;
}

export interface GameState {
  gameHost: string;
  gameStarted: boolean;

  players: MapSchema<Player>;           // Colyseus MapSchema
  playerOrder: ArraySchema<string>;     // Colyseus ArraySchema
  currentPlayer: string;

  currentTrick: Trick;
  completedTricks: ArraySchema<Trick>;  // Colyseus ArraySchema

  currentGameStage: GameStage;
}
