import React from 'react';
import { useGameSessionContext } from '@/context/GameSessionContext';
import { Button } from '@/components/ui/button';

interface DebugControlsProps {
  isDebugMode: boolean;
}

const DebugControls: React.FC<DebugControlsProps> = ({ isDebugMode }) => {
  const { setWinner } = useGameSessionContext();

  if (!isDebugMode) return null;

  const handleSkipGame = () => {
    // Skip to next game without declaring a winner
    setWinner(null, 0);
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-2 bg-black/80 text-white rounded-bl-lg">
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleSkipGame}
        className="text-xs"
      >
        Skip Game (Debug)
      </Button>
    </div>
  );
};

export default DebugControls;