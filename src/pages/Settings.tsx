
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGameSession } from "@/hooks/useGameSession";
import { ArrowLeft, Check, X } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { gameConfigs, toggleGameEnabled } = useGameSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-2">Game Selection</h2>
            <p className="text-muted-foreground mb-6">
              Enable or disable games for your gaming sessions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gameConfigs.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    game.enabled
                      ? "bg-white shadow-md border-primary/20"
                      : "bg-muted/50 border-muted"
                  }`}
                  onClick={() => toggleGameEnabled(game.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-3xl mb-3">{game.icon}</div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        game.enabled
                          ? "bg-primary text-white"
                          : "bg-muted border"
                      }`}
                    >
                      {game.enabled ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold">{game.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {game.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Button onClick={() => navigate(-1)}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
