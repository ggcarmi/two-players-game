import React from "react";
import { Player } from "@/types/game";
import AbstractGridGame, { ResultMessages, WinCondition } from "@/components/AbstractGridGame";
import { useLanguage } from "@/context/LanguageContext";
import GridGameWrapper from "@/components/GridGameWrapper";

interface FindSadProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

/**
 * משחק מצא את הסמיילי העצוב - מימוש באמצעות ירושה מהמחלקה המופשטת
 */
class FindSadRefactored extends AbstractGridGame<FindSadProps> {
  // מימוש רנדור סמיילי רגיל
  renderRegularItem(): React.ReactNode {
    return <span style={{ fontSize: '1.5em' }}>😊</span>;
  }

  // מימוש רנדור סמיילי עצוב
  renderSpecialItem(): React.ReactNode {
    return <span style={{ fontSize: '1.5em' }}>☹️</span>;
  }

  // מימוש הוספת הסמיילי העצוב באופן רנדומלי
  addSpecialItem(availablePositions: number[]): number | void {
    if (availablePositions.length === 0) {
      console.log("Error: No available positions for sad face");
      return null;
    }
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    console.log("Adding sad face at position:", position);
    return position;
  }

  // מימוש תנאי הניצחון - הסמיילי העצוב הופיע
  getWinCondition(): WinCondition {
    const { t } = useLanguage();
    return {
      check: () => {
        // תמיד נחזיר אמת אם הסמיילי העצוב הופיע
        const sadAppeared = this.state.specialItemPosition !== null;
        console.log(`Checking win condition: sadAppeared=${sadAppeared}`);
        return sadAppeared;
      },
      name: t('sadAppeared')
    };
  }

  // דריסת מתודת טווח ההשהיה
  getDelayRange(): { min: number; max: number } | null {
    // תיקון: תמיד יופיע בין 20% ל-50% מזמן המשחק
    const { maxTime = 10000 } = this.props;
    const minDelay = maxTime * 0.2; // 20% מזמן המשחק
    const maxDelay = maxTime * 0.5; // 50% מזמן המשחק
    
    console.log(`🛠️ [FindSad] קביעת טווח זמן להופעת סמיילי עצוב: ${minDelay}ms עד ${maxDelay}ms`);
    return { min: minDelay, max: maxDelay };
  }
  
  // תוספת חדשה: כפיית הופעת הפריט המיוחד
  componentDidMount() {
    super.componentDidMount();
    
    // הגדרת טיימר נוסף שיבטיח הופעת הפריט המיוחד
    if (this.props.maxTime) {
      const guaranteedDelay = this.props.maxTime * 0.3; // 30% מזמן המשחק
      
      console.log(`🛠️ [FindSad] הגדרת טיימר חירום להופעת סמיילי עצוב אחרי ${guaranteedDelay}ms`);
      
      setTimeout(() => {
        // בדיקה שהמשחק עדיין פעיל ושהפריט המיוחד עדיין לא הופיע
        if (this.gameState.gameState === "playing" && this.state.specialItemPosition === null) {
          console.log("🔴 [FindSad] כפיית הופעת סמיילי עצוב דרך טיימר חירום");
          
          try {
            const availablePositions = Array.from(
              { length: this.props.rows * this.props.columns },
              (_, i) => i
            );
            
            // בחירת מיקום רנדומלי
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            const position = availablePositions[randomIndex];
            
            // עדכון המצב באופן ישיר
            this.setState({
              specialItemPosition: position,
              timeWhenSpecialAppeared: Date.now(),
              isWinConditionMet: true
            }, () => {
              // עדכון הממשק מיד
              this.updateItemsWithSpecial();
              console.log(`✅ [FindSad] סמיילי עצוב הופיע בהצלחה במיקום ${position}`);
            });
          } catch (error) {
            console.error("❌ [FindSad] שגיאה בכפיית הופעת סמיילי עצוב:", error);
          }
        }
      }, guaranteedDelay);
    }
  }
}

/**
 * פונקציית עטיפה שמאפשרת שימוש בהוקים בתוך הקומפוננטה
 */
const FindSadWrapper: React.FC<FindSadProps> = (props) => {
  const { t } = useLanguage();
  
  // יצירת הודעות תוצאה מתורגמות
  const resultMessages: ResultMessages = {
    success: t('foundSadFirst'),
    failure: t('tappedTooEarly'),
    timeout: t('noOneSad'),
  };
  
  // שימוש בקומפוננטת העטיפה הכללית
  return (
    <GridGameWrapper
      {...props}
      GameComponent={FindSadRefactored}
      columns={5}
      rows={8}
      gap={0}
      startScreenTitle={t('findSad')}
      startScreenDescription={t('findSadDesc')}
      startScreenIcon="☹️"
      resultMessages={resultMessages}
      rotationDuration={0.6}
      bgClassName="bg-gradient-to-b from-yellow-400 to-orange-500"
    />
  );
};

export default FindSadWrapper;