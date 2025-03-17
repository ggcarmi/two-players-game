
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
    <div className="w-full px-4 py-3 flex items-center justify-between bg-white/10 backdrop-blur-lg border-b border-white/20 z-10">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-10 w-10"
        onClick={() => navigate("/")}
      >
        <Home className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-muted-foreground">
          GAME {currentGame} OF {totalGames}
        </div>
        <div className="flex items-center gap-3 font-bold text-lg">
          <span className="text-player1">{player1Score}</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-player2">{player2Score}</span>
        </div>
        {timerValue !== undefined && maxTime && (
          <div className="w-32 h-1 bg-muted mt-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${(timerValue / maxTime) * 100}%` }}
            />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-10 w-10"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default GameHeader;
