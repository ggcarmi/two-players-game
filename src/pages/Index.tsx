
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Settings, Grid2x2 } from "lucide-react";

// Import Google Font
const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7758d1] to-[#4f35a3] flex flex-col">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <div className="game-ribbon w-24"></div>
        <div className="challenge-badge">
          the CHALLENGE
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Hand icons - stylized */}
        <div className="absolute left-0 top-1/4 w-32 h-32 -translate-x-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M30,20 Q40,20 50,30 Q60,40 60,60 Q60,80 40,90 Q20,100 10,80 Q0,60 10,40 Z" 
                  fill="#FFB280" stroke="#000" strokeWidth="4"/>
            <path d="M30,40 Q40,30 50,40 Q55,50 50,60" 
                  fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        
        <div className="absolute right-0 top-2/3 w-32 h-32 translate-x-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M70,20 Q60,20 50,30 Q40,40 40,60 Q40,80 60,90 Q80,100 90,80 Q100,60 90,40 Z" 
                  fill="#FFB280" stroke="#000" strokeWidth="4"/>
            <path d="M70,40 Q60,30 50,40 Q45,50 50,60" 
                  fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 200
            }}
            className="game-logo text-white mb-8"
          >
            2 PLAYER<br/>GAMES
          </motion.h1>
          
          <div className="game-ribbon w-full max-w-md mx-auto mb-12"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="max-w-md mx-auto space-y-4"
          >
            <button 
              className="cartoon-button w-full bg-white flex items-center justify-center gap-2 py-4 text-xl"
              onClick={() => navigate("/play")}
            >
              <Play className="h-6 w-6" /> PLAY NOW
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="cartoon-button bg-[#ffde54] flex items-center justify-center gap-2"
                onClick={() => navigate("/games")}
              >
                <Grid2x2 className="h-5 w-5" /> GAMES
              </button>
              
              <button 
                className="cartoon-button bg-[#54b4ff] flex items-center justify-center gap-2"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-5 w-5" /> SETTINGS
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="p-4 text-center"
      >
        <p className="text-white/70 font-bold">TAP FAST · WIN BIG</p>
      </motion.div>
    </div>
  );
};

export default Index;
