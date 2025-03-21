
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import GameHeader from "@/components/GameHeader";
import PlayerSide from "@/components/PlayerSide";
import GameResult from "@/components/GameResult";

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
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isGreaterThan50, setIsGreaterThan50] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [timeWhenGreater, setTimeWhenGreater] = useState(0);

  // Start changing numbers
  const startChangingNumbers = useCallback(() => {
    console.log("Start changing numbers");
    if (gameState !== "playing") return;

    let changeInterval: NodeJS.Timeout;
    
    const changeNumber = () => {
      if (gameState !== "playing") return;
      
      // Generate a random number between 0 and 100
      const nextNumber = Math.floor(Math.random() * 101);
      setCurrentNumber(nextNumber);
      console.log(`Number changed to: ${nextNumber}`);
      
      // Check if it's greater than 50
      if (nextNumber > 50 && !isGreaterThan50) {
        console.log("Number is now greater than 50!");
        setIsGreaterThan50(true);
        setTimeWhenGreater(Date.now());
      } else if (nextNumber <= 50 && isGreaterThan50) {
        setIsGreaterThan50(false);
      }
      
      // Schedule next number change (between 400ms and 900ms)
      const nextChangeTime = 400 + Math.random() * 500;
      changeInterval = setTimeout(changeNumber, nextChangeTime);
    };
    
    // Initial delay before first number change
    const initialDelay = 1000;
    changeInterval = setTimeout(changeNumber, initialDelay);
    
    return () => clearTimeout(changeInterval);
  }, [gameState, isGreaterThan50]);

  // Start the game
  const startGame = useCallback(() => {
    console.log("Starting ChangingNumbers game");
    setGameState("playing");
    setTimeRemaining(maxTime);
    setWinner(null);
    setCurrentNumber(0);
    setIsGreaterThan50(false);
  }, [maxTime]);

  // Handle player tap
  const handlePlayerTap = useCallback((player: Player) => {
    console.log(`Player ${player} tapped. Game state: ${gameState}, Number: ${currentNumber}, Greater than 50: ${isGreaterThan50}`);
    if (gameState !== "playing") return;
    
    // If current number is greater than 50, the tap is valid
    if (isGreaterThan50) {
      const timeElapsed = Date.now() - timeWhenGreater;
      setWinner(player);
      setGameState("complete");
      console.log(`Player ${player} wins! Tapped when number was > 50.`);
      
      // Small delay before completing the game
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      // If tapped when number is <= 50, the other player wins
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      console.log(`Player ${player} tapped when number was <= 50. Player ${otherPlayer} wins.`);
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, isGreaterThan50, onGameComplete, timeWhenGreater, currentNumber]);

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
      console.log("Time's up in ChangingNumbers game!");
      setGameState("complete");
      setTimeout(() => {
        onGameComplete(null, maxTime);
      }, 2000);
    }
  }, [timeRemaining, gameState, onGameComplete, maxTime]);

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

  // Added a useEffect to properly initialize game when state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game state changed to playing, initializing...");
      startChangingNumbers();
    }
  }, [gameState, startChangingNumbers]);

  return (
    <div className="game-container bg-gradient-to-b from-blue-200 to-blue-300">
      <GameHeader
        player1Score={player1Score}
        player2Score={player2Score}
        currentGame={currentGame}
        totalGames={totalGames}
        timerValue={timeRemaining}
        maxTime={maxTime}
      />
      
      {gameState === "ready" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={startGame}>
          <div className="cartoon-border bg-white p-8 text-center max-w-xs mx-4">
            <div className="text-4xl mb-4">🔢</div>
            <h2 className="text-2xl font-black mb-4 uppercase">Changing Numbers</h2>
            <p className="text-gray-700 mb-6 font-bold">
              Tap when you see a number greater than 50!
            </p>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-gray-500 font-bold uppercase"
            >
              Tap to Start
            </motion.div>
          </div>
        </div>
      )}
      
      <div className="flex flex-row h-full border-t-4 border-black">
        <PlayerSide
          player={1}
          onTap={() => handlePlayerTap(1)}
          disabled={gameState !== "playing"}
          className="border-r-4 border-black"
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            {gameState === "playing" && (
              <>
                <motion.div 
                  key={currentNumber}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-8xl font-bold ${getNumberColor()} cartoon-text`}
                >
                  {currentNumber}
                </motion.div>
                <div className="mt-6 text-xl font-bold text-black">
                  Tap when number is <span className="font-black text-green-500">&gt; 50</span>
                </div>
              </>
            )}
          </div>
        </PlayerSide>
        
        <PlayerSide
          player={2}
          onTap={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
          className="border-l-4 border-black"
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            {gameState === "playing" && (
              <>
                <motion.div 
                  key={currentNumber}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-8xl font-bold ${getNumberColor()} cartoon-text`}
                >
                  {currentNumber}
                </motion.div>
                <div className="mt-6 text-xl font-bold text-black">
                  Tap when number is <span className="font-black text-green-500">&gt; 50</span>
                </div>
              </>
            )}
          </div>
        </PlayerSide>
      </div>
      
      <AnimatePresence>
        {gameState === "complete" && (
          <GameResult
            winner={winner}
            message={
              isGreaterThan50
                ? winner ? `Tapped first when the number was ${currentNumber}!` : "Time's up! No one tapped in time."
                : winner ? `The other player tapped when the number was only ${currentNumber}!` : "Time's up!"
            }
            onContinue={() => onGameComplete(winner, maxTime - timeRemaining)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChangingNumbers;
