import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBets } from '../hooks/useBets';
import { useBankrollContext } from '../context/BankrollContext';
import { Bet } from '../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  externalBets?: Bet[];
  externalDailyProfits?: Record<string, number>;
}

export const CalendarModal = ({ isOpen, onClose, externalBets, externalDailyProfits }: CalendarModalProps) => {
  const betsHook = useBets();
  
  const bets = externalBets || betsHook.bets;
  const dailyProfits = externalDailyProfits || betsHook.dailyProfits;
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    const daysArr = new Date(year, month + 1, 0).getDate();
    
    // Previous month days to fill start of grid
    const prevMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: startDayIndex }, (_, i) => ({
      day: prevMonth - startDayIndex + i + 1,
      isCurrentMonth: false,
      dateStr: ''
    }));

    const currentMonthDays = Array.from({ length: daysArr }, (_, i) => {
      const yearStr = year;
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(i + 1).padStart(2, '0');
      return {
        day: i + 1,
        isCurrentMonth: true,
        dateStr: `${yearStr}-${monthStr}-${dayStr}`
      };
    });

    return [...prevMonthDays, ...currentMonthDays];
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const monthlyStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthStr = String(month + 1).padStart(2, '0');
    const startStr = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endStr = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
    
    const monthBets = bets.filter(b => b.date >= startStr && b.date <= endStr);
    const lucro = monthBets.reduce((acc, b) => acc + (b.profit || 0), 0);
    
    return {
      lucro,
      apostas: monthBets.length
    };
  }, [bets, currentDate]);

  const { filters, setFilters } = useBankrollContext();
  
  const handleDateClick = (dateStr: string) => {
    if (!dateStr) return;
    setFilters({
      ...filters,
      dateStart: dateStr,
      dateEnd: dateStr
    });
    onClose();
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0b1120] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col p-6",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Calendário de lucros</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-3 hover:bg-white/5 rounded-xl text-gray-400 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold capitalize text-lg text-white">{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-3 hover:bg-white/5 rounded-xl text-gray-400 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-500 font-black mb-2 uppercase tracking-widest">
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {daysInMonth.map((d, i) => {
            const profit = d.isCurrentMonth ? (dailyProfits[d.dateStr] || 0) : 0;
            const hasProfit = d.isCurrentMonth && dailyProfits[d.dateStr] !== undefined && dailyProfits[d.dateStr] !== 0;
            const isToday = d.isCurrentMonth && d.dateStr === new Date().toLocaleDateString('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            const isSelected = d.isCurrentMonth && filters.dateStart === d.dateStr && filters.dateEnd === d.dateStr;

            return (
              <button 
                key={i} 
                disabled={!d.isCurrentMonth}
                onClick={() => handleDateClick(d.dateStr)}
                className={cn(
                  "min-h-[60px] flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer relative group",
                  !d.isCurrentMonth ? "opacity-20 cursor-default border-transparent" : "hover:border-primary/50 hover:bg-white/5",
                  isToday ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "border-white/5 bg-[#0f172a]",
                  isSelected ? "ring-2 ring-primary border-primary bg-primary/10" : "",
                  hasProfit && profit > 0 && !isToday ? "border-[#66dd8b]/30 bg-[#66dd8b]/10" : "",
                  hasProfit && profit < 0 && !isToday ? "border-red-500/30 bg-red-500/10" : ""
                )}
              >
                <span className={cn("text-xs font-bold mb-1", !d.isCurrentMonth ? "text-gray-600" : "text-white")}>{d.day}</span>
                {hasProfit && (
                  <span className={cn("text-[9px] font-black", profit > 0 ? "text-[#66dd8b]" : "text-red-400")}>
                    {profit > 0 ? '+' : ''}{profit.toFixed(0)}
                  </span>
                )}
                {d.isCurrentMonth && (
                  <div className="absolute inset-0 rounded-xl bg-primary/0 group-active:bg-primary/5 transition-all" />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5">
            <div className="text-xs text-gray-400 font-bold mb-1">Lucro do mês</div>
            <div className={cn("text-lg font-black", monthlyStats.lucro >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
              {monthlyStats.lucro.toFixed(2)}R$
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5">
            <div className="text-xs text-gray-400 font-bold mb-1">Apostas do mês</div>
            <div className="text-lg font-black text-white">
              {monthlyStats.apostas}
            </div>
          </div>
        </div>
    </div>
  );
};
