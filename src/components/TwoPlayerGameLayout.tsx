
import React, { useState, useEffect } from "react";
import GameHeader from "./GameHeader";
import PlayerSide from "./PlayerSide";
import GameResult from "./GameResult";
import { Player } from "@/types/game";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface TwoPlayerGameLayoutProps {
  gameState: "ready" | "playing" | "complete";
  setGameState: (state: "ready" | "playing" | "complete") => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  timeRemaining: number;
  maxTime: number;
  winner: Player | null;
  resultMessage: string;
  onPlayerAction: (player: Player) => void;
  startScreenTitle: string;
  startScreenDescription: string;
  startScreenIcon?: string;
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  children: React.ReactNode;
  winConditionMet?: boolean;
}

const TwoPlayerGameLayout: React.FC<TwoPlayerGameLayoutProps> = ({
  gameState,
  setGameState,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  timeRemaining,
  maxTime,
  winner,
  resultMessage,
  onPlayerAction,
  startScreenTitle,
  startScreenDescription,
  startScreenIcon,
  onGameComplete,
  children,
  winConditionMet = false,
}) => {
  const [keyPressed, setKeyPressed] = useState<string | null>(null);

  // Key press detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeyPressed(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Player action based on key press
  useEffect(() => {
    if (gameState === "playing" && keyPressed) {
      if (keyPressed === "q") {
        onPlayerAction(1);
        setKeyPressed(null);
      }
      if (keyPressed === "p") {
        onPlayerAction(2);
        setKeyPressed(null);
      }
    }
  }, [keyPressed, gameState, onPlayerAction]);

  return (
    <div className="game-container flex flex-col h-full">
      {/* Player 2 Side (Top) */}
      <PlayerSide
        player={2}
        active={gameState === "playing"}
        onClick={() => onPlayerAction(2)}
        disabled={gameState !== "playing"}
        className="bg-red-500 hover:bg-red-600 border-b-4 border-black z-10"
      />

      {/* Game Header with Scores */}
      <GameHeader
        player1Score={player1Score}
        player2Score={player2Score}
        currentGame={currentGame}
        totalGames={totalGames}
        timerValue={gameState === "playing" ? timeRemaining : undefined}
        maxTime={maxTime}
        winConditionMet={winConditionMet}
      />

      <div className="relative flex-1 w-full h-full bg-black overflow-hidden">
        {/* Start Screen */}
        {gameState === "ready" && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black bg-opacity-85 text-white p-4 text-center"
            onClick={() => setGameState("playing")}
          >
            {startScreenIcon && (
              <div className="text-7xl mb-6">{startScreenIcon}</div>
            )}
            <h1 className="text-4xl font-bold mb-4">{startScreenTitle}</h1>
            <p className="mb-8 max-w-md text-lg">{startScreenDescription}</p>
            <Button
              size="lg"
              className="animate-pulse"
              onClick={() => setGameState("playing")}
            >
              Tap to Start
            </Button>
          </div>
        )}

        {/* Game Content */}
        <div className="w-full h-full">{children}</div>

        {/* Result Screen */}
        {gameState === "complete" && (
          <GameResult
            winner={winner}
            message={resultMessage}
            onContinue={() => onGameComplete(winner, 0)}
          />
        )}
      </div>

      {/* Player 1 Side (Bottom) */}
      <PlayerSide
        player={1}
        active={gameState === "playing"}
        onClick={() => onPlayerAction(1)}
        disabled={gameState !== "playing"}
        className="bg-cyan-500 hover:bg-cyan-600 border-t-4 border-black z-10"
      />
    </div>
  );
};

export default TwoPlayerGameLayout;
