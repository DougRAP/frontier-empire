import { GameStats, LeaderboardEntry } from "../types";

const LEADERBOARD_KEY = 'hex_settler_leaderboard';

export const leaderboardService = {
  calculateScore(stats: GameStats): number {
    const base = 1000;
    const turnPenalty = stats.turnsPlayed * 10;
    const resBonus = stats.resourcesGathered * 5;
    const toolBonus = stats.toolsPurchased * 20;
    const hintPenalty = stats.hintsUsed * 50;

    return Math.max(0, base - turnPenalty + resBonus + toolBonus - hintPenalty);
  },

  getScores(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse leaderboard", e);
      return [];
    }
  },

  saveScore(stats: GameStats): LeaderboardEntry {
    const score = this.calculateScore(stats);
    const entry: LeaderboardEntry = {
      id: Math.random().toString(36).substring(2, 15),
      playerName: "You",
      date: Date.now(),
      score,
      stats
    };

    const currentScores = this.getScores();
    currentScores.push(entry);
    
    // Sort descending by score
    currentScores.sort((a, b) => b.score - a.score);
    
    // Keep top 50
    const trimmed = currentScores.slice(0, 50);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    return entry;
  },

  clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
  }
};