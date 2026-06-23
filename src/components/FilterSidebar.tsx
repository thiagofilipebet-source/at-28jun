import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBankrollContext } from '../context/BankrollContext';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const InputField = ({ label, placeholder, value, onChange, type = "text", icon: Icon }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-tight">{label}</label>
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all [color-scheme:dark]"
      />
      {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />}
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder = "Selecionar" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-tight">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-[#0f172a]">{placeholder}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#0f172a]">{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
    </div>
  </div>
);

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
  const { filters: contextFilters, setFilters: setContextFilters } = useBankrollContext();
  const [localFilters, setLocalFilters] = useState(contextFilters);

  // Sync local filters with context when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(contextFilters);
    }
  }, [isOpen, contextFilters]);

  const handleReset = () => {
    const defaultFilters = {
      dateStart: '',
      dateEnd: '',
      title: '',
      status: '',
      sport: '',
      house: '',
      valMin: '',
      valMax: '',
      oddMin: '',
      oddMax: '',
      betType: ''
    };
    setLocalFilters(defaultFilters);
    setContextFilters(defaultFilters);
    onClose();
  };

  const handleFilter = () => {
    setContextFilters(localFilters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-[#061423] h-full flex flex-col shadow-2xl border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">FILTROS</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Data de início"
                  type="date"
                  value={localFilters.dateStart}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, dateStart: v })}
                />
                <InputField
                  label="Data final"
                  type="date"
                  value={localFilters.dateEnd}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, dateEnd: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Estado"
                  value={localFilters.status}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, status: v })}
                  options={['Ganha', 'Perdida', 'Pendente', 'Reembolsada', 'Cancelada', 'M. Ganha', 'M. Perdida']}
                />
                <SelectField
                  label="Esporte"
                  value={localFilters.sport}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, sport: v })}
                  options={['Futebol', 'Basquete', 'Tênis', 'Vôlei', 'eSports', 'MMA', 'Outros']}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Casa de apostas"
                  value={localFilters.house}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, house: v })}
                  options={['Bet365', 'Betano', 'Pinnacle', 'Betfair', '1xBet', 'Sportingbet', 'Blaze']}
                />
                <SelectField
                  label="Tipo de aposta"
                  value={localFilters.betType}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, betType: v })}
                  options={['Match Odds', 'Over/Under', 'Both Teams to Score', 'Handicap', 'Draw no Bet']}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Valor min (R$)"
                  placeholder="Ex: 10"
                  type="number"
                  value={localFilters.valMin}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, valMin: v })}
                />
                <InputField
                  label="Valor max (R$)"
                  placeholder="Ex: 80"
                  type="number"
                  value={localFilters.valMax}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, valMax: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Cotação min"
                  placeholder="Ex: 1.10"
                  type="number"
                  value={localFilters.oddMin}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, oddMin: v })}
                />
                <InputField
                  label="Cotação max"
                  placeholder="Ex: 2.45"
                  type="number"
                  value={localFilters.oddMax}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, oddMax: v })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <InputField
                  label="Título da aposta"
                  placeholder="Ex: Real Madrid - Bayern Mun"
                  value={localFilters.title}
                  onChange={(v: string) => setLocalFilters({ ...localFilters, title: v })}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-white/5 bg-[#061423] space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleReset}
                  className="w-full py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
                >
                  Remover filtro
                </button>
                <button
                  onClick={handleFilter}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6149fd] to-[#8a3ffc] hover:from-[#5136f0] hover:to-[#7b2ef5] text-white font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
