import React from 'react';
import { Tile, ResourceType } from '../types';
import { HEX_SIZE } from '../constants';
import { Trees, BrickWall, Mountain, Lock, Home, Castle, Plus, ArrowUp } from 'lucide-react';

interface HexTileProps {
  tile: Tile;
  cx: number;
  cy: number;
  isBuyable: boolean;
  canAffordBuy: boolean;
  canAffordUpgrade: boolean;
  onInteract: (tile: Tile) => void;
}

const HexTile: React.FC<HexTileProps> = ({ 
  tile, cx, cy, isBuyable, canAffordBuy, canAffordUpgrade, onInteract 
}) => {
  // Pointy-topped hexagon points
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = Math.PI / 180 * angle_deg;
    points.push(`${cx + HEX_SIZE * Math.cos(angle_rad)},${cy + HEX_SIZE * Math.sin(angle_rad)}`);
  }
  const polyPoints = points.join(' ');

  const getFillColor = (res: ResourceType) => {
    switch (res) {
      case ResourceType.WOOD: return '#166534'; // green-800
      case ResourceType.BRICK: return '#991b1b'; // red-800
      case ResourceType.ORE: return '#334155'; // slate-700
      default: return '#0f172a'; // slate-900
    }
  };

  const getIcon = () => {
    const props = { size: 28, className: "text-white/20 drop-shadow-sm" }; // Larger background icon
    switch (tile.resource) {
      case ResourceType.WOOD: return <Trees {...props} />;
      case ResourceType.BRICK: return <BrickWall {...props} />;
      case ResourceType.ORE: return <Mountain {...props} />;
      default: return null;
    }
  };

  // Visual State Logic
  const isOwned = tile.level > 0;
  const isLocked = !isOwned && !tile.isUnlockable;
  const fillColor = isOwned ? getFillColor(tile.resource) : '#1e293b';
  
  // Dynamic styling based on state
  const strokeColor = isOwned 
    ? '#e2e8f0' // Owned border
    : (isBuyable && canAffordBuy 
        ? '#fbbf24' // Buyable & Affordable (Amber)
        : (isBuyable ? '#94a3b8' : '#334155')); // Buyable (Slate) vs Locked
        
  const strokeWidth = isOwned ? 4 : (isBuyable ? 3 : 1);
  const opacity = isLocked ? 0.3 : 1;

  return (
    <g 
      className={`transition-all duration-300 ${isBuyable || isOwned ? 'cursor-pointer' : ''}`}
      onClick={() => onInteract(tile)}
      style={{ opacity }}
    >
      <polygon
        points={polyPoints}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="transition-colors duration-300"
      />
      
      {/* Content Container */}
      <foreignObject x={cx - HEX_SIZE/2} y={cy - HEX_SIZE/2} width={HEX_SIZE} height={HEX_SIZE} className="pointer-events-none">
        <div className="h-full w-full flex flex-col items-center justify-center relative">
          
          {/* Level 0: Unowned */}
          {!isOwned && (
            <>
              {isLocked ? <Lock size={20} className="text-slate-600" /> : (
                tile.isUnlockable && (
                  <div className={`flex flex-col items-center justify-center w-full h-full rounded-full transition-all duration-500
                    ${canAffordBuy ? 'scale-110' : 'scale-100'}`}>
                    <div className={`p-2 rounded-full ${canAffordBuy ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50 animate-pulse' : 'text-slate-500'}`}>
                      <Plus size={32} strokeWidth={3} />
                    </div>
                  </div>
                )
              )}
            </>
          )}

          {/* Owned State */}
          {isOwned && (
            <>
              {/* Background Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40 transform scale-125 pointer-events-none">
                {getIcon()}
              </div>
              
              {/* Dice Number Circle */}
              <div className="z-10 bg-slate-900/80 rounded-full w-10 h-10 flex items-center justify-center border-2 border-slate-600 backdrop-blur-md shadow-lg mb-1">
                <span className={`font-black text-xl leading-none pt-0.5 ${tile.number === 6 || tile.number === 8 ? 'text-red-500' : 'text-slate-100'}`}>
                  {tile.number}
                </span>
              </div>

              {/* Building Level Indicator */}
              <div className="z-10 absolute -bottom-2">
                {tile.level === 1 && (
                  <div className="bg-slate-800 p-1 rounded-full border border-slate-600 shadow-lg">
                    <Home size={14} className="text-emerald-400" fill="currentColor" />
                  </div>
                )}
                {tile.level === 2 && (
                  <div className="bg-slate-800 p-1 rounded-full border border-slate-600 shadow-lg">
                     <Castle size={16} className="text-amber-400" fill="currentColor" />
                  </div>
                )}
              </div>
              
              {/* Upgrade Hint Overlay */}
              {tile.level === 1 && canAffordUpgrade && (
                <div className="absolute top-0 right-0 -mt-1 -mr-1 z-20">
                  <div className="bg-green-500 text-white rounded-full p-1 shadow-lg animate-bounce border-2 border-slate-900">
                    <ArrowUp size={12} strokeWidth={4} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

export default React.memo(HexTile);