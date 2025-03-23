
import React from "react";
import { Player } from "@/types/game";
import { cn } from "@/lib/utils";

interface PlayerSideProps {
  player: Player;
  active: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const PlayerSide: React.FC<PlayerSideProps> = ({
  player,
  active,
  onClick,
  disabled = false,
  className,
}) => {
  const isPlayer1 = player === 1;
  
  return (
    <button
      className={cn(
        "w-full py-12 text-center font-bold text-white text-xl", // Tripled height with py-12
        isPlayer1 
          ? "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700" 
          : "bg-red-500 hover:bg-red-600 active:bg-red-700",
        active && !disabled && "animate-pulse",
        disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      PLAYER {player}
    </button>
  );
};

export default PlayerSide;
