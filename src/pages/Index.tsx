import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useGameSessionContext } from "@/context/GameSessionContext";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { resetSession, gameConfigs } = useGameSessionContext();
  const { t } = useLanguage();
  
  const handleStartGame = () => {
    resetSession();
    navigate("/play");
  };

  const handleGoToSettings = () => {
    navigate("/settings");
  };
  
  const enabledGamesCount = gameConfigs.filter(game => game.enabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7758d1] to-[#4f35a3] flex flex-col justify-center items-center p-4 lg:p-8">
      <div className="max-w-md w-full">
        <motion.div
          className="game-logo mb-8 text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <h1 className="text-5xl font-black text-white mb-2">2 PLAYERS</h1>
          <div className="text-2xl font-bold text-white flex justify-center">
            <div className="bg-cyan-500 px-3 py-1 rounded-l-md">
              {t('player1')}
            </div>
            <div className="bg-red-500 px-3 py-1 rounded-r-md">
              {t('player2')}
            </div>
          </div>
          
          <motion.div 
            className="mt-4 text-white/90 font-bold"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {enabledGamesCount > 0 ? (
              <p>
                {enabledGamesCount} {t('gamesSelected')}
              </p>
            ) : (
              <p className="text-yellow-300 animate-pulse">
                {t('noGamesSelected')}
              </p>
            )}
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleStartGame}
            className="cartoon-button bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:pointer-events-none"
            disabled={enabledGamesCount === 0}
          >
            {t('startGame')}
          </button>
          
          <button
            onClick={handleGoToSettings}
            className="cartoon-button bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center"
          >
            <Settings className="mr-2 h-5 w-5" />
            {t('settings')}
          </button>
        </motion.div>
        
        <motion.div
          className="mt-8 text-center text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm">
            {t('languageSupport')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
