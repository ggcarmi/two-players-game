import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState, SPECIAL_ITEM_TIMING } from "@/hooks/useGameState";
import { GridItem } from "./GridGameBoard";
import GridGameBoard from "./GridGameBoard";
import { useLanguage } from "@/context/LanguageContext";

// הגדרת משתנה גלובלי למצב פיתוח שניתן לשינוי
export const IS_DEVELOPMENT_MODE = true;

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
  addSpecialItem: (availablePositions: number[]) => number | void;
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
  rotationDuration?: number; // הוספת משתנה לשליטה במהירות הסיבוב
  winConditionName?: string; // תנאי ניצחון במשחק - לתצוגה במצב פיתוח
}

const BaseGridGame: React.FC<BaseGridGameProps> = ({
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
  columns,
  rows,
  gap = 0, // Default gap between grid items is 0
  specialItemPosition: propSpecialItemPosition,
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
  rotationDuration = 0.8, // ברירת מחדל לסיבוב (רבע מהמהירות המקורית)
  winConditionName,
}) => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [internalSpecialItemPosition, setInternalSpecialItemPosition] = useState<number | null>(null);
  const [timeWhenSpecialAppeared, setTimeWhenSpecialAppeared] = useState<number | null>(null);
  const { t } = useLanguage();
  
  // הוספת סטייט עבור שם הפריט המיוחד להצגה במצב פיתוח
  const [specialItemName, setSpecialItemName] = useState<string>("");
  
  // סטייט חדש למצב ניצחון
  const [isWinConditionMet, setIsWinConditionMet] = useState(false);

  // שימוש בפוזיציה שמועברת כפרופ אם היא קיימת, אחרת בפוזיציה הפנימית
  const specialItemPosition = propSpecialItemPosition !== undefined ? propSpecialItemPosition : internalSpecialItemPosition;

  // שימוש בהוק המשותף למצב המשחק
  const {
    gameState,
    setGameState,
    timeRemaining,
    winner,
    setWinner,
    registerForceCallback,
    emergencyForceSpecialItem,
  } = useGameState({
    maxTime,
    onGameComplete,
  });

  // קביעת שם הפריט המיוחד לפי סוג המשחק
  useEffect(() => {
    // זיהוי סוג המשחק לפי כותרת המשחק או אייקון
    if (startScreenTitle.includes("Dog") || startScreenIcon?.includes("🐶")) {
      setSpecialItemName("כלב");
    } else if (startScreenTitle.includes("Sad") || startScreenIcon?.includes("☹")) {
      setSpecialItemName("סמיילי עצוב");
    } else if (startScreenTitle.includes("Plus") || startScreenIcon?.includes("➕")) {
      setSpecialItemName("יותר פלוסים");
    } else {
      setSpecialItemName("פריט מיוחד");
    }
  }, [startScreenTitle, startScreenIcon]);

  // מונע אתחולים חוזרים של הגריד
  const initRef = useRef(false);

  // אתחול המשחק - יצירת הפריטים בגריד
  const initGame = useCallback(() => {
    // אם כבר אותחל, לא צריך לאתחל שוב
    if (initRef.current && items.length > 0) {
      console.log("[GRID] Skipping grid initialization - already initialized");
      return;
    }
    
    console.log("[GRID] Initializing grid game with dimensions:", columns, "x", rows);
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
    initRef.current = true;
    
    if (internalSpecialItemPosition === null && propSpecialItemPosition === undefined) {
      setInternalSpecialItemPosition(null);
      setTimeWhenSpecialAppeared(null);
    }
  }, [columns, rows, renderRegularItem, items.length, internalSpecialItemPosition, propSpecialItemPosition]);

  // מערכת ניטור מצב המשחק וטיימר להופעת הפריט המיוחד
  useEffect(() => {
    if (gameState !== "playing") {
      console.log("Game is not in playing state", { gameState });
      return;
    }

    // רישום פונקציית אילוץ להופעת הפריט המיוחד
    const forceSpecialItemAppearance = () => {
      if (specialItemPosition === null) {
        console.log("🚨 FORCING special item to appear NOW via global emergency system");
        const availablePositions = Array.from({ length: rows * columns }, (_, i) => i);
        const position = addSpecialItem(availablePositions);
        
        if (typeof position === 'number') {
          setInternalSpecialItemPosition(position);
          setTimeWhenSpecialAppeared(Date.now());
          console.log("Emergency system: Special item added at position", position);
        }
      }
    };
    
    // רישום הפונקציה במערכת הגלובלית
    registerForceCallback(forceSpecialItemAppearance);
    
    // אם הפוזיציה מגיעה כפרופ, נשתמש בה ישירות
    if (propSpecialItemPosition !== undefined) {
      console.log("Using provided special item position", { propSpecialItemPosition });
      setInternalSpecialItemPosition(propSpecialItemPosition);
      if (propSpecialItemPosition !== null) {
        setTimeWhenSpecialAppeared(Date.now());
      }
      return;
    }

    // טיימר בסיסי להופעת הפריט המיוחד
    const gameStartTime = Date.now();
    // Always make sure the special item appears between 20% and 80% of game time
    const minAppearanceTime = maxTime * 0.2; // מופיע לאחר 20% מהזמן לפחות
    const maxAppearanceTime = maxTime * 0.8; // מופיע עד 80% מהזמן
    const appearanceDelay = minAppearanceTime + Math.random() * (maxAppearanceTime - minAppearanceTime);
    
    // Override timing if custom delays are provided (but ensure they're within 20-80% range)
    const effectiveMinDelay = delayMin !== undefined ? Math.min(Math.max(delayMin, minAppearanceTime), maxAppearanceTime) : minAppearanceTime;
    const effectiveMaxDelay = delayMax !== undefined ? Math.min(Math.max(delayMax, minAppearanceTime), maxAppearanceTime) : maxAppearanceTime;
    const effectiveDelay = effectiveMinDelay + Math.random() * (effectiveMaxDelay - effectiveMinDelay);
    
    console.log("Scheduling special item appearance", {
      minAppearanceTime,
      maxAppearanceTime,
      effectiveMinDelay,
      effectiveMaxDelay,
      effectiveDelay,
      maxTime
    });

    // טיימר ראשי להופעת הפריט
    const mainTimer = setTimeout(() => {
      if (gameState === "playing" && specialItemPosition === null) {
        const availablePositions = Array.from({ length: rows * columns }, (_, i) => i);
        const position = addSpecialItem(availablePositions);

        if (typeof position === 'number') {
          setInternalSpecialItemPosition(position);
          setTimeWhenSpecialAppeared(Date.now());
          console.log("Special item added successfully", { position });
        }
      }
    }, effectiveDelay);

    // טיימר גיבוי במקרה שהפריט לא הופיע
    const backupTimer = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - gameStartTime;

      // אם עבר יותר מ-80% מהזמן והפריט עדיין לא הופיע, זהו טיימר גיבוי שמאלץ הופעת פריט
      if (elapsedTime > 0.8 * maxTime && specialItemPosition === null && gameState === "playing") {
        console.log("URGENT: Backup timer forcing special item to appear before game ends");
        const availablePositions = Array.from({ length: rows * columns }, (_, i) => i);
        const position = addSpecialItem(availablePositions);

        if (typeof position === 'number') {
          setInternalSpecialItemPosition(position);
          setTimeWhenSpecialAppeared(currentTime);
          console.log("Backup timer: Adding special item", { position });
        }
      }
    }, 500); // בדיקה כל חצי שנייה לוודא שהפריט אכן מופיע

    return () => {
      clearTimeout(mainTimer);
      clearInterval(backupTimer);
    };
  }, [gameState, maxTime, rows, columns, propSpecialItemPosition, specialItemPosition, addSpecialItem, delayMin, delayMax]);

  // עדכון מצב תנאי הניצחון כאשר הפריט המיוחד מופיע
  useEffect(() => {
    if (specialItemPosition === null) {
      setIsWinConditionMet(false);
      return;
    }
    
    // כאשר הפריט המיוחד מופיע, נעדכן את מצב הניצחון
    console.log("Special item appeared - updating win condition");
    setIsWinConditionMet(true);
    setTimeWhenSpecialAppeared(Date.now());
  }, [specialItemPosition]);

  // עדכון הפריטים כאשר הפריט המיוחד מופיע
  useEffect(() => {
    if (specialItemPosition === null) return;

    console.log("Starting grid update with special item:", { 
      specialItemPosition,
      gameState,
      timeWhenSpecialAppeared,
      gameType: startScreenTitle,
      currentTime: new Date().toISOString()
    });
    
    // במשחק פלוסים ומינוסים, נעדכן מספר רב של תאים לפלוסים
    const isPlusMinusGame = startScreenTitle.includes("Plus") || startScreenIcon?.includes("➕");
    console.log("Game type detection:", { isPlusMinusGame, startScreenTitle, startScreenIcon });
    
    setItems(prevItems => {
      return prevItems.map((item, index) => {
        // אם זה משחק פלוסים ומינוסים, נהפוך כ-60% מהתאים לפלוסים
        if (isPlusMinusGame) {
          const shouldBePlus = Math.random() < 0.6; // 60% סיכוי להיות פלוס
          return {
            ...item,
            content: shouldBePlus ? renderSpecialItem() : renderRegularItem(),
            isSpecial: shouldBePlus,
            onClick: () => handleItemClick(index),
          };
        }
        
        // עבור משחקים אחרים, רק התא המיוחד יקבל תוכן מיוחד
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
  }, [specialItemPosition, renderSpecialItem, renderRegularItem, startScreenTitle, startScreenIcon]);

  // עדכון מצב תנאי הניצחון כאשר הפריט המיוחד מופיע
  useEffect(() => {
    // כאשר הפריט המיוחד מופיע במשחק פעיל, תנאי הניצחון מתקיים
    if (gameState === "playing" && specialItemPosition !== null) {
      console.log("Win condition met: special item appeared at position", specialItemPosition);
      setIsWinConditionMet(true);
    } else {
      setIsWinConditionMet(false);
    }
  }, [gameState, specialItemPosition]);

  // טיפול בלחיצה על פריט
  const handleItemClick = useCallback((index: number) => {
    if (gameState !== "playing") {
      console.log("Item click ignored - game not in playing state", { gameState, index });
      return;
    }

    console.log("Processing item click:", { 
      clickedPosition: index,
      specialItemPosition,
      timeWhenSpecialAppeared,
      currentTime: new Date().toISOString(),
      gameState
    });

    // אם לחצו על הפריט המיוחד
    if (index === specialItemPosition && specialItemPosition !== null && isWinConditionMet) {
      const timeElapsed = Date.now() - timeWhenSpecialAppeared;
      console.log("Special item clicked - time elapsed:", timeElapsed);
      
      setGameState("complete");
      setWinner(1); // השחקן שלחץ ראשון מנצח
      setResultMessage(resultMessages.success);
      setCompleteTimeElapsed(timeElapsed);
      onGameComplete(1, timeElapsed);
    } else {
      // לחיצה על פריט רגיל או לפני שהפריט המיוחד הופיע נחשבת כטעות
      console.log("Invalid click - game over");
      setGameState("complete");
      setWinner(2); // השחקן השני מנצח
      setResultMessage(resultMessages.failure);
      onGameComplete(2, 0);
    }
  }, [gameState, specialItemPosition, timeWhenSpecialAppeared, setGameState, resultMessages]);

  // מעקב אחר הודעת תוצאה
  const [resultMessage, setResultMessage] = useState<string>("");
  const [completeTimeElapsed, setCompleteTimeElapsed] = useState<number>(0);

  // טיפול בלחיצת שחקן
  const onPlayerAction = useCallback((player: Player) => {
    console.log("Processing player action:", {
      player,
      gameState,
      specialItemPosition,
      timeWhenSpecialAppeared,
      currentTime: new Date().toISOString(),
      isWinConditionMet
    });

    if (gameState !== "playing") {
      console.log("Player action ignored - game not in playing state", { gameState, player });
      return;
    }

    // בדיקה חדשה - אם יש פריט מיוחד והתנאי מתקיים, נחשיב את זה כלחיצה על הפריט
    if (specialItemPosition !== null && isWinConditionMet) {
      console.log("Player clicked when special item is present and win condition is met - treating as item click");
      const timeElapsed = Date.now() - timeWhenSpecialAppeared;
      
      setGameState("complete");
      setWinner(player); // השחקן שלחץ ראשון מנצח
      setResultMessage(resultMessages.success);
      setCompleteTimeElapsed(timeElapsed);
      onGameComplete(player, timeElapsed);
      return;
    }

    // אם לחצו לפני שהופיע הפריט המיוחד או לפני שתנאי הניצחון התקיים, זו טעות
    const otherPlayer = player === 1 ? 2 : 1;
    console.log("Early or invalid player tap detected:", {
      tappingPlayer: player,
      winningPlayer: otherPlayer,
      gameState,
      specialItemStatus: specialItemPosition === null ? "not_appeared_yet" : "appeared_but_condition_not_met"
    });
    
    setWinner(otherPlayer);
    setGameState("complete");
    setResultMessage(resultMessages.failure);
  }, [gameState, specialItemPosition, timeWhenSpecialAppeared, setWinner, setGameState, resultMessages, isWinConditionMet]);

  // אתחול המשחק כאשר הוא מתחיל
  useEffect(() => {
    // נמנע מאתחולים חוזרים כשהמשחק כבר מאותחל
    if (gameState === "playing" && !initRef.current) {
      console.log("[GRID] Game state changed to playing - initializing game");
      initGame();
      // איפוס הרפרנס כשהמשחק מסתיים כדי לאפשר אתחול חדש בסיבוב הבא
    } else if (gameState === "ready") {
      initRef.current = false;
    } else if (gameState === "complete" && resultMessage === "" && timeRemaining <= 0) {
      // אם הזמן הסתיים ואין הודעת תוצאה, זה אומר שאף אחד לא מצא את הפריט המיוחד
      console.log("Game timeout - no one found the special item");
      setResultMessage(resultMessages.timeout);
    }
  }, [gameState, initGame, resultMessage, timeRemaining, resultMessages]);

  // סיום המשחק ושמירת התוצאה
  useEffect(() => {
    if (gameState === "complete" && winner !== null) {
      console.log("Game completion sequence started:", {
        winner,
        timeElapsed: completeTimeElapsed,
        specialItemPosition,
        timeWhenSpecialAppeared: timeWhenSpecialAppeared ? new Date(timeWhenSpecialAppeared).toISOString() : null,
        finalGameState: gameState,
        isWinConditionMet
      });

      const timeoutId = setTimeout(() => {
        console.log("Executing game completion:", {
          winner,
          timeElapsed: completeTimeElapsed,
          completionTime: new Date().toISOString()
        });
        onGameComplete(winner, completeTimeElapsed);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, winner, onGameComplete, completeTimeElapsed]);

  // פונקציה לדילוג על משחק במצב פיתוח
  const handleSkipGame = useCallback(() => {
    if (!IS_DEVELOPMENT_MODE) return;
    
    console.log("Developer skip button pressed - skipping game");
    setGameState("complete");
    setTimeout(() => {
      onGameComplete(null, 0);
    }, 500);
  }, [onGameComplete, setGameState]);

  // לכל משחק ספציפי אנחנו מגדירים את תנאי הניצחון
  const getWinConditionName = useCallback(() => {
    if (winConditionName) {
      return winConditionName;
    }
    
    // ברירת מחדל לפי סוג המשחק
    if (startScreenTitle.includes("Dog") || startScreenIcon?.includes("🐶")) {
      return t('dogAppeared');
    } else if (startScreenTitle.includes("Sad") || startScreenIcon?.includes("☹")) {
      return t('sadAppeared');
    } else if (startScreenTitle.includes("Plus") || startScreenIcon?.includes("➕")) {
      return t('plusesAppeared');
    }
    
    return t('specialItemAppeared');
  }, [winConditionName, startScreenTitle, startScreenIcon, t]);

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
      winConditionMet={isWinConditionMet}  // חשוב - ללא העברת הפרמטר הזה לא יעבוד!
      // העברת נתונים למצב פיתוח להדר
      headerProps={{
        isDevelopmentMode: IS_DEVELOPMENT_MODE,
        specialItemName,
        specialItemAppeared: specialItemPosition !== null,
        onSkipGame: handleSkipGame,
        winCondition: IS_DEVELOPMENT_MODE ? getWinConditionName() : undefined,
        isWinConditionMet
      }}
    >
      <div className={`w-full h-full p-0 m-0 flex items-stretch justify-center ${bgClassName} relative`}>
        <GridGameBoard 
          items={items} 
          columns={columns} 
          gap={0}
          className="w-full h-full p-0 m-0" 
          animateSpecialItems={true}
          rotationDuration={rotationDuration}
          isDevelopmentMode={IS_DEVELOPMENT_MODE}
        />
      </div>
    </TwoPlayerGameLayout>
  );
};

export default BaseGridGame;