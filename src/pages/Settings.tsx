import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Plus, Minus, Clock, Globe } from "lucide-react";
import { useGameSessionContext } from "@/context/GameSessionContext";
import { useLanguage, SupportedLanguage } from "@/context/LanguageContext";
import { toast } from "@/components/ui/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { gameConfigs, toggleGameEnabled, updateGameDuration } = useGameSessionContext();
  const { currentLanguage, setLanguage, t } = useLanguage();
  
  // Handle game toggle with auto-save
  const handleToggleGame = (gameId: string) => {
    toggleGameEnabled(gameId);
    toast({
      description: t('settingsSaved'),
      duration: 1500,
    });
  };

  // Handle duration change
  const handleChangeDuration = (gameId: string, change: number) => {
    const game = gameConfigs.find(g => g.id === gameId);
    if (!game) return;
    
    const currentDurationInSeconds = Math.floor((game.duration || 10000) / 1000);
    const newDurationInSeconds = Math.max(5, Math.min(60, currentDurationInSeconds + change));
    const newDurationInMs = newDurationInSeconds * 1000;
    
    updateGameDuration(gameId, newDurationInMs);
    
    toast({
      description: t('gameDuration').replace('{seconds}', newDurationInSeconds.toString()),
      duration: 1500,
    });
  };

  // שינוי שפה
  const changeLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    toast({
      description: t('settingsSaved'),
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7758d1] to-[#4f35a3] flex flex-col">
      <div className="p-4 border-b-4 border-black bg-black">
        <div className="flex items-center max-w-4xl mx-auto">
          <button
            className="w-10 h-10 rounded-full bg-white text-black border-2 border-black flex items-center justify-center mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-black text-white uppercase">{t('settings')}</h1>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* הגדרות שפה */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-black mb-2 text-white uppercase flex items-center">
              <Globe className="mr-2" />
              {t('languageSettings')}
            </h2>
            <p className="text-white/80 mb-4 font-bold">
              {t('selectLanguageDesc')}
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => changeLanguage('he')}
                className={`px-4 py-3 rounded-lg font-bold transition ${
                  currentLanguage === 'he' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/80 text-gray-800 hover:bg-white'
                }`}
              >
                {t('hebrew')}
              </button>
              
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-3 rounded-lg font-bold transition ${
                  currentLanguage === 'en' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/80 text-gray-800 hover:bg-white'
                }`}
              >
                {t('english')}
              </button>
            </div>
          </motion.div>

          {/* בחירת משחקים */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-2xl font-black mb-2 text-white uppercase">{t('gameSelection')}</h2>
            <p className="text-white/80 mb-6 font-bold">
              {t('gameSelectionDesc')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gameConfigs.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`game-card transition-all duration-300 ${
                    game.enabled
                      ? "bg-white"
                      : "bg-gray-200"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="text-4xl mb-3">{game.icon}</div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-black cursor-pointer ${
                          game.enabled
                            ? "bg-green-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => handleToggleGame(game.id)}
                      >
                        {game.enabled ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-black uppercase">{t(game.id)}</h3>
                    <p className="text-sm text-gray-700 mt-1 mb-3">
                      {t(`${game.id}Desc`)}
                    </p>
                    
                    {/* בקרת זמן משחק */}
                    <div className="mt-3 flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm font-bold">
                          {Math.floor((game.duration || 10000) / 1000)} {t('seconds')}
                        </span>
                      </div>
                      
                      <div className="flex">
                        <button
                          className="w-8 h-8 rounded-l-md bg-red-400 text-white border border-red-500 hover:bg-red-500 flex items-center justify-center"
                          onClick={() => handleChangeDuration(game.id, -5)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          className="w-8 h-8 rounded-r-md bg-green-400 text-white border border-green-500 hover:bg-green-500 flex items-center justify-center"
                          onClick={() => handleChangeDuration(game.id, 5)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="p-4 border-t-4 border-black bg-black">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button 
            className="cartoon-button bg-green-400"
            onClick={() => navigate(-1)}
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
