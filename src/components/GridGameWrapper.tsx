import React from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useLanguage } from '@/context/LanguageContext';
import { AbstractGridGameProps, ResultMessages } from './AbstractGridGame';

/**
 * GridGameWrapper - קומפוננטת עטיפה פונקציונלית למשחקי גריד
 * מאפשרת שימוש בהוקים ומעבירה אותם לקומפוננטת המחלקה
 */
interface GridGameWrapperProps extends Omit<AbstractGridGameProps, 'gameState' | 't'> {
  GameComponent: React.ComponentType<AbstractGridGameProps>;
}

const GridGameWrapper: React.FC<GridGameWrapperProps> = ({
  GameComponent,
  maxTime = 10000,
  onGameComplete,
  ...restProps
}) => {
  // שימוש בהוקים
  const gameState = useGameState({
    maxTime,
    onGameComplete,
  });
  
  const { t } = useLanguage();
  
  return (
    <GameComponent
      {...restProps}
      maxTime={maxTime}
      onGameComplete={onGameComplete}
      gameState={gameState}
      t={t}
    />
  );
};

export default GridGameWrapper;