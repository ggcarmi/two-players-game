import React, { ReactNode } from "react";
import { Player } from "@/types/game";
import { cn } from "@/lib/utils";
import GameHeader from "@/components/GameHeader";
import { AnimatePresence, motion } from "framer-motion";
import GameResult from "@/components/GameResult";
import { useLanguage } from "@/context/LanguageContext";

export interface TwoPlayerGameLayoutProps {
  // Game state
  gameState: "ready" | "playing" | "complete";
  setGameState: (state: "ready" | "playing" | "complete") => void;
  
  // Player information
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  
  // Timer information
  timeRemaining: number;
  maxTime: number;
  
  // Game result
  winner: Player | null;
  resultMessage?: string;
  
  // Player actions
  onPlayerAction?: (player: Player) => void;
  
  // Children components (game content)
  children: ReactNode;
  
  // Start screen content
  startScreenTitle: string;
  startScreenDescription: string;
  startScreenIcon?: string;
  
  // Callbacks
  onGameComplete: (winner: Player | null, timeElapsed: number) => void;
}

const TwoPlayerGameLayout: React.FC<TwoPlayerGameLayoutProps> = ({
  gameState,
  setGameState,
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  timeRemaining,
  maxTime,
  winner,
  resultMessage = "",
  onPlayerAction,
  children,
  startScreenTitle,
  startScreenDescription,
  startScreenIcon = "🎮",
  onGameComplete,
}) => {
  const { t } = useLanguage();
  
  const handlePlayerTap = (player: Player) => {
    if (onPlayerAction && gameState === "playing") {
      onPlayerAction(player);
    }
  };

  const startGame = () => {
    setGameState("playing");
  };

  // חישוב גובה כפתורי שחקן לפי גודל המסך - אדפטיבי לגובה המסך
  const playerButtonHeight = "h-[12vh] min-h-[60px] max-h-[100px]";

  return (
    <div className="game-container flex flex-col h-full">
      <GameHeader
        player1Score={player1Score}
        player2Score={player2Score}
        currentGame={currentGame}
        totalGames={totalGames}
        timerValue={timeRemaining}
        maxTime={maxTime}
      />

      <div className="relative flex-1 flex flex-col">
        {/* כפתור שחקן 1 עם גובה אדפטיבי */}
        <button
          className={cn(
            `w-full ${playerButtonHeight} text-center font-bold text-white border-b-4 border-black text-xl`,
            "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 transition-colors",
            gameState !== "playing" ? "opacity-50 pointer-events-none" : "cursor-pointer"
          )}
          onClick={() => handlePlayerTap(1)}
          disabled={gameState !== "playing"}
        >
          {t('player1')}
        </button>

        {/* אזור משחק מרכזי - מתאים עצמו לשטח הנותר */}
        <div className="flex-1 relative overflow-hidden">
          {children}
        </div>

        {/* כפתור שחקן 2 עם גובה אדפטיבי */}
        <button
          className={cn(
            `w-full ${playerButtonHeight} text-center font-bold text-white border-t-4 border-black text-xl`,
            "bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors",
            gameState !== "playing" ? "opacity-50 pointer-events-none" : "cursor-pointer"
          )}
          onClick={() => handlePlayerTap(2)}
          disabled={gameState !== "playing"}
        >
          {t('player2')}
        </button>

        {/* מסך פתיחה עם תרגומים מתאימים */}
        {gameState === "ready" && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" 
            onClick={startGame}
          >
            <div className="glass-panel p-4 sm:p-6 text-center max-w-xs mx-4 border-4 border-white">
              <div className="text-4xl mb-4">{startScreenIcon}</div>
              <h2 className="text-xl font-bold mb-2 text-white">{startScreenTitle}</h2>
              <p className="text-white font-bold mb-6">
                {startScreenDescription}
              </p>
              <button 
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full animate-bounce"
              >
                {t('startGame')}
              </button>
            </div>
          </div>
        )}

        {/* מסך סיום משחק עם תרגומים מתאימים */}
        <AnimatePresence>
          {gameState === "complete" && (
            <GameResult
              winner={winner}
              message={resultMessage}
              onContinue={() => onGameComplete(winner, maxTime - timeRemaining)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TwoPlayerGameLayout;