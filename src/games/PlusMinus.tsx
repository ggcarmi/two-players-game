
import React, { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState } from "@/hooks/useGameState";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  
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

  // States for tracking symbols
  const [plusCount, setPlusCount] = useState(0);
  const [minusCount, setMinusCount] = useState(0);
  const [morePluses, setMorePluses] = useState(false);
  const [timeWhenMorePluses, setTimeWhenMorePluses] = useState(0);
  const [gridItems, setGridItems] = useState<Array<"plus" | "minus">>([]);

  // Initialize the game with all minus symbols
  const initGame = useCallback(() => {
    const gridSize = 10 * 6; // 10 columns x 6 rows
    const initialGrid = Array(gridSize).fill("minus" as const);
    
    setGridItems(initialGrid);
    setPlusCount(0);
    setMinusCount(gridSize);
    setMorePluses(false);
    
    console.log("Initialized PlusMinus game with", gridSize, "items");
    
    return () => {}; // Empty cleanup function
  }, []);

  // Start changing symbols from minus to plus
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const interval = setInterval(() => {
      setGridItems(prevItems => {
        // Find all minus positions
        const minusPositions = prevItems
          .map((item, index) => item === "minus" ? index : -1)
          .filter(pos => pos !== -1);
        
        if (minusPositions.length === 0) return prevItems;
        
        // Convert 1-3 minus symbols to plus per interval
        // Increase the rate to ensure we get to more pluses before time runs out
        const numToChange = Math.min(Math.floor(Math.random() * 4) + 2, minusPositions.length);
        const newItems = [...prevItems];
        
        for (let i = 0; i < numToChange; i++) {
          const randomIndex = Math.floor(Math.random() * minusPositions.length);
          const posToChange = minusPositions[randomIndex];
          newItems[posToChange] = "plus";
          
          // Remove this position from available positions
          minusPositions.splice(randomIndex, 1);
        }
        
        // Update counts
        const newPlusCount = newItems.filter(item => item === "plus").length;
        const newMinusCount = newItems.length - newPlusCount;
        
        setPlusCount(newPlusCount);
        setMinusCount(newMinusCount);
        
        // Check if there are now more pluses than minuses
        if (newPlusCount > newMinusCount && !morePluses) {
          console.log("Now more pluses than minuses:", newPlusCount, ">", newMinusCount);
          setMorePluses(true);
          setTimeWhenMorePluses(Date.now());
        }
        
        return newItems;
      });
    }, 400); // Slightly faster to ensure we get to win condition
    
    return () => clearInterval(interval);
  }, [gameState, morePluses]);

  // Add a guaranteed win condition if we're reaching time limit and no win condition yet
  useEffect(() => {
    if (gameState !== "playing" || morePluses) return;
    
    // If we're past 70% of the time limit and no win condition yet, force it
    const timeThreshold = maxTime * 0.7;
    
    if (timeRemaining < maxTime - timeThreshold) {
      const forceWinTimeout = setTimeout(() => {
        if (!morePluses && gameState === "playing") {
          console.log("Forcing win condition as time is running out");
          // Convert enough minuses to pluses to trigger win condition
          setGridItems(prevItems => {
            const newItems = [...prevItems];
            const totalItems = newItems.length;
            const targetPluses = Math.ceil(totalItems / 2) + 1; // More than half
            const currentPluses = newItems.filter(item => item === "plus").length;
            const neededPluses = targetPluses - currentPluses;
            
            if (neededPluses > 0) {
              const minusPositions = newItems
                .map((item, index) => item === "minus" ? index : -1)
                .filter(pos => pos !== -1);
                
              const numToChange = Math.min(neededPluses, minusPositions.length);
              
              for (let i = 0; i < numToChange; i++) {
                const randomIndex = Math.floor(Math.random() * minusPositions.length);
                const posToChange = minusPositions[randomIndex];
                newItems[posToChange] = "plus";
                minusPositions.splice(randomIndex, 1);
              }
              
              const newPlusCount = newItems.filter(item => item === "plus").length;
              const newMinusCount = totalItems - newPlusCount;
              
              setPlusCount(newPlusCount);
              setMinusCount(newMinusCount);
              
              if (newPlusCount > newMinusCount) {
                setMorePluses(true);
                setTimeWhenMorePluses(Date.now());
              }
            }
            
            return newItems;
          });
        }
      }, timeThreshold / 2);
      
      return () => clearTimeout(forceWinTimeout);
    }
  }, [gameState, timeRemaining, maxTime, morePluses]);

  // Handle player action (tap)
  const onPlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    if (morePluses) {
      // Player correctly identified more pluses
      console.log("Player", player, "correctly identified more pluses");
      const timeElapsed = Date.now() - timeWhenMorePluses;
      setWinner(player);
      setGameState("complete");
      
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      // Player tapped too early
      console.log("Player", player, "tapped too early, other player wins");
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, morePluses, timeWhenMorePluses, setWinner, setGameState, onGameComplete]);

  // Initialize the game when state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      const cleanup = initGame();
      return cleanup;
    }
  }, [gameState, initGame]);

  // Create grid display for visualization
  const renderGrid = () => {
    const rotationAngles = [0, 90, 180, 270];
    
    return (
      <div className="grid grid-rows-6 grid-cols-10 gap-0 w-full h-full p-0">
        {gridItems.map((type, index) => {
          // Pick one of four rotation states
          const rotationIndex = Math.floor(Math.random() * 4);
          const rotation = rotationAngles[rotationIndex];
          
          return (
            <div 
              key={index} 
              className="flex items-center justify-center p-0 m-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {type === "plus" ? (
                <span className="text-xl">➕</span>
              ) : (
                <span className="text-xl">➖</span>
              )}
            </div>
          );
        })}
      </div>
    );
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
        morePluses
          ? winner ? (t('plusMinusSuccess') || "Tapped first when there were more pluses!") : (t('plusMinusTimeout') || "Time's up! No one tapped in time.")
          : winner ? (t('plusMinusFail') || "The other player tapped too early!") : (t('timeUp') || "Time's up!")
      }
      onPlayerAction={onPlayerAction}
      startScreenTitle={t('plusMinus') || "Plus or Minus"}
      startScreenDescription={t('plusMinusDesc') || "Tap when there are more plus signs than minus signs!"}
      startScreenIcon="➕➖"
      onGameComplete={onGameComplete}
      winConditionMet={morePluses}
    >
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-blue-200 to-purple-200 p-0">
        {gameState === "playing" && (
          <>
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              ➕: {plusCount} | ➖: {minusCount}
            </div>
            {renderGrid()}
            <div className="absolute bottom-2 text-sm font-bold text-black bg-white/70 px-3 py-1 rounded-full">
              {morePluses ? (
                <span className="text-green-500">{t('tapNow') || "TAP NOW!"}</span>
              ) : (
                <span>{t('wait') || "WAIT..."}</span>
              )}
            </div>
          </>
        )}
      </div>
    </TwoPlayerGameLayout>
  );
};

export default PlusMinus;
