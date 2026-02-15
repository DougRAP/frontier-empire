import React, { useState, useEffect } from 'react';
import { X, Trophy, Trash2, Calendar, Medal, Users, User, Loader2, Share2, Check } from 'lucide-react';
import { LeaderboardEntry, PlayerGroup } from '../types';
import { leaderboardService } from '../services/leaderboardService';
import { groupService } from '../services/groupService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: PlayerGroup | null;
}

type Tab = 'local' | 'group';

export default function LeaderboardModal({ isOpen, onClose, currentGroup }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('local');
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Effect to load scores when tab or open state changes
  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'local') {
      setScores(leaderboardService.getScores());
      setLoading(false);
    } else if (activeTab === 'group') {
      if (currentGroup) {
        setLoading(true);
        groupService.getLeaderboard(currentGroup.id)
          .then(data => {
            setScores(data);
          })
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
      } else {
        setScores([]);
        setLoading(false);
      }
    }
  }, [isOpen, activeTab, currentGroup]);

  const handleClear = () => {
    if (activeTab === 'local' && confirm("Are you sure you want to clear your local high scores?")) {
      leaderboardService.clearLeaderboard();
      setScores([]);
    }
  };

  const handleShare = () => {
    // Find top score for 'You'
    const myEntryIndex = scores.findIndex(s => s.playerName === 'You');
    const myEntry = scores[myEntryIndex];
    
    if (!myEntry) return;

    let text = '';
    if (activeTab === 'group' && currentGroup) {
        text = `I'm ranked #${myEntryIndex + 1} in '${currentGroup.name}'! 🛡️\nScore: ${myEntry.score.toLocaleString()}\nJoin me in Hex Settler using code: ${currentGroup.id}`;
    } else {
        text = `My high score in Hex Settler Solo is ${myEntry.score.toLocaleString()}! 🏰\nCan you do better?`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Determine if share should be visible (user has a score)
  const userHasScore = scores.some(s => s.playerName === 'You');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900 rounded-t-3xl sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="text-amber-400" size={24} />
              Leaderboard
            </h2>
            <div className="flex items-center gap-2">
                {userHasScore && (
                    <button 
                        onClick={handleShare}
                        className={`p-2 rounded-full transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        title="Share Stats"
                    >
                        {copied ? <Check size={20} /> : <Share2 size={20} />}
                    </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
                  <X size={20} />
                </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${activeTab === 'local' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <User size={16} /> Local
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${activeTab === 'group' ? 'bg-blue-600/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <Users size={16} /> Group
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Loader2 size={32} className="animate-spin mb-2 text-blue-500" />
              <p>Loading scores...</p>
            </div>
          ) : activeTab === 'group' && !currentGroup ? (
            <div className="flex flex-col items-center justify-center h-56 text-slate-400 text-center p-4">
              <Users size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-white mb-2">No Group Joined</p>
              <p className="text-sm mb-4">Join or create a group to see how you stack up against friends!</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Trophy size={48} className="mb-4 opacity-20" />
              <p>No scores yet.</p>
              <p className="text-xs mt-2">Play a game to set the bar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((entry, index) => (
                <div 
                  key={entry.id + index} 
                  className={`relative p-3 rounded-2xl border flex items-center justify-between
                    ${entry.playerName === 'You' ? 'bg-slate-800/80 border-slate-600 ring-1 ring-slate-500/50' : 'bg-slate-900 border-slate-800'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0
                      ${index === 0 ? 'bg-amber-400 text-amber-900' : 
                        index === 1 ? 'bg-slate-300 text-slate-900' : 
                        index === 2 ? 'bg-orange-400 text-orange-900' : 'bg-slate-800 text-slate-500'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <span className={`font-bold ${entry.playerName === 'You' ? 'text-blue-400' : 'text-slate-300'}`}>
                            {entry.playerName || 'Unknown'}
                         </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        <span>{entry.score.toLocaleString()} PTS</span>
                        <span>•</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {index === 0 && <Medal size={20} className="text-amber-400" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (Only for local clearing) */}
        {activeTab === 'local' && scores.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-3xl">
            <button 
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-bold transition-colors"
            >
              <Trash2 size={16} /> Clear Local Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}