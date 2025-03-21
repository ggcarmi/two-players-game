
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameHeaderProps {
  player1Score: number;
  player2Score: number;
  currentGame: number;
  totalGames: number;
  timerValue?: number;
  maxTime?: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  player1Score,
  player2Score,
  currentGame,
  totalGames,
  timerValue,
  maxTime,
}) => {
  const navigate = useNavigate();

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

      <button
        className="w-10 h-10 rounded-full bg-white text-black border-2 border-black flex items-center justify-center"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
};

export default GameHeader;
