import React from 'react';
import { X, Package } from 'lucide-react';
import { Inventory } from '../types';
import { GEM_ITEMS } from '../constants';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  onUseItem: (itemId: string) => void;
}

export default function InventoryModal({ isOpen, onClose, inventory, onUseItem }: InventoryModalProps) {
  if (!isOpen) return null;

  // Filter items to show only valid gem items
  const items = GEM_ITEMS.map(item => ({
    ...item,
    // @ts-ignore
    count: inventory[item.id] || 0
  })).sort((a, b) => (b.count - a.count));

  const totalItems = items.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="text-purple-400" size={24} />
            Inventory
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Package size={48} className="mb-4 opacity-20" />
              <p>Your bag is empty.</p>
              <p className="text-xs mt-2">Visit the Gem Shop to buy supplies!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const Icon = item.icon;
                if (item.count === 0) return null; // Hide items we don't have
                
                return (
                  <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-900 p-3 rounded-xl text-purple-400 border border-slate-700">
                        {/* @ts-ignore */}
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <h3 className="font-bold text-slate-100">{item.name}</h3>
                             <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                x{item.count}
                             </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug mt-1">{item.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        onUseItem(item.id);
                        if (item.count === 1) onClose(); // Close if utilizing last item
                      }}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors active:scale-95"
                    >
                      Use Item
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}