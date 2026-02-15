import React from 'react';
import { X, Gem, Sparkles } from 'lucide-react';
import { Inventory, GameTool } from '../types';
import { GEM_ITEMS } from '../constants';

interface GemShopProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  onBuyItem: (tool: GameTool) => void;
  onBuyGems: (amount: number) => void;
}

export default function GemShop({ isOpen, onClose, inventory, onBuyItem, onBuyGems }: GemShopProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Gem className="text-cyan-400 fill-cyan-400/20" />
              Gem Store
            </h2>
            <div className="text-sm text-cyan-400 font-bold flex items-center gap-1 mt-1">
               Balance: {inventory.gems} <Gem size={12} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          
          {/* IAP Packs (Mock) */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Get More Gems</h3>
            <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onBuyGems(50)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95"
                >
                    <Gem size={32} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <div className="text-center">
                        <div className="font-black text-white">50 Gems</div>
                        <div className="text-xs text-slate-400">$0.99</div>
                    </div>
                </button>
                <button 
                  onClick={() => onBuyGems(150)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-red-500 text-[10px] font-bold px-2 py-0.5 text-white rounded-bl-lg">POPULAR</div>
                    <div className="flex gap-1">
                        <Gem size={24} className="text-cyan-400" />
                        <Gem size={32} className="text-purple-400" />
                    </div>
                    <div className="text-center">
                        <div className="font-black text-white">150 Gems</div>
                        <div className="text-xs text-slate-400">$2.99</div>
                    </div>
                </button>
            </div>
          </div>

          {/* Premium Items */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Premium Tools</h3>
            <div className="space-y-3">
              {GEM_ITEMS.map((item) => {
                 const canAfford = inventory.gems >= item.cost;
                 const Icon = item.icon;
                 
                 return (
                  <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 flex items-center gap-3">
                     <div className="p-3 bg-slate-900 rounded-xl text-purple-400 border border-slate-800">
                        {/* @ts-ignore */}
                        <Icon size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-100">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">{item.description}</p>
                     </div>
                     <button
                       onClick={() => onBuyItem(item)}
                       disabled={!canAfford}
                       className={`px-3 py-2 rounded-xl font-bold text-sm flex flex-col items-center min-w-[70px] transition-all active:scale-95
                         ${canAfford ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                       `}
                     >
                        <span className="flex items-center gap-1">
                           {item.cost} <Gem size={12} fill="currentColor" />
                        </span>
                        <span className="text-[10px] font-normal opacity-80">BUY</span>
                     </button>
                  </div>
                 );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}