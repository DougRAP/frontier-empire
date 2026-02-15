import React from 'react';
import { Flame, Calendar, Coins, X, Gem } from 'lucide-react';
import { StreakState } from '../types';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakData: StreakState | null;
}

export default function StreakModal({ isOpen, onClose, streakData }: StreakModalProps) {
  if (!isOpen || !streakData) return null;

  const bonusCoins = Math.min(3, streakData.currentStreak);
  const bonusGems = (streakData.currentStreak > 0 && streakData.currentStreak % 3 === 0) ? 2 : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center px-8 pb-10">
          {/* Flame Icon */}
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center 
              ${streakData.currentStreak > 2 ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.3)]' : 'bg-slate-800 text-slate-500'} 
              transition-all duration-500`}>
              <Flame size={48} strokeWidth={2} fill={streakData.currentStreak > 0 ? "currentColor" : "none"} />
            </div>
            {streakData.currentStreak > 0 && (
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    Day {streakData.currentStreak}
                </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Daily Streak</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-[200px] leading-relaxed">
            Log in every day to keep your flame lit and earn bonus coins!
          </p>

          {/* Stats Box */}
          <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex justify-between items-center mb-6">
            <div className="flex flex-col items-center flex-1 border-r border-slate-700/50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current</span>
              <span className="text-2xl font-black text-white">{streakData.currentStreak}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Best</span>
              <span className="text-2xl font-black text-orange-400">{streakData.bestStreak}</span>
            </div>
          </div>

          {/* Reward Info */}
          <div className="w-full space-y-3">
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                  <Coins size={20} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-emerald-100">Coin Bonus</div>
                  <div className="text-xs text-emerald-400/80">Every day</div>
                </div>
              </div>
              <div className="text-xl font-black text-white">+{bonusCoins}</div>
            </div>

            {bonusGems > 0 && (
              <div className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
                    <Gem size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-cyan-100">Gem Bonus</div>
                    <div className="text-xs text-cyan-400/80">Every 3rd day</div>
                  </div>
                </div>
                <div className="text-xl font-black text-white">+{bonusGems}</div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}