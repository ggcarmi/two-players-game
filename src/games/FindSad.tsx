
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import GameHeader from "@/components/GameHeader";
import PlayerSide from "@/components/PlayerSide";
import GameResult from "@/components/GameResult";

interface FindSadProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const FindSad: React.FC<FindSadProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
}) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [sadPosition, setSadPosition] = useState<{ x: number; y: number } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [faces, setFaces] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Initialize the game
  const initGame = useCallback(() => {
    console.log("Initializing FindSad game...");
    setTimeRemaining(maxTime);
    setSadPosition(null);
    setWinner(null);
    
    // Create faces array
    const newFaces = Array.from({ length: 30 }, (_, index) => ({
      id: index,
      x: Math.random() * 80 + 10, // 10-90% of container width
      y: Math.random() * 70 + 15, // 15-85% of container height
    }));
    setFaces(newFaces);
    
    // Set timeout to show the sad face
    const sadDelay = 1500 + Math.random() * 3500; // 1.5-5 seconds
    setTimeout(() => {
      console.log("Sad face should appear now, gameState:", gameState);
      if (gameState === "playing") {
        const randomPosition = {
          x: Math.random() * 80 + 10,
          y: Math.random() * 70 + 15,
        };
        setSadPosition(randomPosition);
        setStartTime(Date.now());
        console.log("Sad face positioned at:", randomPosition);
      } else {
        console.log("Game not in playing state, sad face won't appear");
      }
    }, sadDelay);
  }, [gameState, maxTime]);

  // Start the game
  const startGame = () => {
    console.log("Starting FindSad game...");
    setGameState("playing");
  };

  // Effect to initialize the game when it changes to playing state
  useEffect(() => {
    if (gameState === "playing") {
      console.log("FindSad game state changed to playing, initializing...");
      initGame();
    }
  }, [gameState, initGame]);

  // Handle player tap
  const handlePlayerTap = useCallback((player: Player) => {
    console.log("Player", player, "tapped. Game state:", gameState, "Sad position:", sadPosition);
    if (gameState !== "playing") return;
    
    // If sad face isn't shown yet, player tapped too early
    if (!sadPosition) return;
    
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    
    setWinner(player);
    setGameState("complete");
    console.log("Player", player, "wins! Time elapsed:", timeElapsed);
    
    // Small delay before completing the game
    setTimeout(() => {
      onGameComplete(player, timeElapsed);
    }, 2000);
  }, [sadPosition, gameState, onGameComplete, startTime]);

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
          <div className="glass-panel p-6 text-center max-w-xs mx-4">
            <div className="text-4xl mb-4">🙂☹️</div>
            <h2 className="text-xl font-bold mb-2">Find the Sad Face</h2>
            <p className="text-muted-foreground mb-6">
              A sad face will appear among the happy ones. Be the first to tap it!
            </p>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-muted-foreground text-sm"
            >
              Tap to Start
            </motion.div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <PlayerSide
          player={1}
          onTap={() => handlePlayerTap(1)}
          disabled={gameState !== "playing"}
          className="border-b border-black h-1/2"
        >
          <div className="relative w-full h-full overflow-hidden">
            {faces.slice(0, faces.length / 2).map(face => (
              <div 
                key={`p1-${face.id}`}
                className="absolute text-2xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${face.x}%`, top: `${face.y}%` }}
              >
                🙂
              </div>
            ))}
            
            {sadPosition && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute text-2xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${sadPosition.x}%`, top: `${sadPosition.y}%` }}
              >
                ☹️
              </motion.div>
            )}
          </div>
        </PlayerSide>
        
        <PlayerSide
          player={2}
          onTap={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
          className="border-t border-black h-1/2"
        >
          <div className="relative w-full h-full overflow-hidden">
            {faces.slice(faces.length / 2).map(face => (
              <div 
                key={`p2-${face.id}`}
                className="absolute text-2xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${face.x}%`, top: `${face.y}%` }}
              >
                🙂
              </div>
            ))}
            
            {sadPosition && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute text-2xl transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${sadPosition.x}%`, top: `${sadPosition.y}%` }}
              >
                ☹️
              </motion.div>
            )}
          </div>
        </PlayerSide>
      </div>
      
      <AnimatePresence>
        {gameState === "complete" && (
          <GameResult
            winner={winner}
            message={winner ? "Found the sad face first!" : "Time's up! No one found the sad face."}
            onContinue={() => onGameComplete(winner, maxTime - timeRemaining)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindSad;
