
import { GameConfig } from "../types/game";

export const games: GameConfig[] = [
  {
    id: "findDog",
    name: "Find the Dog",
    description: "Find the dog among the pandas as fast as possible!",
    icon: "🐼🐶",
    enabled: true,
    duration: 10000,
  },
  {
    id: "findSad",
    name: "Find the Sad Face",
    description: "Spot the sad face among the happy ones!",
    icon: "🙂☹️",
    enabled: true,
    duration: 10000,
  },
  {
    id: "plusMinus",
    name: "Plus or Minus",
    description: "Tap when there are more plus signs than minus signs!",
    icon: "➕➖",
    enabled: true,
    duration: 15000,
  },
  {
    id: "correctColor",
    name: "Correct Color",
    description: "Tap when the screen shows the right color!",
    icon: "🎨",
    enabled: true,
    duration: 10000,
  },
  {
    id: "changingNumbers",
    name: "Changing Numbers",
    description: "Tap when you see a number greater than 50!",
    icon: "🔢",
    enabled: true,
    duration: 10000,
  },
  {
    id: "tapFast",
    name: "Tap Fast",
    description: "Tap as fast as you can to win!",
    icon: "👏",
    enabled: true,
    duration: 5000,
  }
];

export const getRandomGames = (count = 6): GameConfig[] => {
  const enabledGames = games.filter(game => game.enabled);
  const shuffled = [...enabledGames].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, enabledGames.length));
};

export const getDefaultSelectedGames = (): string[] => {
  return getRandomGames().map(game => game.id);
};
