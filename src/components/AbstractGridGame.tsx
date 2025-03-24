import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState, GameStateReturn } from "@/hooks/useGameState";
import { GridItem } from "./GridGameBoard";
import GridGameBoard from "./GridGameBoard";
import { useLanguage } from "@/context/LanguageContext";

// הגדרת משתנה גלובלי למצב פיתוח שניתן לשינוי
export const IS_DEVELOPMENT_MODE = true;

export interface ResultMessages {
  success: string;
  failure: string;
  timeout: string;
}

export interface WinCondition {
  check: () => boolean;
  name: string;
}

export interface AbstractGridGameProps {
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
  columns: number;
  rows: number;
  gap?: number;
  startScreenTitle: string;
  startScreenDescription: string;
  startScreenIcon?: string;
  resultMessages: ResultMessages;
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  bgClassName?: string;
  rotationDuration?: number;
  gameState?: GameStateReturn; // הוספת אפשרות להעביר את מצב המשחק מבחוץ
  t?: (key: string) => string; // הוספת אפשרות להעביר פונקציית תרגום מבחוץ
}

/**
 * AbstractGridGame - מחלקת בסיס מופשטת למשחקי גריד
 * מספקת את התשתית הבסיסית למשחקי גריד, כאשר משחקים ספציפיים יורשים ממנה
 * ומממשים את הלוגיקה הייחודית שלהם
 */
abstract class AbstractGridGame<P extends AbstractGridGameProps> extends React.Component<P> {
  // מצבים משותפים לכל משחקי הגריד
  state = {
    items: [] as GridItem[],
    specialItemPosition: null as number | null,
    timeWhenSpecialAppeared: null as number | null,
    specialItemName: "",
    isWinConditionMet: false,
    resultMessage: "",
    completeTimeElapsed: 0,
  };

  // הוק משחק משותף - יועבר מבחוץ
  gameState: GameStateReturn;
  t: (key: string) => string;
  
  constructor(props: P) {
    super(props);
    // אתחול הוק משחק משותף והתרגום מהפרופס
    this.gameState = props.gameState as GameStateReturn;
    this.t = props.t || ((key: string) => key);
  }

  // מתודות מופשטות שכל משחק ספציפי חייב לממש
  abstract renderRegularItem(): React.ReactNode;
  abstract renderSpecialItem(): React.ReactNode;
  abstract addSpecialItem(availablePositions: number[]): number | void;
  abstract getWinCondition(): WinCondition;

  // מתודות עם מימוש ברירת מחדל שניתן לדריסה
  getDelayBeforeAddingSpecial(): number {
    return 2000;
  }

  getDelayRange(): { min: number; max: number } | null {
    return null;
  }

  // אתחול המשחק - יצירת הפריטים בגריד
  initGame = () => {
    console.log("Initializing grid game with dimensions:", this.props.columns, "x", this.props.rows);
    const totalItems = this.props.rows * this.props.columns;
    const newItems: GridItem[] = [];

    for (let i = 0; i < totalItems; i++) {
      const row = Math.floor(i / this.props.columns);
      const col = i % this.props.columns;
      
      newItems.push({
        id: i,
        row,
        col,
        content: this.renderRegularItem(),
        isSpecial: false,
      });
    }

    this.setState({
      items: newItems,
      specialItemPosition: null,
      timeWhenSpecialAppeared: null,
    });
  };

