import React from 'react';
import { TOOLS } from '../constants';
import { GameTool, Inventory } from '../types';
import { X, Coins, ArrowRight } from 'lucide-react';

interface ToolShopProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  onBuy: (tool: GameTool) => void;
}

const ToolShop: React.FC<ToolShopProps> = ({ isOpen, onClose, inventory, onBuy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl sm:rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Coins className="text-amber-400 fill-amber-400/20" /> Tool Shop
            </h2>
            <p className="text-slate-400 text-sm mt-1">Spend coins to boost production</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors active:scale-90"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 no-scrollbar pb-safe-bottom">
          <div className="flex justify-between items-center px-2 py-1 mb-2">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your Balance</span>
            <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
              {inventory.coins} <Coins size={16} />
            </span>
          </div>
          
          {TOOLS.map((tool) => {
            const canAfford = inventory.coins >= tool.cost;
            const Icon = tool.icon;
            
            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (canAfford) {
                    onBuy(tool);
                    onClose();
                  }
                }}
                disabled={!canAfford}
                className={`w-full text-left group flex items-center p-4 rounded-2xl border transition-all duration-200
                  ${canAfford 
                    ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50 hover:shadow-lg active:scale-[0.98]' 
                    : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
                  }`}
              >
                {/* Icon Box */}
                <div className={`p-4 rounded-xl mr-4 transition-colors ${canAfford ? 'bg-slate-700 group-hover:bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-600'}`}>
                  {/* @ts-ignore */}
                  <Icon size={28} />
                </div>
                
                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg truncate ${canAfford ? 'text-slate-100' : 'text-slate-500'}`}>{tool.name}</h3>
                  <p className="text-xs text-slate-400 leading-snug mt-1 line-clamp-2">{tool.description}</p>
                </div>
                
                {/* Cost/Action */}
                <div className="ml-3 flex flex-col items-end gap-1">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5
                    ${canAfford 
                      ? 'bg-amber-500 text-slate-900 group-hover:bg-amber-400' 
                      : 'bg-slate-800 text-slate-500'
                    }`}>
                    {tool.cost} <Coins size={14} strokeWidth={3} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ToolShop;