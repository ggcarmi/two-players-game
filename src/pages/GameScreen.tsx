
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSession } from "@/hooks/useGameSession";
import { Player } from "@/types/game";
import FindDog from "@/games/FindDog";
import FindSad from "@/games/FindSad";
import TapFast from "@/games/TapFast";
import ChangingNumbers from "@/games/ChangingNumbers";
import CorrectColor from "@/games/CorrectColor";
import PlusMinus from "@/games/PlusMinus";
import { Button } from "@/components/ui/button";

const GameScreen = () => {
  const navigate = useNavigate();
  const {
    currentGame,
    currentGameIndex,
    selectedGames,
    player1Score,
    player2Score,
    setWinner,
    isSessionComplete,
    resetSession,
  } = useGameSession();
  
  useEffect(() => {
    if (selectedGames.length === 0) {
      navigate("/");
    }
  }, [selectedGames, navigate]);

  const handleGameComplete = (winner: Player | null, timeElapsed: number) => {
    console.log(`Game complete! Winner: ${winner}, Time: ${timeElapsed}`);
    setWinner(winner, timeElapsed);
  };

  // Render the current game component based on the game ID
  const renderGame = () => {
    if (!currentGame) {
      console.log("No current game to render");
      return null;
    }

    console.log(`Rendering game: ${currentGame.id}`);
    const commonProps = {
      onGameComplete: handleGameComplete,
      player1Score,
      player2Score,
      currentGame: currentGameIndex + 1,
      totalGames: selectedGames.length,
      maxTime: currentGame.duration,
    };

    switch (currentGame.id) {
      case "findDog":
        return <FindDog {...commonProps} />;
      case "findSad":
        return <FindSad {...commonProps} />;
      case "tapFast":
        return <TapFast {...commonProps} />;
      case "changingNumbers":
        return <ChangingNumbers {...commonProps} />;
      case "correctColor":
        return <CorrectColor {...commonProps} />;
      case "plusMinus":
        return <PlusMinus {...commonProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl mb-4">Game not implemented yet</h2>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </div>
          </div>
        );
    }
  };

  // Session complete screen
  if (isSessionComplete) {
    const isDraw = player1Score === player2Score;
    const winner = isDraw ? null : player1Score > player2Score ? 1 : 2;

    return (
      <div className="game-container">
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="glass-panel p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold mb-2">Game Session Complete!</h1>
            <div className="flex justify-center items-center gap-8 my-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-player1 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                  1
                </div>
                <div className="text-xl font-bold">{player1Score}</div>
              </div>
              
              <div className="text-4xl font-light">-</div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-player2 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                  2
                </div>
                <div className="text-xl font-bold">{player2Score}</div>
              </div>
            </div>
            
            {!isDraw && (
              <div className="text-xl font-bold mb-8">
                Player {winner} Wins!
              </div>
            )}
            
            {isDraw && (
              <div className="text-xl font-bold mb-8">
                It's a Draw!
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                onClick={() => resetSession()}
              >
                Play Again
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return renderGame();
};

export default GameScreen;
