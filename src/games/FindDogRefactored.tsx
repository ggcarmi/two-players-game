import React, { useRef } from "react";
import { Player } from "@/types/game";
import AbstractGridGame, { ResultMessages, WinCondition } from "@/components/AbstractGridGame";
import { useLanguage } from "@/context/LanguageContext";
import GridGameWrapper from "@/components/GridGameWrapper";

interface FindDogProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

/**
 * משחק מצא את הכלב - מימוש באמצעות ירושה מהמחלקה המופשטת
 */
class FindDogRefactored extends AbstractGridGame<FindDogProps> {
  // מימוש רנדור פנדה רגילה
  renderRegularItem(): React.ReactNode {
    return <span style={{ fontSize: '1.5em' }}>🐼</span>;
  }

  // מימוש רנדור כלב
  renderSpecialItem(): React.ReactNode {
    return <span style={{ fontSize: '1.5em' }}>🐶</span>;
  }

  // מימוש הוספת הכלב באופן רנדומלי
  addSpecialItem(availablePositions: number[]): number | void {
    if (availablePositions.length === 0) {
      console.log("Error: No available positions for dog");
      return null;
    }
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    console.log("Adding dog at position:", position);
    return position;
  }

  // מימוש תנאי הניצחון - הכלב הופיע
  getWinCondition(): WinCondition {
    const { t } = useLanguage();
    return {
      check: () => {
        // תמיד נחזיר אמת אם הכלב הופיע
        const dogAppeared = this.state.specialItemPosition !== null;
        console.log(`Checking win condition: dogAppeared=${dogAppeared}`);
        return dogAppeared;
      },
      name: t('dogAppeared')
    };
  }

  // דריסת מתודת טווח ההשהיה
  getDelayRange(): { min: number; max: number } | null {
    // תיקון: תמיד יופיע בין 20% ל-50% מזמן המשחק
    const { maxTime = 10000 } = this.props;
    const minDelay = maxTime * 0.2; // 20% מזמן המשחק
    const maxDelay = maxTime * 0.5; // 50% מזמן המשחק
    
    console.log(`🛠️ [FindDog] קביעת טווח זמן להופעת כלב: ${minDelay}ms עד ${maxDelay}ms`);
    return { min: minDelay, max: maxDelay };
  }
  
  // תוספת חדשה: כפיית הופעת הפריט המיוחד
  componentDidMount() {
    super.componentDidMount();
    
    // הגדרת טיימר נוסף שיבטיח הופעת הפריט המיוחד
    if (this.props.maxTime) {
      const guaranteedDelay = this.props.maxTime * 0.3; // 30% מזמן המשחק
      
      console.log(`🛠️ [FindDog] הגדרת טיימר חירום להופעת כלב אחרי ${guaranteedDelay}ms`);
      
      setTimeout(() => {
        // בדיקה שהמשחק עדיין פעיל ושהפריט המיוחד עדיין לא הופיע
        if (this.gameState.gameState === "playing" && this.state.specialItemPosition === null) {
          console.log("🔴 [FindDog] כפיית הופעת כלב דרך טיימר חירום");
          
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
              console.log(`✅ [FindDog] כלב הופיע בהצלחה במיקום ${position}`);
            });
          } catch (error) {
            console.error("❌ [FindDog] שגיאה בכפיית הופעת כלב:", error);
          }
        }
      }, guaranteedDelay);
    }
  }
}

/**
 * פונקציית עטיפה שמאפשרת שימוש בהוקים בתוך הקומפוננטה
 */
const FindDogWrapper: React.FC<FindDogProps> = (props) => {
  const { t } = useLanguage();
  
  // יצירת הודעות תוצאה מתורגמות
  const resultMessages: ResultMessages = {
    success: t('foundDogFirst'),
    failure: t('tappedTooEarly'),
    timeout: t('noOneDog'),
  };
  
  // שימוש בקומפוננטת העטיפה הכללית
  return (
    <GridGameWrapper
      {...props}
      GameComponent={FindDogRefactored}
      columns={6}
      rows={10}
      gap={0}
      startScreenTitle={t('findDog')}
      startScreenDescription={t('findDogDesc')}
      startScreenIcon="🐶"
      resultMessages={resultMessages}
      rotationDuration={0.8}
      bgClassName="bg-gradient-to-b from-blue-400 to-purple-500"
    />
  );
};

export default FindDogWrapper;