import React, { useState, useEffect, useCallback } from "react";
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

  // פונקציה להוספת הפרצוף העצוב אחרי זמן רנדומלי
  const addSadFace = useCallback((availablePositions: number[]) => {
    if (availablePositions.length === 0) return;
    
    // בחירת מיקום אקראי מתוך המיקומים הזמינים
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    setSadPosition(randomPosition);
    return Date.now(); // החזרת זמן ההופעה
  }, []);

  return (
    <BaseGridGame
      player1Score={player1Score}
      player2Score={player2Score}
      currentGame={currentGame}
      totalGames={totalGames}
      maxTime={maxTime}
      columns={6}
      rows={10}
      gap={0} // אין מרווח בין האלמנטים
      specialItemPosition={sadPosition}
      // תוכן אלמנטים רגילים - פרצוף שמח בגודל אחיד
      renderRegularItem={() => <span style={{ fontSize: '1em' }}>🙂</span>}
      // תוכן אלמנט מיוחד - פרצוף עצוב באותו גודל בדיוק
      renderSpecialItem={() => <span style={{ fontSize: '1em' }}>☹️</span>}
      addSpecialItem={(availablePositions) => {
        if (availablePositions.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        setSadPosition(availablePositions[randomIndex]);
        return availablePositions[randomIndex];
      }}
      delayBeforeAddingSpecial={2000} // המתנה של 2 שניות לפני הוספת הפרצוף העצוב
      startScreenTitle={t('findSad')}
      startScreenDescription={t('findSadDesc')}
      startScreenIcon="☹️"
      resultMessages={{
        success: t('foundSadFirst'),
        failure: t('tappedTooEarly'),
        timeout: t('noOneSad'),
      }}
      onGameComplete={onGameComplete}
    />
  );
};

export default FindSad;
