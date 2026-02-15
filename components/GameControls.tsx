import React from 'react';
import { ArrowLeftRight, ShoppingBag, HelpCircle, Dice5, Package, Sprout } from 'lucide-react';
import { Inventory } from '../types';

interface GameControlsProps {
  onRoll: () => void;
  isRolling: boolean;
  gameWon: boolean;
  activeToolEffect: string | null;
  harvestTotemTurns: number;
  isTradeOpen: boolean;
  onToggleTrade: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onGetHint: () => void;
  hintLoading: boolean;
  inventory: Inventory;
}

const GameControls: React.FC<GameControlsProps> = ({
  onRoll, isRolling, gameWon, activeToolEffect, harvestTotemTurns,
  isTradeOpen, onToggleTrade, onOpenShop, onOpenInventory,
  onGetHint, hintLoading, inventory
}) => {
  return (
    <div className="flex-none bg-slate-900 border-t border-slate-800 pb-safe-bottom z-40">
      <div className="flex items-center justify-between gap-3 p-3 max-w-lg mx-auto h-20">
        
        <ControlBtn 
          icon={ArrowLeftRight} 
          active={isTradeOpen}
          onClick={onToggleTrade}
          disabled={isRolling || gameWon}
          label="Trade"
        />
        
        <ControlBtn 
          icon={Package}
          onClick={onOpenInventory}
          disabled={isRolling || gameWon}
          label="Items"
        />

        {/* Main Roll Button */}
        <button 
          onClick={onRoll}
          disabled={isRolling || gameWon}
          className={`flex-[1.5] h-full rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all active:scale-[0.97]
            ${isRolling ? 'bg-slate-700 cursor-not-allowed' : (activeToolEffect ? 'bg-amber-500 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50')}`}
        >
          {harvestTotemTurns > 0 && (
             <div className="absolute top-1 right-2 flex items-center gap-1 text-[10px] font-bold bg-black/20 px-1.5 rounded-full">
                <Sprout size={10} /> {harvestTotemTurns}
             </div>
          )}
          
          <div className="flex items-center gap-2 z-10">
            <Dice5 size={28} className={isRolling ? 'animate-spin' : ''} strokeWidth={2.5} />
            <span className="font-black text-xl tracking-tight">
              {isRolling ? 'ROLLING' : (activeToolEffect ? 'LUCKY ROLL' : 'ROLL')}
            </span>
          </div>
          {!isRolling && !activeToolEffect && (
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">End Turn</span>
          )}
        </button>

        <ControlBtn 
          icon={ShoppingBag} 
          onClick={onOpenShop}
          disabled={isRolling || gameWon}
          label="Shop"
          badge={inventory.coins > 0}
        />

        <ControlBtn 
          icon={HelpCircle} 
          onClick={onGetHint}
          disabled={hintLoading || isRolling || gameWon}
          label="Hint"
          loading={hintLoading}
        />
      </div>
    </div>
  );
};

// Internal Helper
const ControlBtn = ({ icon: Icon, onClick, disabled, label, active, badge, loading }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`h-full aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all active:scale-95 relative
      ${active 
        ? 'bg-slate-700 border-slate-500 text-white' 
        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}
    `}
  >
    {loading ? (
      <span className="animate-spin text-xl">✨</span> 
    ) : (
      <>
        <Icon size={24} strokeWidth={2} />
        <span className="text-[10px] font-bold mt-1">{label}</span>
      </>
    )}
    {badge && (
      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-800"></span>
    )}
  </button>
);

export default React.memo(GameControls);