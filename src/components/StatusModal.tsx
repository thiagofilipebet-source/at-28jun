import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, XCircle, RotateCcw, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { BetStatus } from '../types';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempStatus: BetStatus;
  setTempStatus: (status: BetStatus) => void;
  tempReturnValue?: number;
  setTempReturnValue?: (val: number) => void;
  onConfirm: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ 
  isOpen, 
  onClose, 
  tempStatus, 
  setTempStatus, 
  tempReturnValue,
  setTempReturnValue,
  onConfirm 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-[450px] p-6 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/40 font-bold text-sm tracking-widest uppercase">Alterar Status</span>
              <button 
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'pending', label: 'Pendente', icon: Clock },
                { id: 'won', label: 'Ganha', icon: CheckCircle2 },
                { id: 'lost', label: 'Perdida', icon: XCircle },
                { id: 'refunded', label: 'Reembolsada', icon: RotateCcw },
                { id: 'half_won', label: 'Meio ganho', icon: ArrowUpCircle },
                { id: 'half_lost', label: 'Meio perdido', icon: ArrowDownCircle },
                { id: 'cashout', label: 'Cashout', icon: DollarSign },
                { id: 'canceled', label: 'Cancelado', icon: XCircle },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTempStatus(option.id as BetStatus)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all relative group text-left",
                    tempStatus === option.id 
                      ? "bg-white/5 border-indigo-500/50 ring-1 ring-indigo-500/50" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      tempStatus === option.id ? "border-indigo-500" : "border-white/20"
                    )}>
                      {tempStatus === option.id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      tempStatus === option.id ? "text-white" : "text-white/60"
                    )}>
                      {option.label}
                    </span>
                  </div>
                  <option.icon className={cn(
                    "w-4 h-4 transition-colors",
                    tempStatus === option.id ? "text-white/80" : "text-white/20 group-hover:text-white/40"
                  )} />
                </button>
              ))}
            </div>

            {tempStatus === 'cashout' && setTempReturnValue && (
              <div className="p-3 border border-indigo-500/30 rounded-xl bg-indigo-500/[0.02] mt-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-semibold text-white/60 block mb-1">
                  Cashout da casa de apostas ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tempReturnValue || ''}
                  onChange={(e) => setTempReturnValue(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 7.90"
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-gray-600"
                />
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={onClose}
                className="flex-1 py-3.5 text-white/60 font-bold hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] text-white font-bold rounded-lg shadow-xl shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
