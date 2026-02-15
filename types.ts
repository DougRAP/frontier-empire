export enum ResourceType {
  WOOD = 'WOOD',
  BRICK = 'BRICK',
  ORE = 'ORE',
  EMPTY = 'EMPTY'
}

export interface HexCoordinates {
  q: number;
  r: number;
  s: number;
}

export interface Tile {
  id: string;
  coords: HexCoordinates;
  resource: ResourceType;
  number: number; // 1-6
  level: number; // 0 = unowned/ghost, 1 = settlement, 2 = city
  isUnlockable: boolean; // Can be bought initially
}

export interface Inventory {
  [ResourceType.WOOD]: number;
  [ResourceType.BRICK]: number;
  [ResourceType.ORE]: number;
  coins: number;
  gems: number;
  // Premium Items
  item_supply: number;
  item_totem: number;
  item_reroll: number;
}

export interface GameTool {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'coins' | 'gems';
  icon: any; // React Component
}

export interface GameStats {
  turnsPlayed: number;
  resourcesGathered: number;
  toolsPurchased: number;
  hintsUsed: number;
  premiumItemsUsed: number;
  coachConsultations: number;
}

export interface PlayerGroup {
  id: string; // The invite code
  name: string;
  memberCount: number;
  createdAt: number;
}

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastLoginDate: string; // YYYY-MM-DD local
}

export interface LeaderboardEntry {
  id: string;
  playerName?: string;
  date: number;
  score: number;
  stats: GameStats;
}

export interface GameState {
  tiles: Tile[];
  inventory: Inventory;
  lastRoll: number | null;
  turn: number;
  message: string | null;
  activeToolEffect: string | null; // e.g., 'production_boom'
  harvestTotemTurns: number; // Remaining turns for the premium buff
}

export type HintRequest = {
  inventory: Inventory;
  tiles: Tile[];
  costs: any;
};

export type CoachPersonality = 'mentor' | 'tough' | 'professor';

export interface GameStateSummary {
  turn: number;
  inventory: Inventory;
  tiles: Tile[];
  streak: StreakState | null;
  recentActions: string[];
  activeToolEffect: string | null;
  harvestTotemTurns: number;
}