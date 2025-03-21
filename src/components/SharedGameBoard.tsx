import React from "react";
import { Player } from "@/types/game";
import { cn } from "@/lib/utils";

interface SharedGameBoardProps {
  onPlayerAction: (player: Player) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SharedGameBoard: React.FC<SharedGameBoardProps> = ({
  onPlayerAction,
  disabled = false,
  children,
  className,
}) => {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      {/* Player 1 control at the top */}
      <button
        className={cn(
          "w-full py-6 text-center font-bold text-white border-b-4 border-black text-xl",
          "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 transition-colors",
          disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
        )}
        onClick={() => !disabled && onPlayerAction(1)}
        disabled={disabled}
      >
        PLAYER 1
      </button>

      {/* Main game board area */}
      <div
        className={cn(
          "flex-1 w-full relative overflow-hidden",
          disabled ? "opacity-50 pointer-events-none" : "",
          className
        )}
      >
        {children}
      </div>

      {/* Player 2 control at the bottom */}
      <button
        className={cn(
          "w-full py-6 text-center font-bold text-white border-t-4 border-black text-xl",
          "bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors",
          disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
        )}
        onClick={() => !disabled && onPlayerAction(2)}
        disabled={disabled}
      >
        PLAYER 2
      </button>
    </div>
  );
}

export default SharedGameBoard;