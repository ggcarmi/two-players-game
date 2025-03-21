
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import GameHeader from "@/components/GameHeader";
import PlayerSide from "@/components/PlayerSide";
import GameResult from "@/components/GameResult";

interface CorrectColorProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

// Array of colors to use in the game
const colors = [
  { name: "Red", bg: "bg-red-500" },
  { name: "Blue", bg: "bg-blue-500" },
  { name: "Green", bg: "bg-green-500" },
  { name: "Yellow", bg: "bg-yellow-500" },
  { name: "Purple", bg: "bg-purple-500" }
];

const CorrectColor: React.FC<CorrectColorProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
}) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [targetColor, setTargetColor] = useState(colors[0]);
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [isCorrectColor, setIsCorrectColor] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [timeWhenCorrect, setTimeWhenCorrect] = useState(0);

  // Initialize the game
  const initGame = useCallback(() => {
    console.log("Initializing CorrectColor game");
    // Choose a random target color
    const randomTarget = colors[Math.floor(Math.random() * colors.length)];
    setTargetColor(randomTarget);
    setIsCorrectColor(false);
    
    // Start with a different color
    let initialColor;
    do {
      initialColor = colors[Math.floor(Math.random() * colors.length)];
    } while (initialColor.name === randomTarget.name);
    
    setCurrentColor(initialColor);
    
    // Start changing colors
    startChangingColors();
  }, []);

  // Function to change colors at intervals
  const startChangingColors = useCallback(() => {
    console.log("Starting color changes");
    let changeInterval: NodeJS.Timeout;
    
    const changeColor = () => {
      if (gameState !== "playing") return;
      
      // Randomly choose next color (can be same as current)
      const nextColor = colors[Math.floor(Math.random() * colors.length)];
      setCurrentColor(nextColor);
      console.log(`Changed to ${nextColor.name}. Target is ${targetColor.name}`);
      
      // Check if it matches target color
      if (nextColor.name === targetColor.name && !isCorrectColor) {
        console.log("Correct color shown!");
        setIsCorrectColor(true);
        setTimeWhenCorrect(Date.now());
      } else if (nextColor.name !== targetColor.name && isCorrectColor) {
        setIsCorrectColor(false);
      }
      
      // Schedule next color change (between 500ms and 1500ms)
      const nextChangeTime = 500 + Math.random() * 1000;
      changeInterval = setTimeout(changeColor, nextChangeTime);
    };
    
    // Initial delay before first color change
    const initialDelay = 1000 + Math.random() * 1500;
    changeInterval = setTimeout(changeColor, initialDelay);
    
    return () => clearTimeout(changeInterval);
  }, [gameState, isCorrectColor, targetColor]);

  // Start the game
  const startGame = useCallback(() => {
    console.log("Starting CorrectColor game");
    setGameState("playing");
    setTimeRemaining(maxTime);
    setWinner(null);
  }, [maxTime]);

  // Handle player tap
  const handlePlayerTap = useCallback((player: Player) => {
    console.log(`Player ${player} tapped. Game state: ${gameState}, Correct color: ${isCorrectColor}`);
    if (gameState !== "playing") return;
    
    // If current color is the target color, the tap is valid
    if (isCorrectColor) {
      const timeElapsed = Date.now() - timeWhenCorrect;
      setWinner(player);
      setGameState("complete");
      console.log(`Player ${player} wins! Tapped on correct color.`);
      
      // Small delay before completing the game
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      // If tapped when color is wrong, the other player wins
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      console.log(`Player ${player} tapped on wrong color. Player ${otherPlayer} wins.`);
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, isCorrectColor, onGameComplete, timeWhenCorrect]);

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
      console.log("Time's up in CorrectColor game!");
      setGameState("complete");
      setTimeout(() => {
        onGameComplete(null, maxTime);
      }, 2000);
    }
  }, [timeRemaining, gameState, onGameComplete, maxTime]);

  // Added a useEffect to properly initialize game when state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game state changed to playing, initializing...");
      initGame();
    }
  }, [gameState, initGame]);

  return (
    <div className="game-container">
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
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-2xl font-black mb-4 uppercase">Correct Color</h2>
            <p className="text-gray-700 mb-6 font-bold">
              Tap when the screen shows the <span className="font-bold">{targetColor.name}</span> color!
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
          className={`${currentColor.bg} border-r-4 border-black transition-colors duration-300`}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            {gameState === "playing" && (
              <>
                <div className="text-5xl font-black text-white cartoon-text mb-8 uppercase">
                  {currentColor.name}
                </div>
                <div className="text-xl text-white font-bold">
                  Tap when it's <span className="font-black">{targetColor.name}!</span>
                </div>
              </>
            )}
          </div>
        </PlayerSide>
        
        <PlayerSide
          player={2}
          onTap={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
          className={`${currentColor.bg} border-l-4 border-black transition-colors duration-300`}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            {gameState === "playing" && (
              <>
                <div className="text-5xl font-black text-white cartoon-text mb-8 uppercase">
                  {currentColor.name}
                </div>
                <div className="text-xl text-white font-bold">
                  Tap when it's <span className="font-black">{targetColor.name}!</span>
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
              isCorrectColor
                ? winner ? "Tapped first when the color was correct!" : "Time's up! No one tapped in time."
                : winner ? "The other player tapped with the wrong color!" : "Time's up!"
            }
            onContinue={() => onGameComplete(winner, maxTime - timeRemaining)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CorrectColor;
