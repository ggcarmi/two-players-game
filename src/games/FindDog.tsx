import React from "react";
import { Player } from "@/types/game";
import BaseGridGame from "@/components/BaseGridGame";

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
  return (
    <BaseGridGame
      onGameComplete={onGameComplete}
      player1Score={player1Score}
      player2Score={player2Score}
      currentGame={currentGame}
      totalGames={totalGames}
      maxTime={maxTime}
      
      // Grid configuration
      columns={10}
      rows={10}
      
      // Game content
      defaultItemContent="🐼"
      specialItemContent="🐶"
      
      // Game display
      startScreenTitle="Find the Dog"
      startScreenDescription="A dog will appear among the pandas. Be the first to tap it!"
      startScreenIcon="🐼🐶"
      resultMessageSuccess="Found the dog first!"
      resultMessageFailure="Your opponent wins! You tapped too early!"
      resultMessageTimeout="Time's up! No one found the dog."
      
      // Custom timing
      delayMin={1000}
      delayMax={5000}
    />
  );
};

export default FindDog;
