import React from 'react';
import { X, Calendar, ChevronDown, Trash2, Settings, PlusCircle, Minus, Plus, Wallet, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Bet, Bankroll } from '../types';
import { CANONICAL_BOOKMAKER_LIST, SPORTS_LIST, SPORT_EMOJIS } from '../constants';
import { SearchableDropdown } from './SearchableDropdown';

interface AddBetSidebarProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
  selections: any[];
  addSelection: () => void;
  removeSelection: (id: string) => void;
  updateSelection: (id: string, field: string, value: any) => void;
  showMaisOpcoes: boolean;
  setShowMaisOpcoes: (show: boolean) => void;
  isSaving?: boolean;
}

export const AddBetSidebar: React.FC<AddBetSidebarProps> = ({
  isOpen, isEditMode, onClose, onSubmit, date, setDate, time, setTime,
  selections, addSelection, removeSelection, updateSelection,
  showMaisOpcoes, setShowMaisOpcoes,
  isSaving = false
}) => {
  const [expandedSelectionId, setExpandedSelectionId] = React.useState<string | null>(null);

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 z-[100] w-full max-w-xl bg-[#0b1120] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col h-[100dvh] max-h-[100dvh]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-[#0b1120]">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {isEditMode ? "Editar Aposta" : "Adicionar Aposta"}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form id="add-bet-form" onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
              <label className="text-[10px] md:text-xs font-normal md:font-medium text-gray-400 block mb-1">Data</label>
              <div className="relative">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-transparent border-none text-white text-sm md:text-base focus:outline-none [color-scheme:dark]" />
              </div>
            </div>
            <div className="space-y-1.5 p-3 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
              <label className="text-[10px] md:text-xs font-normal md:font-medium text-gray-400 block mb-1">Hora</label>
              <div className="relative">
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-transparent border-none text-white text-sm md:text-base focus:outline-none [color-scheme:dark]" />
              </div>
            </div>
          </div>

          {selections.map((selection, index) => (
            <div key={selection.id} className="border border-white/10 rounded-xl bg-white/[0.01]">
              <div className="p-2 sm:p-3 border-b border-white/5 bg-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-white/70 shrink-0" />
                  <span className="text-sm font-bold text-white/90 whitespace-nowrap">
                    {index === 0 ? "Aposta" : `Aposta ${index + 1}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                  {index > 0 && (
                    <>
                      <input type="date" value={selection.date || date} onChange={e => updateSelection(selection.id, 'date', e.target.value)} required className="w-[110px] sm:w-[130px] bg-white/5 border border-white/10 rounded-md px-2 text-white text-xs h-7 sm:h-8 focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]" />
                      <input type="time" value={selection.time || time} onChange={e => updateSelection(selection.id, 'time', e.target.value)} required className="w-[70px] sm:w-[80px] bg-white/5 border border-white/10 rounded-md px-2 text-white text-xs h-7 sm:h-8 focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]" />
                    </>
                  )}
                  {selections.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeSelection(selection.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="p-3 border border-white/10 rounded-lg bg-white/5 transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                  <SearchableDropdown
                    label="Casa de apostas"
                    value={selection.casaAposta}
                    onChange={(value) => updateSelection(selection.id, 'casaAposta', value)}
                    options={CANONICAL_BOOKMAKER_LIST}
                    placeholder="Selecionar ou digitar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1 space-y-1.5 p-3 border border-white/10 rounded-lg bg-white/5 transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                    <label className="text-[10px] md:text-xs font-normal md:font-semibold text-white/60 block">Título da aposta</label>
                    <input 
                      type="text" 
                      value={selection.titulo} 
                      onChange={e => updateSelection(selection.id, 'titulo', e.target.value)} 
                      onPaste={e => {
                        const text = e.clipboardData.getData('text');
                        const apostaMatch = text.match(/Aposta:\s*R?\$?\s*([0-9.,]+)/i);
                        if (apostaMatch) {
                           const stake = parseFloat(apostaMatch[1].replace(',', '.'));
                           updateSelection(selection.id, 'valor', stake.toString());
                        }
                      }}
                      required 
                      className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-gray-600" 
                      placeholder="Ex: Real Madrid - Bayern Munich" 
                    />
                  </div>
                  <div className="col-span-1 space-y-1.5 p-3 border border-white/10 rounded-lg bg-white/5 transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                    <label className="text-[10px] md:text-xs font-normal md:font-semibold text-white/60 block uppercase">ODD</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="1.01" 
                      value={selection.cotacao} 
                      onChange={e => updateSelection(selection.id, 'cotacao', e.target.value)} 
                      required 
                      className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-gray-600" 
                      placeholder="Ex: 1.50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-3 border border-white/10 rounded-lg bg-white/5 h-[64px] flex flex-col justify-center transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                    <label className="text-[10px] md:text-xs font-normal md:font-semibold text-white/60 block w-full">Esporte</label>
                    <div className="relative flex items-center">
                      <select 
                        value={selection.esporte} 
                        onChange={e => updateSelection(selection.id, 'esporte', e.target.value)} 
                        required 
                        className="w-full bg-transparent border-none text-white text-sm focus:outline-none appearance-none cursor-pointer pr-6 font-normal md:font-bold"
                      >
                        {SPORTS_LIST.map(sport => (
                          <option key={sport} value={sport} className="bg-[#0b1120]">
                            {SPORT_EMOJIS[sport] || '⚽'} {sport}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3 border border-white/10 rounded-lg bg-white/5 h-[64px] flex flex-col justify-center relative cursor-pointer group transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                    <label className="text-[10px] md:text-xs font-normal md:font-semibold text-white/60 block w-full">Estado</label>
                    <select 
                      value={selection.status} 
                      onChange={e => updateSelection(selection.id, 'status', e.target.value)} 
                      required 
                      className="w-full bg-transparent border-none text-white text-sm font-normal md:font-semibold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="pending" className="bg-[#0b1120]">Pendente</option>
                      <option value="won" className="bg-[#0b1120]">Ganha</option>
                      <option value="lost" className="bg-[#0b1120]">Perdida</option>
                      <option value="refunded" className="bg-[#0b1120]">Reembolsada</option>
                      <option value="half_won" className="bg-[#0b1120]">Meio ganho</option>
                      <option value="half_lost" className="bg-[#0b1120]">Meio perdido</option>
                      <option value="cashout" className="bg-[#0b1120]">Cashout</option>
                      <option value="canceled" className="bg-[#0b1120]">Cancelado</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-white/10 rounded-xl bg-white/[0.02] h-[64px] transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                        <label className="text-[10px] md:text-xs font-normal md:font-medium text-gray-400 block mb-1">Valor (R$)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          value={selection.valor} 
                          onChange={e => updateSelection(selection.id, 'valor', e.target.value)} 
                          required 
                          className="w-full bg-transparent border-none text-white text-sm md:text-base focus:outline-none placeholder:text-gray-600" 
                          placeholder="Ex: 50" 
                        />
                      </div>
                      <div className="relative">
                        <div 
                          className="p-3 border border-yellow-500/30 rounded-xl bg-yellow-500/[0.02] flex items-center justify-between gap-2 text-yellow-400 text-xs md:text-sm transition-all cursor-pointer hover:bg-yellow-500/[0.05] h-[64px]" 
                          onClick={() => setExpandedSelectionId(expandedSelectionId === selection.id ? null : selection.id)}
                        >
                          <div className="flex items-center md:gap-2 overflow-hidden">
                            <Wallet className="w-4 h-4 text-yellow-400 shrink-0 hidden md:block" />
                            <span className="font-semibold text-xs md:text-sm text-white/90 truncate">
                              {selection.has_deposited !== false ? "Depósito: Sim" : "Depósito: Não"}
                            </span>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-yellow-400 transition-transform shrink-0", expandedSelectionId === selection.id ? "rotate-180" : "")} />
                        </div>
                        
                        {expandedSelectionId === selection.id && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#161e32] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <button 
                              type="button"
                              className={cn("w-full text-left p-3 text-sm font-medium transition-colors hover:bg-white/5 border-b border-white/5", selection.has_deposited !== false ? "text-yellow-500 bg-white/5" : "text-white")}
                              onClick={() => { updateSelection(selection.id, 'has_deposited', true); setExpandedSelectionId(null); }}
                            >
                              Sim, depositei na casa
                            </button>
                            <button 
                              type="button"
                              className={cn("w-full text-left p-3 text-sm font-medium transition-colors hover:bg-white/5", selection.has_deposited === false ? "text-yellow-500 bg-white/5" : "text-white")}
                              onClick={() => { updateSelection(selection.id, 'has_deposited', false); setExpandedSelectionId(null); }}
                            >
                              Não, utilizei saldo da banca
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {selection.status === 'cashout' && (
                      <div className="p-3 border border-indigo-500/30 rounded-xl bg-indigo-500/[0.02] transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] md:text-xs font-normal md:font-medium text-white/60 block mb-1">Cashout da casa de apostas ($)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={selection.return_value || ''} 
                          onChange={e => updateSelection(selection.id, 'return_value', e.target.value)} 
                          required 
                          className="w-full bg-transparent border-none text-white text-sm md:text-base focus:outline-none placeholder:text-gray-600" 
                          placeholder="Ex: 7.90" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!isEditMode && (
            <>
              <button 
                type="button" 
                onClick={addSelection}
                className="w-full py-3 border border-indigo-500/20 rounded-xl bg-indigo-500/[0.03] flex items-center justify-center gap-2 text-indigo-400 text-sm font-bold hover:bg-indigo-500/[0.06] transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar mais de uma aposta
              </button>

              <button 
                type="button" 
                onClick={() => setShowMaisOpcoes(!showMaisOpcoes)}
                className="w-full py-3 border border-white/10 rounded-xl bg-white/[0.02] flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm font-bold text-white/90 cursor-pointer"
              >
                {showMaisOpcoes ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                Mais opções
              </button>
            </>
          )}

          {showMaisOpcoes && (
            <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {selections.map((selection, index) => (
                <div key={`comment-${selection.id}`} className="space-y-1.5 p-4 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5">
                  <label className="text-xs font-semibold text-white/60 block px-1">
                    Comentário - {index === 0 ? (isEditMode ? "Aposta selecionada" : "Aposta") : `Aposta ${index + 1}`}
                  </label>
                  <textarea 
                    value={selection.comment} 
                    onChange={e => updateSelection(selection.id, 'comment', e.target.value)}
                    placeholder={`Adicionar comentário para a ${index === 0 ? "aposta" : `aposta ${index + 1}`}...`}
                    className="w-full h-24 bg-transparent border-none text-white text-sm focus:outline-none transition-all resize-none placeholder:text-gray-600"
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="p-6 pb-10 mb-[env(safe-area-inset-bottom,0)] border-t border-white/10 bg-[#0b1120] shrink-0">
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white font-normal md:font-bold py-3.5 md:py-4 px-4 rounded-lg transition-all shadow-xl shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-3 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 md:w-6 h-5 md:h-6" />
                <span>{isEditMode ? "Salvar Alterações" : "Adicionar Aposta"}</span>
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
};