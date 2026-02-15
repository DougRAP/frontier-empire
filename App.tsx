import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useGroupSystem } from './hooks/useGroupSystem';
import { getHint, getCoachAdvice } from './services/geminiService';
import { trackEvent } from './services/analytics';
import { leaderboardService } from './services/leaderboardService'; // Imported for score calculation
import { BUILDING_COSTS } from './constants';
import { GameStateSummary, CoachPersonality } from './types';
import ResourceBar from './components/ResourceBar';
import ToolShop from './components/ToolShop';
import GemShop from './components/GemShop';
import InventoryModal from './components/InventoryModal';
import Onboarding from './components/Onboarding';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import TradeMenu from './components/TradeMenu';
import VictoryModal from './components/VictoryModal';
import GroupModal from './components/GroupModal';
import StreakModal from './components/StreakModal';
import LeaderboardModal from './components/LeaderboardModal';
import CoachPanel from './components/CoachPanel';
import { Sparkles, X } from 'lucide-react';

export default function App() {
  // Group System Logic
  const groupSystem = useGroupSystem();

  // Core Game Logic
  const {
    tiles,
    inventory,
    isRolling,
    activeToolEffect,
    harvestTotemTurns,
    message,
    gameWon,
    turn,
    gameStats,
    streakData,
    actionLog,
    handleRollDice,
    handleInteractTile,
    handleBuyTool,
    handleUseConsumable,
    handleBuyGems,
    handleTrade,
    canAfford,
    trackHintUsed,
    trackCoachConsultation
  } = useGameState(groupSystem.currentGroup?.id);
  
  // UI State
  const [hint, setHint] = useState<string | null>(null);
  const [isToolShopOpen, setIsToolShopOpen] = useState(false);
  const [isGemShopOpen, setIsGemShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isTradeMenuOpen, setIsTradeMenuOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  
  // Coach Personality State with Persistence
  const [coachPersonality, setCoachPersonality] = useState<CoachPersonality>(() => {
    try {
        const stored = localStorage.getItem('hex_coach_personality');
        if (stored === 'mentor' || stored === 'tough' || stored === 'professor') {
            return stored;
        }
    } catch (e) {}
    return 'mentor';
  });
  
  const [hintLoading, setHintLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Derived state for props
  const currentScore = leaderboardService.calculateScore({ ...gameStats, turnsPlayed: turn });

  // Handlers
  const onRoll = () => {
    setHint(null);
    handleRollDice();
  };

  const fetchHint = async () => {
    setHintLoading(true);
    setHint(null);
    
    trackEvent('hint_requested', { turn, inventory });
    trackHintUsed();

    const hintText = await getHint({
      inventory,
      tiles,
      costs: BUILDING_COSTS
    });
    setHint(hintText);
    setHintLoading(false);
  };

  const handlePersonalityChange = (p: CoachPersonality) => {
    setCoachPersonality(p);
    localStorage.setItem('hex_coach_personality', p);
    trackEvent('coach_personality_changed', { personality: p });
  };

  const handleOpenCoach = () => {
    setIsCoachOpen(true);
    trackEvent('coach_opened', { turn });
  };

  const handleAskCoach = async (question?: string) => {
    setCoachLoading(true);

    trackEvent('coach_advice_requested', { 
        streak: streakData?.currentStreak || 0,
        current_score: currentScore,
        personality: coachPersonality,
        has_question: !!question,
        question_length: question ? question.length : 0
    });
    
    const summary: GameStateSummary = {
        turn,
        inventory,
        tiles,
        streak: streakData,
        recentActions: actionLog,
        activeToolEffect,
        harvestTotemTurns
    };

    try {
        const advice = await getCoachAdvice(summary, question, coachPersonality);
        setCoachAdvice(advice);
        trackCoachConsultation();
    } catch (e) {
        setCoachAdvice("The coach is currently taking a break. Please try again later.");
    } finally {
        setCoachLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 flex flex-col relative overflow-hidden font-sans text-slate-100">
      <ResourceBar 
        inventory={inventory} 
        onHelp={() => setShowTutorial(true)} 
        onGroupClick={() => setIsGroupModalOpen(true)}
        streak={streakData?.currentStreak || 0}
        onStreakClick={() => setIsStreakModalOpen(true)}
        onLeaderboardClick={() => setIsLeaderboardModalOpen(true)}
        onGemClick={() => setIsGemShopOpen(true)}
        onCoachClick={handleOpenCoach}
      />

      {/* Main Game Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center w-full">
        
        {/* Message Toast */}
        <div className="h-16 w-full flex items-end justify-center pointer-events-none z-20 pb-2 absolute top-20">
          {message && (
            <div className="mx-4 max-w-sm text-center animate-in slide-in-from-top-4 fade-in duration-300">
               <span className="inline-block bg-slate-800/90 backdrop-blur-md border border-slate-700 px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-100 shadow-xl ring-1 ring-white/10">
                {message}
               </span>
            </div>
          )}
        </div>

        {/* SVG Game Board */}
        <GameBoard 
            tiles={tiles}
            inventory={inventory}
            onInteract={handleInteractTile}
            canAfford={canAfford}
        />

        {/* Hint Bubble */}
        {hint && !gameWon && (
          <div className="absolute bottom-6 left-4 right-4 max-w-md mx-auto z-20">
            <div className="bg-indigo-900/95 border border-indigo-500/50 p-4 rounded-2xl text-indigo-100 text-sm shadow-2xl animate-in slide-in-from-bottom-2 flex items-start gap-3 backdrop-blur-sm">
              <Sparkles className="shrink-0 text-indigo-400 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="leading-relaxed">{hint}</p>
              </div>
              <button onClick={() => setHint(null)} className="text-indigo-400 p-1">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <TradeMenu 
        isOpen={isTradeMenuOpen} 
        onClose={() => setIsTradeMenuOpen(false)}
        inventory={inventory}
        onTrade={handleTrade}
        gameWon={gameWon}
      />

      <GameControls 
        onRoll={onRoll}
        isRolling={isRolling}
        gameWon={gameWon}
        activeToolEffect={activeToolEffect}
        harvestTotemTurns={harvestTotemTurns}
        isTradeOpen={isTradeMenuOpen}
        onToggleTrade={() => setIsTradeMenuOpen(!isTradeMenuOpen)}
        onOpenShop={() => setIsToolShopOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onGetHint={fetchHint}
        hintLoading={hintLoading}
        inventory={inventory}
      />

      <ToolShop 
        isOpen={isToolShopOpen && !gameWon} 
        onClose={() => setIsToolShopOpen(false)} 
        inventory={inventory}
        onBuy={handleBuyTool}
      />

      <GemShop
        isOpen={isGemShopOpen && !gameWon}
        onClose={() => setIsGemShopOpen(false)}
        inventory={inventory}
        onBuyItem={handleBuyTool}
        onBuyGems={handleBuyGems}
      />

      <InventoryModal 
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onUseItem={handleUseConsumable}
      />

      <GroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        currentGroup={groupSystem.currentGroup}
        loading={groupSystem.loading}
        error={groupSystem.error}
        onCreate={groupSystem.createGroup}
        onJoin={groupSystem.joinGroup}
        onLeave={groupSystem.leaveGroup}
        onClearError={groupSystem.clearError}
      />

      <StreakModal 
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakData={streakData}
      />

      <LeaderboardModal 
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        currentGroup={groupSystem.currentGroup}
      />

      <CoachPanel 
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        onAskCoach={handleAskCoach}
        advice={coachAdvice}
        loading={coachLoading}
        personality={coachPersonality}
        onPersonalityChange={handlePersonalityChange}
        currentScore={currentScore}
        currentStreak={streakData?.currentStreak || 0}
        groupCode={groupSystem.currentGroup?.id}
      />
      
      <Onboarding 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />

      <VictoryModal 
        gameWon={gameWon} 
        stats={gameStats} 
        streak={streakData?.currentStreak || 0}
      />
    </div>
  );
}