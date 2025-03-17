
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGameSession } from "@/hooks/useGameSession";
import { GameSessionContext } from "@/context/GameSessionContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GameScreen from "./pages/GameScreen";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const GameSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const gameSession = useGameSession();
  
  return (
    <GameSessionContext.Provider value={gameSession}>
      {children}
    </GameSessionContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameSessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/play" element={<GameScreen />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameSessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
