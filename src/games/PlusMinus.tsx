
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/game";
import GameHeader from "@/components/GameHeader";
import PlayerSide from "@/components/PlayerSide";
import GameResult from "@/components/GameResult";

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
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready");
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [symbols, setSymbols] = useState<Array<"plus" | "minus">>([]);
  const [morePluses, setMorePluses] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [timeWhenReady, setTimeWhenReady] = useState(0);

  // Initialize the game with all minus symbols
  const initGame = useCallback(() => {
    const initialSymbols = Array(30).fill("minus");
    setSymbols(initialSymbols);
    setMorePluses(false);
    
    // Set a random time when we'll start changing symbols to plus
    const startChangingTime = 2000 + Math.random() * 5000;
    setTimeout(() => {
      if (gameState === "playing") {
        startChangingSymbols();
      }
    }, startChangingTime);
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

  // Start the game
  const startGame = useCallback(() => {
    setGameState("playing");
    setTimeRemaining(maxTime);
    setWinner(null);
    initGame();
  }, [initGame, maxTime]);

  // Handle player tap
  const handlePlayerTap = useCallback((player: Player) => {
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
  }, [gameState, morePluses, onGameComplete, timeWhenReady]);

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
      setGameState("complete");
      setTimeout(() => {
        onGameComplete(null, maxTime);
      }, 2000);
    }
  }, [timeRemaining, gameState, onGameComplete, maxTime]);

  // New symbol components with cartoon styling
  const PlusSymbol = () => (
    <div className="w-10 h-10 flex items-center justify-center">
      <div className="relative">
        <div className="absolute w-8 h-2 bg-blue-500 rounded-full border-2 border-black"></div>
        <div className="absolute h-8 w-2 bg-blue-500 rounded-full border-2 border-black"></div>
      </div>
    </div>
  );

  const MinusSymbol = () => (
    <div className="w-10 h-10 flex items-center justify-center">
      <div className="w-8 h-2 bg-red-500 rounded-full border-2 border-black"></div>
    </div>
  );

  return (
    <div className="game-container bg-gradient-to-b from-[#6c4bb0] to-[#53399e]">
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
            <div className="text-5xl mb-4 flex justify-center">
              <div className="relative mr-6">
                <div className="absolute w-12 h-3 bg-blue-500 rounded-full border-2 border-black"></div>
                <div className="absolute h-12 w-3 bg-blue-500 rounded-full border-2 border-black"></div>
              </div>
              <div className="w-12 h-3 bg-red-500 rounded-full border-2 border-black mt-5"></div>
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase">Plus or Minus</h2>
            <p className="text-gray-700 mb-6 font-bold">
              Tap when there are more plus signs than minus signs on your side!
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
          <div className="relative w-full h-full overflow-hidden">
            <div className="grid grid-cols-5 gap-1 p-4 h-full">
              {symbols.slice(0, symbols.length / 2).map((symbol, index) => (
                <motion.div 
                  key={`p1-${index}`}
                  initial={symbol === "plus" ? { scale: 0 } : { scale: 1 }}
                  animate={{ scale: 1, rotate: symbol === "plus" ? [0, 15, -15, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-center"
                >
                  {symbol === "plus" ? <PlusSymbol /> : <MinusSymbol />}
                </motion.div>
              ))}
            </div>
          </div>
        </PlayerSide>
        
        <PlayerSide
          player={2}
          onTap={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
          className="border-l-4 border-black"
        >
          <div className="relative w-full h-full overflow-hidden">
            <div className="grid grid-cols-5 gap-1 p-4 h-full">
              {symbols.slice(symbols.length / 2).map((symbol, index) => (
                <motion.div 
                  key={`p2-${index}`}
                  initial={symbol === "plus" ? { scale: 0 } : { scale: 1 }}
                  animate={{ scale: 1, rotate: symbol === "plus" ? [0, 15, -15, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-center"
                >
                  {symbol === "plus" ? <PlusSymbol /> : <MinusSymbol />}
                </motion.div>
              ))}
            </div>
          </div>
        </PlayerSide>
      </div>
      
      <AnimatePresence>
        {gameState === "complete" && (
          <GameResult
            winner={winner}
            message={
              morePluses
                ? winner ? "Tapped first when there were more pluses!" : "Time's up! No one tapped in time."
                : winner ? "The other player tapped too early!" : "Time's up!"
            }
            onContinue={() => onGameComplete(winner, maxTime - timeRemaining)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlusMinus;
