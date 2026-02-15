import React, { useState } from 'react';
import { Bot, X, MessageSquare, Loader2, Send, GraduationCap, Zap, HeartHandshake, Copy, Check, Share2 } from 'lucide-react';
import { CoachPersonality } from '../types';

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAskCoach: (question?: string) => void;
  advice: string | null;
  loading: boolean;
  personality: CoachPersonality;
  onPersonalityChange: (p: CoachPersonality) => void;
  currentScore: number;
  currentStreak: number;
  groupCode?: string;
}

const PERSONALITIES: { id: CoachPersonality; name: string; desc: string; icon: any }[] = [
    { id: 'mentor', name: 'Calm Mentor', desc: 'Encouraging and gentle guidance.', icon: HeartHandshake },
    { id: 'tough', name: 'Tough Love Pro', desc: 'Blunt, sarcastic, optimization-focused.', icon: Zap },
    { id: 'professor', name: 'The Professor', desc: 'Analytical, technical, and precise.', icon: GraduationCap }
];

export default function CoachPanel({ 
  isOpen, onClose, onAskCoach, advice, loading, personality, onPersonalityChange,
  currentScore, currentStreak, groupCode
}: CoachPanelProps) {
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAsk = () => {
    onAskCoach(question.trim() || undefined);
    setCopied(false); // Reset copy state on new request
  };

  const handleCopyMoment = () => {
    if (!advice) return;

    // Smart truncation: Try to get the first 2 sentences, or fallback to length
    const sentences = advice.match(/[^.!?]+[.!?]+/g);
    let shortAdvice = advice;
    if (sentences && sentences.length > 0) {
        shortAdvice = sentences.slice(0, 2).join(' ');
        if (shortAdvice.length > 200) {
             shortAdvice = shortAdvice.substring(0, 197) + '...';
        }
    } else if (advice.length > 150) {
        shortAdvice = advice.substring(0, 150) + '...';
    }

    const personalityName = PERSONALITIES.find(p => p.id === personality)?.name || 'AI Coach';
    
    let text = `💡 ${personalityName} says: "${shortAdvice}"\n\n`;
    text += `🏆 Score: ${currentScore.toLocaleString()} | Streak: ${currentStreak} 🔥\n`;
    text += `Try to beat my strategy in Hex Settler Solo!`;
    if (groupCode) {
        text += `\nJoin my group: ${groupCode}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-slate-900 border-l border-slate-700 shadow-2xl z-[55] transition-all duration-300 ease-in-out transform flex flex-col pt-safe-top
      ${isOpen ? 'translate-x-0 w-80 sm:w-96' : 'translate-x-full w-80 sm:w-96 pointer-events-none'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Bot className="text-indigo-400" />
          AI Coach
        </h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Personality Selector */}
        <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Coach Personality</h3>
            <div className="grid grid-cols-3 gap-2">
                {PERSONALITIES.map(p => {
                    const Icon = p.icon;
                    const isActive = personality === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => onPersonalityChange(p.id)}
                            className={`flex flex-col items-center p-2 rounded-xl border transition-all active:scale-95
                                ${isActive 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                                }`}
                        >
                            <Icon size={20} className="mb-1" />
                            <span className="text-[10px] font-bold text-center leading-tight">{p.name}</span>
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500 mt-2 italic text-center min-h-[1.5em]">
                {PERSONALITIES.find(p => p.id === personality)?.desc}
            </p>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
          <p className="text-indigo-200 text-sm leading-relaxed">
            I'm here to help with high-level strategy. Ask me a specific question, or just tap "Ask Coach" for a general situation analysis.
          </p>
        </div>

        <div className="space-y-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Should I save for a city or buy more tiles?"
            className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            disabled={loading}
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                {question ? <Send size={18} /> : <MessageSquare size={18} />} 
                {question ? 'Ask Specific Question' : 'Analyze Position'}
              </>
            )}
          </button>
        </div>

        {advice && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Coach's Advice</h3>
            
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap shadow-inner relative group">
               {advice}
            </div>

            <div className="flex flex-col gap-2">
                <button 
                  onClick={handleCopyMoment}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${copied 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-slate-800 text-indigo-400 border border-slate-700 hover:bg-slate-750 hover:text-white'
                    }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Moment'}
                </button>
                
                {copied && (
                    <p className="text-center text-[10px] text-green-400 font-medium animate-in fade-in duration-300">
                        Coach moment copied! Paste it in chat or social.
                    </p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}