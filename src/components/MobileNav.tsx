import React from 'react';
import { Home, List, Plus, LineChart as ChartIcon, MoreHorizontal } from 'lucide-react';
import { useBankrollContext } from '../context/BankrollContext';
import { cn } from '../lib/utils';

export const MobileNav = () => {
  const { currentView, setCurrentView, setIsAddBetModalOpen, activeBankrollId, isStatsOpen, setIsStatsOpen } = useBankrollContext();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0b1120] border-t border-white/5 px-6 flex items-center justify-between z-50">
      <button 
        onClick={() => {
          if (activeBankrollId) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('bankrolls');
            alert('Crie uma banca primeiro!');
          }
        }}
        className={cn(
          "flex flex-col items-center gap-1",
          currentView === 'dashboard' ? "text-[#66dd8b]" : "text-gray-500"
        )}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
      </button>

      <button 
        onClick={() => {
          if (activeBankrollId) {
            setCurrentView('stats');
          } else {
            setCurrentView('bankrolls');
            alert('Crie uma banca primeiro!');
          }
        }}
        className={cn(
          "flex flex-col items-center gap-1",
          currentView === 'stats' ? "text-[#66dd8b]" : "text-gray-500"
        )}
      >
        <List className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Apostas</span>
      </button>

      <div className="relative -mt-14 z-[60]">
        <button 
          onClick={() => setIsAddBetModalOpen(true)}
          className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border-4 border-[#0b1120] active:scale-95 transition-transform"
        >
          <Plus className="w-8 h-8" strokeWidth={3} />
        </button>
      </div>

      <button 
        onClick={() => setIsStatsOpen(true)}
        className={cn(
          "flex flex-col items-center gap-1",
          isStatsOpen ? "text-[#66dd8b]" : "text-gray-500"
        )}
      >
        <ChartIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Estatísticas</span>
      </button>

      <button 
        onClick={() => setCurrentView('more')}
        className={cn(
          "flex flex-col items-center gap-1",
          currentView === 'more' ? "text-[#66dd8b]" : "text-gray-500"
        )}
      >
        <MoreHorizontal className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Mais</span>
      </button>
    </nav>
  );
};
