import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/game";

export interface UseGameStateProps {
  maxTime: number;
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  timeoutDelay?: number;
}

export interface GameStateReturn {
  gameState: "ready" | "playing" | "complete";
  setGameState: (state: "ready" | "playing" | "complete") => void;
  timeRemaining: number;
  startTime: number;
  winner: Player | null;
  setWinner: (winner: Player | null) => void;
  handlePlayerAction: (player: Player) => void;
  resetGame: () => void;
  calculateTimeElapsed: () => number;
}

/**
 * A hook to manage common game state logic across different games
 */
export function useGameState({
  maxTime,
  onGameComplete,
  timeoutDelay = 2000
}: UseGameStateProps): GameStateReturn {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [startTime, setStartTime] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);

  // Reset game state
  const resetGame = useCallback(() => {
    setGameState("ready");
    setTimeRemaining(maxTime);
    setWinner(null);
    setStartTime(0);
  }, [maxTime]);

  // Initialize timer when game starts playing
  useEffect(() => {
    if (gameState === "playing") {
      setStartTime(Date.now());
    }
  }, [gameState]);

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setGameState("complete");
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState]);

  // Handle timeout
  useEffect(() => {
    if (timeRemaining <= 0 && gameState === "playing") {
      setGameState("complete");
      setTimeout(() => {
        onGameComplete(null, maxTime);
      }, timeoutDelay);
    }
  }, [timeRemaining, gameState, onGameComplete, maxTime, timeoutDelay]);

  // Handle player action during gameplay
  const handlePlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    setWinner(player);
    setGameState("complete");
    
    const timeElapsed = Date.now() - startTime;
    
    setTimeout(() => {
      onGameComplete(player, timeElapsed);
    }, timeoutDelay);
  }, [gameState, onGameComplete, startTime, timeoutDelay]);

  // Helper to calculate elapsed time
  const calculateTimeElapsed = useCallback(() => {
    return Date.now() - startTime;
  }, [startTime]);

  return {
    gameState,
    setGameState,
    timeRemaining,
    startTime,
    winner,
    setWinner,
    handlePlayerAction,
    resetGame,
    calculateTimeElapsed
  };
}