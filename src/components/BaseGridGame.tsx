
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState } from "@/hooks/useGameState";
import { GridItem } from "./GridGameBoard";
import GridGameBoard from "./GridGameBoard";
import { useLanguage } from "@/context/LanguageContext";

interface ResultMessages {
  success: string;
  failure: string;
  timeout: string;
}

interface BaseGridGameProps {
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
  columns: number;
  rows: number;
  gap?: number;
  specialItemPosition?: number | null;
  renderRegularItem: () => React.ReactNode;
  renderSpecialItem: () => React.ReactNode;
  addSpecialItem: (availablePositions: number[]) => number | null;
  delayBeforeAddingSpecial?: number;
  delayMin?: number;
  delayMax?: number;
  startScreenTitle: string;
  startScreenDescription: string;
  startScreenIcon?: string;
  resultMessages: ResultMessages;
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  bgClassName?: string;
  defaultItemContent?: string;
  specialItemContent?: string;
}

const BaseGridGame: React.FC<BaseGridGameProps> = ({
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
  columns,
  rows,
  gap = 0,
  specialItemPosition,
  renderRegularItem,
  renderSpecialItem,
  addSpecialItem,
  delayBeforeAddingSpecial = 2000,
  delayMin,
  delayMax,
  startScreenTitle,
  startScreenDescription,
  startScreenIcon,
  resultMessages,
  onGameComplete,
  bgClassName = "bg-gradient-to-b from-blue-400 to-purple-500",
}) => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [specialItem, setSpecialItem] = useState<number | null>(null);
  const [timeWhenSpecialAppeared, setTimeWhenSpecialAppeared] = useState<number | null>(null);
  const [winConditionMet, setWinConditionMet] = useState(false);
  const { t } = useLanguage();
  const [resultMessage, setResultMessage] = useState<string>("");
  const [completeTimeElapsed, setCompleteTimeElapsed] = useState<number>(0);

  // Use the shared game state hook
  const {
    gameState,
    setGameState,
    timeRemaining,
    winner,
    setWinner,
    calculateTimeElapsed,
  } = useGameState({
    maxTime,
    onGameComplete: (winner, timeElapsed) => {
      // This is just a passthrough to make sure we complete properly
      console.log("Game completing with winner:", winner, "time:", timeElapsed);
      onGameComplete(winner, timeElapsed);
    },
  });

  // Initialize the game - create grid items
  const initGame = useCallback(() => {
    console.log("Initializing grid game with", rows, "rows and", columns, "columns");
    const totalItems = rows * columns;
    const newItems: GridItem[] = [];

    // Four possible rotation angles: 0, 90, 180, 270 degrees
    const rotationAngles = [0, 90, 180, 270];

    for (let i = 0; i < totalItems; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      
      // Pick one of four rotation states
      const rotationIndex = Math.floor(Math.random() * 4);
      const rotation = rotationAngles[rotationIndex];
      
      newItems.push({
        id: i,
        row,
        col,
        content: (
          <div style={{ transform: `rotate(${rotation}deg)` }}>
            {renderRegularItem()}
          </div>
        ),
        isSpecial: false,
      });
    }

    setItems(newItems);
    setSpecialItem(null);
    setTimeWhenSpecialAppeared(null);
    setResultMessage("");
    setWinConditionMet(false);
  }, [columns, rows, renderRegularItem]);

  // Add special item after delay - IMPROVED FOR GUARANTEED WIN CONDITION
  useEffect(() => {
    if (gameState !== "playing") return;

    // Ensure the special item appears within the game time window
    // Between 20% and 70% of the max time, to give players enough time to react
    const minDelay = Math.min(maxTime * 0.2, delayMin || maxTime * 0.2);
    const maxDelay = Math.min(maxTime * 0.7, delayMax || maxTime * 0.7);
    
    // Calculate a random delay within our safe window
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    
    console.log(`Setting up special item to appear after ${delay}ms (within ${minDelay}ms-${maxDelay}ms window)`);
    
    const timeout = setTimeout(() => {
      if (gameState === "playing") {
        const availablePositions = Array.from({ length: rows * columns }, (_, i) => i);
        const specialPosition = addSpecialItem(availablePositions);
        
        console.log("Adding special item at position:", specialPosition);
        
        if (specialPosition !== null) {
          setSpecialItem(specialPosition);
          setTimeWhenSpecialAppeared(Date.now());
          setWinConditionMet(true);
          
          // Update items with the special item
          setItems(prevItems => {
            return prevItems.map((item, index) => {
              if (index === specialPosition) {
                return {
                  ...item,
                  content: renderSpecialItem(),
                  isSpecial: true,
                  onClick: () => handleItemClick(index),
                };
              }
              return {
                ...item,
                onClick: () => handleItemClick(index),
              };
            });
          });
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [gameState, addSpecialItem, delayBeforeAddingSpecial, delayMin, delayMax, rows, columns, renderSpecialItem, maxTime]);

  // Handle item click
  const handleItemClick = useCallback((index: number) => {
    console.log("Item clicked:", index, "Special item:", specialItem);
    
    if (gameState !== "playing") return;

    // If clicked on the special item
    if (index === specialItem && specialItem !== null) {
      const timeElapsed = timeWhenSpecialAppeared ? Date.now() - timeWhenSpecialAppeared : 0;
      
      // Set winner based on which side of the screen was clicked
      // This will be handled by the TwoPlayerGameLayout based on which player tapped
      setGameState("complete");
      setResultMessage(resultMessages.success);
      setCompleteTimeElapsed(timeElapsed);
    } else {
      // Regular item clicked - counts as mistake
      setGameState("complete");
      setResultMessage(resultMessages.failure);
    }
  }, [gameState, specialItem, timeWhenSpecialAppeared, setGameState, resultMessages]);

  // Handle timeout - if time runs out and no winner
  useEffect(() => {
    if (timeRemaining <= 0 && gameState === "playing") {
      console.log("Time ran out, completing game with no winner");
      setGameState("complete");
      setResultMessage(resultMessages.timeout);
      setTimeout(() => {
        onGameComplete(null, maxTime);
      }, 2000);
    }
  }, [timeRemaining, gameState, resultMessages, onGameComplete, maxTime, setGameState]);

  // Handle player action (tap on player button)
  const onPlayerAction = useCallback((player: Player) => {
    console.log("Player action:", player, "Game state:", gameState, "Special item:", specialItem);
    
    if (gameState !== "playing") return;

    // If special item is visible, player action should count
    if (specialItem !== null) {
      console.log("Special item is visible, player", player, "wins");
      const timeElapsed = timeWhenSpecialAppeared ? Date.now() - timeWhenSpecialAppeared : 0;
      setWinner(player);
      setGameState("complete");
      setResultMessage(resultMessages.success);
      
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      // If tapped before special item appeared, it's a failure
      console.log("Special item not visible yet, player", player, "loses");
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      setResultMessage(resultMessages.failure);
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, specialItem, timeWhenSpecialAppeared, setWinner, setGameState, resultMessages, onGameComplete]);

  // Initialize game when state changes to playing
  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game state changed to playing, initializing game");
      initGame();
    } else if (gameState === "complete" && resultMessage === "" && timeRemaining <= 0) {
      // If time ran out and no result message, no one found the special item
      setResultMessage(resultMessages.timeout);
    }
  }, [gameState, initGame, resultMessage, timeRemaining, resultMessages]);

  // Rotate items every 1 second using the 4 fixed states
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const rotationAngles = [0, 90, 180, 270];
    
    const rotateInterval = setInterval(() => {
      setItems(prevItems => {
        return prevItems.map(item => {
          if (!item.isSpecial) {
            // Pick one of four rotation states
            const rotationIndex = Math.floor(Math.random() * 4);
            const rotation = rotationAngles[rotationIndex];
            
            return {
              ...item,
              content: (
                <div style={{ transform: `rotate(${rotation}deg)` }}>
                  {renderRegularItem()}
                </div>
              ),
            };
          }
          return item;
        });
      });
    }, 1000); // Rotate every 1 second
    
    return () => clearInterval(rotateInterval);
  }, [gameState, renderRegularItem]);

  console.log("Rendering BaseGridGame with game state:", gameState, "winner:", winner, "winConditionMet:", winConditionMet);

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
      resultMessage={resultMessage}
      onPlayerAction={onPlayerAction}
      startScreenTitle={startScreenTitle}
      startScreenDescription={startScreenDescription}
      startScreenIcon={startScreenIcon}
      onGameComplete={onGameComplete}
      winConditionMet={winConditionMet}
    >
      <div className={`w-full h-full p-0 flex items-center justify-center ${bgClassName}`}>
        <GridGameBoard 
          items={items} 
          columns={columns} 
          gap={0}  // Forced to 0
          animateSpecialItems={true}
        />
      </div>
    </TwoPlayerGameLayout>
  );
};

export default BaseGridGame;
