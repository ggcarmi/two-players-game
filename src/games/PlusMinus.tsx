import React, { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/game";
import { useLanguage } from "@/context/LanguageContext";
import BaseGridGame from "@/components/BaseGridGame";
import { IS_DEVELOPMENT_MODE } from "@/components/BaseGridGame";

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
  
  // סטייט לעקוב אחרי מצב הפלוסים והמינוסים
  const [morePluses, setMorePluses] = useState(false);
  
  // סטייט לעקוב אחרי מיקום מיוחד (דמה במשחק הזה)
  const [specialItemPosition, setSpecialItemPosition] = useState<number | null>(null);

  // מספר השורות והטורים בגריד
  const rows = 15;
  const columns = 10;
  const totalCells = rows * columns;

  // פונקציה ליצירת תוכן רנדומלי של פלוסים ומינוסים
  const generateRandomItems = useCallback(() => {
    if (IS_DEVELOPMENT_MODE) {
      console.log("Generating random plus/minus items");
    }
    
    // הגדרה האם יהיו יותר פלוסים או יותר מינוסים
    const shouldHaveMorePluses = Math.random() > 0.5;
    
    if (IS_DEVELOPMENT_MODE) {
      console.log(`This round will have ${shouldHaveMorePluses ? 'more pluses' : 'more minuses'}`);
    }
    
    setMorePluses(shouldHaveMorePluses);
    
    // אם יש יותר פלוסים, זה מצב הניצחון - נעדכן את הסטייט
    if (shouldHaveMorePluses) {
      setSpecialItemPosition(0); // שימוש בפוזיציה 0 להפעלת אינדיקציה
    } else {
      setSpecialItemPosition(null);
    }
    
    return shouldHaveMorePluses;
  }, []);

  // אפקט לאתחול משחק חדש ויצירת אייטמים רנדומליים
  useEffect(() => {
    const interval = setInterval(() => {
      generateRandomItems();
    }, 3000); // החלפה כל 3 שניות
    
    return () => clearInterval(interval);
  }, [generateRandomItems]);

  // רנדור פריט רגיל - מינוס
  const renderMinus = useCallback(() => {
    return <span style={{ fontSize: '1em' }}>➖</span>;
  }, []);

  // רנדור פריט מיוחד - פלוס
  const renderPlus = useCallback(() => {
    return <span style={{ fontSize: '1em' }}>➕</span>;
  }, []);

  // הוספת "פריט מיוחד" - מחזיר מיקום אקראי לפריט מיוחד
  const addSpecialItem = useCallback((availablePositions: number[]) => {
    if (availablePositions.length === 0) return null;
    
    // בוחר מיקום אקראי מתוך המיקומים הזמינים
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    
    console.log("Adding special item (plus) at position:", position);
    return position; // מחזיר מיקום תקף לפריט המיוחד
  }, []);

  return (
    <BaseGridGame
      player1Score={player1Score}
      player2Score={player2Score}
      currentGame={currentGame}
      totalGames={totalGames}
      maxTime={maxTime}
      columns={columns}
      rows={rows}
      gap={0}
      specialItemPosition={specialItemPosition}
      renderRegularItem={renderMinus}
      renderSpecialItem={renderPlus}
      addSpecialItem={addSpecialItem}
      startScreenTitle={t('plusMinus')}
      startScreenDescription={t('plusMinusDesc')}
      startScreenIcon="➕➖"
      resultMessages={{
        success: t('plusMinusSuccess'),
        failure: t('plusMinusFail'),
        timeout: t('plusMinusTimeout')
      }}
      onGameComplete={onGameComplete}
      rotationDuration={0.8}
      winConditionName={t('plusesAppeared')}
    />
  );
};

export default PlusMinus;
