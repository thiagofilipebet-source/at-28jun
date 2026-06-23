import React from 'react';
import { cn } from '../lib/utils';

interface EarningCardProps {
  title: string;
  period: string;
  value: number;
  earnings: number;
  losses: number;
  bets: number;
}

export const EarningCard: React.FC<EarningCardProps> = ({ title, period, value, earnings, losses, bets }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 flex-1 justify-center">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{title}</span>
      <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{period}</span>
    </div>
    <div>
      <div className={cn("text-xl lg:text-[22px] leading-tight font-black", value >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
        {value >= 0 ? '+' : ''}R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="flex justify-between items-center mt-0.5 text-[10px] font-semibold text-gray-400">
        <span className="text-[#66dd8b]/80">Ganhos: R$ {earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-red-400/80">Percas: R$ {losses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-0.5">
      <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-400 border border-white/5 w-fit">
        {bets} Apostas
      </div>
    </div>
  </div>
);
