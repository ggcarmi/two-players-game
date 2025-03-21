import { useState, useEffect } from "react";
import { GameConfig, Player, GameResult } from "@/types/game";
import { games } from "@/data/games";

export const useGameSession = () => {
  // Load game configs from localStorage or use defaults
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>(() => {
    const savedConfigs = localStorage.getItem('gameConfigs');
    return savedConfigs ? JSON.parse(savedConfigs) : games;
  });
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Initialize selected games on mount and when gameConfigs change
  useEffect(() => {
    const enabledGames = gameConfigs.filter(game => game.enabled).map(game => game.id);
    setSelectedGames(enabledGames);
  }, [gameConfigs]);
  
  // Ensure game list updates at the beginning of each game session
  useEffect(() => {
    if (currentGameIndex === 0 && !isSessionComplete) {
      const enabledGames = gameConfigs.filter(game => game.enabled).map(game => game.id);
      setSelectedGames(enabledGames);
    }
  }, [currentGameIndex, isSessionComplete, gameConfigs]);
  
  // Check for force reload flag from home screen
  useEffect(() => {
    const forceReload = localStorage.getItem('forceGameConfigReload');
    if (forceReload === 'true') {
      // Clear the flag
      localStorage.removeItem('forceGameConfigReload');
      
      // Reload game configs from localStorage
      const savedConfigs = localStorage.getItem('gameConfigs');
      if (savedConfigs) {
        const configs = JSON.parse(savedConfigs);
        setGameConfigs(configs);
        
        // Update selected games based on enabled status
        const enabledGames = configs.filter(game => game.enabled).map(game => game.id);
        setSelectedGames(enabledGames);
      }
    }
  }, []);

  const currentGame = selectedGames.length > 0 && currentGameIndex < selectedGames.length
    ? gameConfigs.find(game => game.id === selectedGames[currentGameIndex])
    : null;

  const setWinner = (winner: Player | null, timeElapsed: number) => {
    if (winner) {
      if (winner === 1) setPlayer1Score(prev => prev + 1);
      if (winner === 2) setPlayer2Score(prev => prev + 1);
    }

    setResults(prev => [...prev, {
      winner,
      player1Score,
      player2Score,
      timeElapsed
    }]);

    if (currentGameIndex + 1 >= selectedGames.length) {
      setIsSessionComplete(true);
    } else {
      setCurrentGameIndex(prev => prev + 1);
    }
  };

  const resetSession = (newSelectedGames?: string[]) => {
    // Reload game configs from localStorage
    const savedConfigs = localStorage.getItem('gameConfigs');
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs);
      setGameConfigs(configs);
    }
    
    setCurrentGameIndex(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setResults([]);
    setIsSessionComplete(false);
    if (newSelectedGames) {
      setSelectedGames(newSelectedGames);
    }
  };

  const toggleGameEnabled = (gameId: string) => {
    setGameConfigs(prev => {
      const newConfigs = prev.map(game =>
        game.id === gameId
          ? { ...game, enabled: !game.enabled }
          : game
      );
      
      // Save to localStorage
      localStorage.setItem('gameConfigs', JSON.stringify(newConfigs));
      return newConfigs;
    });
  };

  // הוספת פונקציה חדשה לעדכון זמן משחק
  const updateGameDuration = (gameId: string, duration: number) => {
    setGameConfigs(prev => {
      const newConfigs = prev.map(game =>
        game.id === gameId
          ? { ...game, duration: duration }
          : game
      );
      
      // שמירה ב-localStorage
      localStorage.setItem('gameConfigs', JSON.stringify(newConfigs));
      return newConfigs;
    });
  };

  return {
    gameConfigs,
    selectedGames,
    currentGame,
    currentGameIndex,
    player1Score,
    player2Score,
    results,
    isSessionComplete,
    setWinner,
    resetSession,
    toggleGameEnabled,
    updateGameDuration
  };
};