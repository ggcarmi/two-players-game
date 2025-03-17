
export type Player = 1 | 2;

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  duration?: number;
}

export interface GameResult {
  winner: Player | null;
  player1Score: number;
  player2Score: number;
  timeElapsed: number;
}

export interface SessionState {
  gameConfigs: GameConfig[];
  selectedGames: string[];
  currentGameIndex: number;
  player1Score: number;
  player2Score: number;
  results: GameResult[];
  isSessionComplete: boolean;
}
