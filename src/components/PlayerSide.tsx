
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
  
  const handleTap = () => {
    console.log(`Player ${player} tapped, disabled: ${disabled}`);
    if (!disabled) {
      onTap();
    }
  };
  
  return (
    <div
      className={cn(
        "player-side h-full relative",
        isPlayer1 ? "bg-cyan-100" : "bg-red-100",
        disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
        className
      )}
      onClick={handleTap}
    >
      <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
        <div className={cn(
          "font-bold px-4 py-1 rounded-full uppercase tracking-wider border-2 border-black",
          isPlayer1 ? "bg-cyan-500 text-white" : "bg-red-500 text-white"
        )}>
          Player {player}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PlayerSide;
