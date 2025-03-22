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
      resultMessages={{
        success: "Found the dog first!",
        failure: "Your opponent wins! You tapped too early!",
        timeout: "Time's up! No one found the dog."
      }}
      
      // Custom timing
      delayMin={1000}
      delayMax={5000}
      
      // Render regular item
      renderRegularItem={() => <span style={{ fontSize: '1em' }}>🐼</span>}
      
      addSpecialItem={(availablePositions) => {
        if (availablePositions.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        return availablePositions[randomIndex];
      }}
    />
  );
};

export default FindDog;
