import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Dice5, Hammer, Coins } from 'lucide-react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Welcome to Hex Settler",
    desc: "Your goal is to settle the entire island. Own every tile on the map to win.",
    icon: MapPin,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Roll & Collect",
    desc: "Roll the dice each turn. You gain resources (Wood, Brick, Ore) from owned tiles matching the rolled number.",
    icon: Dice5,
    color: "text-amber-400",
    bg: "bg-amber-500/10"
  },
  {
    title: "Build & Upgrade",
    desc: "Spend resources to buy new tiles adjacent to your territory, or upgrade settlements to cities for 2x production.",
    icon: Hammer,
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    title: "Trade & Tools",
    desc: "Trade excess resources (3:1) for Coins. Use Coins in the Shop to buy tools that boost your rolls and resources.",
    icon: Coins,
    color: "text-purple-400",
    bg: "bg-purple-500/10"
  }
];

export default function Onboarding({ isOpen, onClose }: OnboardingProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onClose();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col min-h-[420px] animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Skip Button */}
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col items-center text-center p-8 pt-12">
           <div className={`p-6 rounded-full mb-8 ring-1 ring-white/10 shadow-xl ${current.bg} ${current.color} transition-all duration-300`}>
             <Icon size={48} strokeWidth={1.5} />
           </div>
           
           <h2 className="text-2xl font-black text-white mb-4 leading-tight tracking-tight transition-all duration-300">{current.title}</h2>
           <p className="text-slate-400 text-lg leading-relaxed transition-all duration-300">{current.desc}</p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-800/50 border-t border-slate-800">
          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-slate-200' : 'w-1.5 bg-slate-700'}`} 
              />
            ))}
          </div>

          <div className="flex gap-3">
             {step > 0 ? (
               <button 
                 onClick={handleBack}
                 className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
               >
                 <ChevronLeft size={20} />
               </button>
             ) : (
                <button 
                 onClick={onClose}
                 className="px-4 py-3 rounded-xl text-slate-500 font-bold text-sm hover:text-slate-300 transition-colors"
               >
                 Skip
               </button>
             )}
             
             <button 
               onClick={handleNext}
               className="flex-1 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-100"
             >
               {step === STEPS.length - 1 ? "Got it!" : "Next"}
               {step < STEPS.length - 1 && <ChevronRight size={18} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
