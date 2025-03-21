import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState } from "@/hooks/useGameState";

interface ChangingNumbersProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const ChangingNumbers: React.FC<ChangingNumbersProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
}) => {
  // Use the shared game state hook
  const {
    gameState,
    setGameState,
    timeRemaining,
    winner,
    setWinner,
  } = useGameState({
    maxTime,
    onGameComplete
  });

  // State for tracking the current number
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isGreaterThan50, setIsGreaterThan50] = useState(false);
  const [timeWhenGreater, setTimeWhenGreater] = useState(0);

  // Start changing numbers
  const startChangingNumbers = useCallback(() => {
    if (gameState !== "playing") return;
    
    const changeNumber = () => {
      if (gameState !== "playing") return;
      
      // Generate a random number between 0 and 100
      const nextNumber = Math.floor(Math.random() * 101);
      setCurrentNumber(nextNumber);
      
      // Check if it's greater than 50
      if (nextNumber > 50 && !isGreaterThan50) {
        setIsGreaterThan50(true);
        setTimeWhenGreater(Date.now());
      } else if (nextNumber <= 50 && isGreaterThan50) {
        setIsGreaterThan50(false);
      }
      
      // Schedule next number change (between 400ms and 900ms)
      const nextChangeTime = 400 + Math.random() * 500;
      const timeoutId = setTimeout(changeNumber, nextChangeTime);
      
      return () => clearTimeout(timeoutId);
    };
    
    // Initial delay before first number change
    const initialDelay = 1000;
    const initialTimeoutId = setTimeout(changeNumber, initialDelay);
    
    return () => clearTimeout(initialTimeoutId);
  }, [gameState, isGreaterThan50]);

  // Handle player tap
  const onPlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    // If current number is greater than 50, the tap is valid
    if (isGreaterThan50) {
      const timeElapsed = Date.now() - timeWhenGreater;
      setWinner(player);
      setGameState("complete");
      
      // Small delay before completing the game
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      // If tapped when number is <= 50, the other player wins
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, isGreaterThan50, onGameComplete, timeWhenGreater, setWinner, setGameState]);

  // Initialize the game when the game state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      setCurrentNumber(0);
      setIsGreaterThan50(false);
      const cleanup = startChangingNumbers();
      
      return cleanup;
    }
  }, [gameState, startChangingNumbers]);

  // Determine the color based on the number
  const getNumberColor = () => {
    if (currentNumber > 50) {
      return "text-green-500";
    } else if (currentNumber > 30) {
      return "text-yellow-500";
    } else {
      return "text-red-500";
    }
  };

  return (
    <TwoPlayerGameLayout
      gameState={gameState}
      setGameState={setGameState}
      player1Score={player1Score}
      player2Score={player2Score}
      currentGame={currentGame}
      totalGames={totalGames}
      timeRemaining={timeRemaining}
      maxTime={maxTime}
      winner={winner}
      resultMessage={
        isGreaterThan50
          ? winner ? `Tapped first when the number was ${currentNumber}!` : "Time's up! No one tapped in time."
          : winner ? `The other player tapped when the number was only ${currentNumber}!` : "Time's up!"
      }
      onPlayerAction={onPlayerAction}
      startScreenTitle="Changing Numbers"
      startScreenDescription="Tap when you see a number greater than 50!"
      startScreenIcon="🔢"
      onGameComplete={onGameComplete}
    >
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-blue-200 to-blue-300">
        {gameState === "playing" && (
          <>
            <motion.div 
              key={currentNumber}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-8xl md:text-9xl font-black ${getNumberColor()}`}
            >
              {currentNumber}
            </motion.div>
            <div className="mt-4 text-lg font-bold">
              {isGreaterThan50 ? "TAP NOW!" : "WAIT..."}
            </div>
          </>
        )}
      </div>
    </TwoPlayerGameLayout>
  );
};

export default ChangingNumbers;
