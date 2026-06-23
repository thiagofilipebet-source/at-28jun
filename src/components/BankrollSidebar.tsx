import React, { useState } from 'react';
import { X, PlusCircle, HelpCircle, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { Bankroll } from '../types';
import { AutomationDictionaryModal } from './AutomationDictionaryModal';

interface BankrollSidebarProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    initial_value: string;
    auto_bet?: boolean;
    auto_bet_value_enabled?: boolean;
    auto_bet_odd_enabled?: boolean;
    auto_bet_unit?: string;
    auto_bet_house_enabled?: boolean;
    auto_bet_sport_enabled?: boolean;
    is_public?: boolean;
  };
  setFormData: (data: any) => void;
  isSaving?: boolean;
}

export const BankrollSidebar: React.FC<BankrollSidebarProps> = ({
  isOpen, isEditMode, onClose, onSubmit, formData, setFormData, isSaving = false
}) => {
  const [dictionaryType, setDictionaryType] = useState<'sport' | 'house' | null>(null);

  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative">
      <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] shadow-2xl border border-white/10 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black"></div>
      </div>
    </div>
  );

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 z-[100] w-full max-w-xl bg-[#0b1120] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col h-[100dvh] max-h-[100dvh]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <AutomationDictionaryModal 
        isOpen={dictionaryType !== null} 
        onClose={() => setDictionaryType(null)} 
        type={dictionaryType || 'sport'} 
      />
      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-[#0b1120]">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {isEditMode ? "Editar Banca" : "Nova Banca"}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] md:text-xs font-normal md:font-bold text-gray-500 tracking-widest mb-1.5 px-1">Nome</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm md:text-base text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="Ex: Banca VIP"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-normal md:font-bold text-gray-500 tracking-widest mb-1.5 px-1">Valor Inicial</label>
                <input 
                  type="number" 
                  value={formData.initial_value}
                  onChange={e => setFormData({ ...formData, initial_value: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm md:text-base text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="1000.00"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 overflow-hidden">
                <label className="text-xs md:text-sm font-normal md:font-bold text-white truncate">Banca Pública</label>
                <Tooltip text="Se ativado, outras pessoas poderão ver sua banca através do link de compartilhamento. Se desativado, apenas você terá acesso." />
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                  formData.is_public ? "bg-indigo-600" : "bg-gray-600"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  formData.is_public ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <label className="text-xs md:text-sm font-normal md:font-bold text-white">Aposta Automática</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, auto_bet: !formData.auto_bet })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  formData.auto_bet ? "bg-indigo-600" : "bg-gray-600"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  formData.auto_bet ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {formData.auto_bet && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <label className="text-xs md:text-sm font-normal md:font-bold text-white">Valor Automático</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, auto_bet_value_enabled: !formData.auto_bet_value_enabled })}
                      className={cn(
                        "w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors relative shrink-0",
                        formData.auto_bet_value_enabled ? "bg-indigo-600" : "bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 md:top-1 w-3.5 md:h-4 h-3.5 md:w-4 rounded-full bg-white transition-transform",
                        formData.auto_bet_value_enabled ? "left-6 md:left-7" : "left-0.5 md:left-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <label className="text-xs md:text-sm font-normal md:font-bold text-white">Odd Automática</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, auto_bet_odd_enabled: !formData.auto_bet_odd_enabled })}
                      className={cn(
                        "w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors relative shrink-0",
                        formData.auto_bet_odd_enabled ? "bg-indigo-600" : "bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 md:top-1 w-3.5 md:h-4 h-3.5 md:w-4 rounded-full bg-white transition-transform",
                        formData.auto_bet_odd_enabled ? "left-6 md:left-7" : "left-0.5 md:left-1"
                      )} />
                    </button>
                  </div>
                </div>
                
                {formData.auto_bet_value_enabled && (
                  <div>
                    <label className="block text-[10px] md:text-xs font-normal md:font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Unidade (R$)</label>
                    <input 
                      type="number" 
                      value={formData.auto_bet_unit || ''}
                      onChange={e => setFormData({ ...formData, auto_bet_unit: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm md:text-base text-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                      placeholder="60"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <label className="text-xs md:text-sm font-normal md:font-bold text-white truncate">Casa Automática</label>
                    <Tooltip text="Identifica automaticamente a casa de aposta. Você pode adicionar mapeamentos personalizados no dicionário." />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {formData.auto_bet_house_enabled && (
                      <button type="button" onClick={() => setDictionaryType('house')} className="p-1.5 md:p-2 rounded-lg bg-green-500/20 text-green-400">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto_bet_house_enabled: !formData.auto_bet_house_enabled })}
                        className={cn(
                          "w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors relative",
                          formData.auto_bet_house_enabled ? "bg-indigo-600" : "bg-gray-600"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 md:top-1 w-3.5 md:h-4 h-3.5 md:w-4 rounded-full bg-white transition-transform",
                          formData.auto_bet_house_enabled ? "left-6 md:left-7" : "left-0.5 md:left-1"
                        )} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <label className="text-xs md:text-sm font-normal md:font-bold text-white truncate">Detecção de Esporte</label>
                    <Tooltip text="Para a detecção de esporte funcionar é necessário adicionar as informações no dicionário." />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {formData.auto_bet_sport_enabled && (
                      <button type="button" onClick={() => setDictionaryType('sport')} className="p-1.5 md:p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto_bet_sport_enabled: !formData.auto_bet_sport_enabled })}
                        className={cn(
                          "w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors relative",
                          formData.auto_bet_sport_enabled ? "bg-indigo-600" : "bg-gray-600"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 md:top-1 w-3.5 md:h-4 h-3.5 md:w-4 rounded-full bg-white transition-transform",
                          formData.auto_bet_sport_enabled ? "left-6 md:left-7" : "left-0.5 md:left-1"
                        )} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pb-10 mb-[env(safe-area-inset-bottom,0)] border-t border-white/10 bg-[#0b1120] shrink-0">
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white font-bold py-3.5 md:py-4 px-4 rounded-lg transition-all shadow-xl shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-3 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 md:w-6 h-5 md:h-6" />
                <span className="font-normal md:font-bold">{isEditMode ? "Salvar alterações" : "Criar banca"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
