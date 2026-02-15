import React, { useState } from 'react';
import { PlayerGroup } from '../types';
import { Users, UserPlus, LogOut, Copy, X, Check, ArrowRight, Loader2 } from 'lucide-react';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: PlayerGroup | null;
  loading: boolean;
  error: string | null;
  onCreate: (name: string) => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onClearError: () => void;
}

type ViewState = 'main' | 'create' | 'join';

export default function GroupModal({
  isOpen, onClose, currentGroup, loading, error,
  onCreate, onJoin, onLeave, onClearError
}: GroupModalProps) {
  const [view, setView] = useState<ViewState>('main');
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset local state when opening/closing
  React.useEffect(() => {
    if (isOpen) {
      setView('main');
      setInputValue('');
      onClearError();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (currentGroup?.id) {
      navigator.clipboard.writeText(currentGroup.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    
    if (view === 'create') {
      onCreate(inputValue.trim());
    } else if (view === 'join') {
      onJoin(inputValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="text-blue-400" /> 
            {currentGroup ? 'Your Group' : 'Friend Groups'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <span className="text-sm font-bold">Connecting...</span>
            </div>
          ) : currentGroup ? (
            // --- Active Group View ---
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-blue-500/30">
                <Users size={32} className="text-blue-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-1">{currentGroup.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-8">
                <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">{currentGroup.memberCount} members</span>
              </div>

              <div className="w-full bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Invite Code</p>
                <button 
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 hover:border-blue-500/50 transition-colors group"
                >
                  <span className="text-2xl font-mono font-black text-blue-400 tracking-widest">{currentGroup.id}</span>
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-slate-500 group-hover:text-blue-400" />}
                </button>
                <p className="text-xs text-slate-500 mt-2">Share this code with friends to let them join.</p>
              </div>

              <button 
                onClick={onLeave}
                className="text-red-400 text-sm font-bold flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors"
              >
                <LogOut size={16} /> Leave Group
              </button>
            </div>
          ) : (
            // --- No Group Views ---
            <>
              {view === 'main' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-center mb-6 leading-relaxed">
                    Join a group to compete with friends and track your progress together.
                  </p>
                  
                  <button 
                    onClick={() => setView('create')}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus size={20} /> Create New Group
                  </button>
                  
                  <button 
                    onClick={() => setView('join')}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-lg border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={20} /> Join with Code
                  </button>
                </div>
              )}

              {(view === 'create' || view === 'join') && (
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {view === 'create' ? 'Name Your Group' : 'Enter Invite Code'}
                  </h3>
                  
                  <input
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={view === 'create' ? "e.g. Hex Masters" : "e.g. X9Y2Z1"}
                    maxLength={view === 'create' ? 20 : 8}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 font-mono"
                  />
                  
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => { setView('main'); setInputValue(''); onClearError(); }}
                      className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={!inputValue.trim()}
                      className="flex-1 py-3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                    >
                      {view === 'create' ? 'Create' : 'Join'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
