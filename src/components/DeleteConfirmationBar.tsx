import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DeleteConfirmationBarProps {
  isVisible: boolean;
  selectedCount: number;
  confirmDeletion: boolean;
  onConfirmChange: (checked: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
  itemType?: 'bet' | 'bankroll';
}

export const DeleteConfirmationBar: React.FC<DeleteConfirmationBarProps> = ({ 
  isVisible, 
  selectedCount, 
  confirmDeletion, 
  onConfirmChange, 
  onCancel, 
  onDelete,
  itemType = 'bet'
}) => {
  const titles = {
    bet: {
      singular: 'Aposta selecionada',
      plural: 'Apostas selecionadas',
      subtitle: 'Selecione as apostas para excluir'
    },
    bankroll: {
      singular: 'Banca selecionada',
      plural: 'Bancas selecionadas',
      subtitle: 'ATENÇÃO: Todas as apostas desta banca serão excluídas!'
    }
  };

  const t = titles[itemType];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 inset-x-0 lg:h-20 py-2.5 lg:py-0 bg-[#0f172a] border-t border-white/10 px-3 lg:px-6 flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-0 z-[60] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="w-8 h-8 lg:w-11 lg:h-11 rounded-full bg-[#f43f5e] flex items-center justify-center text-white font-black text-sm lg:text-lg shrink-0">
              {selectedCount}
            </div>
            <div className="flex flex-col select-none text-left">
              <span className="text-white font-bold text-sm lg:text-[15px] tracking-tight">
                {selectedCount === 1 ? t.singular : t.plural}
              </span>
              <span className="text-white/40 text-xs lg:text-[13px] font-medium tracking-tight">
                {t.subtitle}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 w-full lg:w-auto">
            <label className="flex items-center justify-center lg:justify-start gap-2 w-full lg:w-auto px-3 py-2 lg:py-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 cursor-pointer transition-all">
              <input 
                type="checkbox" 
                checked={confirmDeletion}
                onChange={(e) => onConfirmChange(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-transparent text-indigo-500 focus:ring-offset-0 focus:ring-0 cursor-pointer" 
              />
              <span className="text-white font-bold text-sm lg:text-xs">Confirmar a exclusão</span>
            </label>

            <div className="hidden lg:block h-8 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button 
                onClick={onCancel}
                className="flex-1 lg:flex-none py-2 lg:py-2.5 px-3 lg:px-6 bg-[#050914]/50 lg:bg-transparent rounded-lg text-gray-300 hover:text-white font-bold text-sm lg:text-xs transition-all tracking-wide lg:tracking-widest"
              >
                Cancelar
              </button>

              <button 
                disabled={!confirmDeletion || selectedCount === 0}
                onClick={onDelete}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 py-2 lg:py-2.5 px-3 lg:px-6 rounded-lg font-bold lg:font-black text-sm lg:text-xs transition-all",
                  confirmDeletion && selectedCount > 0
                    ? "bg-[#cc5e6c] hover:bg-[#b0525d] text-white shadow-lg active:scale-95"
                    : "bg-[#cc5e6c]/50 text-white/50 cursor-not-allowed"
                )}
              >
                <Trash2 className="w-4 h-4 opacity-50" />
                Remover
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
