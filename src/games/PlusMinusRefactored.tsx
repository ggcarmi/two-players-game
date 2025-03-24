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
      check: () => this.state.plusCount > this.state.minusCount,
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
      
      return {
        items: newItems,
        plusCount,
        minusCount,
        isWinConditionMet: plusCount > minusCount,
      };
    });
  };
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