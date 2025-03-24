import React, { useState } from "react";
import { Player } from "@/types/game";
import AbstractGridGame, { ResultMessages, WinCondition } from "@/components/AbstractGridGame";
import { useLanguage } from "@/context/LanguageContext";
import { IS_DEVELOPMENT_MODE } from "@/components/AbstractGridGame";
import GridGameWrapper from "@/components/GridGameWrapper";

interface PlusMinusProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

/**
 * משחק פלוסים ומינוסים - מימוש באמצעות ירושה מהמחלקה המופשטת
 */
class PlusMinusRefactored extends AbstractGridGame<PlusMinusProps> {
  // סטייט פנימי למעקב אחרי מצב הפלוסים והמינוסים
  state = {
    ...this.state,
    plusCount: 0,
    minusCount: 0,
  };

  // מימוש רנדור מינוס רגיל
  renderRegularItem(): React.ReactNode {
    return <span style={{ fontSize: '1em' }}>➖</span>;
  }

  // מימוש רנדור פלוס מיוחד
  renderSpecialItem(): React.ReactNode {
    return <span style={{ fontSize: '1em' }}>➕</span>;
  }

  // מימוש הוספת פלוסים באופן רנדומלי
  addSpecialItem(availablePositions: number[]): number | void {
    if (availablePositions.length === 0) return null;
    
    // בוחר מיקום אקראי מתוך המיקומים הזמינים
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    
    // מאתחל את הספירה של פלוסים ומינוסים
    this.setState({ plusCount: 0, minusCount: 0 });
    
    console.log("Adding special item (plus) at position:", position);
    return position;
  }

  // מימוש תנאי הניצחון - יש יותר פלוסים
  getWinCondition(): WinCondition {
    const { t } = useLanguage();
    return {
      check: () => {
        const { plusCount, minusCount } = this.state;
        // תמיד נוודא שיש יותר פלוסים ממינוסים
        const isWinConditionMet = plusCount > minusCount;
        console.log(`Checking win condition: plusCount=${plusCount}, minusCount=${minusCount}, isWinConditionMet=${isWinConditionMet}`);
        return isWinConditionMet;
      },
      name: t('plusesAppeared')
    };
  }

  // דריסת מתודת עדכון הפריטים כאשר הפריט המיוחד מופיע
  updateItemsWithSpecial = () => {
    const { specialItemPosition } = this.state;
    if (specialItemPosition === null) return;

    console.log("Updating grid with special items for PlusMinus game");
    
    this.setState(prevState => {
      let plusCount = 0;
      let minusCount = 0;
      
      // יצירת מערך חדש של פריטים עם פלוסים ומינוסים
      const newItems = prevState.items.map((item, index) => {
        // קביעה אם הפריט יהיה פלוס או מינוס
        const shouldBePlus = Math.random() < 0.6; // 60% סיכוי להיות פלוס
        
        if (shouldBePlus) {
          plusCount++;
        } else {
          minusCount++;
        }
        
        return {
          ...item,
          content: shouldBePlus ? this.renderSpecialItem() : this.renderRegularItem(),
          isSpecial: shouldBePlus,
          onClick: () => this.handleItemClick(index),
        };
      });
      
      // עדכון הסטייט עם הערכים החדשים
      return {
        items: newItems,
        plusCount,
        minusCount,
      };
    }, () => {
      // בדיקת תנאי הניצחון לאחר עדכון הסטייט
      const isWinConditionMet = this.getWinCondition().check();
      console.log(`Checking win condition after update: isWinConditionMet=${isWinConditionMet}`);
      this.setState({ isWinConditionMet });
      
      // קריאה למנהל האירועים לאחר עדכון ה-state
      if (isWinConditionMet) {
        this.gameEventManager('specialItemAppeared');
      }
    });
  };

  // דריסת מתודת טווח ההשהיה
  getDelayRange(): { min: number; max: number } | null {
    // תיקון: תמיד יופיע בין 20% ל-50% מזמן המשחק
    const { maxTime = 10000 } = this.props;
    const minDelay = maxTime * 0.2; // 20% מזמן המשחק
    const maxDelay = maxTime * 0.5; // 50% מזמן המשחק
    
    console.log(`🛠️ [PlusMinus] קביעת טווח זמן להופעת פלוסים: ${minDelay}ms עד ${maxDelay}ms`);
    return { min: minDelay, max: maxDelay };
  }
  
  // תוספת חדשה: כפיית הופעת הפריט המיוחד
  componentDidMount() {
    super.componentDidMount();
    
    // הגדרת טיימר נוסף שיבטיח הופעת הפריט המיוחד
    if (this.props.maxTime) {
      const guaranteedDelay = this.props.maxTime * 0.3; // 30% מזמן המשחק
      
      console.log(`🛠️ [PlusMinus] הגדרת טיימר חירום להופעת פלוסים אחרי ${guaranteedDelay}ms`);
      
      setTimeout(() => {
        // בדיקה שהמשחק עדיין פעיל ושהפריט המיוחד עדיין לא הופיע
        if (this.gameState.gameState === "playing" && this.state.specialItemPosition === null) {
          console.log("🔴 [PlusMinus] כפיית הופעת פלוסים דרך טיימר חירום");
          
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
              console.log(`✅ [PlusMinus] פלוסים הופיעו בהצלחה במיקום ${position}`);
            });
          } catch (error) {
            console.error("❌ [PlusMinus] שגיאה בכפיית הופעת פלוסים:", error);
          }
        }
      }, guaranteedDelay);
    }
  }
}

/**
 * פונקציית עטיפה שמאפשרת שימוש בהוקים בתוך הקומפוננטה
 */
const PlusMinusWrapper: React.FC<PlusMinusProps> = (props) => {
  const { t } = useLanguage();
  
  // יצירת הודעות תוצאה מתורגמות
  const resultMessages: ResultMessages = {
    success: t('foundMorePluses'),
    failure: t('tappedTooEarly'),
    timeout: t('noOneFoundPluses'),
  };
  
  // שימוש בקומפוננטת העטיפה הכללית
  return (
    <GridGameWrapper
      {...props}
      GameComponent={PlusMinusRefactored}
      columns={10}
      rows={15}
      gap={0}
      startScreenTitle={t('plusMinus')}
      startScreenDescription={t('plusMinusDesc')}
      startScreenIcon="➕"
      resultMessages={resultMessages}
      rotationDuration={0.5}
      bgClassName="bg-gradient-to-b from-green-400 to-blue-500"
    />
  );
};

export default PlusMinusWrapper;