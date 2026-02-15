import React, { useMemo } from 'react';
import { Tile, Inventory } from '../types';
import { getHexPixelCoordinates, isAdjacentToOwned } from '../utils/grid';
import { HEX_SIZE, BUILDING_COSTS } from '../constants';
import HexTile from './HexTile';

interface GameBoardProps {
  tiles: Tile[];
  inventory: Inventory;
  onInteract: (tile: Tile) => void;
  canAfford: (cost: Partial<Inventory>) => boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ tiles, inventory, onInteract, canAfford }) => {
  // Memoize ViewBox calculation to avoid recalculating on every render if tiles don't change
  const viewBox = useMemo(() => {
    const coords = tiles.map(t => getHexPixelCoordinates(t.coords.q, t.coords.r, HEX_SIZE));
    if (coords.length > 0) {
      const minX = Math.min(...coords.map(c => c.x)) - HEX_SIZE;
      const maxX = Math.max(...coords.map(c => c.x)) + HEX_SIZE;
      const minY = Math.min(...coords.map(c => c.y)) - HEX_SIZE;
      const maxY = Math.max(...coords.map(c => c.y)) + HEX_SIZE;
      const width = maxX - minX;
      const height = maxY - minY;
      // Add generous padding for mobile centering
      return `${minX - 30} ${minY - 30} ${width + 60} ${height + 60}`;
    }
    return "0 0 100 100";
  }, [tiles]);

  // Pre-calculate affordance to pass stable primitives where possible, 
  // although memoized HexTile will check prop equality.
  const canBuyNew = canAfford(BUILDING_COSTS.NEW_TILE);
  const canUpgrade = canAfford(BUILDING_COSTS.UPGRADE_TILE);

  return (
    <div className="flex-1 w-full max-w-2xl flex items-center justify-center p-4">
      <svg viewBox={viewBox} className="w-full h-full touch-none drop-shadow-2xl">
        {tiles.map((tile) => {
          const { x, y } = getHexPixelCoordinates(tile.coords.q, tile.coords.r, HEX_SIZE);
          // Adjacency check is relatively cheap for small maps, but could be memoized if needed.
          const isReachable = tile.isUnlockable || isAdjacentToOwned(tile, tiles);
          const isBuyable = tile.level === 0 && isReachable;
          
          return (
            <HexTile
              key={tile.id}
              tile={{...tile, isUnlockable: isBuyable }} 
              cx={x}
              cy={y}
              isBuyable={isBuyable}
              canAffordBuy={canBuyNew}
              canAffordUpgrade={canUpgrade}
              onInteract={onInteract}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(GameBoard);