
import React from "react";
import { motion } from "framer-motion";
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="cartoon-border bg-white p-8 max-w-sm mx-4"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {winner ? (
            <div
              className={cn(
                "flex items-center justify-center w-20 h-20 rounded-full mb-2 border-4 border-black",
                winner === 1 ? "bg-cyan-500" : "bg-red-500"
              )}
            >
              <span className="text-white text-3xl font-black">{winner}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-20 h-20 rounded-full mb-2 bg-yellow-400 border-4 border-black">
              <span className="text-white text-3xl">🤝</span>
            </div>
          )}

          <h3 className="text-2xl font-black uppercase">
            {winner ? `Player ${winner} Wins!` : "It's a tie!"}
          </h3>
          
          <p className="text-gray-700 font-bold">{message}</p>
          
          <button 
            className="cartoon-button mt-4 w-full bg-green-400"
            onClick={onContinue}
          >
            CONTINUE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameResult;
