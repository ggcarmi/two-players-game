
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/game";
import { cn } from "@/lib/utils";

interface GameResultProps {
  winner: Player | null;
  message: string;
  onContinue: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  winner,
  message,
  onContinue,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="glass-panel p-6 max-w-sm mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          {winner ? (
            <div
              className={cn(
                "flex items-center justify-center w-16 h-16 rounded-full mb-2",
                winner === 1 ? "bg-player1" : "bg-player2"
              )}
            >
              <span className="text-white text-2xl font-bold">{winner}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-16 h-16 rounded-full mb-2 bg-muted">
              <span className="text-muted-foreground text-2xl">🤝</span>
            </div>
          )}

          <h3 className="text-xl font-bold">
            {winner ? `Player ${winner} Wins!` : "It's a tie!"}
          </h3>
          
          <p className="text-muted-foreground">{message}</p>
          
          <Button 
            className="mt-4 w-full"
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameResult;
