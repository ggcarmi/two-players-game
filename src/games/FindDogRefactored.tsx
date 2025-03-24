import React from "react";
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
      check: () => this.state.specialItemPosition !== null,
      name: t('dogAppeared')
    };
  }

  // דריסת מתודת טווח ההשהיה
  getDelayRange(): { min: number; max: number } | null {
    // קובע זמן הופעה רנדומלי בין 1 ל-7 שניות
    const minDelay = 1000; // מינימום שנייה אחת
    const maxDelay = Math.min(7000, (this.props.maxTime || 10000) * 0.7); // מקסימום 7 שניות או 70% מהזמן המקסימלי
    return { min: minDelay, max: maxDelay };
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