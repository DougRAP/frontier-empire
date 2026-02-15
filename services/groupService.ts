import { PlayerGroup, LeaderboardEntry } from "../types";

const DB_KEY = 'hex_settler_groups_db';
const USER_KEY = 'hex_settler_user_group_id';
const SCORES_PREFIX = 'hex_settler_group_scores_';

// Simulate network delay for realistic feel
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const groupService = {
  /**
   * Get the current player's group from local storage.
   */
  async getCurrentGroup(): Promise<PlayerGroup | null> {
    await delay(300);
    const groupId = localStorage.getItem(USER_KEY);
    if (!groupId) return null;

    const db = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    return db[groupId] || null;
  },

  /**
   * Create a new group with a unique 6-character code.
   */
  async createGroup(name: string): Promise<PlayerGroup> {
    await delay(800); // Simulate server creation time
    
    // Generate simple 6-char ID (Mocking unique ID)
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newGroup: PlayerGroup = {
      id,
      name,
      memberCount: 1,
      createdAt: Date.now()
    };

    // Save to "DB"
    const db = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    db[id] = newGroup;
    localStorage.setItem(DB_KEY, JSON.stringify(db));

    // Update User session
    localStorage.setItem(USER_KEY, id);

    // Seed some mock scores for the new group so it's not empty
    const seedScores: LeaderboardEntry[] = [
      { id: 'bot1', playerName: 'Settler One', date: Date.now() - 100000, score: 850, stats: { turnsPlayed: 40, resourcesGathered: 100, toolsPurchased: 2, hintsUsed: 0, premiumItemsUsed: 0, coachConsultations: 0 } },
      { id: 'bot2', playerName: 'HexMaster', date: Date.now() - 500000, score: 1200, stats: { turnsPlayed: 35, resourcesGathered: 150, toolsPurchased: 5, hintsUsed: 0, premiumItemsUsed: 0, coachConsultations: 0 } }
    ];
    localStorage.setItem(SCORES_PREFIX + id, JSON.stringify(seedScores));

    return newGroup;
  },

  /**
   * Join an existing group by code.
   */
  async joinGroup(code: string): Promise<PlayerGroup> {
    await delay(800);
    const cleanCode = code.trim().toUpperCase();
    
    const db = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    const group = db[cleanCode];

    if (!group) {
      throw new Error("Group not found. Check the code and try again.");
    }

    // Simulate adding a member (In a real app, this would be handled by the server)
    // We only increment if joining a different group to avoid spamming self-joins
    const currentId = localStorage.getItem(USER_KEY);
    if (currentId !== cleanCode) {
        group.memberCount += 1;
        db[cleanCode] = group;
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    localStorage.setItem(USER_KEY, cleanCode);
    return group;
  },

  /**
   * Leave the current group.
   */
  async leaveGroup(): Promise<void> {
    await delay(400);
    const currentId = localStorage.getItem(USER_KEY);
    if (currentId) {
        const db = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
        if (db[currentId]) {
            // Simulate leaving
            db[currentId].memberCount = Math.max(1, db[currentId].memberCount - 1);
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        }
    }
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Submit a score to the group leaderboard.
   */
  async submitScore(groupId: string, entry: LeaderboardEntry): Promise<void> {
    await delay(600);
    const key = SCORES_PREFIX + groupId;
    const scores: LeaderboardEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Force playerName to "You" for consistency in this local view, 
    // or keep what was passed if we want to differentiate.
    // In a real app, the server would assign the user's name.
    scores.push(entry);
    
    // Sort
    scores.sort((a, b) => b.score - a.score);
    
    // Limit to top 100
    const trimmed = scores.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(trimmed));
  },

  /**
   * Get leaderboard for a group.
   */
  async getLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
    await delay(500);
    const key = SCORES_PREFIX + groupId;
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    return scores;
  }
};