  // הוספת פריט מיוחד לאחר השהייה
  addSpecialItemWithDelay = () => {
    if (this.gameState.gameState !== "playing") return;

    // חישוב זמן ההשהיה - אם יש טווח מוגדר, השתמש בו
    const delayRange = this.getDelayRange();
    const delay = delayRange
      ? delayRange.min + Math.random() * (delayRange.max - delayRange.min)
      : this.getDelayBeforeAddingSpecial();

    console.log(`Adding special item after ${delay}ms delay`);
    
    const timeout = setTimeout(() => {
      if (this.gameState.gameState === "playing") {
        try {
          const availablePositions = Array.from(
            { length: this.props.rows * this.props.columns },
            (_, i) => i
          );
          const position = this.addSpecialItem(availablePositions);
          
          console.log("Special item position returned:", position);
          
          if (typeof position === 'number') {
            this.setState({
              specialItemPosition: position,
              timeWhenSpecialAppeared: Date.now(),
            });
            console.log("Special item added at position:", position);
          } else {
            console.warn("addSpecialItem did not return a valid position");
          }
        } catch (error) {
          console.error("Error adding special item:", error);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  };

  // עדכון הפריטים כאשר הפריט המיוחד מופיע
  updateItemsWithSpecial = () => {
    const { specialItemPosition } = this.state;
    if (specialItemPosition === null) return;

    console.log("Updating grid with special item at position:", specialItemPosition);
    
    this.setState(prevState => ({
      items: prevState.items.map((item, index) => {
        // עבור משחקים אחרים, רק התא המיוחד יקבל תוכן מיוחד
        if (index === specialItemPosition) {
          return {
            ...item,
            content: this.renderSpecialItem(),
            isSpecial: true,
            onClick: () => this.handleItemClick(index),
          };
        }
        return {
          ...item,
          onClick: () => this.handleItemClick(index),
        };
      }),
      isWinConditionMet: this.getWinCondition().check(),
    }));
  };

  // טיפול בלחיצה על פריט
  handleItemClick = (index: number) => {
    if (this.gameState.gameState !== "playing") return;

    const { specialItemPosition, timeWhenSpecialAppeared } = this.state;
    console.log("Item clicked at position:", index, "Special item position:", specialItemPosition);

    // אם לחצו על הפריט המיוחד
    if (index === specialItemPosition && specialItemPosition !== null) {
      const timeElapsed = timeWhenSpecialAppeared ? Date.now() - timeWhenSpecialAppeared : 0;
      console.log(`Special item found! Time elapsed: ${timeElapsed}ms`);
      this.gameState.setGameState("complete");
      // הפריט שנלחץ הוא האייטם המיוחד - מעבירים למצב הודעת ניצחון
      this.setState({
        resultMessage: this.props.resultMessages.success,
        completeTimeElapsed: timeElapsed,
      });
    } else {
      // לחיצה על פריט רגיל נחשבת כטעות
      console.log("Regular item clicked - failure");
      this.gameState.setGameState("complete");
      this.setState({
        resultMessage: this.props.resultMessages.failure,
      });
    }
  };

  // טיפול בלחיצת שחקן
  onPlayerAction = (player: Player) => {
    if (this.gameState.gameState !== "playing") return;

    const { specialItemPosition } = this.state;
    console.log(`Player ${player} tapped, special item position:`, specialItemPosition);

    // אם יש פריט מיוחד, הלחיצה צריכה להיות עליו ולא על הכפתור
    if (specialItemPosition !== null) return;

    // אם לחצו לפני שהופיע הפריט המיוחד, זו טעות
    const otherPlayer = player === 1 ? 2 : 1;
    console.log(`Player ${player} tapped too early, ${otherPlayer} wins`);
    this.gameState.setWinner(otherPlayer);
    this.gameState.setGameState("complete");
    this.setState({
      resultMessage: this.props.resultMessages.failure,
    });
  };

  // פונקציה לדילוג על משחק במצב פיתוח
  handleSkipGame = () => {
    if (!IS_DEVELOPMENT_MODE) return;
    
    console.log("Developer skip button pressed - skipping game");
    this.gameState.setGameState("complete");
    setTimeout(() => {
      this.props.onGameComplete(null, 0);
    }, 500);
  };

  // מחזור חיים - אתחול
  componentDidMount() {
    // קביעת שם הפריט המיוחד לפי סוג המשחק
    const { startScreenTitle, startScreenIcon } = this.props;
    let specialItemName = "פריט מיוחד";
    
    if (startScreenTitle.includes("Dog") || startScreenIcon?.includes("🐶")) {
      specialItemName = "כלב";
    } else if (startScreenTitle.includes("Sad") || startScreenIcon?.includes("☹")) {
      specialItemName = "סמיילי עצוב";
    } else if (startScreenTitle.includes("Plus") || startScreenIcon?.includes("➕")) {
      specialItemName = "יותר פלוסים";
    }
    
    this.setState({ specialItemName });
  }

  // מחזור חיים - עדכון
  componentDidUpdate(prevProps: P, prevState: any) {
    const { gameState } = this.gameState;
    const { specialItemPosition, resultMessage } = this.state;
    const { timeRemaining } = this.gameState;
    
    // אתחול המשחק כאשר הוא מתחיל
    if (gameState === "playing" && prevProps !== this.props) {
      this.initGame();
      this.addSpecialItemWithDelay();
    }
    
    // עדכון הפריטים כאשר הפריט המיוחד מופיע
    if (specialItemPosition !== prevState.specialItemPosition) {
      this.updateItemsWithSpecial();
    }
    
    // אם הזמן הסתיים ואין הודעת תוצאה, זה אומר שאף אחד לא מצא את הפריט המיוחד
    if (gameState === "complete" && resultMessage === "" && timeRemaining <= 0) {
      this.setState({
        resultMessage: this.props.resultMessages.timeout,
      });
    }
    
    // סיום המשחק ושמירת התוצאה
    if (gameState === "complete" && this.gameState.winner !== null && prevState.gameState !== "complete") {
      const timeoutId = setTimeout(() => {
        console.log(`Game completed, winner: Player ${this.gameState.winner}, time elapsed: ${this.state.completeTimeElapsed}ms`);
        this.props.onGameComplete(this.gameState.winner, this.state.completeTimeElapsed);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }

  // רנדור
  render() {
    const { 
      player1Score, player2Score, currentGame, totalGames, maxTime = 10000,
      columns, rows, gap = 0, startScreenTitle, startScreenDescription, startScreenIcon,
      bgClassName = "bg-gradient-to-b from-blue-400 to-purple-500", rotationDuration = 0.8
    } = this.props;
    
    const { 
      items, specialItemPosition, specialItemName, isWinConditionMet, resultMessage 
    } = this.state;
    
    const { gameState, timeRemaining, winner, setGameState } = this.gameState;
    
    const winCondition = this.getWinCondition();
    
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
        onPlayerAction={this.onPlayerAction}
        startScreenTitle={startScreenTitle}
        startScreenDescription={startScreenDescription}
        startScreenIcon={startScreenIcon}
        onGameComplete={this.props.onGameComplete}
        // העברת נתונים למצב פיתוח להדר
        headerProps={{
          isDevelopmentMode: IS_DEVELOPMENT_MODE,
          specialItemName,
          specialItemAppeared: specialItemPosition !== null,
          onSkipGame: this.handleSkipGame,
          winCondition: IS_DEVELOPMENT_MODE ? winCondition.name : undefined,
          isWinConditionMet
        }}
      >
        <div className={`w-full h-full p-0 m-0 flex items-stretch justify-center ${bgClassName} relative`}>
          <GridGameBoard 
            items={items} 
            columns={columns} 
            gap={gap}
            className="w-full h-full p-0 m-0" 
            animateSpecialItems={true}
            rotationDuration={rotationDuration}
            isDevelopmentMode={IS_DEVELOPMENT_MODE}
          />
        </div>
      </TwoPlayerGameLayout>
    );
  }