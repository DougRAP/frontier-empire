import React from 'react';
import { Inventory, ResourceType } from '../types';
import { Trees, BrickWall, Mountain, Coins, Info, Users, Flame, Trophy, Gem, Bot } from 'lucide-react';

interface ResourceBarProps {
  inventory: Inventory;
  onHelp: () => void;
  onGroupClick?: () => void;
  streak?: number;
  onStreakClick?: () => void;
  onLeaderboardClick?: () => void;
  onGemClick?: () => void;
  onCoachClick?: () => void;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ 
  inventory, onHelp, onGroupClick, streak = 0, onStreakClick, onLeaderboardClick, onGemClick, onCoachClick
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pt-safe-top z-50 shadow-xl transition-all duration-300">
      <div className="max-w-lg mx-auto flex justify-between items-center px-4 py-3">
        {/* Resources Group */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-around">
          <ResourceItem icon={Trees} value={inventory[ResourceType.WOOD]} color="text-green-500" label="Wood" />
          <ResourceItem icon={BrickWall} value={inventory[ResourceType.BRICK]} color="text-red-500" label="Brick" />
          <ResourceItem icon={Mountain} value={inventory[ResourceType.ORE]} color="text-slate-400" label="Ore" />
        </div>
        
        <div className="h-10 w-px bg-slate-700 mx-1 sm:mx-3"></div>
        
        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          <button onClick={onGemClick} className="flex flex-col items-center justify-center min-w-[2.5rem] hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1 text-cyan-400 font-black text-lg leading-none filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              <Gem size={16} strokeWidth={2.5} fill="currentColor" className="opacity-20 absolute" />
              <Gem size={16} strokeWidth={2.5} />
              <span>{inventory.gems}</span>
            </div>
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Gems</span>
          </button>

          <ResourceItem icon={Coins} value={inventory.coins} color="text-amber-400" label="Coins" isCurrency />
          
          <div className="flex gap-1.5 ml-0.5">
             {/* Streak Button */}
             {onStreakClick && (
                <button
                  onClick={onStreakClick}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors
                    ${streak > 0 
                      ? 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500 hover:text-white' 
                      : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  aria-label="Daily Streak"
                >
                  <Flame size={16} strokeWidth={2.5} fill={streak > 0 ? "currentColor" : "none"} />
                </button>
             )}

             {onLeaderboardClick && (
              <button 
                onClick={onLeaderboardClick}
                className="w-8 h-8 rounded-full bg-slate-800 text-amber-500 border border-slate-700 flex items-center justify-center hover:text-white hover:bg-amber-600 transition-colors"
                aria-label="Leaderboard"
              >
                <Trophy size={16} strokeWidth={2.5} />
              </button>
            )}

             {onGroupClick && (
              <button 
                onClick={onGroupClick}
                className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center hover:text-white hover:bg-blue-600 transition-colors"
                aria-label="Friends"
              >
                <Users size={16} strokeWidth={2.5} />
              </button>
            )}

            {onCoachClick && (
                <button 
                onClick={onCoachClick}
                className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center hover:text-white hover:bg-indigo-600 transition-colors"
                aria-label="AI Coach"
              >
                <Bot size={16} strokeWidth={2.5} />
              </button>
            )}

            <button 
              onClick={onHelp}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Tutorial"
            >
              <Info size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceItem = ({ icon: Icon, value, color, label, isCurrency = false }: any) => (
  <div className="flex flex-col items-center justify-center min-w-[3rem]">
    <div className={`flex items-center gap-1 ${color} font-black ${isCurrency ? 'text-lg' : 'text-lg'} leading-none filter drop-shadow-sm`}>
      <Icon size={isCurrency ? 18 : 16} strokeWidth={2.5} />
      <span>{value}</span>
    </div>
    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{label}</span>
  </div>
);

export default ResourceBar;