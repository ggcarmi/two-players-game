
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import { useGameSession } from "@/hooks/useGameSession";

const Settings = () => {
  const navigate = useNavigate();
  const { gameConfigs, toggleGameEnabled } = useGameSession();

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
          <h1 className="text-xl font-black text-white uppercase">Settings</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-black mb-2 text-white uppercase">Game Selection</h2>
            <p className="text-white/80 mb-6 font-bold">
              Enable or disable games for your gaming sessions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gameConfigs.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`game-card cursor-pointer transition-all duration-300 ${
                    game.enabled
                      ? "bg-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => toggleGameEnabled(game.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="text-4xl mb-3">{game.icon}</div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-black ${
                          game.enabled
                            ? "bg-green-500 text-white"
                            : "bg-white"
                        }`}
                      >
                        {game.enabled ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-black uppercase">{game.name}</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {game.description}
                    </p>
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
            SAVE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
