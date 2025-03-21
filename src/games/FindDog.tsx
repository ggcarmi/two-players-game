
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import GameHeader from "@/components/GameHeader";
import PlayerSide from "@/components/PlayerSide";
import GameResult from "@/components/GameResult";

interface FindDogProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const FindDog: React.FC<FindDogProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
}) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [dogPosition, setDogPosition] = useState<{ x: number; y: number } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [pandas, setPandas] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Initialize the game
  const initGame = useCallback(() => {
    console.log("Initializing game...");
    setTimeRemaining(maxTime);
    setDogPosition(null);
    setWinner(null);
    
    // Create pandas array
    const newPandas = Array.from({ length: 24 }, (_, index) => ({
      id: index,
      x: Math.random() * 80 + 10, // 10-90% of container width
      y: Math.random() * 70 + 15, // 15-85% of container height
    }));
    setPandas(newPandas);
    
    // Set timeout to show the dog
    const dogDelay = 1000 + Math.random() * 4000; // 1-5 seconds
    setTimeout(() => {
      console.log("Dog should appear now, gameState:", gameState);
      if (gameState === "playing") {
        const randomPosition = {
          x: Math.random() * 80 + 10,
          y: Math.random() * 70 + 15,
        };
        setDogPosition(randomPosition);
        setStartTime(Date.now());
        console.log("Dog positioned at:", randomPosition);
      } else {
        console.log("Game not in playing state, dog won't appear");
      }
    }, dogDelay);
  }, [gameState, maxTime]);

  // Start the game
  const startGame = useCallback(() => {
    console.log("Starting game...");
    setGameState("playing");
  }, []);

  // Effect to initialize the game when it changes to playing state
  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game state changed to playing, initializing...");
      initGame();
    }
  }, [gameState, initGame]);

  // Handle player tap
  const handlePlayerTap = useCallback((player: Player) => {
    console.log("Player", player, "tapped. Game state:", gameState, "Dog position:", dogPosition);
    if (gameState !== "playing") return;
    
    // If dog isn't shown yet, player tapped too early
    if (!dogPosition) return;
    
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    
    setWinner(player);
    setGameState("complete");
    console.log("Player", player, "wins! Time elapsed:", timeElapsed);
    
    // Small delay before completing the game
    setTimeout(() => {
      onGameComplete(player, timeElapsed);
    }, 2000);
  }, [dogPosition, gameState, onGameComplete, startTime]);

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
      console.log("Time's up!");
      setGameState("complete");
      setTimeout(() => {
        onGameComplete(null, maxTime);
      }, 2000);
    }
  }, [timeRemaining, gameState, onGameComplete, maxTime]);

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
          <div className="glass-panel p-6 text-center max-w-xs mx-4 bg-white rounded-xl cartoon-border">
            <div className="text-4xl mb-4">🐼🐶</div>
            <h2 className="text-xl font-bold mb-2">Find the Dog</h2>
            <p className="text-gray-700 mb-6">
              A dog will appear among the pandas. Be the first to tap it!
            </p>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-gray-500 text-sm font-bold"
            >
              Tap to Start
            </motion.div>
          </div>
        </div>
      )}
      
      <div className="flex flex-row h-full">
        <PlayerSide
          player={1}
          onTap={() => handlePlayerTap(1)}
          disabled={gameState !== "playing"}
          className="border-r border-black"
        >
          <div className="relative w-full h-full overflow-hidden">
            {pandas.slice(0, pandas.length / 2).map(panda => (
              <div 
                key={`p1-${panda.id}`}
                className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${panda.x}%`, top: `${panda.y}%` }}
              >
                🐼
              </div>
            ))}
            
            {dogPosition && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${dogPosition.x}%`, top: `${dogPosition.y}%` }}
              >
                🐶
              </motion.div>
            )}
          </div>
        </PlayerSide>
        
        <PlayerSide
          player={2}
          onTap={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
          className="border-l border-black"
        >
          <div className="relative w-full h-full overflow-hidden">
            {pandas.slice(pandas.length / 2).map(panda => (
              <div 
                key={`p2-${panda.id}`}
                className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${panda.x}%`, top: `${panda.y}%` }}
              >
                🐼
              </div>
            ))}
            
            {dogPosition && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${dogPosition.x}%`, top: `${dogPosition.y}%` }}
              >
                🐶
              </motion.div>
            )}
          </div>
        </PlayerSide>
      </div>
      
      <AnimatePresence>
        {gameState === "complete" && (
          <GameResult
            winner={winner}
            message={winner ? "Found the dog first!" : "Time's up! No one found the dog."}
            onContinue={() => onGameComplete(winner, maxTime - timeRemaining)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindDog;
