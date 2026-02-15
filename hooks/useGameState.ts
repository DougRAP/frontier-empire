import { useState, useEffect, useCallback } from 'react';
import { Tile, ResourceType, Inventory, GameTool, GameStats, StreakState } from '../types';
import { INITIAL_INVENTORY, BUILDING_COSTS, RESOURCES } from '../constants';
import { generateInitialGrid, isAdjacentToOwned } from '../utils/grid';
import { trackEvent } from '../services/analytics';
import { updateStreak } from '../services/streakService';
import { leaderboardService } from '../services/leaderboardService';
import { groupService } from '../services/groupService';

const DICE_ROLL_DURATION = 1000;

export function useGameState(currentGroupId: string | undefined) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [inventory, setInventory] = useState<Inventory>(INITIAL_INVENTORY);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState(1);
  const [activeToolEffect, setActiveToolEffect] = useState<string | null>(null);
  const [harvestTotemTurns, setHarvestTotemTurns] = useState(0);
  const [message, setMessage] = useState<string | null>("Welcome! Roll the dice to start.");
  const [gameWon, setGameWon] = useState(false);
  const [streakData, setStreakData] = useState<StreakState | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Statistics Tracking
  const [stats, setStats] = useState<Omit<GameStats, 'turnsPlayed'>>({
    resourcesGathered: 0,
    toolsPurchased: 0,
    hintsUsed: 0,
    premiumItemsUsed: 0,
    coachConsultations: 0
  });

  const logAction = useCallback((action: string) => {
    setActionLog(prev => [action, ...prev].slice(0, 5));
  }, []);

  // Initialize Game Grid & Streak
  useEffect(() => {
    setTiles(generateInitialGrid());
    
    // Process Streak
    const { state, bonusCoins, bonusGems, isNewDay } = updateStreak();
    setStreakData(state);

    // Apply Streak Bonus
    if (bonusCoins > 0 || bonusGems > 0) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins + bonusCoins,
        gems: prev.gems + (bonusGems || 0)
      }));
      
      // Only show message if it's a fresh login for the day
      if (isNewDay) {
        let msg = `Daily Streak! ${state.currentStreak} Day(s). +${bonusCoins} Coins`;
        if (bonusGems && bonusGems > 0) msg += `, +${bonusGems} Gems!`;
        setMessage(msg);
        logAction(`Login Bonus: ${msg}`);
      }
    }

    trackEvent('game_start', { 
      timestamp: Date.now(),
      streak: state.currentStreak 
    });
  }, []);

  // Check Win Condition & Save Score
  useEffect(() => {
    if (tiles.length > 0) {
      const resourceTiles = tiles.filter(t => t.resource !== ResourceType.EMPTY);
      const allOwned = resourceTiles.every(t => t.level > 0);
      
      if (allOwned && !gameWon) {
        setGameWon(true);
        setMessage("VICTORY! You have settled the entire island!");
        logAction("Game Won!");
        
        const finalStats: GameStats = { ...stats, turnsPlayed: turn };
        trackEvent('game_won', { turns: turn, stats: finalStats });
        
        // Save to Local Leaderboard
        const entry = leaderboardService.saveScore(finalStats);

        // Submit to Group Leaderboard if active
        if (currentGroupId) {
          groupService.submitScore(currentGroupId, entry).catch(err => {
            console.error("Failed to submit group score", err);
          });
        }
      }
    }
  }, [tiles, gameWon, turn, stats, currentGroupId]);

  // --- Actions ---

  const handleRollDice = useCallback((skipTurnIncrement: boolean = false) => {
    if (isRolling || gameWon) return;
    
    setIsRolling(true);
    setMessage(skipTurnIncrement ? "Echo Stone used: Rolling..." : "Rolling...");

    setTimeout(() => {
      let roll = Math.floor(Math.random() * 6) + 1;
      
      // Tool Effect: Lucky Charm
      if (activeToolEffect === 'lucky_charm') {
        roll = 6;
        setMessage("Lucky Charm activated! You rolled a 6!");
        logAction("Rolled 6 (Lucky Charm)");
        setActiveToolEffect(null); // Clear it
      } else {
        setMessage(`You rolled a ${roll}!`);
        if (!skipTurnIncrement) logAction(`Rolled ${roll}`);
      }

      setLastRoll(roll);
      
      setTiles(currentTiles => {
        const producingTiles = currentTiles.filter(t => t.level > 0 && t.number === roll && t.resource !== ResourceType.EMPTY);
        
        // Handle Harvest Totem decrement
        if (harvestTotemTurns > 0 && !skipTurnIncrement) {
            setHarvestTotemTurns(prev => Math.max(0, prev - 1));
        }
        
        if (producingTiles.length > 0) {
             let multiplier = 1;
             if (activeToolEffect === 'production_boom') {
                multiplier = 2;
                setActiveToolEffect(null);
             }

             const newRes: Record<string, number> = {};
             const summary: string[] = [];
             let totalGained = 0;

             producingTiles.forEach(t => {
                let amt = t.level * multiplier;
                
                // Harvest Totem Bonus
                if (harvestTotemTurns > 0) {
                    amt += 1;
                }

                newRes[t.resource] = (newRes[t.resource] || 0) + amt;
                totalGained += amt;
                summary.push(`${amt} ${t.resource.toLowerCase()}`);
             });
            
             let msg = `Production: ${summary.join(', ')}`;
             if (multiplier > 1) msg += " (Doubled!)";
             if (harvestTotemTurns > 0) msg += " (+1 Totem)";
             
             setMessage(msg);
             
             setStats(prev => ({ ...prev, resourcesGathered: prev.resourcesGathered + totalGained }));

             setInventory(prev => ({
                ...prev,
                [ResourceType.WOOD]: prev[ResourceType.WOOD] + (newRes[ResourceType.WOOD] || 0),
                [ResourceType.BRICK]: prev[ResourceType.BRICK] + (newRes[ResourceType.BRICK] || 0),
                [ResourceType.ORE]: prev[ResourceType.ORE] + (newRes[ResourceType.ORE] || 0),
             }));
        } else {
            if (activeToolEffect !== 'lucky_charm') {
                setMessage(`Rolled a ${roll}. No resources produced.`);
            }
        }
        
        return currentTiles; 
      });

      if (!skipTurnIncrement) {
          setTurn(t => t + 1);
      }
      setIsRolling(false);
    }, DICE_ROLL_DURATION);
  }, [isRolling, gameWon, activeToolEffect, harvestTotemTurns]);

  const canAfford = useCallback((cost: Partial<Inventory>) => {
    return (
      inventory[ResourceType.WOOD] >= (cost[ResourceType.WOOD] || 0) &&
      inventory[ResourceType.BRICK] >= (cost[ResourceType.BRICK] || 0) &&
      inventory[ResourceType.ORE] >= (cost[ResourceType.ORE] || 0) &&
      inventory.coins >= (cost.coins || 0)
    );
  }, [inventory]);

  const payCost = useCallback((cost: Partial<Inventory>) => {
    setInventory(prev => ({
      ...prev,
      [ResourceType.WOOD]: prev[ResourceType.WOOD] - (cost[ResourceType.WOOD] || 0),
      [ResourceType.BRICK]: prev[ResourceType.BRICK] - (cost[ResourceType.BRICK] || 0),
      [ResourceType.ORE]: prev[ResourceType.ORE] - (cost[ResourceType.ORE] || 0),
      coins: prev.coins - (cost.coins || 0),
    }));
  }, []);

  const updateTile = useCallback((id: string, updates: Partial<Tile>) => {
    setTiles(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, ...updates };
    }));
  }, []);

  const handleInteractTile = useCallback((tile: Tile) => {
    if (isRolling || gameWon) return;

    if (tile.level === 1) {
      if (canAfford(BUILDING_COSTS.UPGRADE_TILE)) {
        payCost(BUILDING_COSTS.UPGRADE_TILE);
        updateTile(tile.id, { level: 2 });
        setMessage("Upgraded to City! Production doubled.");
        logAction(`Upgraded tile ${tile.coords.q},${tile.coords.r} to City`);
      } else {
        setMessage("Need 2 Brick, 3 Ore to upgrade.");
      }
      return;
    }

    if (tile.level === 0) {
      const isReachable = tile.isUnlockable || isAdjacentToOwned(tile, tiles);
      if (!isReachable) {
        setMessage("Build adjacent to owned tiles first.");
        return;
      }

      if (canAfford(BUILDING_COSTS.NEW_TILE)) {
        payCost(BUILDING_COSTS.NEW_TILE);
        updateTile(tile.id, { level: 1 });
        setMessage("New settlement established!");
        logAction(`Built settlement at ${tile.coords.q},${tile.coords.r}`);
      } else {
        setMessage("Need 1 Wood, 1 Brick to build.");
      }
    }
  }, [isRolling, gameWon, tiles, canAfford, payCost, updateTile]);

  const handleBuyTool = useCallback((tool: GameTool) => {
    if (tool.currency === 'gems') {
        if (inventory.gems >= tool.cost) {
            setInventory(prev => ({ 
                ...prev, 
                gems: prev.gems - tool.cost,
                [tool.id]: (prev[tool.id as keyof Inventory] || 0) + 1
            }));
            setStats(prev => ({ ...prev, toolsPurchased: prev.toolsPurchased + 1 }));
            trackEvent('gem_item_purchased', { itemId: tool.id, cost: tool.cost });
            setMessage(`Purchased ${tool.name}. Check your inventory!`);
            logAction(`Bought Premium: ${tool.name}`);
        }
        return;
    }

    if (inventory.coins >= tool.cost) {
      setInventory(prev => ({ ...prev, coins: prev.coins - tool.cost }));
      setStats(prev => ({ ...prev, toolsPurchased: prev.toolsPurchased + 1 }));
      
      trackEvent('tool_purchased', { 
        toolId: tool.id, 
        toolName: tool.name, 
        cost: tool.cost,
        turn: turn
      });

      logAction(`Bought Tool: ${tool.name}`);

      if (tool.id === 'production_boom' || tool.id === 'lucky_charm') {
        setActiveToolEffect(tool.id);
        setMessage(`${tool.name} active for next roll!`);
      } else if (tool.id === 'miner_contract') {
        setInventory(prev => ({ ...prev, [ResourceType.ORE]: prev[ResourceType.ORE] + 2 }));
        setMessage("Miner Contract: +2 Ore");
      } else if (tool.id === 'builder_grant') {
        setInventory(prev => ({ ...prev, [ResourceType.WOOD]: prev[ResourceType.WOOD] + 2, [ResourceType.BRICK]: prev[ResourceType.BRICK] + 2 }));
        setMessage("Builder Grant: +2 Wood, +2 Brick");
      }
    }
  }, [inventory, turn]);

  const handleUseConsumable = useCallback((itemId: string) => {
    // @ts-ignore
    if (inventory[itemId] > 0) {
        setInventory(prev => ({ ...prev, [itemId]: prev[itemId as keyof Inventory] - 1 }));
        setStats(prev => ({ ...prev, premiumItemsUsed: prev.premiumItemsUsed + 1 }));
        trackEvent('premium_item_used', { itemId, turn });
        
        logAction(`Used Item: ${itemId}`);

        if (itemId === 'item_supply') {
            setInventory(prev => ({
                ...prev,
                [ResourceType.WOOD]: prev[ResourceType.WOOD] + 1,
                [ResourceType.BRICK]: prev[ResourceType.BRICK] + 1,
                [ResourceType.ORE]: prev[ResourceType.ORE] + 1,
            }));
            setMessage("Supply Crate opened! +1 Wood, +1 Brick, +1 Ore.");
        } else if (itemId === 'item_totem') {
            setHarvestTotemTurns(prev => prev + 7);
            setMessage("Harvest Totem active! +1 Resource yield for 7 turns.");
        } else if (itemId === 'item_reroll') {
            handleRollDice(true);
            logAction(`Used Echo Stone (Reroll)`);
        }
    }
  }, [inventory, handleRollDice]);

  const handleBuyGems = useCallback((amount: number) => {
      setInventory(prev => ({ ...prev, gems: prev.gems + amount }));
      trackEvent('iap_gems_purchased', { amount });
      setMessage(`Purchased ${amount} Gems!`);
      logAction(`Bought ${amount} Gems`);
  }, []);

  const handleTrade = useCallback((res: ResourceType) => {
    if (inventory[res] >= 3) {
      setInventory(prev => ({
        ...prev,
        [res]: prev[res] - 3,
        coins: prev.coins + 1
      }));
      setMessage(`Sold 3 ${res.toLowerCase()} for 1 Coin.`);
      logAction(`Traded 3 ${res} for 1 Coin`);
    }
  }, [inventory]);

  const trackHintUsed = useCallback(() => {
    setStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    logAction("Used Hint");
  }, []);

  const trackCoachConsultation = useCallback(() => {
    setStats(prev => ({ ...prev, coachConsultations: prev.coachConsultations + 1 }));
    logAction("Consulted Coach");
  }, []);

  return {
    tiles,
    inventory,
    lastRoll,
    isRolling,
    turn,
    activeToolEffect,
    harvestTotemTurns,
    message,
    gameWon,
    gameStats: { ...stats, turnsPlayed: turn },
    streakData,
    actionLog,
    handleRollDice: () => handleRollDice(false),
    handleInteractTile,
    handleBuyTool,
    handleUseConsumable,
    handleBuyGems,
    handleTrade,
    canAfford,
    trackHintUsed,
    trackCoachConsultation
  };
}