import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Target, Wallet, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBankrollContext } from '../context/BankrollContext';
import { useBets } from '../hooks/useBets';

interface AnalysisSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
        className="relative w-full max-w-4xl bg-[#050914] h-full flex flex-col shadow-2xl border-l border-white/5"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-white tracking-tight">Análise Detalhada</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Placeholder */}
        <div className="flex-1 overflow-y-auto p-6 text-gray-400">
          <h3 className="text-xl font-bold text-white mb-4">Conteúdo da Análise em construção</h3>
          <p>Aqui você verá os gráficos e estatísticas detalhadas como nas fotos.</p>
        </div>
      </motion.div>
    </div>
  );
};
