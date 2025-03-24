import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState, GameStateReturn, SPECIAL_ITEM_TIMING } from "@/hooks/useGameState";
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
  gameState?: GameStateReturn; // הוספת אפשרות להעביר את מצב המשחק מבחו�
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
  
  // מנגנון למניעת אתחולים חוזרים של הגריד
  private isInitialized = false;
  
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
    // מניעת אתחולים חוזרים כשהמשחק כבר מאותחל
    if (this.isInitialized && this.state.items.length > 0) {
      console.log("[AbstractGrid] Skipping grid initialization - already initialized");
      return;
    }
    
    console.log("[AbstractGrid] Initializing grid game with dimensions:", this.props.columns, "x", this.props.rows);
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
    
    // סימון שהמשחק אותחל
    this.isInitialized = true;
  };

  // הוספת פריט מיוחד לאחר השהייה
  addSpecialItemWithDelay = () => {
    if (this.gameState.gameState !== "playing") return;

    const { maxTime } = this.props;
    const gameStartTime = Date.now();
    
    // הגדרת טווח מובטח של 20-80% מזמן המשחק
    const minAppearanceTime = maxTime * 0.2; // מופיע לאחר 20% מהזמן לפחות
    const maxAppearanceTime = maxTime * 0.8; // מופיע עד 80% מהזמן
    
    // חישוב זמן ההשהיה - קבלת טווח מוגדר מהמשחק הספציפי
    const delayRange = this.getDelayRange();
    
    // הבטחת טווח זמן בתוך הגבולות המובטחים
    const effectiveMinDelay = delayRange
        ? Math.min(Math.max(delayRange.min, minAppearanceTime), maxAppearanceTime)
        : minAppearanceTime;
    const effectiveMaxDelay = delayRange
        ? Math.min(Math.max(delayRange.max, minAppearanceTime), maxAppearanceTime)
        : maxAppearanceTime;
    
    // בחירת זמן רנדומלי בתוך הטווח המותר
    const effectiveDelay = effectiveMinDelay + Math.random() * (effectiveMaxDelay - effectiveMinDelay);
    
    console.log(`Adding special item after ${effectiveDelay}ms delay (${effectiveDelay / maxTime * 100}% of game time)`, {
      minAppearanceTime,
      maxAppearanceTime,
      effectiveMinDelay,
      effectiveMaxDelay,
      maxTime
    });
    
    // טיימר ראשי להופעת הפריט
    const mainTimer = setTimeout(() => {
      if (this.gameState.gameState === "playing" && this.state.specialItemPosition === null) {
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
            }, () => {
              // עדכון הפריטים מיד לאחר עדכון הסטייט
              this.updateItemsWithSpecial();
            });
            console.log("Special item added at position:", position);
          } else {
            console.warn("addSpecialItem did not return a valid position");
          }
        } catch (error) {
          console.error("Error adding special item:", error);
        }
      }
    }, effectiveDelay);
    
    // טיימר גיבוי במקרה שהפריט לא הופיע - בדיקה תכופה יותר
    const backupTimer = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - gameStartTime;
      
      // אם עבר יותר מ-80% מהזמן והפריט עדיין לא הופיע, חייבים להכריח הופעה
      if (elapsedTime > 0.8 * maxTime && this.state.specialItemPosition === null && this.gameState.gameState === "playing") {
        console.log("URGENT: Backup timer forcing special item to appear before game ends");
        try {
          const availablePositions = Array.from(
            { length: this.props.rows * this.props.columns },
            (_, i) => i
          );
          const position = this.addSpecialItem(availablePositions);
          
          if (typeof position === 'number') {
            this.setState({
              specialItemPosition: position,
              timeWhenSpecialAppeared: currentTime,
            }, () => {
              // עדכון הפריטים מיד לאחר עדכון הסטייט
              this.updateItemsWithSpecial();
            });
            console.log("Backup timer: Successfully added special item at position", position);
          } else {
            console.error("Backup timer: Failed to add special item - no valid position returned");
          }
        } catch (error) {
          console.error("Error adding special item in backup timer:", error);
        }
      }
      
      // כדאי גם לבדוק אם המשחק עדיין בתהליך אחרי זמן מסוים
      if (elapsedTime > maxTime && this.gameState.gameState === "playing") {
        console.log("Game has exceeded maximum time but still playing - force completion");
        this.gameState.setGameState("complete");
      }
    }, 500); // בדיקה כל חצי שנייה
    
    return () => {
      clearTimeout(mainTimer);
      clearInterval(backupTimer);
    };
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
    }), () => {
      // קריאה למנהל האירועים לאחר עדכון ה-state
      this.gameEventManager('specialItemAppeared');
      console.log("Special item updated in grid, content rendered:", this.renderSpecialItem());
    });
  };

  // מערכת ניהול אירועי משחק - גרסה משופרת
  gameEventManager = (event: 'specialItemAppeared' | 'specialItemClicked' | 'invalidClick', data?: any) => {
    const { specialItemPosition, timeWhenSpecialAppeared, isWinConditionMet } = this.state;
    
    switch (event) {
      case 'specialItemAppeared':
        if (this.gameState.gameState === 'playing') {
          // בדיקת תנאי הניצחון מיד כאשר הפריט המיוחד מופיע
          // תמיד נגדיר שתנאי הניצחון מתקיים כאשר הפריט המיוחד מופיע
          // (אלא אם כן המשחק הספציפי מגדיר אחרת)
          const winConditionResult = this.getWinCondition().check();
          console.log(`Special item appeared - checking win condition: ${winConditionResult}`);
          
          this.setState({
            timeWhenSpecialAppeared: Date.now(),
            isWinConditionMet: winConditionResult,
          });
        }
        break;
      
      case 'specialItemClicked':
        // בדיקה נוספת של תנאי הניצחון בזמן הלחיצה
        // אם הפריט המיוחד הופיע, נניח שתנאי הניצחון מתקיים
        const currentWinCondition = specialItemPosition !== null;
        console.log(`Special item clicked - win condition: ${currentWinCondition}, state.isWinConditionMet: ${isWinConditionMet}`);
        
        if ((currentWinCondition || isWinConditionMet) && this.gameState.gameState === 'playing') {
          const timeElapsed = timeWhenSpecialAppeared ? Date.now() - timeWhenSpecialAppeared : 0;
          console.log(`Win condition met! Time elapsed: ${timeElapsed}ms`);
          
          // עדכון מצב המשחק והודעת הניצחון
          this.gameState.setWinner(1); // השחקן שלח� ראשו� מנצח
          this.gameState.setGameState('complete');
          this.setState({
            resultMessage: this.props.resultMessages.success,
            completeTimeElapsed: timeElapsed,
          });
          return timeElapsed;
        }
        return null;
      
      case 'invalidClick':
        if (this.gameState.gameState === 'playing') {
          console.log('Invalid click - failure');
          this.gameState.setWinner(2); // השחקן השני מנצח
          this.gameState.setGameState('complete');
          this.setState({
            resultMessage: this.props.resultMessages.failure,
          });
          return false;
        }
        return null;
    }
  };

  // טיפול בלחיצה על פריט
  handleItemClick = (index: number) => {
    if (this.gameState.gameState !== "playing") return;

    const { specialItemPosition } = this.state;
    console.log("Item clicked at position:", index, "Special item position:", specialItemPosition);

    // בדיקה האם נלחץ הפריט המיוחד
    if (index === specialItemPosition) {
      this.gameEventManager('specialItemClicked');
    } else {
      this.gameEventManager('invalidClick');
    }
  };

  // טיפול בלחיצת שחקן
  onPlayerAction = (player: Player) => {
    if (this.gameState.gameState !== "playing") {
      console.log(`[AbstractGrid] Player ${player} action ignored - game not in playing state`, { gameState: this.gameState.gameState });
      return;
    }

    const { specialItemPosition, isWinConditionMet } = this.state;
    console.log(`[AbstractGrid] Processing player ${player} action:`, {
      specialItemPosition,
      isWinConditionMet,
      currentTime: new Date().toISOString()
    });

    // בדיקה חדשה - אם יש פריט מיוחד והתנאי מתקיים, נחשיב את זה כלחיצה על הפריט
    if (specialItemPosition !== null && isWinConditionMet) {
      console.log("[AbstractGrid] Player clicked when special item is present and win condition is met - treating as item click");
      const timeElapsed = this.state.timeWhenSpecialAppeared ? Date.now() - this.state.timeWhenSpecialAppeared : 0;
      
      this.gameState.setWinner(player);
      this.gameState.setGameState("complete");
      this.setState({
        resultMessage: this.props.resultMessages.success,
        completeTimeElapsed: timeElapsed,
      });

      this.props.onGameComplete(player, timeElapsed);
      return;
    }

    // אם לחצו לפני שהופיע הפריט המיוחד או לפני שתנאי הניצחון התקיים, זו טעות
    const otherPlayer = player === 1 ? 2 : 1;
    console.log("[AbstractGrid] Invalid or early player tap detected:", {
      tappingPlayer: player,
      winningPlayer: otherPlayer,
      specialItemStatus: specialItemPosition === null ? "not_appeared_yet" : "appeared_but_condition_not_met"
    });
    
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
    
    // רישום פונקציית אילוץ להופעת הפריט המיוחד
    if (this.gameState.registerForceCallback) {
      const forceSpecialItemAppearance = () => {
        if (this.state.specialItemPosition === null) {
          console.log("🚨 FORCING special item to appear NOW via emergency system in AbstractGridGame");
          try {
            const availablePositions = Array.from(
              { length: this.props.rows * this.props.columns },
              (_, i) => i
            );
            const position = this.addSpecialItem(availablePositions);
            
            if (typeof position === 'number') {
              this.setState({
                specialItemPosition: position,
                timeWhenSpecialAppeared: Date.now(),
              }, () => {
                // עדכון הפריטים מיד לאחר עדכון הסטייט
                this.updateItemsWithSpecial();
                console.log("Emergency system: Special item added at position", position);
              });
            }
          } catch (error) {
            console.error("Error in emergency force special item:", error);
          }
        }
      };
      
      // רישום הפונקציה במערכת הגלובלית
      this.gameState.registerForceCallback(forceSpecialItemAppearance);
    }
  }

  // מחזור חיים - עדכון
  componentDidUpdate(prevProps: P, prevState: any) {
    const { gameState } = this.gameState;
    const { specialItemPosition, resultMessage } = this.state;
    const { timeRemaining } = this.gameState;
    
    // אתחול המשחק כאשר הוא מתחיל - רק אם עוד לא אותחל
    if (gameState === "playing" && prevState.gameState !== "playing") {
      console.log("Game state changed to playing - initializing game");
      
      if (!this.isInitialized) {
        console.log("[AbstractGrid] Initializing game for the first time");
        this.initGame();
        this.addSpecialItemWithDelay();
      } else {
        console.log("[AbstractGrid] Game already initialized, skipping initialization");
      }
    }
    
    // איפוס הסימון של האתחול כשהמשחק חוזר למצב "ready"
    if (gameState === "ready" && prevState.gameState !== "ready") {
      console.log("[AbstractGrid] Game returning to ready state, resetting initialization flag");
      this.isInitialized = false;
    }
    
    // עדכון הפריטים כאשר הפריט המיוחד מופיע
    if (specialItemPosition !== prevState.specialItemPosition && specialItemPosition !== null) {
      console.log("Special item position changed - updating items");
      this.updateItemsWithSpecial();
    }
    
    // אם הזמן הסתיים ואין הודעת תוצאה, זה אומר שאף אחד לא מצא את הפריט המיוחד
    if (gameState === "complete" && resultMessage === "" && timeRemaining <= 0) {
      console.log("Game timeout - setting timeout message");
      this.setState({
        resultMessage: this.props.resultMessages.timeout,
      });
    }
    
    // סיום המשחק ושמירת התוצאה
    if (gameState === "complete" && this.gameState.winner !== null && prevState.gameState !== "complete") {
      console.log("Game completed with winner - scheduling completion callback");
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
}