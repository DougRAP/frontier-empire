import { StreakState } from '../types';

const STREAK_KEY = 'hex_settler_streak';

export const getStreakState = (): StreakState => {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse streak data", e);
  }
  return { currentStreak: 0, bestStreak: 0, lastLoginDate: '' };
};

export const updateStreak = () => {
  const now = new Date();
  const todayStr = now.toDateString(); // Uses local time, sufficient for daily mechanics
  
  let state = getStreakState();
  let isNewDay = false;

  // Check if we already logged in today
  if (state.lastLoginDate !== todayStr) {
    isNewDay = true;
    const lastLogin = state.lastLoginDate ? new Date(state.lastLoginDate) : null;
    
    let isConsecutive = false;
    
    // Check if the last login was yesterday
    if (lastLogin) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Compare date strings to avoid hour/minute mismatches
      if (lastLogin.toDateString() === yesterday.toDateString()) {
        isConsecutive = true;
      }
    }

    if (isConsecutive) {
      state.currentStreak += 1;
    } else {
      // Reset if missed a day, or first time (streak becomes 1)
      state.currentStreak = 1;
    }

    state.lastLoginDate = todayStr;
    
    if (state.currentStreak > state.bestStreak) {
      state.bestStreak = state.currentStreak;
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(state));
  }

  // Calculate Daily Bonus:
  // Starts at 1 Coin, caps at 3 Coins (mild advantage)
  const bonusCoins = Math.min(3, state.currentStreak);
  
  // Bonus Gems: Every 3rd day (3, 6, 9...), get 2 Gems.
  const bonusGems = (state.currentStreak > 0 && state.currentStreak % 3 === 0) ? 2 : 0;

  return { state, bonusCoins, bonusGems, isNewDay };
};