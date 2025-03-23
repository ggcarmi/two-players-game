
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Settings, SkipForward, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGameSessionContext } from "@/context/GameSessionContext";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  timerValue?: number;
  maxTime?: number;
  winConditionMet?: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  timerValue,
  maxTime,
  winConditionMet = false,
}) => {
  const navigate = useNavigate();
  const { setWinner } = useGameSessionContext();

  // For development mode
  const IS_DEBUG_MODE = true; // For development, set to false in production

  const handleSkipGame = () => {
    // Skip to next game without declaring a winner
    setWinner(null, 0);
  };

  return (
    <div className="w-full px-4 py-3 flex items-center justify-between bg-black text-white border-b-4 border-black z-10">
      <button
        className="w-10 h-10 rounded-full bg-white text-black border-2 border-black flex items-center justify-center"
        onClick={() => navigate("/")}
      >
        <Home className="h-5 w-5" />
      </button>

      <div className="flex flex-col items-center">
        <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
          GAME {currentGame} OF {totalGames}
        </div>
        <div className="flex items-center gap-3 font-extrabold text-xl">
          <span className="text-cyan-400">{player1Score}</span>
          <span className="text-white">-</span>
          <span className="text-red-400">{player2Score}</span>
        </div>
        {timerValue !== undefined && maxTime && (
          <div className="w-32 h-2 bg-white/20 mt-1 rounded-full overflow-hidden border border-white/40">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-red-500 transition-all duration-100"
              style={{ width: `${(timerValue / maxTime) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {IS_DEBUG_MODE && (
          <>
            <button
              title="Skip Game"
              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
              onClick={handleSkipGame}
            >
              <SkipForward className="h-4 w-4" />
            </button>
            
            <div 
              title="Win Condition Status"
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                winConditionMet ? "bg-green-500" : "bg-yellow-500"
              )}
            >
              <Check className="h-4 w-4 text-white" />
            </div>
          </>
        )}
        <button
          className="w-10 h-10 rounded-full bg-white text-black border-2 border-black flex items-center justify-center"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default GameHeader;
