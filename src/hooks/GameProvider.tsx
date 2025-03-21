import { createContext, useContext } from "react";
import { useGameRoom } from "../hooks/useGameRoom"; // Move hook here
import * as Colyseus from "colyseus.js";

const client = new Colyseus.Client("ws://localhost:2567");

const GameContext = createContext<ReturnType<typeof useGameRoom> | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const game = useGameRoom(client);
  return (
    <GameContext.Provider value={game}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
