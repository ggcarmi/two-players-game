
import React, { useState } from "react";
import { Player } from "@/types/game";
import BaseGridGame from "@/components/BaseGridGame";
import { useLanguage } from "@/context/LanguageContext";

interface FindSadProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const FindSad: React.FC<FindSadProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
}) => {
  const [sadPosition, setSadPosition] = useState<number | null>(null);
  const { t } = useLanguage();

  // Function to add the sad face after random delay
  const addSadFace = (availablePositions: number[]) => {
    if (availablePositions.length === 0) return null;
    
    // Choose random position for the sad face
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    
    console.log("Adding sad face at position:", position);
    setSadPosition(position);
    
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
      rows={10}
      gap={0}
      
      // Game content
      specialItemPosition={sadPosition}
      renderRegularItem={() => <span style={{ fontSize: '1.5em' }}>🙂</span>}
      renderSpecialItem={() => <span style={{ fontSize: '1.5em' }}>☹️</span>}
      
      // Game display
      startScreenTitle={t('findSad')}
      startScreenDescription={t('findSadDesc')}
      startScreenIcon="☹️"
      resultMessages={{
        success: t('foundSadFirst'),
        failure: t('tappedTooEarly'),
        timeout: t('noOneSad'),
      }}
      
      // Custom timing
      delayMin={1000}
      delayMax={3000}
      
      // Add special item function
      addSpecialItem={addSadFace}
    />
  );
};

export default FindSad;
