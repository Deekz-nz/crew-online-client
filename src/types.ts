export interface Card {
  color: string;
  number: number;
}

export interface Player {
  hand: Card[];
  isMyTurn: boolean;
}

export interface GameState {
  players: Map<string, Player>;
  playedCards: Card[];
  currentTurnSessionId: string;
}
