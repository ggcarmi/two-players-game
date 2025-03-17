
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-player1 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-3">
                1
              </div>
              <div className="text-4xl font-bold">VS</div>
              <div className="w-16 h-16 bg-player2 rounded-full flex items-center justify-center text-white text-2xl font-bold ml-3">
                2
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            QuickPlay Duel
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mb-8 max-w-md mx-auto"
          >
            Lightning-fast reaction games for two players on the same device. Test your reflexes!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold"
              onClick={() => navigate("/play")}
            >
              <Play className="mr-2 h-5 w-5" /> Play Now
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-5 w-5" /> Settings
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="p-4 text-center text-sm text-muted-foreground"
      >
        <p>Fast-paced mini-games for two players</p>
      </motion.div>
    </div>
  );
};

export default Index;
