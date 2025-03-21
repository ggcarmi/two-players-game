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
  specialItemPosition: number | null;
  renderRegularItem: () => React.ReactNode;
  renderSpecialItem: () => React.ReactNode;
  addSpecialItem: (availablePositions: number[]) => number | void;
  delayBeforeAddingSpecial?: number;
  startScreenTitle: string;
  startScreenDescription: string;
  startScreenIcon?: string;
  resultMessages: ResultMessages;
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  bgClassName?: string;
}

const BaseGridGame: React.FC<BaseGridGameProps> = ({
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
  columns,
  rows,
  gap = 0, // ברירת מחדל ללא מרווח בין האלמנטים
  specialItemPosition,
  renderRegularItem,
  renderSpecialItem,
  addSpecialItem,
  delayBeforeAddingSpecial = 2000,
  startScreenTitle,
  startScreenDescription,
  startScreenIcon,
  resultMessages,
  onGameComplete,
  bgClassName = "bg-gradient-to-b from-blue-400 to-purple-500",
}) => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [timeWhenSpecialAppeared, setTimeWhenSpecialAppeared] = useState<number | null>(null);
  const { t } = useLanguage();

  // שימוש בהוק המשותף למצב המשחק
  const {
    gameState,
    setGameState,
    timeRemaining,
    winner,
    setWinner,
  } = useGameState({
    maxTime,
    onGameComplete,
  });

  // אתחול המשחק - יצירת הפריטים בגריד
  const initGame = useCallback(() => {
    const totalItems = rows * columns;
    const newItems: GridItem[] = [];

    for (let i = 0; i < totalItems; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      
      newItems.push({
        id: i,
        row,
        col,
        content: renderRegularItem(),
        isSpecial: false,
      });
    }

    setItems(newItems);
    setTimeWhenSpecialAppeared(null);
  }, [columns, rows, renderRegularItem]);

  // הוספת פריט מיוחד לאחר השהייה
  useEffect(() => {
    if (gameState !== "playing") return;

    const timeout = setTimeout(() => {
      if (gameState === "playing") {
        const availablePositions = Array.from({ length: rows * columns }, (_, i) => i);
        const timeAppeared = addSpecialItem(availablePositions);
        
        if (timeAppeared) {
          setTimeWhenSpecialAppeared(timeAppeared);
        }
      }
    }, delayBeforeAddingSpecial);

    return () => clearTimeout(timeout);
  }, [gameState, addSpecialItem, delayBeforeAddingSpecial, rows, columns]);

  // עדכון הפריטים כאשר הפריט המיוחד מופיע
  useEffect(() => {
    if (specialItemPosition === null) return;

    setItems(prevItems => {
      return prevItems.map((item, index) => {
        if (index === specialItemPosition) {
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
  }, [specialItemPosition, renderSpecialItem]);

  // טיפול בלחיצה על פריט
  const handleItemClick = useCallback((index: number) => {
    if (gameState !== "playing") return;

    // אם לחצו על הפריט המיוחד
    if (index === specialItemPosition && specialItemPosition !== null) {
      const timeElapsed = timeWhenSpecialAppeared ? Date.now() - timeWhenSpecialAppeared : 0;
      setGameState("complete");
      // הפריט שנלחץ הוא האייטם המיוחד - מעבירים למצב הודעת ניצחון
      setResultMessage(resultMessages.success);
      // שומרים את הזמן לחישוב התוצאה הסופית
      setCompleteTimeElapsed(timeElapsed);
    } else {
      // לחיצה על פריט רגיל נחשבת כטעות
      setGameState("complete");
      setResultMessage(resultMessages.failure);
    }
  }, [gameState, specialItemPosition, timeWhenSpecialAppeared, setGameState, resultMessages]);

  // מעקב אחר הודעת תוצאה
  const [resultMessage, setResultMessage] = useState<string>("");
  const [completeTimeElapsed, setCompleteTimeElapsed] = useState<number>(0);

  // טיפול בלחיצת שחקן
  const onPlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;

    // אם יש פריט מיוחד, הלחיצה צריכה להיות עליו ולא על הכפתור
    if (specialItemPosition !== null) return;

    // אם לחצו לפני שהופיע הפריט המיוחד, זו טעות
    const otherPlayer = player === 1 ? 2 : 1;
    setWinner(otherPlayer);
    setGameState("complete");
    setResultMessage(resultMessages.failure);
  }, [gameState, specialItemPosition, setWinner, setGameState, resultMessages]);

  // אתחול המשחק כאשר הוא מתחיל
  useEffect(() => {
    if (gameState === "playing") {
      initGame();
    } else if (gameState === "complete" && resultMessage === "" && timeRemaining <= 0) {
      // אם הזמן הסתיים ואין הודעת תוצאה, זה אומר שאף אחד לא מצא את הפריט המיוחד
      setResultMessage(resultMessages.timeout);
    }
  }, [gameState, initGame, resultMessage, timeRemaining, resultMessages]);

  // סיום המשחק ושמירת התוצאה
  useEffect(() => {
    if (gameState === "complete" && winner !== null) {
      const timeoutId = setTimeout(() => {
        onGameComplete(winner, completeTimeElapsed);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, winner, onGameComplete, completeTimeElapsed]);

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
    >
      <div className={`w-full h-full p-0 flex items-center justify-center ${bgClassName}`}>
        <GridGameBoard 
          items={items} 
          columns={columns} 
          gap={gap}
          animateSpecialItems={true}
        />
      </div>
    </TwoPlayerGameLayout>
  );
};

export default BaseGridGame;