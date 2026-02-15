import React from 'react';
import { ArrowLeftRight, X, Coins } from 'lucide-react';
import { RESOURCES } from '../constants';
import { Inventory, ResourceType } from '../types';

interface TradeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  onTrade: (res: ResourceType) => void;
  gameWon: boolean;
}

const TradeMenu: React.FC<TradeMenuProps> = ({ isOpen, onClose, inventory, onTrade, gameWon }) => {
  if (!isOpen || gameWon) return null;

  return (
    <div className="absolute bottom-[90px] left-0 right-0 z-30 px-4 animate-in slide-in-from-bottom-10 fade-in duration-200">
      <div className="max-w-md mx-auto bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-4 shadow-2xl ring-1 ring-white/10">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-slate-400" /> Market (3:1)
          </h3>
          <button 
            onClick={onClose}
            className="bg-slate-700/50 p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {RESOURCES.map(res => {
            const canTrade = inventory[res] >= 3;
            return (
              <button
                key={res}
                disabled={!canTrade}
                onClick={() => onTrade(res)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all active:scale-95
                  ${canTrade 
                    ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-200' 
                    : 'bg-slate-900/30 border-slate-800 opacity-40 text-slate-500'}`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">Sell 3</span>
                <span className="font-black text-lg mb-1">{res}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  +1 <Coins size={10} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TradeMenu);