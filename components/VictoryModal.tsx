import React, { useMemo, useState } from 'react';
import { Trophy, Clock, Pickaxe, HelpCircle, LayoutGrid, RotateCcw, Share2, Copy, Check, Bot } from 'lucide-react';
import { GameStats } from '../types';
import { leaderboardService } from '../services/leaderboardService';

interface VictoryModalProps {
  gameWon: boolean;
  stats: GameStats;
  streak: number;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ gameWon, stats, streak }) => {
  const [copied, setCopied] = useState(false);

  // Use the shared scoring service to ensure consistency
  const score = useMemo(() => {
    return leaderboardService.calculateScore(stats);
  }, [stats]);

  if (!gameWon) return null;

  const shareText = `I scored ${score.toLocaleString()} in Hex Settler Solo! 🏆\nStreak: ${streak} days 🔥\nCan you beat me?`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-700 p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 p-6 sm:p-8 rounded-3xl flex flex-col items-center max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header Icon */}
        <div className="bg-amber-500/20 p-5 rounded-full mb-4 ring-4 ring-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <Trophy size={48} className="text-amber-400" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">Victory!</h2>
        <p className="text-slate-400 text-sm mb-6">Island Settled</p>

        {/* Score Card */}
        <div className="w-full bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Session Score</span>
          <span className="text-4xl font-black text-white tracking-tight">{score.toLocaleString()}</span>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <StatItem icon={Clock} label="Turns" value={stats.turnsPlayed} />
          <StatItem icon={LayoutGrid} label="Resources" value={stats.resourcesGathered} />
          <StatItem icon={Pickaxe} label="Tools" value={stats.toolsPurchased} />
          <StatItem icon={HelpCircle} label="Hints" value={stats.hintsUsed} color="text-indigo-400" />
          {stats.coachConsultations > 0 && (
            <StatItem icon={Bot} label="Coach Tips" value={stats.coachConsultations} color="text-indigo-400" />
          )}
        </div>

        {/* Share Section */}
        <div className="w-full bg-slate-800 rounded-2xl p-3 mb-6 border border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Share2 size={12} /> Share Result
          </p>
          <div className="flex gap-2">
            <div className="bg-slate-950/50 rounded-xl p-3 text-xs text-slate-400 font-mono flex-1 truncate select-all border border-slate-800">
              {shareText}
            </div>
            <button 
              onClick={handleCopy}
              className={`px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${copied ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95'}
              `}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          Play Again
        </button>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, color = "text-slate-300" }: any) => (
  <div className="bg-slate-800 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-700/50">
    <div className="flex items-center gap-1.5 mb-1 opacity-80">
      <Icon size={14} className={color} />
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
    </div>
    <span className="text-xl font-bold text-slate-100">{value}</span>
  </div>
);

export default React.memo(VictoryModal);