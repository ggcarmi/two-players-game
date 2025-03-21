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
        "w-full py-4 text-center font-bold text-white text-xl",
        isPlayer1 
          ? "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 border-b-4 border-black" 
          : "bg-red-500 hover:bg-red-600 active:bg-red-700 border-t-4 border-black",
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
