import { createContext, useContext } from "react";
import { useGameRoom } from "../hooks/useGameRoom"; // Move hook here
import * as Colyseus from "colyseus.js";



/**
 * GameProvider (React Context)
 * ----------------------------
 * Provides global game state and actions throughout the app.
 *
 * - Wraps around the app with a React Context.
 * - Uses useGameRoom hook to manage Colyseus room connection, players, tasks, game stage, etc.
 * - Exposes state (e.g., players, hand, gameStage) and action functions (e.g., sendTakeTask, sendPlayCard).
 *
 * Allows any component to access game state without prop drilling.
 * Must wrap the app in <GameProvider> in App.tsx.
 */

const client = new Colyseus.Client(import.meta.env.VITE_COLYSEUS_URL);

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
