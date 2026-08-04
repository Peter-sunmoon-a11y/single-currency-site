import type { GradientColor } from "@/sections/bonus/styles";

// API Response structure
export interface ConquestAPITask {
  id: number;
  game_tag: string;
  type: string;
  name: string;
  description: string;
  note: string;
  key: string;
  reward_amount: string;
  reward_currency: string;
  created_at: number;
  updated_at: number;
  handle_status: number;
  version: number;
  is_daily: number;
  is_finish: number;
  bet_amount?: number;
  total_bet_amount?: number;
  win_amount?: number;
  total_win_amount?: number;
}

// Component task format
export interface ConquestTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradientColor: GradientColor;
  reward: string;
  progress: number;
  completed: boolean;
  category?: string;
  path?: string;
}

// Task configuration types
interface TaskConfig {
  icon: string;
  category: string;
  path?: string;
}

// Task configuration mappings
const CONQUEST_TASK_CONFIG: Record<string, TaskConfig> = {
  "slots master": {
    icon: "/images/games/achievements/slots-master.svg",
    category: "slots-master",
    path: "/explore?type=slots&category=all",
  },
  "gameshow master": {
    icon: "/images/games/achievements/gameshow-master.png",
    category: "gameshow-master",
  },
  "blackjack master": {
    icon: "/images/games/achievements/blackjack-master.svg",
    category: "blackjack-master",
    path: "/explore?type=liveCasino&category=blackjack",
  },
  "baccarat master": {
    icon: "/images/games/achievements/baccarat-master.svg",
    category: "baccarat-master",
    path: "/explore?type=liveCasino&category=baccarat",
  },
  "roulette master": {
    icon: "/images/games/achievements/roulette-master.svg",
    category: "roulette-master",
    path: "/explore?type=liveCasino&category=roulette",
  },
  "just wager": {
    icon: "/images/games/achievements/just-wager.svg",
    category: "daily-wager",
    path: "/explore?type=casino",
  },
  "big win": {
    icon: "/images/games/achievements/big-win.svg",
    category: "big-multiplier",
    path: "/explore?type=casino",
  },
  "huge win": {
    icon: "/images/games/achievements/big-win.svg",
    category: "big-multiplier",
    path: "/explore?type=casino",
  },
  "massive win": {
    icon: "/images/games/achievements/massive-win.svg",
    category: "big-multiplier",
    path: "/explore?type=casino",
  },
};

const GAME_TAG_CONFIG: Record<string, TaskConfig> = {
  slots: {
    icon: "/images/games/achievements/slots-master.svg",
    category: "slots",
  },
  gameshow: {
    icon: "/images/games/achievements/gameshow-master.png",
    category: "gameshow",
  },
  blackjack: {
    icon: "/images/games/achievements/blackjack-master.svg",
    category: "blackjack",
  },
  baccarat: {
    icon: "/images/games/achievements/baccarat-master.svg",
    category: "baccarat",
  },
  roulette: {
    icon: "/images/games/achievements/roulette-master.svg",
    category: "roulette",
  },
};

const TASK_TYPE_CONFIG: Record<string, TaskConfig> = {
  wager: {
    icon: "/images/games/achievements/daily-wager.png",
    category: "wager",
  },
  multiplier: {
    icon: "/images/games/achievements/big-win.png",
    category: "multiplier",
  },
};

const DEFAULT_TASK_CONFIG: TaskConfig = {
  icon: "/images/games/achievements/default.png",
  category: "default",
};

/**
 * Get task configuration based on task name, game tag, and type
 */
const getTaskConfig = (taskName: string, gameTag: string, type: string): TaskConfig => {
  const lowerTaskName = taskName.toLowerCase();
  const lowerGameTag = gameTag.toLowerCase();
  const lowerType = type.toLowerCase();

  // 1. Priority: exact match by task name
  for (const [key, config] of Object.entries(CONQUEST_TASK_CONFIG)) {
    if (lowerTaskName.includes(key)) {
      return config;
    }
  }

  // 2. Fallback by game_tag
  const gameTagConfig = GAME_TAG_CONFIG[lowerGameTag];
  if (gameTagConfig) {
    return gameTagConfig;
  }

  // 3. Fallback by type
  for (const [key, config] of Object.entries(TASK_TYPE_CONFIG)) {
    if (lowerType.includes(key)) {
      return config;
    }
  }

  // 4. Default configuration
  return DEFAULT_TASK_CONFIG;
};

/**
 * Calculate progress percentage from API task data
 */
const calculateProgress = (apiTask: ConquestAPITask): number => {
  let progress = 0;

  if (apiTask.total_bet_amount && apiTask.bet_amount !== undefined) {
    progress = (apiTask.bet_amount / apiTask.total_bet_amount) * 100;
  } else if (apiTask.total_win_amount && apiTask.win_amount !== undefined) {
    progress = (apiTask.win_amount / apiTask.total_win_amount) * 100;
  }

  return Math.min(progress, 100); // Ensure progress doesn't exceed 100%
};

/**
 * Convert API task data to component format
 */
export const convertAPITaskToConquestTask = (apiTask: ConquestAPITask): ConquestTask => {
  const config = getTaskConfig(apiTask.name, apiTask.game_tag, apiTask.type);
  const progress = calculateProgress(apiTask);

  return {
    id: apiTask.id.toString(),
    title: apiTask.name,
    description: apiTask.description,
    icon: config.icon,
    gradientColor: "orange" as GradientColor, // Will be overridden by color extraction
    reward: `${apiTask.reward_amount} ${apiTask.reward_currency}`,
    progress,
    completed: apiTask.is_finish === 1,
    category: config.category,
    path: config?.path,
  };
};

/**
 * Convert array of API tasks to component format
 */
export const formatConquestTasksData = (apiTasks: ConquestAPITask[]): ConquestTask[] => {
  return apiTasks.map(convertAPITaskToConquestTask);
};
