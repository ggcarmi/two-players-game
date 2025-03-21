import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState } from "@/hooks/useGameState";

interface PlusMinusProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const PlusMinus: React.FC<PlusMinusProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 15000,
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

  // State for tracking symbols
  const [symbols, setSymbols] = useState<Array<"plus" | "minus">>([]);
  const [morePluses, setMorePluses] = useState(false);
  const [timeWhenReady, setTimeWhenReady] = useState(0);

  // Initialize the game with all minus symbols
  const initGame = useCallback(() => {
    const initialSymbols = Array(150).fill("minus"); // 150 symbols for a 10x15 grid
    setSymbols(initialSymbols);
    setMorePluses(false);
    
    // Start changing symbols after a short delay
    const startChangingTime = 2000 + Math.random() * 3000;
    const timeoutId = setTimeout(() => {
      if (gameState === "playing") {
        startChangingSymbols();
      }
    }, startChangingTime);
    
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  // Start changing symbols from minus to plus
  const startChangingSymbols = useCallback(() => {
    const interval = setInterval(() => {
      if (gameState !== "playing") {
        clearInterval(interval);
        return;
      }
      
      setSymbols(prev => {
        const newSymbols = [...prev];
        const randomIndex = Math.floor(Math.random() * newSymbols.length);
        
        // Only change if it's still a minus
        if (newSymbols[randomIndex] === "minus") {
          newSymbols[randomIndex] = "plus";
        }
        
        // Check if there are more pluses than minuses
        const plusCount = newSymbols.filter(s => s === "plus").length;
        const minusCount = newSymbols.filter(s => s === "minus").length;
        
        if (plusCount > minusCount && !morePluses) {
          setMorePluses(true);
          setTimeWhenReady(Date.now());
        }
        
        return newSymbols;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [gameState, morePluses]);

  // Handle player tap
  const onPlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    // If there are more pluses, the tap is valid
    if (morePluses) {
      const timeElapsed = Date.now() - timeWhenReady;
      setWinner(player);
      setGameState("complete");
      
      // Small delay before completing the game
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      // If tapped too early (before there are more pluses), the other player wins
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, morePluses, onGameComplete, timeWhenReady, setWinner, setGameState]);

  // Initialize the game when the game state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      const cleanup = initGame();
      return cleanup;
    }
  }, [gameState, initGame]);

  // Symbol components using emojis
  const PlusSymbol = () => (
    <div className="w-8 h-8 flex items-center justify-center">
      <span className="text-2xl">➕</span>
    </div>
  );
  
  const MinusSymbol = () => (
    <div className="w-8 h-8 flex items-center justify-center">
      <span className="text-2xl">➖</span>
    </div>
  );

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
        morePluses
          ? winner ? "Tapped first when there were more pluses!" : "Time's up! No one tapped in time."
          : winner ? "The other player tapped too early!" : "Time's up!"
      }
      onPlayerAction={onPlayerAction}
      startScreenTitle="Plus or Minus"
      startScreenDescription="Tap when there are more plus signs than minus signs on your side!"
      startScreenIcon="➕➖"
      onGameComplete={onGameComplete}
    >
      <div className="relative w-full h-full overflow-hidden p-2 bg-gradient-to-b from-purple-300 to-purple-400">
        <div className="grid grid-cols-10 gap-1 w-full">
          {symbols.map((symbol, index) => (
            <motion.div 
              key={`symbol-${index}`}
              initial={symbol === "plus" ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1, rotate: symbol === "plus" ? [0, 15, -15, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="aspect-square flex items-center justify-center"
            >
              {symbol === "plus" ? <PlusSymbol /> : <MinusSymbol />}
            </motion.div>
          ))}
        </div>
      </div>
    </TwoPlayerGameLayout>
  );
};

export default PlusMinus;
