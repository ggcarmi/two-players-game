
import React from "react";
import { cn } from "@/lib/utils";
import { Player } from "@/types/game";

interface PlayerSideProps {
  player: Player;
  onTap: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const PlayerSide: React.FC<PlayerSideProps> = ({
  player,
  onTap,
  disabled = false,
  children,
  className,
}) => {
  const isPlayer1 = player === 1;

  return (
    <div
      className={cn(
        "player-side h-full",
        isPlayer1 ? "player1-side" : "player2-side",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      onClick={disabled ? undefined : onTap}
    >
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className={cn(
          "text-sm font-medium px-4 py-1 rounded-full",
          isPlayer1 ? "bg-player1/20 text-player1" : "bg-player2/20 text-player2"
        )}>
          Player {player}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PlayerSide;
