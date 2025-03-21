import React from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/game";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onContinue}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="cartoon-border bg-white p-6 text-center max-w-xs mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {winner ? (
          <>
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl font-bold text-white ${winner === 1 ? "bg-cyan-500" : "bg-red-500"}`}>
              {winner}
            </div>
            <h2 className="text-2xl font-black mb-3 uppercase">
              {t('playerWins').replace('{player}', winner.toString())}
            </h2>
          </>
        ) : (
          <>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl font-bold text-white bg-gray-500">
              =
            </div>
            <h2 className="text-2xl font-black mb-3 uppercase">
              {t('draw')}
            </h2>
          </>
        )}
        
        <p className="text-gray-700 mb-6 font-bold">
          {message}
        </p>
        
        <button
          className="cartoon-button bg-blue-500 w-full"
          onClick={onContinue}
        >
          {t('continueText')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GameResult;
