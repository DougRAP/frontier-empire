import { HexCoordinates, Tile, ResourceType } from '../types';

export const getHexPixelCoordinates = (q: number, r: number, size: number) => {
  const x = size * (3 / 2) * q;
  const y = size * Math.sqrt(3) * (r + q / 2);
  return { x, y };
};

export const cubeDistance = (a: HexCoordinates, b: HexCoordinates) => {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
};

export const getNeighbors = (q: number, r: number): { q: number; r: number; s: number }[] => {
  const directions = [
    { q: 1, r: 0, s: -1 }, { q: 1, r: -1, s: 0 }, { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 }, { q: -1, r: 1, s: 0 }, { q: 0, r: 1, s: -1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r, s: - (q + d.q) - (r + d.r) }));
};

export const generateInitialGrid = (): Tile[] => {
  const tiles: Tile[] = [];
  const mapRadius = 2; // small map for mobile
  
  for (let q = -mapRadius; q <= mapRadius; q++) {
    const r1 = Math.max(-mapRadius, -q - mapRadius);
    const r2 = Math.min(mapRadius, -q + mapRadius);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      // Core tiles are level 1, outer are level 0 (unlockable)
      const dist = cubeDistance({ q, r, s }, { q: 0, r: 0, s: 0 });
      
      let resource = ResourceType.EMPTY;
      let number = 1;
      let level = 0;
      let isUnlockable = false;

      // Random deterministic gen based on coords
      const rand = Math.abs((q * 31 + r * 17) % 100);
      
      if (rand < 33) resource = ResourceType.WOOD;
      else if (rand < 66) resource = ResourceType.BRICK;
      else resource = ResourceType.ORE;

      // Center is always level 1
      if (dist === 0) {
        level = 1;
        number = 3; // easy start
      } else if (dist === 1) {
        // First ring is unlockable immediately if we wanted, or we start with 1 random one
        // Let's make 2 random neighbors active to start
        if ((q === 1 && r === -1) || (q === -1 && r === 1)) {
            level = 1;
        } else {
            isUnlockable = true;
        }
        number = (Math.abs(q + r * 2) % 6) + 1;
      } else {
        // Outer ring
        isUnlockable = false; // Must unlock neighbors first
        number = (Math.abs(q * 7 + r * 3) % 6) + 1;
      }

      tiles.push({
        id: `${q},${r}`,
        coords: { q, r, s },
        resource,
        number,
        level,
        isUnlockable: level === 0 // Logic update needed in game loop to check connectivity
      });
    }
  }
  return tiles;
};

// Helper to check if a tile is adjacent to any owned tile (level > 0)
export const isAdjacentToOwned = (tile: Tile, allTiles: Tile[]) => {
  const ownedCoords = allTiles.filter(t => t.level > 0).map(t => t.coords);
  const neighbors = getNeighbors(tile.coords.q, tile.coords.r);
  return neighbors.some(n => 
    ownedCoords.some(oc => oc.q === n.q && oc.r === n.r)
  );
};
