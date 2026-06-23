import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, Hotel, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSportMappingsContext } from '../context/SportMappingsContext';
import { BOOKMAKER_LOGOS } from '../constants';

interface AutomationDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sport' | 'house';
}

export const AutomationDictionaryModal: React.FC<AutomationDictionaryModalProps> = ({ isOpen, onClose, type }) => {
  const { mappings, addMapping, deleteMapping } = useSportMappingsContext();
  const [keyword, setKeyword] = useState('');
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset value when type changes
  useEffect(() => {
    if (isOpen) {
      setValue(type === 'sport' ? 'Futebol' : '');
      setKeyword('');
    }
  }, [type, isOpen]);

  if (!isOpen) return null;

  const filteredMappings = mappings.filter(m => {
      if (type === 'sport') {
          return m.type === 'sport' || !m.type;
      }
      return m.type === 'house';
  });

  const handleAdd = async () => {
    if (!keyword.trim() || !value.trim()) return;
    setIsSaving(true);
    const result = await addMapping(keyword, value, type);
    setIsSaving(false);
    if (result) {
      setKeyword('');
      if (type === 'house') setValue('');
    }
  };

  const title = type === 'sport' ? 'Dicionário de Esportes' : 'Dicionário de Casas de Aposta';
  const label = type === 'sport' ? 'Esporte' : 'Casa de Aposta';
  const placeholder = type === 'sport' ? 'Ex: Shai, Nadal, UFC...' : 'Ex: EDS, Estrelabet, etc...';
  const description = type === 'sport' 
    ? 'Adicione palavras-chave para identificar o esporte automaticamente pelo nome do evento.'
    : 'Adicione abreviações ou nomes alternativos para identificar a casa de aposta automaticamente.';

  const bookmakers = Object.keys(BOOKMAKER_LOGOS).sort();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0b1120]">
      <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          {type === 'sport' ? <BookOpen className="w-6 h-6 text-indigo-400" /> : <Hotel className="w-6 h-6 text-green-400" />}
          {title}
        </h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", type === 'sport' ? "bg-indigo-500/10" : "bg-green-500/10")}>
                {type === 'sport' ? <BookOpen className="w-5 h-5 text-indigo-400" /> : <Hotel className="w-5 h-5 text-green-400" />}
              </div>
              <h3 className="text-lg font-bold text-white">{description}</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">
              {type === 'sport' 
                ? 'Ex: Se você adicionar "Shai" \u2192 "Basquete", ao digitar "Shai Gilgeous-Alexander" o esporte mudará para Basquete.'
                : 'Ex: Se você adicionar "EDS" \u2192 "Esportes da Sorte", ao digitar "EDS" a casa de aposta mudará para Esportes da Sorte.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1 whitespace-nowrap">Palavra-chave</label>
              <input 
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-600"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1 whitespace-nowrap">{label}</label>
              {type === 'sport' ? (
                <div className="relative">
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isSaving}
                  >
                    {['Futebol', 'Basquete', 'Tenis', 'Volei', 'Esports'].map(s => <option key={s} value={s} className="bg-[#1a1f2e]">{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              ) : (
                <div className="relative">
                  <input 
                    list="bookmakers-list"
                    placeholder="Selecione ou digite..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-600"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isSaving}
                  />
                  <datalist id="bookmakers-list">
                    {bookmakers.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={handleAdd}
                disabled={!keyword.trim() || !value.trim() || isSaving}
                className="w-full bg-[#66dd8b] hover:bg-[#5dbf80] disabled:bg-gray-600 disabled:text-gray-400 text-[#0b1120] font-bold rounded-xl py-3.5 px-4 transition-all shadow-lg shadow-[#66dd8b]/10 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-[#0b1120]/30 border-t-[#0b1120] rounded-full animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {isSaving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs">Mapeamentos Ativos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
              {filteredMappings.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  {type === 'sport' ? <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" /> : <Hotel className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />}
                  <p className="text-gray-500 text-sm italic">Nenhum mapeamento adicionado ainda.</p>
                </div>
              ) : (
                  filteredMappings.map(m => (
                      <div key={m.id} className="group flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{m.keyword}</span>
                            <span className={cn("text-xs uppercase font-bold tracking-tighter opacity-70", type === 'sport' ? "text-indigo-400" : "text-green-400")}>
                                {m.sport}
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteMapping(m.id)} 
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
