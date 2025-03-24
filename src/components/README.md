# ארכיטקטורת משחקי גריד

מסמך זה מתאר את הארכיטקטורה החדשה של משחקי הגריד במערכת, המבוססת על עקרונות תכנות מונחה עצמים וירושה.

## מבנה הארכיטקטורה

### AbstractGridGame

מחלקת בסיס מופשטת המספקת את התשתית הבסיסית למשחקי גריד. כל משחק ספציפי יורש ממחלקה זו ומממש את הלוגיקה הייחודית שלו.

#### מתודות מופשטות שכל משחק חייב לממש:

- `renderRegularItem()`: מחזירה את התוכן של פריט רגיל בגריד
- `renderSpecialItem()`: מחזירה את התוכן של הפריט המיוחד בגריד
- `addSpecialItem()`: מוסיפה פריט מיוחד לגריד במיקום מסוים
- `getWinCondition()`: מגדירה את תנאי הניצחון במשחק

#### מתודות עם מימוש ברירת מחדל שניתן לדרוס:

- `getDelayBeforeAddingSpecial()`: מחזירה את זמן ההשהיה לפני הוספת הפריט המיוחד
- `getDelayRange()`: מחזירה טווח זמנים רנדומלי להוספת הפריט המיוחד

### GridGameWrapper

קומפוננטת עטיפה פונקציונלית המאפשרת שימוש בהוקים ומעבירה אותם לקומפוננטת המחלקה. זה פותר את הבעיה של שימוש בהוקים בתוך מחלקות.

## יצירת משחק חדש

1. צור מחלקה חדשה שיורשת מ-`AbstractGridGame`
2. ממש את המתודות המופשטות הנדרשות
3. דרוס מתודות ברירת מחדל לפי הצורך
4. צור פונקציית עטיפה שמשתמשת ב-`GridGameWrapper`

## דוגמה ליצירת משחק חדש

```tsx
// MyNewGame.tsx
import React from "react";
import { Player } from "@/types/game";
import AbstractGridGame, { ResultMessages, WinCondition } from "@/components/AbstractGridGame";
import { useLanguage } from "@/context/LanguageContext";
import GridGameWrapper from "@/components/GridGameWrapper";

interface MyNewGameProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

// מחלקת המשחק שיורשת מהמחלקה המופשטת
class MyNewGame extends AbstractGridGame<MyNewGameProps> {
  // מימוש רנדור פריט רגיל
  renderRegularItem(): React.ReactNode {
    return <span style={{ fontSize: '1.5em' }}>🌟</span>;
  }

  // מימוש רנדור פריט מיוחד
  renderSpecialItem(): React.ReactNode {
    return <span style={{ fontSize: '1.5em' }}>🚀</span>;
  }

  // מימוש הוספת פריט מיוחד
  addSpecialItem(availablePositions: number[]): number | void {
    if (availablePositions.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    console.log("Adding special item at position:", position);
    return position;
  }

  // מימוש תנאי הניצחון
  getWinCondition(): WinCondition {
    const { t } = useLanguage();
    return {
      check: () => this.state.specialItemPosition !== null,
      name: t('rocketAppeared')
    };
  }

  // דריסת מתודת טווח ההשהיה (אופציונלי)
  getDelayRange(): { min: number; max: number } | null {
    return { min: 1000, max: 5000 };
  }
}

/**
 * פונקציית עטיפה שמאפשרת שימוש בהוקים בתוך הקומפוננטה
 */
const MyNewGameWrapper: React.FC<MyNewGameProps> = (props) => {
  const { t } = useLanguage();
  
  // יצירת הודעות תוצאה מתורגמות
  const resultMessages: ResultMessages = {
    success: t('foundRocketFirst'),
    failure: t('tappedTooEarly'),
    timeout: t('noOneFoundRocket'),
  };
  
  // שימוש בקומפוננטת העטיפה הכללית
  return (
    <GridGameWrapper
      {...props}
      GameComponent={MyNewGame}
      columns={6}
      rows={8}
      gap={0}
      startScreenTitle={t('findRocket')}
      startScreenDescription={t('findRocketDesc')}
      startScreenIcon="🚀"
      resultMessages={resultMessages}
      rotationDuration={0.7}
      bgClassName="bg-gradient-to-b from-purple-400 to-indigo-500"
    />
  );
};

export default MyNewGameWrapper;
```

## יתרונות הארכיטקטורה החדשה

1. **הפרדת אחריות** - כל משחק אחראי רק על הלוגיקה הייחודית שלו
2. **קוד משותף** - הלוגיקה המשותפת נמצאת במחלקת הבסיס
3. **תחזוקה קלה** - שינויים גלובליים מתבצעים במקום אחד
4. **הרחבה פשוטה** - הוספת משחקים חדשים דורשת מימוש של מספר מתודות בלבד
5. **שימוש בהוקים** - פתרון אלגנטי לשימוש בהוקים בתוך מחלקות