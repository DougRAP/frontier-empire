import { ResourceType, GameTool } from './types';
import { Pickaxe, Hammer, Zap, Gem, Package, Sprout, RotateCw } from 'lucide-react';

export const RESOURCES = [ResourceType.WOOD, ResourceType.BRICK, ResourceType.ORE];

export const BUILDING_COSTS = {
  NEW_TILE: {
    [ResourceType.WOOD]: 1,
    [ResourceType.BRICK]: 1,
    [ResourceType.ORE]: 0,
  },
  UPGRADE_TILE: {
    [ResourceType.WOOD]: 0,
    [ResourceType.BRICK]: 2,
    [ResourceType.ORE]: 3,
  },
  TRADE_RATE: 3, // 3 resources = 1 coin
};

export const INITIAL_INVENTORY = {
  [ResourceType.WOOD]: 2,
  [ResourceType.BRICK]: 2,
  [ResourceType.ORE]: 0,
  coins: 0,
  gems: 15, // Free starter gems
  item_supply: 0,
  item_totem: 0,
  item_reroll: 0,
};

export const HEX_SIZE = 55; // Base pixel size for hex math

export const TOOLS: GameTool[] = [
  {
    id: 'production_boom',
    name: 'Production Boom',
    description: 'Double all resources gained on the next roll.',
    cost: 4,
    currency: 'coins',
    icon: Zap,
  },
  {
    id: 'miner_contract',
    name: 'Miner Contract',
    description: 'Instantly gain 2 Ore.',
    cost: 3,
    currency: 'coins',
    icon: Pickaxe,
  },
  {
    id: 'builder_grant',
    name: 'Builder Grant',
    description: 'Instantly gain 2 Wood and 2 Brick.',
    cost: 5,
    currency: 'coins',
    icon: Hammer,
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    description: 'Next roll is guaranteed to be a 6.',
    cost: 6,
    currency: 'coins',
    icon: Gem,
  },
];

export const GEM_ITEMS: GameTool[] = [
  {
    id: 'item_supply',
    name: 'Supply Crate',
    description: 'Instantly get 1 Wood, 1 Brick, and 1 Ore. Best for recovering from a slow start.',
    cost: 2,
    currency: 'gems',
    icon: Package,
  },
  {
    id: 'item_totem',
    name: 'Harvest Totem',
    description: 'Add +1 resource to ALL producing tiles for 7 turns. High value for wide empires.',
    cost: 6,
    currency: 'gems',
    icon: Sprout,
  },
  {
    id: 'item_reroll',
    name: 'Echo Stone',
    description: 'Roll for resources without advancing the Turn Timer. Critical for optimizing leaderboard scores.',
    cost: 4,
    currency: 'gems',
    icon: RotateCw,
  }
];