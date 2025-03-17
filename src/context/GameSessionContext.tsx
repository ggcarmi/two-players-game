
import { createContext, useContext } from "react";
import { GameConfig, Player, GameResult, SessionState } from "../types/game";

interface GameSessionContextType extends SessionState {
  currentGame: GameConfig | null;
  setWinner: (winner: Player | null, timeElapsed: number) => void;
  resetSession: (selectedGames?: string[]) => void;
  toggleGameEnabled: (gameId: string) => void;
}

export const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const useGameSessionContext = () => {
  const context = useContext(GameSessionContext);
  if (context === undefined) {
    throw new Error("useGameSessionContext must be used within a GameSessionProvider");
  }
  return context;
};
