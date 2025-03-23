
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
    console.log("Resetting game state");
    setGameState("ready");
    setTimeRemaining(maxTime);
    setWinner(null);
    setStartTime(0);
  }, [maxTime]);

  // Initialize timer when game starts playing
  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game started playing, setting start time");
      setStartTime(Date.now());
    }
  }, [gameState]);

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing") return;

    console.log("Starting game timer with max time:", maxTime);
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          console.log("Time's up!");
          clearInterval(interval);
          setGameState("complete");
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, maxTime]);

  // Handle timeout
  useEffect(() => {
    if (timeRemaining <= 0 && gameState === "playing") {
      console.log("Game timed out, completing with no winner");
      setGameState("complete");
      
      // Ensure we call onGameComplete with null winner after a short delay
      const timeoutId = setTimeout(() => {
        console.log("Executing timeout callback after delay");
        onGameComplete(null, maxTime);
      }, timeoutDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [timeRemaining, gameState, onGameComplete, maxTime, timeoutDelay]);

  // Handle player action during gameplay
  const handlePlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    console.log("Player", player, "action received");
    setWinner(player);
    setGameState("complete");
    
    const timeElapsed = Date.now() - startTime;
    
    // Call onGameComplete after a delay to show the result screen first
    const timeoutId = setTimeout(() => {
      console.log("Executing player action callback after delay");
      onGameComplete(player, timeElapsed);
    }, timeoutDelay);
    
    return () => clearTimeout(timeoutId);
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
