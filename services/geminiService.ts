import { GoogleGenAI } from "@google/genai";
import { HintRequest, ResourceType, Tile, GameStateSummary, CoachPersonality } from "../types";
import { isAdjacentToOwned } from "../utils/grid";

// Local heuristic to provide instant hints without API key
const generateLocalHint = (request: HintRequest): string => {
  const { inventory, tiles, costs } = request;
  const ownedTiles = tiles.filter(t => t.level > 0);
  
  // 1. Check for City Upgrade (High Value)
  const canAffordUpgrade = 
    inventory[ResourceType.BRICK] >= costs.UPGRADE_TILE[ResourceType.BRICK] &&
    inventory[ResourceType.ORE] >= costs.UPGRADE_TILE[ResourceType.ORE];

  if (canAffordUpgrade) {
    const settlements = ownedTiles.filter(t => t.level === 1);
    if (settlements.length > 0) {
      // Pick the best one: 6 or 8, then others
      const best = settlements.sort((a, b) => Math.abs(7 - a.number) - Math.abs(7 - b.number))[0];
      return `Upgrade your ${best.resource.toLowerCase()} settlement (rolled on ${best.number}) to a City to double production.`;
    }
  }

  // 2. Check for New Settlement (Expansion)
  const canAffordNew = 
    inventory[ResourceType.WOOD] >= costs.NEW_TILE[ResourceType.WOOD] &&
    inventory[ResourceType.BRICK] >= costs.NEW_TILE[ResourceType.BRICK];
    
  if (canAffordNew) {
    const buyable = tiles.filter(t => t.level === 0 && (t.isUnlockable || isAdjacentToOwned(t, tiles)));
    
    if (buyable.length > 0) {
      // Prioritize new resources or high probabilities
      const best = buyable.sort((a, b) => Math.abs(7 - a.number) - Math.abs(7 - b.number))[0];
      return `Expand your territory! Build a new settlement on the ${best.resource.toLowerCase()} tile (rolled on ${best.number}).`;
    }
  }

  // 3. Strategic Goals (Close to affordable)
  // Close to Settlement
  if (inventory[ResourceType.WOOD] > 0 && inventory[ResourceType.BRICK] === 0) {
    return "You have Wood. Try to find Brick to build a new settlement.";
  }
  if (inventory[ResourceType.WOOD] === 0 && inventory[ResourceType.BRICK] > 0) {
    return "You have Brick. Try to find Wood to build a new settlement.";
  }

  // Close to City
  if (inventory[ResourceType.ORE] >= 1 && inventory[ResourceType.BRICK] >= 1) {
    return "Save your Ore and Brick. You are close to affording a City upgrade.";
  }

  // 4. Tools & Trade
  if (inventory.coins >= 4) {
    return "You have plenty of Coins. Buy a 'Production Boom' tool to boost your next roll.";
  }

  // Default
  return "Roll the dice to gather resources, or trade 3 of the same resource for a Coin.";
};

export const getHint = async (request: HintRequest): Promise<string> => {
  // Use local logic if no API key is present
  if (!process.env.API_KEY) {
    console.log("No API Key, using local hint.");
    return generateLocalHint(request);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a strategic assistant for a hex-grid resource game.
    Current Inventory: Wood:${request.inventory[ResourceType.WOOD]}, Brick:${request.inventory[ResourceType.BRICK]}, Ore:${request.inventory[ResourceType.ORE]}, Coins:${request.inventory.coins}.
    
    Goal: Suggest ONE specific, actionable move to improve the player's position.
    Prioritize buying settlements or upgrades if possible.
    If resources are low, suggest what to aim for.
    Keep it under 15 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || generateLocalHint(request);
  } catch (error) {
    console.warn("Gemini Error, falling back to local hint:", error);
    return generateLocalHint(request);
  }
};

const PERSONALITY_PROMPTS: Record<CoachPersonality, string> = {
  mentor: `Tone: Calm, encouraging, gentle. Act like a supportive mentor or kind teacher. Use phrases like "Great job so far" or "Consider this option". Focus on steady progress and learning.`,
  tough: `Tone: Tough love, blunt, mildly sarcastic. Act like a hardcore pro gamer coach. Focus purely on efficiency and winning. Don't sugarcoat mistakes. Use phrases like "Stop wasting time" or "Here's the optimal play".`,
  professor: `Tone: Academic, analytical, precise. Act like a university professor of game theory. Use technical terms like 'probability distribution', 'expected yield', 'resource delta', and 'opportunity cost'. Be formal and deeply analytical.`
};

/**
 * Returns deep strategic coaching advice based on the provided GameStateSummary.
 */
export const getCoachAdvice = async (summary: GameStateSummary, question?: string, personality: CoachPersonality = 'mentor'): Promise<string> => {
    // If no API key, return a stub with simulation
    if (!process.env.API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return `(Simulated AI Coach - ${personality})\nTurn: ${summary.turn}\n\nSince no API Key is configured, I cannot analyze the board deeply. However, general strategy is to balance Wood/Brick for expansion early, then switch to Ore/Brick for cities later.`;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Serialize Board State
    const ownedTiles = summary.tiles.filter(t => t.level > 0);
    const ownedSummary = ownedTiles.map(t => 
        `- ${t.resource} tile (Roll: ${t.number}) at Level ${t.level} (Q${t.coords.q},R${t.coords.r})`
    ).join('\n');

    const inventoryStr = `Wood:${summary.inventory.WOOD}, Brick:${summary.inventory.BRICK}, Ore:${summary.inventory.ORE}, Coins:${summary.inventory.coins}, Gems:${summary.inventory.gems}`;
    
    const toneInstruction = PERSONALITY_PROMPTS[personality];

    // 2. Construct Prompt
    const systemInstruction = `
        You are a master strategist for a single-player game called "Hex Settler".
        
        ${toneInstruction}

        Game Rules:
        - Tiles produce resources (Wood, Brick, Ore) when their number (1-6) is rolled.
        - Costs: New Tile (1 Wood, 1 Brick), Upgrade to City (2 Brick, 3 Ore).
        - Goal: Own all tiles on the map.
        - Trading: 3 Resources = 1 Coin. Coins buy Tools.
        
        Your Role:
        - Act as a strategic coach. Do not just pick a move; explain the "Why".
        - Analyze resource balance (e.g., "You have too much Wood, not enough Ore").
        - Suggest long-term plans (e.g., "Focus on getting an Ore tile next").
        - If the user asks a specific question, answer it directly using the game state.
        - If NO question is asked, provide:
          1. Situation Analysis (Strengths/Weaknesses).
          2. 1-3 Recommended Plans for the next 5-10 turns.
    `;

    const userContent = `
        Current Game State:
        - Turn: ${summary.turn}
        - Inventory: ${inventoryStr}
        - Active Tool Effect: ${summary.activeToolEffect || "None"}
        - Harvest Totem Turns Remaining: ${summary.harvestTotemTurns}
        - Recent Actions: ${summary.recentActions.join(', ')}
        
        Owned Tiles:
        ${ownedSummary}
        
        ${question ? `USER QUESTION: "${question}"` : "USER REQUEST: Analyze my position and give me a plan."}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userContent,
            config: {
                systemInstruction: systemInstruction,
                maxOutputTokens: 500,
            }
        });
        
        return response.text || "I'm having trouble analyzing the board right now. Try again in a moment.";
    } catch (e) {
        console.error("Coach API Error:", e);
        return "I couldn't reach the strategy server. Please check your connection and try again.";
    }
};