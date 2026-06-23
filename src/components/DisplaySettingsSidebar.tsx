import React from 'react';
import { X, Monitor, Eye, EyeOff, GripVertical, Clock, Ticket, Coins, TrendingUp, Activity, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';
import { DisplaySettings } from '../types';

interface DisplaySettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onSettingsChange: (settings: DisplaySettings) => void;
}

export const DisplaySettingsSidebar: React.FC<DisplaySettingsSidebarProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const toggleSetting = (key: keyof DisplaySettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0b1120] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-[#0b1120]">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-white tracking-tight">Personalizar exibição das apostas</h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Configuração para esta bankroll</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* visualização Session */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Visualização da aposta</h3>
          </div>
          
          <div className="bg-[#0f172a] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2 flex-wrap">
                 {settings.showHora && (
                   <div className="bg-slate-900/60 text-white text-[11px] px-2 py-0.5 rounded border border-white/10 font-bold tracking-tight">
                     21:00
                   </div>
                 )}
                 {settings.showFormato && (
                   <div className="bg-[#1e1b4b] text-[#818cf8] text-[11px] px-2 py-0.5 rounded border border-[#312e81] font-bold tracking-tight">
                     Simples
                   </div>
                 )}
                 {settings.showCasa && (
                   <div className="bg-[#f2994a] text-black text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-bold tracking-tight">
                     <Navigation className="w-3 h-3 rotate-45 fill-black" />
                     betfair
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-xs">⚽</div>
                 <span className="text-white font-bold text-[15px] tracking-tight">Paris Saint-Germain vs Real Madrid</span>
               </div>
               <div className="flex items-center gap-6 mt-1">
                 {settings.showCotacao && (
                   <div>
                     <div className="text-white font-bold text-xs">1.850</div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold">Cotação</div>
                   </div>
                 )}
                 {settings.showValor && (
                   <div>
                     <div className="text-white font-bold text-xs">100.00 R$</div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold">Valor</div>
                   </div>
                 )}
                 {settings.showGanho && (
                   <div>
                     <div className="text-[#66dd8b] font-bold text-xs">185.00 R$</div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold">Ganho</div>
                   </div>
                 )}
                 <div>
                   <div className="text-[#66dd8b] font-bold text-xs">+85.00 R$</div>
                   <div className="text-[10px] text-gray-500 uppercase font-bold">Lucro</div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Dados Visíveis Session */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-[#66dd8b]" />
            <h3 className="text-lg font-bold text-white">Dados visíveis</h3>
          </div>

          <div className="space-y-2">
            {[
              { id: 'showHora', label: 'Hora', icon: Clock },
              { id: 'showFormato', label: 'Formato da aposta', icon: Ticket },
              { id: 'showCasa', label: 'Casa de apostas', icon: Coins },
              { id: 'showGanho', label: 'Ganho da aposta', icon: TrendingUp },
              { id: 'showCotacao', label: 'Cotação', icon: TrendingUp },
              { id: 'showValor', label: 'Valor', icon: Activity },
              { id: 'autoOddAutomation', label: 'Automação Odd 2.00', icon: TrendingUp },
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => toggleSetting(item.id as keyof DisplaySettings)}
                className="group w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-gray-700" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white font-bold tracking-tight">{item.label}</span>
                  </div>
                </div>
                {settings[item.id as keyof DisplaySettings] ? <Eye className="w-5 h-5 text-[#66dd8b]" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
