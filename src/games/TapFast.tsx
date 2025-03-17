
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import GameHeader from "@/components/GameHeader";
import PlayerSide from "@/components/PlayerSide";
import GameResult from "@/components/GameResult";

interface TapFastProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const TapFast: React.FC<TapFastProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 5000,
}) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [player1Taps, setPlayer1Taps] = useState(0);
  const [player2Taps, setPlayer2Taps] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);

  // Start the game
  const startGame = () => {
    setGameState("playing");
    setTimeRemaining(maxTime);
    setPlayer1Taps(0);
    setPlayer2Taps(0);
    setWinner(null);
  };

  // Handle player taps
  const handlePlayerTap = (player: Player) => {
    if (gameState !== "playing") return;
    
    if (player === 1) {
      setPlayer1Taps(prev => prev + 1);
    } else {
      setPlayer2Taps(prev => prev + 1);
    }
  };

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setGameState("complete");
          
          // Determine winner
          let gameWinner: Player | null = null;
          if (player1Taps > player2Taps) {
            gameWinner = 1;
          } else if (player2Taps > player1Taps) {
            gameWinner = 2;
          } else {
            gameWinner = null; // It's a tie
          }
          
          setWinner(gameWinner);
          
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState, player1Taps, player2Taps]);

  // Handle game completion
  useEffect(() => {
    if (gameState === "complete") {
      setTimeout(() => {
        onGameComplete(winner, maxTime);
      }, 2000);
    }
  }, [gameState, winner, onGameComplete, maxTime]);

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
            <div className="text-4xl mb-4">👏</div>
            <h2 className="text-xl font-bold mb-2">Tap Fast</h2>
            <p className="text-muted-foreground mb-6">
              Tap as fast as you can for 5 seconds! The player with the most taps wins.
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
      
      <div className="flex flex-row h-full">
        <PlayerSide
          player={1}
          onTap={() => handlePlayerTap(1)}
          disabled={gameState !== "playing"}
          className="border-r border-white/10"
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <motion.div
              animate={gameState === "playing" ? { scale: [1, 0.95, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="text-8xl font-bold text-player1"
            >
              {player1Taps}
            </motion.div>
            <div className="mt-4 text-muted-foreground">Taps</div>
            {gameState === "playing" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-8 text-lg text-player1"
              >
                TAP! TAP! TAP!
              </motion.div>
            )}
          </div>
        </PlayerSide>
        
        <PlayerSide
          player={2}
          onTap={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
          className="border-l border-white/10"
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <motion.div
              animate={gameState === "playing" ? { scale: [1, 0.95, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="text-8xl font-bold text-player2"
            >
              {player2Taps}
            </motion.div>
            <div className="mt-4 text-muted-foreground">Taps</div>
            {gameState === "playing" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-8 text-lg text-player2"
              >
                TAP! TAP! TAP!
              </motion.div>
            )}
          </div>
        </PlayerSide>
      </div>
      
      <AnimatePresence>
        {gameState === "complete" && (
          <GameResult
            winner={winner}
            message={winner ? `${player1Taps} vs ${player2Taps} taps` : `It's a tie! ${player1Taps} taps each`}
            onContinue={() => onGameComplete(winner, maxTime)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TapFast;
