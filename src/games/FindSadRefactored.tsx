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
      check: () => this.state.specialItemPosition !== null,
      name: t('sadAppeared')
    };
  }

  // דריסת מתודת טווח ההשהיה
  getDelayRange(): { min: number; max: number } | null {
    // קובע זמן הופעה רנדומלי בין 1 ל-5 שניות
    const minDelay = 1000; // מינימום שנייה אחת
    const maxDelay = Math.min(5000, (this.props.maxTime || 10000) * 0.5); // מקסימום 5 שניות או 50% מהזמן המקסימלי
    return { min: minDelay, max: maxDelay };
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