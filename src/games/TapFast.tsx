import React, { useState } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState } from "@/hooks/useGameState";

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
  // Use the shared game state hook
  const {
    gameState,
    setGameState,
    timeRemaining,
    winner,
    setWinner
  } = useGameState({
    maxTime,
    onGameComplete
  });

  // State for tracking taps
  const [player1Taps, setPlayer1Taps] = useState(0);
  const [player2Taps, setPlayer2Taps] = useState(0);

  // Handle player taps
  const onPlayerAction = (player: Player) => {
    if (gameState !== "playing") return;

    if (player === 1) {
      setPlayer1Taps(prev => prev + 1);
    } else {
      setPlayer2Taps(prev => prev + 1);
    }
    
    // Check if time is up
    if (timeRemaining <= 0) {
      determineWinner();
    }
  };

  // Determine the winner based on tap count
  const determineWinner = () => {
    if (player1Taps > player2Taps) {
      setWinner(1);
    } else if (player2Taps > player1Taps) {
      setWinner(2);
    } else {
      setWinner(null); // It's a tie
    }
    
    setGameState("complete");
  };

  // Effect to determine winner when game ends
  React.useEffect(() => {
    if (timeRemaining <= 0 && gameState === "playing") {
      determineWinner();
    }
  }, [timeRemaining, gameState]);

  // Reset the tap counts when game starts
  React.useEffect(() => {
    if (gameState === "playing") {
      setPlayer1Taps(0);
      setPlayer2Taps(0);
    }
  }, [gameState]);

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
      resultMessage={winner 
        ? `${player1Taps} vs ${player2Taps} taps` 
        : `It's a tie! ${player1Taps} taps each`
      }
      onPlayerAction={onPlayerAction}
      startScreenTitle="Tap Fast"
      startScreenDescription="Tap as fast as you can for 5 seconds! The player with the most taps wins."
      startScreenIcon="👏"
      onGameComplete={onGameComplete}
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-row items-center justify-center gap-12 md:gap-16 p-6 md:p-8 bg-white/90 rounded-xl border-4 border-black">
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-500">PLAYER 1</div>
            <motion.div
              animate={gameState === "playing" ? { scale: [1, 0.95, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-cyan-500 my-2"
            >
              {player1Taps}
            </motion.div>
            <div className="text-sm text-muted-foreground">Taps</div>
          </div>
          
          <div className="text-3xl md:text-4xl font-bold">VS</div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">PLAYER 2</div>
            <motion.div
              animate={gameState === "playing" ? { scale: [1, 0.95, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-red-500 my-2"
            >
              {player2Taps}
            </motion.div>
            <div className="text-sm text-muted-foreground">Taps</div>
          </div>
        </div>
      </div>
    </TwoPlayerGameLayout>
  );
};

export default TapFast;
