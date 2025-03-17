
import { useState, useEffect, useCallback } from "react";
import { GameConfig, GameResult, SessionState, Player } from "../types/game";
import { getDefaultSelectedGames, allGames } from "../data/games";

export const useGameSession = () => {
  const [state, setState] = useState<SessionState>({
    gameConfigs: allGames,
    selectedGames: getDefaultSelectedGames(),
    currentGameIndex: 0,
    player1Score: 0,
    player2Score: 0,
    results: [],
    isSessionComplete: false,
  });

  // Determine the current game configuration based on the current index
  const currentGame = useCallback(() => {
    if (state.currentGameIndex >= state.selectedGames.length) {
      return null;
    }
    
    const currentGameId = state.selectedGames[state.currentGameIndex];
    return state.gameConfigs.find(game => game.id === currentGameId) || null;
  }, [state.currentGameIndex, state.selectedGames, state.gameConfigs]);

  // Record the result of a completed game
  const recordGameResult = useCallback((result: GameResult) => {
    setState(prev => {
      const newPlayer1Score = prev.player1Score + (result.winner === 1 ? 1 : 0);
      const newPlayer2Score = prev.player2Score + (result.winner === 2 ? 1 : 0);
      const newResults = [...prev.results, result];
      const newIndex = prev.currentGameIndex + 1;
      const isComplete = newIndex >= prev.selectedGames.length;

      return {
        ...prev,
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        results: newResults,
        currentGameIndex: newIndex,
        isSessionComplete: isComplete,
      };
    });
  }, []);

  // Set the winner of the current game
  const setWinner = useCallback((winner: Player | null, timeElapsed: number) => {
    const result: GameResult = {
      winner,
      player1Score: winner === 1 ? 1 : 0,
      player2Score: winner === 2 ? 1 : 0,
      timeElapsed,
    };
    recordGameResult(result);
  }, [recordGameResult]);

  // Reset the session to start a new set of games
  const resetSession = useCallback((selectedGames = getDefaultSelectedGames()) => {
    setState({
      gameConfigs: allGames,
      selectedGames,
      currentGameIndex: 0,
      player1Score: 0,
      player2Score: 0,
      results: [],
      isSessionComplete: false,
    });
  }, []);

  // Toggle a game's enabled status
  const toggleGameEnabled = useCallback((gameId: string) => {
    setState(prev => {
      const updatedConfigs = prev.gameConfigs.map(game => 
        game.id === gameId ? { ...game, enabled: !game.enabled } : game
      );
      
      return {
        ...prev,
        gameConfigs: updatedConfigs
      };
    });
  }, []);

  return {
    ...state,
    currentGame: currentGame(),
    setWinner,
    resetSession,
    toggleGameEnabled,
  };
};
