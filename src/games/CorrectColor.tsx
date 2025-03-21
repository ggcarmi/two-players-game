import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import TwoPlayerGameLayout from "@/components/TwoPlayerGameLayout";
import { useGameState } from "@/hooks/useGameState";
import { useLanguage } from "@/context/LanguageContext";

interface CorrectColorProps {
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  maxTime?: number;
}

const colors = [
  { id: 'red', bg: "bg-red-500", textColor: "text-white" },
  { id: 'blue', bg: "bg-blue-500", textColor: "text-white" },
  { id: 'green', bg: "bg-green-500", textColor: "text-white" },
  { id: 'yellow', bg: "bg-yellow-500", textColor: "text-black" },
  { id: 'purple', bg: "bg-purple-500", textColor: "text-white" }
];

const CorrectColor: React.FC<CorrectColorProps> = ({
  onGameComplete,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  maxTime = 10000,
}) => {
  const { t } = useLanguage();
  
  const {
    gameState,
    setGameState,
    timeRemaining,
    winner,
    setWinner,
  } = useGameState({
    maxTime,
    onGameComplete
  });

  const [targetColorIndex, setTargetColorIndex] = useState(0);
  const [displayColorIndex, setDisplayColorIndex] = useState(0);
  const [isMatch, setIsMatch] = useState(false);
  const [timeWhenMatch, setTimeWhenMatch] = useState(0);

  const initGame = useCallback(() => {
    const randomTargetIndex = Math.floor(Math.random() * colors.length);
    setTargetColorIndex(randomTargetIndex);
    
    const randomDisplayIndex = Math.floor(Math.random() * colors.length);
    setDisplayColorIndex(randomDisplayIndex);
    
    setIsMatch(randomTargetIndex === randomDisplayIndex);
    
    if (randomTargetIndex === randomDisplayIndex) {
      setTimeWhenMatch(Date.now());
    }
  }, []);

  const startChangingColors = useCallback(() => {
    if (gameState !== "playing") return;
    
    const changeColor = () => {
      if (gameState !== "playing") return;
      
      const newDisplayIndex = Math.floor(Math.random() * colors.length);
      setDisplayColorIndex(newDisplayIndex);
      
      const match = newDisplayIndex === targetColorIndex;
      
      if (match && !isMatch) {
        setIsMatch(true);
        setTimeWhenMatch(Date.now());
      } else if (!match && isMatch) {
        setIsMatch(false);
      }
      
      const nextChangeTime = 1000 + Math.random() * 1000;
      const timeoutId = setTimeout(changeColor, nextChangeTime);
      
      return () => clearTimeout(timeoutId);
    };
    
    const initialDelay = 1000 + Math.random() * 1000;
    const initialTimeoutId = setTimeout(changeColor, initialDelay);
    
    return () => clearTimeout(initialTimeoutId);
  }, [gameState, isMatch, targetColorIndex]);

  const onPlayerAction = useCallback((player: Player) => {
    if (gameState !== "playing") return;
    
    if (isMatch) {
      const timeElapsed = Date.now() - timeWhenMatch;
      setWinner(player);
      setGameState("complete");
      
      setTimeout(() => {
        onGameComplete(player, timeElapsed);
      }, 2000);
    } else {
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      setGameState("complete");
      
      setTimeout(() => {
        onGameComplete(otherPlayer, 0);
      }, 2000);
    }
  }, [gameState, isMatch, onGameComplete, timeWhenMatch, setWinner, setGameState]);

  useEffect(() => {
    if (gameState === "playing") {
      initGame();
      const cleanup = startChangingColors();
      
      return cleanup;
    }
  }, [gameState, initGame, startChangingColors]);

  const targetColor = colors[targetColorIndex];
  const displayColor = colors[displayColorIndex];

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
      resultMessage={
        isMatch
          ? winner ? t('colorMatchSuccess') : t('colorMatchTimeout')
          : winner ? t('colorMatchFail') : t('timeUp')
      }
      onPlayerAction={onPlayerAction}
      startScreenTitle={t('correctColor')}
      startScreenDescription={t('correctColorDesc')}
      startScreenIcon="🎨"
      onGameComplete={onGameComplete}
    >
      <div className={`flex flex-col items-center justify-center w-full h-full ${displayColor.bg} transition-colors duration-300`}>
        {gameState === "playing" && (
          <>
            <div className={`text-[10vmin] font-black ${displayColor.textColor} mb-8 uppercase`}>
              {t(targetColor.id)}
            </div>
            <div className="text-xl text-white font-bold text-center px-4">
              {t('tapWhenMatch')}
            </div>
          </>
        )}
      </div>
    </TwoPlayerGameLayout>
  );
};

export default CorrectColor;
