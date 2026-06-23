import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Calendar, BarChart2, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnalysisChart } from './AnalysisChart';
import { AnalysisDualChart } from './AnalysisDualChart';
import { useBankrollContext } from '../context/BankrollContext';
import { useBets } from '../hooks/useBets';
import { BetStatus } from '../types';
import { normalizeBookmakerName } from '../constants';

const FilterBar = ({ 
  dateFrom, setDateFrom, 
  dateTo, setDateTo, 
  onClear,
  bankrolls,
  selectedBankrollId,
  setSelectedBankrollId
}: { 
  dateFrom: string; setDateFrom: (v: string) => void; 
  dateTo: string; setDateTo: (v: string) => void; 
  onClear: () => void;
  bankrolls: any[];
  selectedBankrollId: string;
  setSelectedBankrollId: (v: string) => void;
}) => (
  <div className="bg-[#0b1120] border border-white/5 rounded-xl p-3 lg:p-4 grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-4 items-end mb-4 lg:mb-6">
    <div className="flex flex-col gap-1 col-span-2 lg:col-span-1 lg:flex-1">
      <label className="text-[10px] lg:text-xs font-bold text-gray-400">Banca</label>
      <select
        value={selectedBankrollId}
        onChange={(e) => setSelectedBankrollId(e.target.value)}
        className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 hover:bg-[#1e293b]/70"
      >
        <option value="all">Todas as bancas</option>
        {bankrolls.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
    
    <div className="flex flex-col gap-1 lg:flex-1">
      <label className="text-[10px] lg:text-xs font-bold text-gray-400">De</label>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
      />
    </div>

    <div className="flex flex-col gap-1 lg:flex-1">
      <label className="text-[10px] lg:text-xs font-bold text-gray-400">Até</label>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
      />
    </div>

    <div className="flex flex-col gap-1 col-span-2 lg:col-span-1 w-full lg:w-auto mt-1 lg:mt-0">
      <button
        type="button"
        onClick={onClear}
        className="bg-transparent border border-white/10 text-white rounded-lg px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold hover:bg-white/5 transition-all text-center w-full"
      >
        Limpar
      </button>
    </div>
  </div>
);

export const AnalysisView: React.FC = () => {
  const tabs = ["Geral", "Período", "Esporte", "Casa de apostas"];
  const [activeTab, setActiveTab] = useState("Geral");
  const { bankrolls } = useBankrollContext();
  const { allBets } = useBets();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
const [selectedBankrollId, setSelectedBankrollId] = useState<string>('all');
  const [periodDateFrom, setPeriodDateFrom] = useState<string>('');
  const [periodDateTo, setPeriodDateTo] = useState<string>('');
  const [esporteDateFrom, setEsporteDateFrom] = useState<string>('');
  const [esporteDateTo, setEsporteDateTo] = useState<string>('');
  const [casaDateFrom, setCasaDateFrom] = useState<string>('');
  const [casaDateTo, setCasaDateTo] = useState<string>('');

  // Geral Filters
  const [geralBankroll, setGeralBankroll] = useState<string>('all');
  const [geralDateFrom, setGeralDateFrom] = useState<string>('');
  const [geralDateTo, setGeralDateTo] = useState<string>('');
  const [geralSport, setGeralSport] = useState<string>('Todos');
  const [geralBookmaker, setGeralBookmaker] = useState<string>('Todas');

  const [geralSharedPeriod, setGeralSharedPeriod] = useState<string>('Tudo');
  const [geralSharedDate, setGeralSharedDate] = useState<string>('');

  const allSportsList = useMemo(() => {
    const set = new Set<string>();
    allBets.forEach(b => {
      let sport = (b.sport || 'Outros').trim();
      sport = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
      if (sport === 'Basquetebol') sport = 'Basquete';
      if (sport === 'Tênis' || sport === 'Tenis') sport = 'Ténis';
      if (sport === 'Hockey' || sport === 'Hoquei no gelo') sport = 'Hóquei no gelo';
      if (sport === 'Outro' || sport === 'Outros') sport = 'Outros';
      if (sport === 'Esports' || sport === 'E-sports' || sport === 'E sports') sport = 'eSports';
      if (sport) set.add(sport);
    });
    return Array.from(set).sort();
  }, [allBets]);

  const allBookiesList = useMemo(() => {
    const set = new Set<string>();
    allBets.forEach(b => {
      const bookmaker = normalizeBookmakerName(b.bookmaker, 'Não informada');
      if (bookmaker) set.add(bookmaker);
    });
    return Array.from(set).sort();
  }, [allBets]);

  const filterByPeriod = (bets: typeof allBets, period: string, exactDate: string) => {
    if (exactDate) return bets.filter(b => b.date === exactDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToStr = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const _d = new Date(d.getTime() - (offset*60*1000));
      return _d.toISOString().split('T')[0];
    }
    
    if (period === 'Hoje') {
      const todayStr = dateToStr(today);
      return bets.filter(b => b.date === todayStr);
    }
    if (period === 'Ontem') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = dateToStr(yesterday);
      return bets.filter(b => b.date === yesterdayStr);
    }
    if (period === '7D') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = dateToStr(sevenDaysAgo);
      return bets.filter(b => b.date >= sevenDaysAgoStr);
    }
    return bets;
  };

  const geralBets = useMemo(() => {
    return allBets.filter(bet => {
      if (geralBankroll !== 'all' && bet.bankroll_id !== geralBankroll) return false;
      let sport = (bet.sport || 'Outros').trim();
      sport = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
      if (sport === 'Basquetebol') sport = 'Basquete';
      if (sport === 'Tênis' || sport === 'Tenis') sport = 'Ténis';
      if (sport === 'Hockey' || sport === 'Hoquei no gelo') sport = 'Hóquei no gelo';
      if (sport === 'Outro' || sport === 'Outros') sport = 'Outros';
      if (sport === 'Esports' || sport === 'E-sports' || sport === 'E sports') sport = 'eSports';
      if (geralSport !== 'Todos' && sport !== geralSport) return false;

      let bookie = (bet.bookmaker || 'Não informada').trim();
      bookie = bookie.charAt(0).toUpperCase() + bookie.slice(1).toLowerCase();
      if (["Esporte da sorte", "Esportes da sorte"].includes(bookie)) bookie = "Esportes da sorte";
      if (["Faz1", "Faz1bet", "Faz 1 bet"].includes(bookie)) bookie = "Faz 1 Bet";
      if (["Gol de bet", "Goldebet"].includes(bookie)) bookie = "Gol de Bet";
      if (["Aposta ganha", "Apostaganha", "Aposta ganha bet", "Apostaganhabet"].includes(bookie)) bookie = "Aposta Ganha";
      if (["Bravobet", "Bravo bet", "Bravo"].includes(bookie)) bookie = "Bravobet";
      if (["Estrelabet", "Estrela bet"].includes(bookie)) bookie = "Estrela Bet";
      if (geralBookmaker !== 'Todas' && bookie !== geralBookmaker) return false;

      if (geralDateFrom && bet.date < geralDateFrom) return false;
      if (geralDateTo && bet.date > geralDateTo) return false;
      return true;
    });
  }, [allBets, geralBankroll, geralSport, geralBookmaker, geralDateFrom, geralDateTo]);

  const geralStats = useMemo(() => {
    let profit = 0;
    let volume = 0;
    let count = 0;
    geralBets.forEach(bet => {
      profit += bet.profit;
      volume += bet.stake;
      count++;
    });
    return {
      profit,
      volume,
      count,
      roi: volume > 0 ? (profit / volume) * 100 : 0
    };
  }, [geralBets]);

  const geralBookmakerData = useMemo(() => {
     const bets = filterByPeriod(geralBets, geralSharedPeriod, geralSharedDate);
     const map = new Map();
     bets.forEach(bet => {
         const bookmaker = normalizeBookmakerName(bet.bookmaker, 'Não informada');
         
         if (!map.has(bookmaker)) map.set(bookmaker, { name: bookmaker, profit: 0, stake: 0, count: 0 });
         const d = map.get(bookmaker);
         d.profit += bet.profit;
         d.stake += bet.stake;
         d.count++;
     });
     return Array.from(map.values())
       .map(d => ({
         ...d,
         roi: d.stake > 0 ? (d.profit / d.stake) * 100 : 0
       }))
       .filter(d => d.count > 0)
       .sort((a, b) => b.profit - a.profit);
  }, [geralBets, geralSharedPeriod, geralSharedDate]);

  const geralSportData = useMemo(() => {
     const bets = filterByPeriod(geralBets, geralSharedPeriod, geralSharedDate);
     const map = new Map();
     bets.forEach(bet => {
         let sport = (bet.sport || 'Outros').trim();
         sport = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
         if (sport === 'Basquetebol') sport = 'Basquete';
         if (sport === 'Tênis' || sport === 'Tenis') sport = 'Ténis';
         if (sport === 'Hockey' || sport === 'Hoquei no gelo') sport = 'Hóquei no gelo';
         if (sport === 'Outro' || sport === 'Outros') sport = 'Outros';
         if (sport === 'Esports' || sport === 'E-sports' || sport === 'E sports') sport = 'eSports';
         if (!map.has(sport)) map.set(sport, { name: sport, profit: 0, stake: 0, count: 0 });
         const d = map.get(sport);
         d.profit += bet.profit;
         d.stake += bet.stake;
         d.count++;
     });
     return Array.from(map.values())
       .map(d => ({
         ...d,
         roi: d.stake > 0 ? (d.profit / d.stake) * 100 : 0
       }))
       .filter(d => d.count > 0)
       .sort((a, b) => b.profit - a.profit);
  }, [geralBets, geralSharedPeriod, geralSharedDate]);

  // Helpers to prevent timezone shifts
  const toLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const filteredBets = useMemo(() => {
    let bets = selectedBankrollId === 'all' 
      ? allBets 
      : allBets.filter(b => b.bankroll_id === selectedBankrollId);

    let dateFrom = '';
    let dateTo = '';

    if (activeTab === "Período") {
      dateFrom = periodDateFrom;
      dateTo = periodDateTo;
    } else if (activeTab === "Esporte") {
      dateFrom = esporteDateFrom;
      dateTo = esporteDateTo;
    } else if (activeTab === "Casa de apostas") {
      dateFrom = casaDateFrom;
      dateTo = casaDateTo;
    }

    if (dateFrom || dateTo) {
      bets = bets.filter(bet => {
        if (dateFrom && bet.date < dateFrom) return false;
        if (dateTo && bet.date > dateTo) return false;
        return true;
      });
    }

    return bets;
  }, [allBets, selectedBankrollId, activeTab, periodDateFrom, periodDateTo, esporteDateFrom, esporteDateTo, casaDateFrom, casaDateTo]);

  const sportData = useMemo(() => {
    const map = new Map();
    filteredBets.forEach(bet => {
        const rawSport = (bet.sport || 'Outros').trim();
        let sport = rawSport.charAt(0).toUpperCase() + rawSport.slice(1).toLowerCase();
        if (sport === 'Basquetebol') sport = 'Basquete';
        if (sport === 'Tênis' || sport === 'Tenis') sport = 'Ténis';
        if (sport === 'Hockey' || sport === 'Hoquei no gelo') sport = 'Hóquei no gelo';
        if (sport === 'Outro' || sport === 'Outros') sport = 'Outros';
        if (sport === 'Esports' || sport === 'E-sports' || sport === 'E sports') sport = 'eSports';
        
        if (!map.has(sport)) map.set(sport, { sport, count: 0, won: 0, lost: 0, refund: 0, totalStake: 0, totalProfit: 0 });
        const d = map.get(sport);
        d.count++;
        if (bet.status === 'won') d.won++;
        else if (bet.status === 'lost') d.lost++;
        else if (bet.status === 'refunded') d.refund++;
        d.totalStake += bet.stake;
        d.totalProfit += bet.profit;
    });
    return Array.from(map.values()).map(d => ({
        ...d,
        roi: d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0,
        sucesso: d.count !== 0 ? (d.won / d.count) * 100 : 0
    }));
  }, [filteredBets]);

  const bookmakerData = useMemo(() => {
    const map = new Map();
    filteredBets.forEach(bet => {
        const bookmaker = normalizeBookmakerName(bet.bookmaker, 'Outro');
        
        if (!map.has(bookmaker)) map.set(bookmaker, { bookmaker, count: 0, won: 0, lost: 0, refund: 0, totalStake: 0, totalProfit: 0 });
        const d = map.get(bookmaker);
        d.count++;
        if (bet.status === 'won') d.won++;
        else if (bet.status === 'lost') d.lost++;
        else if (bet.status === 'refunded') d.refund++;
        d.totalStake += bet.stake;
        d.totalProfit += bet.profit;
    });
    return Array.from(map.values())
      .filter(d => d.bookmaker !== 'Outro')
      .map(d => ({
        ...d,
        roi: d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0,
        sucesso: d.count !== 0 ? (d.won / d.count) * 100 : 0
      }));
  }, [filteredBets]);

  const profitData = useMemo(() => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const data = days.map(day => ({ name: day, lucro: 0 }));
    
    filteredBets.forEach(bet => {
      const date = toLocalDate(bet.date);
      // Adjust day index for Sunday=6 to Sunday=0
      let dayIndex = date.getDay() - 1;
      if (dayIndex < 0) dayIndex = 6;
      
      data[dayIndex].lucro += bet.profit;
    });
    return data;
  }, [filteredBets]);

  const roiSuccessData = useMemo(() => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const data = days.map(day => ({ name: day, roi: 0, sucesso: 0, totalProfit: 0, totalStake: 0, count: 0, won: 0 }));
    
    filteredBets.forEach(bet => {
      const date = toLocalDate(bet.date);
      let dayIndex = date.getDay() - 1;
      if (dayIndex < 0) dayIndex = 6;
      
      data[dayIndex].totalProfit += bet.profit;
      data[dayIndex].totalStake += bet.stake;
      data[dayIndex].count++;
      if (bet.status === 'won' || bet.status === 'half_won') data[dayIndex].won++;
    });

    return data.map(d => ({
      name: d.name,
      roi: d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0,
      sucesso: d.count !== 0 ? (d.won / d.count) * 100 : 0
    }));
  }, [filteredBets]);

  const tableData = useMemo(() => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const fullNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const data = days.map((day, i) => ({ dia: fullNames[i], apostas: 0, ganha: 0, perdida: 0, reembolsada: 0, total: 0, lucro: 0 }));
    
    filteredBets.forEach(bet => {
      const date = toLocalDate(bet.date);
      let dayIndex = date.getDay() - 1;
      if (dayIndex < 0) dayIndex = 6;
      
      data[dayIndex].apostas++;
      if (bet.status === 'won') data[dayIndex].ganha++;
      else if (bet.status === 'lost') data[dayIndex].perdida++;
      else if (bet.status === 'refunded') data[dayIndex].reembolsada++;
      
      data[dayIndex].total += bet.stake;
      data[dayIndex].lucro += bet.profit;
    });

    return data.map(d => ({
      ...d,
      total: d.total.toFixed(2) + ' $',
      roi: (d.total !== 0 ? (d.lucro / d.total) * 100 : 0).toFixed(2) + ' %',
      sucesso: (d.apostas !== 0 ? (d.ganha / d.apostas) * 100 : 0).toFixed(2) + ' %'
    }));
  }, [filteredBets]);

  const currentWeekId = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const weekNumber = Math.ceil((((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    return `S${weekNumber} ${year}`;
  }, []);

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const weekData = useMemo(() => {
    const map = new Map();
    
    // Always insert the current week
    const currentYear = parseInt(currentWeekId.split(' ')[1]);
    const currentWeekNum = parseInt(currentWeekId.split(' ')[0].substring(1));
    map.set(currentWeekId, { id: currentWeekId, apostas: 0, ganha: 0, perdida: 0, reembolsada: 0, totalStake: 0, totalProfit: 0, won: 0, count: 0, weekNumber: currentWeekNum, year: currentYear });

    filteredBets.forEach(bet => {
      const date = toLocalDate(bet.date);
      const year = date.getFullYear();
      // Reset date to start of week (Monday)
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      
      const weekNumber = Math.ceil((((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
      const id = `S${weekNumber} ${year}`;
      
      if (!map.has(id)) map.set(id, { id, apostas: 0, ganha: 0, perdida: 0, reembolsada: 0, totalStake: 0, totalProfit: 0, won: 0, count: 0, weekNumber, year });
      const dEntry = map.get(id);
      dEntry.apostas++;
      if (bet.status === 'won') dEntry.ganha++;
      else if (bet.status === 'lost') dEntry.perdida++;
      else if (bet.status === 'refunded') dEntry.reembolsada++;
      dEntry.totalStake += bet.stake;
      dEntry.totalProfit += bet.profit;
      dEntry.count++;
      if (bet.status === 'won' || bet.status === 'half_won') dEntry.won++;
    });
    // Sort by year descending then week number descending
    return Array.from(map.values()).sort((a,b) => b.year - a.year || b.weekNumber - a.weekNumber);
  }, [filteredBets, currentWeekId]);

  useEffect(() => {
    if (weekData.length > 0 && !selectedWeek) {
      setSelectedWeek(currentWeekId);
    }
  }, [weekData, selectedWeek, currentWeekId]);

  const weekProfitData = useMemo(() => weekData.map(d => ({ name: d.id, lucro: d.totalProfit })), [weekData]);
  const weekRoiSuccessData = useMemo(() => weekData.map(d => ({ 
    name: d.id, 
    roi: d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0, 
    sucesso: d.count !== 0 ? (d.won / d.count) * 100 : 0 
  })), [weekData]);
  
  const dailyDataForSelectedWeek = useMemo(() => {
    if (!selectedWeek) return { profitData: [], roiSuccessData: [], tableData: [] };
    
    const week = weekData.find(w => w.id === selectedWeek);
    if (!week) return { profitData: [], roiSuccessData: [], tableData: [] };

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const fullNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    
    const year = parseInt(selectedWeek.split(' ')[1]);
    const weekNum = parseInt(selectedWeek.split(' ')[0].slice(1));
    const firstJan = new Date(year, 0, 1);
    const day = firstJan.getDay();
    const diff = firstJan.getDate() - day + (day === 0 ? -6 : 1);
    const firstMonday = new Date(year, 0, diff);
    const mondayOfWeek = new Date(firstMonday.getTime() + (weekNum - 1) * 7 * 86400000);
    
    const data = days.map((dayName, i) => {
        const currentDate = new Date(mondayOfWeek.getTime() + i * 86400000);
        const dateStr = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
        return { 
          name: dayName, 
          dia: `${fullNames[i]} - ${dateStr}`, 
          lucro: 0, 
          roi: 0, 
          sucesso: 0, 
          apostas: 0, 
          ganha: 0, 
          perdida: 0, 
          reembolsada: 0, 
          totalStake: 0 
        };
    });

    // Filter bets for the selected week
    const weekBets = filteredBets.filter(bet => {
        const date = toLocalDate(bet.date);
        const year = date.getFullYear();
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        const weekNumber = Math.ceil((((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
        return `S${weekNumber} ${year}` === selectedWeek;
    });

    weekBets.forEach(bet => {
        const date = toLocalDate(bet.date);
        let dayIndex = date.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        
        data[dayIndex].lucro += bet.profit;
        data[dayIndex].totalStake += bet.stake;
        data[dayIndex].apostas++;
        if (bet.status === 'won') data[dayIndex].ganha++;
        else if (bet.status === 'lost') data[dayIndex].perdida++;
        else if (bet.status === 'refunded') data[dayIndex].reembolsada++;
    });

    return {
        profitData: data.map(d => ({ name: d.name, lucro: d.lucro })),
        roiSuccessData: data.map(d => ({
            name: d.name,
            roi: d.totalStake !== 0 ? (d.lucro / d.totalStake) * 100 : 0,
            sucesso: d.apostas !== 0 ? (d.ganha / d.apostas) * 100 : 0
        })),
        tableData: data.map(d => ({
            dia: d.dia,
            apostas: d.apostas,
            ganha: d.ganha,
            perdida: d.perdida,
            reembolsada: d.reembolsada,
            total: d.totalStake.toFixed(2) + ' $',
            lucro: d.lucro,
            roi: (d.totalStake !== 0 ? (d.lucro / d.totalStake) * 100 : 0).toFixed(2) + ' %',
            sucesso: (d.apostas !== 0 ? (d.ganha / d.apostas) * 100 : 0).toFixed(2) + ' %'
        }))
    };
  }, [filteredBets, selectedWeek, weekData]);

  const [currentWeekPage, setCurrentWeekPage] = useState(0);
  const weeksPerPage = 5;
  const visibleWeekTableData = useMemo(() => {
    const data = weekData.map(d => ({
      semana: d.id,
      apostas: d.apostas,
      ganha: d.ganha,
      perdida: d.perdida,
      reembolsada: d.reembolsada,
      total: d.totalStake.toFixed(2) + ' $',
      lucro: d.totalProfit,
      roi: (d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0).toFixed(2) + ' %',
      sucesso: (d.count !== 0 ? (d.won / d.count) * 100 : 0).toFixed(2) + ' %'
    }));
    return data.slice(currentWeekPage * weeksPerPage, (currentWeekPage + 1) * weeksPerPage);
  }, [weekData, currentWeekPage]);

  const monthData = useMemo(() => {
    const map = new Map();
    filteredBets.forEach(bet => {
      const date = toLocalDate(bet.date);
      const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const id = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!map.has(id)) map.set(id, { id, apostas: 0, ganha: 0, perdida: 0, reembolsada: 0, totalStake: 0, totalProfit: 0, won: 0, count: 0 });
      const d = map.get(id);
      d.apostas++;
      if (bet.status === 'won') d.ganha++;
      else if (bet.status === 'lost') d.perdida++;
      else if (bet.status === 'refunded') d.reembolsada++;
      d.totalStake += bet.stake;
      d.totalProfit += bet.profit;
      d.count++;
      if (bet.status === 'won' || bet.status === 'half_won') d.won++;
    });
    return Array.from(map.values());
  }, [filteredBets]);

  const monthProfitData = useMemo(() => monthData.map(d => ({ name: d.id, lucro: d.totalProfit })), [monthData]);
  const monthRoiSuccessData = useMemo(() => monthData.map(d => ({ 
    name: d.id, 
    roi: d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0, 
    sucesso: d.count !== 0 ? (d.won / d.count) * 100 : 0 
  })), [monthData]);
  const monthTableData = useMemo(() => monthData.map(d => ({
    mes: d.id,
    apostas: d.apostas,
    ganha: d.ganha,
    perdida: d.perdida,
    reembolsada: d.reembolsada,
    total: d.totalStake.toFixed(2) + ' $',
    lucro: d.totalProfit,
    roi: (d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0).toFixed(2) + ' %',
    sucesso: (d.apostas !== 0 ? (d.ganha / d.apostas) * 100 : 0).toFixed(2) + ' %'
  })), [monthData]);

  const yearData = useMemo(() => {
    const map = new Map();
    filteredBets.forEach(bet => {
      const date = toLocalDate(bet.date);
      const id = date.getFullYear().toString();
      if (!map.has(id)) map.set(id, { id, apostas: 0, ganha: 0, perdida: 0, reembolsada: 0, totalStake: 0, totalProfit: 0, won: 0, count: 0 });
      const d = map.get(id);
      d.apostas++;
      if (bet.status === 'won') d.ganha++;
      else if (bet.status === 'lost') d.perdida++;
      else if (bet.status === 'refunded') d.reembolsada++;
      d.totalStake += bet.stake;
      d.totalProfit += bet.profit;
      d.count++;
      if (bet.status === 'won' || bet.status === 'half_won') d.won++;
    });
    return Array.from(map.values());
  }, [filteredBets]);

  const yearProfitData = useMemo(() => yearData.map(d => ({ name: d.id, lucro: d.totalProfit })), [yearData]);
  const yearRoiSuccessData = useMemo(() => yearData.map(d => ({ 
    name: d.id, 
    roi: d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0, 
    sucesso: d.count !== 0 ? (d.won / d.count) * 100 : 0 
  })), [yearData]);
  const yearTableData = useMemo(() => yearData.map(d => ({
    ano: d.id,
    apostas: d.apostas,
    ganha: d.ganha,
    perdida: d.perdida,
    reembolsada: d.reembolsada,
    total: d.totalStake.toFixed(2) + ' $',
    lucro: d.totalProfit,
    roi: (d.totalStake !== 0 ? (d.totalProfit / d.totalStake) * 100 : 0).toFixed(2) + ' %',
    sucesso: (d.apostas !== 0 ? (d.ganha / d.apostas) * 100 : 0).toFixed(2) + ' %'
  })), [yearData]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#050914] text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Análise Detalhada</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4 lg:mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors border whitespace-nowrap",
              activeTab === tab
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                : "bg-[#0b1120] text-gray-400 border-white/5 hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Geral" && (
        <div className="space-y-4 lg:space-y-6">
          {/* Top Filter Bar */}
          <div className="bg-[#0b1120] border border-white/5 rounded-xl p-3 lg:p-4 grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-4 items-end">
            <div className="flex flex-col gap-1 col-span-2 lg:col-span-1 lg:flex-1">
              <label className="text-[10px] lg:text-xs font-bold text-gray-400">Banca</label>
              <select
                value={geralBankroll}
                onChange={(e) => setGeralBankroll(e.target.value)}
                className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 hover:bg-[#1e293b]/70"
              >
                <option value="all">Todas as bancas</option>
                {bankrolls.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1 lg:flex-1">
              <label className="text-[10px] lg:text-xs font-bold text-gray-400">De</label>
              <div className="relative">
                <input
                  type="date"
                  value={geralDateFrom}
                  onChange={(e) => setGeralDateFrom(e.target.value)}
                  className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 lg:flex-1">
              <label className="text-[10px] lg:text-xs font-bold text-gray-400">Até</label>
              <div className="relative">
                <input
                  type="date"
                  value={geralDateTo}
                  onChange={(e) => setGeralDateTo(e.target.value)}
                  className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 lg:flex-1">
              <label className="text-[10px] lg:text-xs font-bold text-gray-400">Esporte</label>
              <select
                value={geralSport}
                onChange={(e) => setGeralSport(e.target.value)}
                className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 hover:bg-[#1e293b]/70"
              >
                <option value="Todos">Todos</option>
                {allSportsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 lg:flex-1">
              <label className="text-[10px] lg:text-xs font-bold text-gray-400">Casa de Aposta</label>
              <select
                value={geralBookmaker}
                onChange={(e) => setGeralBookmaker(e.target.value)}
                className="bg-[#1e293b] text-xs lg:text-sm text-white border border-white/10 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 w-full focus:outline-none focus:border-indigo-500/50 hover:bg-[#1e293b]/70"
              >
                <option value="Todas">Todas</option>
                {allBookiesList.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 col-span-2 lg:col-span-1 w-full lg:w-auto mt-1 lg:mt-0">
              <button
                type="button"
                onClick={() => {
                  setGeralBankroll('all');
                  setGeralDateFrom('');
                  setGeralDateTo('');
                  setGeralSport('Todos');
                  setGeralBookmaker('Todas');
                  setGeralSharedPeriod('Tudo');
                  setGeralSharedDate('');
                }}
                className="bg-transparent border border-white/10 text-white rounded-lg px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold hover:bg-white/5 transition-all text-center w-full"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-[#0b1120] border border-white/5 rounded-xl p-3 sm:p-5 relative overflow-hidden group">
              <div className="flex flex-col relative z-10 overflow-hidden">
                <span className="text-[9px] sm:text-xs font-bold text-gray-400 tracking-wider mb-1 sm:mb-2 truncate">LUCRO</span>
                <span className={cn("text-[13px] min-[360px]:text-[15px] sm:text-2xl lg:text-3xl font-black tracking-tighter sm:tracking-normal truncate", geralStats.profit >= 0 ? "text-[#66dd8b]" : "text-red-500")}>
                  {geralStats.profit >= 0 ? '+' : ''}
                  {(geralStats.profit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="bg-[#0b1120] border border-white/5 rounded-xl p-3 sm:p-5 relative overflow-hidden group">
              <div className="flex flex-col relative z-10 overflow-hidden">
                <span className="text-[9px] sm:text-xs font-bold text-gray-400 tracking-wider mb-1 sm:mb-2 truncate">VOLUME APOSTADO</span>
                <span className="text-[13px] min-[360px]:text-[15px] sm:text-2xl lg:text-3xl font-black tracking-tighter sm:tracking-normal text-white truncate">
                  {(geralStats.volume || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="bg-[#0b1120] border border-white/5 rounded-xl p-3 sm:p-5 relative overflow-hidden group">
              <div className="flex flex-col relative z-10 overflow-hidden">
                <span className="text-[9px] sm:text-xs font-bold text-gray-400 tracking-wider mb-1 sm:mb-2 truncate">RETORNO TOTAL</span>
                <span className="text-[13px] min-[360px]:text-[15px] sm:text-2xl lg:text-3xl font-black tracking-tighter sm:tracking-normal text-white truncate">
                  {((geralStats.volume || 0) + (geralStats.profit || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="bg-[#0b1120] border border-white/5 rounded-xl p-3 sm:p-5 relative overflow-hidden group">
              <div className="flex flex-col relative z-10 overflow-hidden">
                <span className="text-[9px] sm:text-xs font-bold text-gray-400 tracking-wider mb-1 sm:mb-2 truncate">TOTAL APOSTAS</span>
                <span className="text-[13px] min-[360px]:text-[15px] sm:text-2xl lg:text-3xl font-black tracking-tighter sm:tracking-normal text-white truncate">
                  {geralStats.count || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Deep dive sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Casa de Aposta */}
            <div className="bg-[#0b1120] border border-white/5 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-2 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                    <CheckSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white whitespace-nowrap">Por Casa de Aposta</h3>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                  {['Hoje', 'Ontem', '7D', 'Tudo'].map(prd => (
                    <button
                      key={prd}
                      onClick={() => { setGeralSharedPeriod(prd); setGeralSharedDate(''); }}
                      className={cn("text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded transition-colors whitespace-nowrap bg-white/[0.02]", geralSharedPeriod === prd && !geralSharedDate ? "text-[#66dd8b]" : "text-gray-500 hover:text-gray-300")}
                    >
                      {prd}
                    </button>
                  ))}
                  <div className="relative shrink-0">
                    <input 
                      type="date" 
                      value={geralSharedDate}
                      onChange={(e) => {
                        setGeralSharedDate(e.target.value);
                        if(e.target.value) setGeralSharedPeriod('');
                      }}
                      className="absolute inset-0 opacity-0 w-full cursor-pointer"
                    />
                    <button className={cn("p-1.5 rounded transition-colors bg-white/[0.02]", geralSharedDate ? "text-[#66dd8b]" : "text-gray-500 hover:text-gray-300")}>
                      <Calendar className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {geralBookmakerData.length === 0 && <div className="text-sm text-gray-500 text-center py-4">Sem dados para exibir</div>}
                {geralBookmakerData.map((d, idx) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">{d.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{d.count} APOSTAS</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn("text-xs font-bold", d.profit >= 0 ? "text-[#66dd8b]" : "text-red-500")}>
                        {d.profit >= 0 ? '+' : ''}{(d.profit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className={cn("text-[9px] font-bold", d.roi >= 0 ? "text-[#66dd8b]" : "text-red-500")}>
                        ROI: {(d.roi || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Por Esporte */}
            <div className="bg-[#0b1120] border border-white/5 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-2 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white whitespace-nowrap">Por Esporte</h3>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                  {['Hoje', 'Ontem', '7D', 'Tudo'].map(prd => (
                    <button
                      key={prd}
                      onClick={() => { setGeralSharedPeriod(prd); setGeralSharedDate(''); }}
                      className={cn("text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded transition-colors whitespace-nowrap bg-white/[0.02]", geralSharedPeriod === prd && !geralSharedDate ? "text-[#66dd8b]" : "text-gray-500 hover:text-gray-300")}
                    >
                      {prd}
                    </button>
                  ))}
                  <div className="relative shrink-0">
                    <input 
                      type="date" 
                      value={geralSharedDate}
                      onChange={(e) => {
                        setGeralSharedDate(e.target.value);
                        if(e.target.value) setGeralSharedPeriod('');
                      }}
                      className="absolute inset-0 opacity-0 w-full cursor-pointer"
                    />
                    <button className={cn("p-1.5 rounded transition-colors bg-white/[0.02]", geralSharedDate ? "text-[#66dd8b]" : "text-gray-500 hover:text-gray-300")}>
                      <Calendar className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {geralSportData.length === 0 && <div className="text-sm text-gray-500 text-center py-4">Sem dados para exibir</div>}
                {geralSportData.map((d, idx) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">{d.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{d.count} APOSTAS FINALIZADAS</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn("text-xs font-bold", d.profit >= 0 ? "text-[#66dd8b]" : "text-red-500")}>
                        {d.profit >= 0 ? '+' : ''}{(d.profit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className={cn("text-[9px] font-bold", d.roi >= 0 ? "text-[#66dd8b]" : "text-red-500")}>
                        ROI: {(d.roi || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Período" && (
        <div className="space-y-12">
            <FilterBar 
                dateFrom={periodDateFrom} setDateFrom={setPeriodDateFrom}
                dateTo={periodDateTo} setDateTo={setPeriodDateTo}
                onClear={() => { setPeriodDateFrom(''); setPeriodDateTo(''); setSelectedBankrollId('all'); }}
                bankrolls={bankrolls}
                selectedBankrollId={selectedBankrollId}
                setSelectedBankrollId={setSelectedBankrollId}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisChart data={dailyDataForSelectedWeek.profitData} xKey="name" barDataKey="lucro" title="Lucro por dia da semana" />
                <AnalysisDualChart 
                data={dailyDataForSelectedWeek.roiSuccessData} 
                xKey="name" 
                dataKey1="roi" 
                dataKey2="sucesso" 
                label1="ROI" 
                label2="Sucesso %"
                title="ROI e Sucesso por dia da semana" 
                />
            </div>
            {/* The rest of Período view */}
            <div className="mt-6 bg-[#0b1120] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-center flex-1">Estatísticas por dia da semana de {selectedWeek}</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                const currentIndex = weekData.findIndex(w => w.id === selectedWeek);
                                if (currentIndex < weekData.length - 1) setSelectedWeek(weekData[currentIndex + 1].id);
                            }}
                            disabled={weekData.findIndex(w => w.id === selectedWeek) === weekData.length - 1}
                            className={cn("p-2 bg-white/5 rounded-full transition-colors", weekData.findIndex(w => w.id === selectedWeek) === weekData.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10")}
                        >
                            {"<"}
                        </button>
                        <button 
                            onClick={() => {
                                const currentIndex = weekData.findIndex(w => w.id === selectedWeek);
                                if (currentIndex > 0) setSelectedWeek(weekData[currentIndex - 1].id);
                            }}
                            disabled={weekData.findIndex(w => w.id === selectedWeek) === 0}
                            className={cn("p-2 bg-white/5 rounded-full transition-colors", weekData.findIndex(w => w.id === selectedWeek) === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10")}
                        >
                            {">"}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] lg:text-xs text-gray-400 border-collapse whitespace-nowrap">
                        <thead>
                        <tr className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider divide-x divide-white/10">
                            <th className="pb-2 px-4">Dia</th>
                            <th className="pb-2 px-2 text-center">Apostas</th>
                            <th className="pb-2 px-2 text-center">Ganha</th>
                            <th className="pb-2 px-2 text-center">Perdida</th>
                            <th className="pb-2 px-2 text-center">Reembolsada</th>
                            <th className="pb-2 px-2 text-center">Valor total</th>
                            <th className="pb-2 px-2 text-center">Lucros</th>
                            <th className="pb-2 px-2 text-center">ROI</th>
                            <th className="pb-2 px-2 text-center">Sucesso %</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {dailyDataForSelectedWeek.tableData.map((row) => (
                            <tr key={row.dia} className="hover:bg-white/5 divide-x divide-white/10 border-b border-white/5 last:border-0">
                            <td className="py-2 px-4 text-white font-medium">{row.dia}</td>
                            <td className="py-2 px-2 text-center">{row.apostas}</td>
                            <td className="py-2 px-2 text-center text-green-500">{row.ganha}</td>
                            <td className="py-2 px-2 text-center text-red-500">{row.perdida}</td>
                            <td className="py-2 px-2 text-center">{row.reembolsada}</td>
                            <td className="py-2 px-2 text-center">{row.total}</td>
                            <td className={cn("py-2 px-2 text-center font-bold", row.lucro >= 0 ? "text-green-500" : "text-red-500")}>
                                {row.lucro.toFixed(2)} $
                            </td>
                            <td className="py-2 text-center">{row.roi}</td>
                            <td className="py-2 text-center">{row.sucesso}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Semanas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisChart data={weekProfitData} xKey="name" barDataKey="lucro" title="Lucro por semana" />
                <AnalysisDualChart 
                    data={weekRoiSuccessData} 
                    xKey="name" 
                    dataKey1="roi" 
                    dataKey2="sucesso" 
                    label1="ROI" 
                    label2="Sucesso %"
                    title="ROI e Sucesso por semana" 
                />
                </div>
                <div className="mt-6 bg-[#0b1120] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex-1 text-center">Estatísticas por semana</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentWeekPage(p => Math.max(0, p - 1))}
                            disabled={currentWeekPage === 0}
                            className={cn("p-2 bg-white/5 rounded-full transition-colors", currentWeekPage === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10")}
                        >
                            {"<"}
                        </button>
                        <button 
                            onClick={() => setCurrentWeekPage(p => Math.min(Math.ceil(weekData.length / weeksPerPage) - 1, p + 1))}
                            disabled={currentWeekPage >= Math.ceil(weekData.length / weeksPerPage) - 1}
                            className={cn("p-2 bg-white/5 rounded-full transition-colors", currentWeekPage >= Math.ceil(weekData.length / weeksPerPage) - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10")}
                        >
                            {">"}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] lg:text-xs text-gray-400 border-collapse whitespace-nowrap">
                        <thead>
                        <tr className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider divide-x divide-white/10">
                            <th className="pb-2 px-4">Semana</th>
                            <th className="pb-2 px-2 text-center">Apostas</th>
                            <th className="pb-2 px-2 text-center">Ganha</th>
                            <th className="pb-2 px-2 text-center">Perdida</th>
                            <th className="pb-2 px-2 text-center">Reembolsada</th>
                            <th className="pb-2 px-2 text-center">Valor total</th>
                            <th className="pb-2 px-2 text-center">Lucros</th>
                            <th className="pb-2 px-2 text-center">ROI</th>
                            <th className="pb-2 px-2 text-center">Sucesso %</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {visibleWeekTableData.map((row) => (
                            <tr key={row.semana} className="hover:bg-white/5 divide-x divide-white/10 border-b border-white/5 last:border-0">
                            <td className="py-2 px-4 text-white font-medium">{row.semana}</td>
                            <td className="py-2 px-2 text-center">{row.apostas}</td>
                            <td className="py-2 px-2 text-center text-green-500">{row.ganha}</td>
                            <td className="py-2 px-2 text-center text-red-500">{row.perdida}</td>
                            <td className="py-2 px-2 text-center">{row.reembolsada}</td>
                            <td className="py-2 px-2 text-center">{row.total}</td>
                            <td className={cn("py-2 px-2 text-center font-bold", row.lucro >= 0 ? "text-green-500" : "text-red-500")}>
                                {row.lucro.toFixed(2)} $
                            </td>
                            <td className="py-2 text-center">{row.roi}</td>
                            <td className="py-2 text-center">{row.sucesso}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
            
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Meses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisChart data={monthProfitData} xKey="name" barDataKey="lucro" title="Lucro por mês" />
                <AnalysisDualChart 
                    data={monthRoiSuccessData} 
                    xKey="name" 
                    dataKey1="roi" 
                    dataKey2="sucesso" 
                    label1="ROI" 
                    label2="Sucesso %"
                    title="ROI e Sucesso por mês" 
                />
                </div>
                <div className="mt-6 bg-[#0b1120] p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-semibold mb-6 text-center">Estatísticas por mês</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] lg:text-xs text-gray-400 border-collapse whitespace-nowrap">
                        <thead>
                        <tr className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider divide-x divide-white/10">
                            <th className="pb-2 px-4">Mês</th>
                            <th className="pb-2 px-2 text-center">Apostas</th>
                            <th className="pb-2 px-2 text-center">Ganha</th>
                            <th className="pb-2 px-2 text-center">Perdida</th>
                            <th className="pb-2 px-2 text-center">Reembolsada</th>
                            <th className="pb-2 px-2 text-center">Valor total</th>
                            <th className="pb-2 px-2 text-center">Lucros</th>
                            <th className="pb-2 px-2 text-center">ROI</th>
                            <th className="pb-2 px-2 text-center">Sucesso %</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {monthTableData.map((row) => (
                            <tr key={row.mes} className="hover:bg-white/5 divide-x divide-white/10 border-b border-white/5 last:border-0">
                            <td className="py-2 px-4 text-white font-medium">{row.mes}</td>
                            <td className="py-2 px-2 text-center">{row.apostas}</td>
                            <td className="py-2 px-2 text-center text-green-500">{row.ganha}</td>
                            <td className="py-2 px-2 text-center text-red-500">{row.perdida}</td>
                            <td className="py-2 px-2 text-center">{row.reembolsada}</td>
                            <td className="py-2 px-2 text-center">{row.total}</td>
                            <td className={cn("py-2 px-2 text-center font-bold", row.lucro >= 0 ? "text-green-500" : "text-red-500")}>
                                {row.lucro.toFixed(2)} $
                            </td>
                            <td className="py-2 text-center">{row.roi}</td>
                            <td className="py-2 text-center">{row.sucesso}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
            
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Anos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisChart data={yearProfitData} xKey="name" barDataKey="lucro" title="Lucro por ano" />
                <AnalysisDualChart 
                    data={yearRoiSuccessData} 
                    xKey="name" 
                    dataKey1="roi" 
                    dataKey2="sucesso" 
                    label1="ROI" 
                    label2="Sucesso %"
                    title="ROI e Sucesso por ano" 
                />
                </div>
                <div className="mt-6 bg-[#0b1120] p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-semibold mb-6 text-center">Estatísticas por ano</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] lg:text-xs text-gray-400 border-collapse whitespace-nowrap">
                        <thead>
                        <tr className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider divide-x divide-white/10">
                            <th className="pb-2 px-4">Ano</th>
                            <th className="pb-2 px-2 text-center">Apostas</th>
                            <th className="pb-2 px-2 text-center">Ganha</th>
                            <th className="pb-2 px-2 text-center">Perdida</th>
                            <th className="pb-2 px-2 text-center">Reembolsada</th>
                            <th className="pb-2 px-2 text-center">Valor total</th>
                            <th className="pb-2 px-2 text-center">Lucros</th>
                            <th className="pb-2 px-2 text-center">ROI</th>
                            <th className="pb-2 px-2 text-center">Sucesso %</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {yearTableData.map((row) => (
                            <tr key={row.ano} className="hover:bg-white/5 divide-x divide-white/10 border-b border-white/5 last:border-0">
                            <td className="py-2 px-4 text-white font-medium">{row.ano}</td>
                            <td className="py-2 px-2 text-center">{row.apostas}</td>
                            <td className="py-2 px-2 text-center text-green-500">{row.ganha}</td>
                            <td className="py-2 px-2 text-center text-red-500">{row.perdida}</td>
                            <td className="py-2 px-2 text-center">{row.reembolsada}</td>
                            <td className="py-2 px-2 text-center">{row.total}</td>
                            <td className={cn("py-2 px-2 text-center font-bold", row.lucro >= 0 ? "text-green-500" : "text-red-500")}>
                                {row.lucro.toFixed(2)} $
                            </td>
                            <td className="py-2 text-center">{row.roi}</td>
                            <td className="py-2 text-center">{row.sucesso}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === "Esporte" && (
        <div className="grid grid-cols-1 gap-6">
            <FilterBar 
                dateFrom={esporteDateFrom} setDateFrom={setEsporteDateFrom}
                dateTo={esporteDateTo} setDateTo={setEsporteDateTo}
                onClear={() => { setEsporteDateFrom(''); setEsporteDateTo(''); setSelectedBankrollId('all'); }}
                bankrolls={bankrolls}
                selectedBankrollId={selectedBankrollId}
                setSelectedBankrollId={setSelectedBankrollId}
            />
            <h2 className="text-xl font-bold">Esporte</h2>
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#0b1120] p-4 lg:p-6 rounded-2xl border border-white/5 col-span-1 lg:col-span-1">
                    <h3 className="text-sm lg:text-lg font-semibold mb-4">Distribuição por Esporte</h3>
                    <div className="min-h-[400px] flex items-center justify-center">
                      {mounted ? (
                        <ResponsiveContainer width="99%" height={400} minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie
                                    data={sportData.map(s => ({ name: s.sport, value: s.count }))}
                                    innerRadius="50%"
                                    outerRadius="75%"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={false}
                                >
                                    {sportData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0b1120', borderColor: '#ffffff10', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="h-[400px] w-full" />}
                    </div>
                </div>
                <AnalysisChart 
                  data={sportData.map(s => ({ name: s.sport, lucro: s.totalProfit }))} 
                  xKey="name" 
                  barDataKey="lucro" 
                  title="Lucro por Esporte" 
                  height={400}
                  showExternalLabels={true}
                />
            </div>
            <div className="bg-[#0b1120] p-4 lg:p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm lg:text-lg font-semibold mb-4">Estatísticas por Esporte</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] lg:text-xs text-gray-400 border-collapse whitespace-nowrap">
                        <thead>
                        <tr className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider divide-x divide-white/10">
                            <th className="pb-2 px-4">Esporte</th>
                            <th className="pb-2 px-2 text-center">Apostas</th>
                            <th className="pb-2 px-2 text-center text-green-500">Ganha</th>
                            <th className="pb-2 px-2 text-center text-red-500">Perdida</th>
                            <th className="pb-2 px-2 text-center">Reemb.</th>
                            <th className="pb-2 px-2 text-center">Total Apostado</th>
                            <th className="pb-2 px-2 text-center">Total Lucro</th>
                            <th className="pb-2 px-2 text-center">ROI %</th>
                            <th className="pb-2 px-2 text-center">Sucesso %</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {sportData.map((row) => (
                            <tr key={row.sport} className="hover:bg-white/5 divide-x divide-white/10 border-b border-white/5 last:border-0">
                            <td className="py-2 px-4 text-white font-medium">{row.sport}</td>
                            <td className="py-2 px-2 text-center">{row.count}</td>
                            <td className="py-2 px-2 text-center text-green-500">{row.won}</td>
                            <td className="py-2 px-2 text-center text-red-500">{row.lost}</td>
                            <td className="py-2 px-2 text-center">{row.refund}</td>
                            <td className="py-2 px-2 text-center">{row.totalStake.toFixed(2)} $</td>
                            <td className={cn("py-2 px-2 text-center font-bold", row.totalProfit >= 0 ? "text-green-500" : "text-red-500")}>
                                {row.totalProfit.toFixed(2)} $
                            </td>
                            <td className="py-2 px-2 text-center">{row.roi.toFixed(1)}%</td>
                            <td className="py-2 px-2 text-center">{row.sucesso.toFixed(1)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {activeTab === "Casa de apostas" && (
        <div className="grid grid-cols-1 gap-6">
            <FilterBar 
                dateFrom={casaDateFrom} setDateFrom={setCasaDateFrom}
                dateTo={casaDateTo} setDateTo={setCasaDateTo}
                onClear={() => { setCasaDateFrom(''); setCasaDateTo(''); setSelectedBankrollId('all'); }}
                bankrolls={bankrolls}
                selectedBankrollId={selectedBankrollId}
                setSelectedBankrollId={setSelectedBankrollId}
            />
            <h2 className="text-xl font-bold">Casa de apostas</h2>
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#0b1120] p-4 lg:p-6 rounded-2xl border border-white/5 col-span-1 lg:col-span-1">
                    <h3 className="text-sm lg:text-lg font-semibold mb-4">Distribuição por casa de apostas</h3>
                    <div className="min-h-[500px] flex items-center justify-center">
                      {mounted ? (
                        <ResponsiveContainer width="99%" height={500} minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie
                                    data={bookmakerData.map(b => ({ name: b.bookmaker, value: b.count }))}
                                    innerRadius="50%"
                                    outerRadius="75%"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={false}
                                >
                                    {bookmakerData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0b1120', borderColor: '#ffffff10', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="h-[500px] w-full" />}
                    </div>
                </div>
                <AnalysisChart 
                  data={bookmakerData.map(b => ({ name: b.bookmaker, lucro: b.totalProfit }))} 
                  xKey="name" 
                  barDataKey="lucro" 
                  title="Lucro por casa de apostas" 
                  height={400}
                  showExternalLabels={true}
                />
            </div>
            <div className="bg-[#0b1120] p-4 lg:p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm lg:text-lg font-semibold mb-4">Estatísticas por casa de apostas</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] lg:text-xs text-gray-400 border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider divide-x divide-white/10">
                                <th className="pb-2 px-4">Casa de apostas</th>
                                <th className="pb-2 px-2 text-center">Apostas</th>
                                <th className="pb-2 px-2 text-center">Ganha</th>
                                <th className="pb-2 px-2 text-center">Perdida</th>
                                <th className="pb-2 px-2 text-center">Reemb.</th>
                                <th className="pb-2 px-2 text-center">Valor total</th>
                                <th className="pb-2 px-2 text-center">Lucros</th>
                                <th className="pb-2 px-2 text-center">ROI</th>
                                <th className="pb-2 px-2 text-center">Sucesso %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookmakerData.map(b => (
                                <tr key={b.bookmaker} className="hover:bg-white/5 divide-x divide-white/10 border-b border-white/5 last:border-0">
                                    <td className="py-2 px-4 text-white font-medium">{b.bookmaker}</td>
                                    <td className="py-2 px-2 text-center">{b.count}</td>
                                    <td className="py-2 px-2 text-center text-green-500">{b.won}</td>
                                    <td className="py-2 px-2 text-center text-red-500">{b.lost}</td>
                                <td className="py-2 px-2 text-center">{b.refund}</td>
                                <td className="py-2 px-2 text-center">{b.totalStake.toFixed(2)} $</td>
                                <td className={cn("py-2 px-2 text-center font-bold", b.totalProfit >= 0 ? "text-green-500" : "text-red-500")}>{b.totalProfit.toFixed(2)} $</td>
                                <td className="py-2 px-2 text-center">{b.roi.toFixed(2)} %</td>
                                <td className="py-2 px-2 text-center">{b.sucesso.toFixed(2)} %</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
