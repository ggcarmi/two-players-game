
import React, { useState } from "react";
import { Player } from "@/types/game";
import BaseGridGame from "@/components/BaseGridGame";
import { useLanguage } from "@/context/LanguageContext";

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
  const [specialItemPosition, setSpecialItemPosition] = useState<number | null>(null);
  const { t } = useLanguage();
  
  // Function to add special item (dog) after random delay
  const addSpecialItem = (availablePositions: number[]) => {
    if (availablePositions.length === 0) return null;
    
    // Choose random position for the dog
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    
    console.log("Adding dog at position:", position);
    setSpecialItemPosition(position);
    
    return position;
  };

  return (
    <BaseGridGame
      onGameComplete={onGameComplete}
      player1Score={player1Score}
      player2Score={player2Score}
      currentGame={currentGame}
      totalGames={totalGames}
      maxTime={maxTime}
      
      // Grid configuration
      columns={6}
      rows={6}
      
      // Game content
      specialItemPosition={specialItemPosition}
      renderRegularItem={() => <span style={{ fontSize: '1.5em' }}>🐼</span>}
      renderSpecialItem={() => <span style={{ fontSize: '1.5em' }}>🐶</span>}
      
      // Game display
      startScreenTitle={t('findDog') || "Find the Dog"}
      startScreenDescription={t('findDogDesc') || "A dog will appear among the pandas. Be the first to tap it!"}
      startScreenIcon="🐼🐶"
      resultMessages={{
        success: t('foundDogFirst') || "Found the dog first!",
        failure: t('tappedTooEarly') || "Your opponent wins! You tapped too early!",
        timeout: t('noOneDog') || "Time's up! No one found the dog."
      }}
      
      // Custom timing
      delayMin={1000}
      delayMax={5000}
      
      // Add special item function
      addSpecialItem={addSpecialItem}
    />
  );
};

export default FindDog;
