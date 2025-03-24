import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/game";

// תוספת חדשה - ייצוא קבועים גלובליים לתזמון הופעת פריטים מיוחדים
export const SPECIAL_ITEM_TIMING = {
  MIN_PERCENT: 0.2,  // הפריט יופיע לכל הפחות אחרי 20% מזמן המשחק
  MAX_PERCENT: 0.8,  // הפריט יופיע לכל היותר אחרי 80% מזמן המשחק
  FORCE_APPEAR: true // אילוץ הופעת פריט מיוחד תמיד
};

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
  registerForceCallback: (callback: () => void) => void;
  emergencyForceSpecialItem: () => void;
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
  
  // חדש: הוספת התייחסות להופעת פריט מיוחד - מאפשר אכיפה גלובלית
  const [emergencySpecialItemShown, setEmergencySpecialItemShown] = useState(false);
  const [forceSpecialItemCallback, setForceSpecialItemCallback] = useState<(() => void) | null>(null);

  // משתמשים יכולים לרשום פונקציה כדי לאלץ הופעת פריט מיוחד
  const registerForceCallback = useCallback((callback: () => void) => {
    console.log("Registering emergency callback for forcing special item appearance");
    setForceSpecialItemCallback(() => callback);
  }, []);

  // מצב חירום: להופיע פריט מיוחד אם עדיין לא הופיע
  const emergencyForceSpecialItem = useCallback(() => {
    if (forceSpecialItemCallback && !emergencySpecialItemShown) {
      console.log("🚨 EMERGENCY: Forcing special item to appear globally!");
      forceSpecialItemCallback();
      setEmergencySpecialItemShown(true);
    }
  }, [forceSpecialItemCallback, emergencySpecialItemShown]);

  // Reset game state
  const resetGame = useCallback(() => {
    console.log("Resetting game state");
    setGameState("ready");
    setTimeRemaining(maxTime);
    setWinner(null);
    setStartTime(0);
    setEmergencySpecialItemShown(false);
    setForceSpecialItemCallback(null);
  }, [maxTime]);

  // Initialize timer when game starts playing
  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game started playing, setting start time");
      setStartTime(Date.now());
    }
  }, [gameState]);

  // Timer logic - simplified
  useEffect(() => {
    if (gameState !== "playing") return;

    console.log("Starting basic game timer with max time:", maxTime);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, maxTime - elapsed);
      
      setTimeRemaining(remaining);
      
      // אכיפת הופעת פריט מיוחד אם עברנו את נקודת האמצע של המשחק
      if (elapsed > maxTime * SPECIAL_ITEM_TIMING.MAX_PERCENT * 0.9 && !emergencySpecialItemShown) {
        console.log(`🚨 CRITICAL: ${elapsed}ms elapsed (${elapsed/maxTime*100}% of game time) - forcing special item to appear now!`);
        emergencyForceSpecialItem();
      }
      
      if (remaining <= 0) {
        console.log("Time's up - game over");
        clearInterval(interval);
        setGameState("complete");
        setWinner(null);
        onGameComplete(null, maxTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, maxTime, emergencySpecialItemShown, emergencyForceSpecialItem]);

  // Handle game completion directly in timer
  useEffect(() => {
    if (gameState === "complete" && winner === null && timeRemaining <= 0) {
      console.log("Game completed due to timeout");
      onGameComplete(null, maxTime);
    }
  }, [gameState, winner, timeRemaining, onGameComplete, maxTime]);

  // Simplified player action handler
  const handlePlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    console.log("Player", player, "action received");
    const timeElapsed = Date.now() - startTime;
    
    setWinner(player);
    setGameState("complete");
    onGameComplete(player, timeElapsed);
  }, [gameState, startTime, onGameComplete]);

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
    calculateTimeElapsed,
    registerForceCallback,
    emergencyForceSpecialItem
  };
}
