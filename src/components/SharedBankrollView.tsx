import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Bankroll, Bet } from '../types';
import { LoadingScreen } from './LoadingScreen';
import { Lock, TrendingUp, Navigation, Hourglass, ChevronDown, PieChart, Calendar, LineChart as ChartIcon, LayoutDashboard, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { Chart } from './Chart';
import { EarningCard } from './EarningCard';
import { ActivityItem } from './ActivityItem';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BankrollContext } from '../context/BankrollContext';
import { BetsContext } from '../context/BetsContext';
import { StatsSidebar } from './StatsSidebar';
import { FilterSidebar } from './FilterSidebar';
import { CalendarModal } from './CalendarModal';

export const SharedBankrollView = ({ bankrollId }: { bankrollId: string }) => {
  const [bankroll, setBankroll] = useState<Bankroll | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        setLoading(true);
        const { data: bData, error: bError } = await supabase
          .from('bankrolls')
          .select('id, name, is_public, initial_value, created_at')
          .eq('id', bankrollId)
          .single();

        if (bError || !bData) {
          throw new Error('Banca não encontrada ou não é pública.');
        }

        setBankroll(bData);

        const { data: betsData, error: betsError } = await supabase
          .from('bets')
          .select('id, bankroll_id, date, time, event, sport, bookmaker, stake, odd, status, comment, type, return_value, profit, created_at')
          .eq('bankroll_id', bankrollId)
          .order('date', { ascending: false })
          .limit(1000);

        if (!betsError && betsData) {
          setBets(betsData);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados compartilhados.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [bankrollId]);

  // Context Mocks
  const [currentView, setCurrentView] = useState<any>('dashboard');
  const [timeRange, setTimeRange] = useState<any>('all');
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<any>({
    dateStart: '', dateEnd: '', title: '', status: '', sport: '', house: '', valMin: '', valMax: '', oddMin: '', oddMax: '', betType: ''
  });

  if (loading) return <LoadingScreen />;

  if (error || !bankroll) {
    return (
      <div className="min-h-screen bg-dashboard flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Acesso Negado</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Esta banca não existe, não é pública ou o link é inválido.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-3 bg-[#1e293b] text-white font-bold rounded-xl hover:bg-[#2e3e56] transition-all"
        >
          Voltar para Início
        </button>
      </div>
    );
  }

  const mockContextValue: any = {
    activeBankrollId: bankroll.id,
    setActiveBankrollId: () => {},
    editingBankrollId: null,
    setEditingBankrollId: () => {},
    currentView,
    setCurrentView,
    isAddBetModalOpen: false,
    setIsAddBetModalOpen: () => {},
    isSettingsOpen: false,
    setIsSettingsOpen: () => {},
    isStatsOpen,
    setIsStatsOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    isFiltersOpen,
    setIsFiltersOpen,
    timeRange,
    setTimeRange,
    filters,
    setFilters,
    bankrolls: [bankroll],
    loadingBankrolls: false,
    sqlError: null,
    isSavingBankroll: false,
    refreshBankrolls: () => {},
    addBankroll: async () => null,
    updateBankroll: async () => null,
    deleteBankroll: async () => false,
  };

  const mockBetsContextValue: any = {
    bets,
    allBets: bets,
    dailyProfits: {}, // Can optionally calculate or just leave empty
    stats: {
      lucroLiquido: 0, roi: 0, taxaAcerto: 0, totalApostas: 0, 
      investimentoTotal: 0, totalGanhos: 0, totalPercas: 0, 
      apostasPendentes: 0, valorPendente: 0
    },
    groupedBets: {},
    chartData: [],
    loading: false,
    addBets: async () => [],
    updateBet: async () => {},
    deleteBets: async () => {},
    updateBetStatus: async () => {},
    updateBetWithdrawn: async () => {},
    bulkUpdateBetWithdrawn: async () => {},
    deleteOrphanedBets: async () => true,
    refreshBets: async () => {},
    calculateLucro: () => 0,
    getGroupedBets: () => ({})
  };

  return (
    <BetsContext.Provider value={mockBetsContextValue}>
      <BankrollContext.Provider value={mockContextValue}>
        <div className="flex bg-dashboard text-white overflow-hidden absolute inset-0">
        {/* Sidebar Restrita */}
        <aside className="hidden lg:flex w-[280px] h-screen bg-sidebar border-r border-white/5 flex-col shrink-0 overflow-hidden relative z-10">
          <div className="pt-8 pb-6 px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <img src="https://res.cloudinary.com/dfnndawb7/image/upload/v1777493470/betamos_qlx8mw.png" className="w-full h-full object-cover" alt="BETAMOS Logo" />
              </div>
              <h1 className="font-bold text-2xl tracking-tight text-white leading-none uppercase">BETAMOS</h1>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1 pb-4">
            <div className="group flex items-center gap-3 w-full font-medium text-sm px-6 py-3.5 transition-colors cursor-pointer text-primary bg-card/80 border-l-[3px] border-primary">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="flex-1 font-semibold">Dashboard</span>
            </div>

            <div 
              onClick={() => window.location.href = '/'}
              className="group flex items-center gap-3 w-full font-medium text-sm px-6 py-3.5 transition-colors cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"
            >
              <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
              <span className="flex-1 font-semibold">Crie sua Banca</span>
            </div>
          </nav>
        </aside>

        <SharedDashboardContent bankroll={bankroll} bets={bets} />
        
        {/* Modais e Sidebars */}
        <StatsSidebar 
          isOpen={isStatsOpen} 
          onClose={() => setIsStatsOpen(false)} 
          externalBets={bets}
          externalBankroll={bankroll}
        />
        <FilterSidebar isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
        <CalendarModal 
          isOpen={isCalendarOpen} 
          onClose={() => setIsCalendarOpen(false)} 
          externalBets={bets}
        />
      </div>
    </BankrollContext.Provider>
    </BetsContext.Provider>
  );
};

const SharedDashboardContent = ({ bankroll, bets }: { bankroll: Bankroll, bets: Bet[] }) => {
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [expandedMonth, setExpandedMonth] = useState<string | null>(() => {
    const d = new Date();
    return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/\s+de\s+/gi, ' ').toLowerCase();
  });
  
  const [collapsedDays, setCollapsedDays] = useState<string[]>([]);
  const toggleDayCollapse = (dayKey: string) => {
    setCollapsedDays(prev => prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]);
  };

  const getVisibleCount = (month: string) => visibleCounts[month] || 25;

  const handleShowMore = (month: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [month]: (prev[month] || 25) + 25
    }));
  };

  const calculateLucroValue = (bet: Bet): number => {
    switch (bet.status) {
      case 'won': return (bet.odd * bet.stake) - bet.stake;
      case 'half_won': return ((bet.odd * bet.stake) - bet.stake) / 2;
      case 'lost': return -bet.stake;
      case 'half_lost': return -bet.stake / 2;
      case 'refunded': return 0;
      case 'cashout': return (bet.return_value || 0) - bet.stake;
      case 'canceled': return 0;
      default: return 0;
    }
  };

  const { timeRange, filters, setFilters } = React.useContext(BankrollContext)!;

  const processedBets = useMemo(() => {
    let filtered = bets.map(b => ({ ...b, profit: calculateLucroValue(b) }));
    
    // Custom Filters
    filtered = filtered.filter(bet => {
      // Title/Search filter
      if (filters.title) {
        const search = filters.title.toLowerCase();
        const eventMatch = bet.event?.toLowerCase().includes(search);
        const commentMatch = bet.comment?.toLowerCase().includes(search);
        const sportMatch = bet.sport?.toLowerCase().includes(search);
        const houseMatch = bet.bookmaker?.toLowerCase().includes(search);
        const typeMatch = bet.type?.toLowerCase().includes(search);
        if (!eventMatch && !commentMatch && !sportMatch && !houseMatch && !typeMatch) return false;
      }

      // Status filter
      if (filters.status) {
        const statusMap: Record<string, string> = {
          'Ganha': 'won',
          'Perdida': 'lost',
          'Pendente': 'pending',
          'Reembolsada': 'refunded',
          'Cancelada': 'canceled',
          'M. Ganha': 'half_won',
          'M. Perdida': 'half_lost',
          'Cashout': 'cashout'
        };
        if (bet.status !== statusMap[filters.status]) return false;
      }

      // Sport filter
      if (filters.sport && bet.sport !== filters.sport) return false;

      // House filter
      if (filters.bookmaker && bet.bookmaker !== filters.bookmaker && filters.house && bet.bookmaker !== filters.house) return false;

      // Bet Type filter (exact or select)
      if (filters.betType && bet.type !== filters.betType) return false;

      // Date Range
      if (filters.dateStart) {
        const start = new Date(filters.dateStart + "T00:00:00").getTime();
        const betTime = new Date(bet.date + "T00:00:00").getTime();
        if (betTime < start) return false;
      }
      if (filters.dateEnd) {
        const end = new Date(filters.dateEnd + "T23:59:59").getTime();
        const betTime = new Date(bet.date + "T12:00:00").getTime();
        if (betTime > end) return false;
      }

      // Value Range
      if (filters.valMin && bet.stake < parseFloat(filters.valMin)) return false;
      if (filters.valMax && bet.stake > parseFloat(filters.valMax)) return false;

      // Odds Range
      if (filters.oddMin && bet.odd < parseFloat(filters.oddMin)) return false;
      if (filters.oddMax && bet.odd > parseFloat(filters.oddMax)) return false;

      return true;
    });

    // TimeRange Filter
    if (timeRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1d': // Últimas 24h
          startDate.setDate(now.getDate() - 1);
          break;
        case '1s': // Última Semana
          startDate.setDate(now.getDate() - 7);
          break;
        case '1m': // Último Mês
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '1a': // Último Ano
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const offset = startDate.getTimezoneOffset();
      const _d = new Date(startDate.getTime() - (offset*60*1000));
      const startString = _d.toISOString().split('T')[0];
      filtered = filtered.filter(bet => bet.date >= startString);
    }
    
    return filtered;
  }, [bets, timeRange, filters]);

  const stats = useMemo(() => {
    const totalProfit = processedBets.reduce((acc, bet) => acc + (bet.profit || 0), 0);
    const totalStake = processedBets.reduce((acc, bet) => acc + (bet.stake || 0), 0);
    const roiNum = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const winCount = processedBets.filter(b => b.status === 'won' || b.status === 'half_won').length;
    const betCount = processedBets.length;
    const winRateNum = betCount > 0 ? (winCount / betCount) * 100 : 0;
    const activeBets = processedBets.filter(b => b.status !== 'pending');
    
    return {
      lucroLiquido: totalProfit,
      roi: roiNum,
      taxaAcerto: winRateNum,
      totalApostas: betCount,
      apostasPendentes: processedBets.filter(b => b.status === 'pending').length,
      valorPendente: processedBets.filter(b => b.status === 'pending').reduce((acc, b) => acc + (b.stake || 0), 0)
    };
  }, [processedBets]);

  const periodStats = useMemo(() => {
    const now = new Date();
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const todayStr = formatDate(now);
    const todayBets = processedBets.filter(b => b.date === todayStr);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const weekBets = processedBets.filter(b => b.date >= formatDate(startOfWeek));

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthBets = processedBets.filter(b => b.date >= formatDate(startOfMonth));

    const getStats = (periodBets: Bet[]) => {
      const lucro = periodBets.reduce((acc, b) => acc + (b.profit || 0), 0);
      const totalGanhos = periodBets.filter(b => (b.profit || 0) > 0).reduce((acc, b) => acc + (b.profit || 0), 0);
      const totalPercas = Math.abs(periodBets.filter(b => (b.profit || 0) < 0).reduce((acc, b) => acc + (b.profit || 0), 0));
      return { lucro, totalGanhos, totalPercas, count: periodBets.length };
    };

    return {
      today: getStats(todayBets),
      week: getStats(weekBets),
      month: getStats(monthBets)
    };
  }, [processedBets]);

  const groupedBets = useMemo(() => {
    const getWeekNumber = (dStr: string) => {
      if (!dStr) return 0;
      const d = new Date(dStr + "T12:00:00");
      if (isNaN(d.getTime())) return 0;
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
      return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    };

    return processedBets.reduce((acc, bet) => {
      if (!bet || !bet.date) return acc;
      const d = new Date(bet.date + "T12:00:00");
      if (isNaN(d.getTime())) return acc;
      
      const monthStr = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const month = monthStr.replace(/\s+de\s+/gi, ' ').toLowerCase();
      const weekNum = getWeekNumber(bet.date);
      const week = `Semana ${weekNum}`;
      const weekday = d.toLocaleString('pt-BR', { weekday: 'long' });
      const dayNum = d.getDate();
      const day = `${weekday} ${dayNum}`;
      
      if (!acc[month]) acc[month] = {};
      if (!acc[month][week]) acc[month][week] = {};
      if (!acc[month][week][day]) acc[month][week][day] = [];
      
      acc[month][week][day].push(bet);
      return acc;
    }, {} as Record<string, Record<string, Record<string, Bet[]>>>);
  }, [processedBets]);

  const sortedMonthKeys = useMemo(() => {
    return Object.keys(groupedBets).sort((a, b) => {
      const getFirstBetDate = (monthKey: string) => {
        const weeks = groupedBets[monthKey];
        for (const week in weeks) {
          for (const day in weeks[week]) {
            if (weeks[week][day].length > 0) return new Date(weeks[week][day][0].date + "T12:00:00");
          }
        }
        return new Date();
      };
      const dateA = getFirstBetDate(a);
      const dateB = getFirstBetDate(b);
      const yearDiff = dateB.getFullYear() - dateA.getFullYear();
      if (yearDiff !== 0) return yearDiff; 
      return dateB.getMonth() - dateA.getMonth();
    });
  }, [groupedBets]);

  const chartData = useMemo(() => {
    return processedBets.filter(b => b.status !== 'pending');
  }, [processedBets]);

  const displaySettings = {
    showHora: true,
    showFormato: true,
    showCasa: true,
    showGanho: true,
    showCotacao: true,
    showValor: true,
    autoOddAutomation: true,
  };

  const { setIsStatsOpen, isFiltersOpen, setIsFiltersOpen, isCalendarOpen, setIsCalendarOpen } = React.useContext(BankrollContext)!;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-dashboard relative overflow-hidden">
      {/* Top Header */}
      <header className="hidden lg:flex h-16 px-6 border-b border-white/5 items-center justify-between shrink-0 bg-[#0b1120] z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-normal text-white tracking-tight uppercase">
            {bankroll.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all shadow-xl shadow-indigo-500/10 cursor-pointer"
          >
            Criar minha conta
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="hidden lg:flex px-6 py-2.5 border-b border-white/5 items-center justify-between bg-[#0b1120]/50 backdrop-blur-sm shrink-0 z-40">
        <div className="flex items-center gap-4">
            <div 
              onClick={() => setIsStatsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] cursor-pointer group hover:bg-white/[0.05] transition-all"
            >
              <ChartIcon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-bold text-gray-500 group-hover:text-white transition-colors">Estatística</span>
            </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFiltersOpen(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                isFiltersOpen
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "text-gray-400 border-white/5 bg-white/[0.02] hover:bg-white/5 hover:text-white"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
            </button>
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                isCalendarOpen 
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                  : "text-gray-400 border-white/5 bg-white/[0.02] hover:bg-white/5 hover:text-white"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendário
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Special Header */}
      <header className="lg:hidden flex h-14 items-center justify-between px-4 bg-[#0b1120] sticky top-0 z-40">
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <span className="text-white text-base font-normal tracking-tight uppercase truncate">
            {bankroll.name} (PÚBLICO)
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-2 lg:p-6 space-y-2 lg:space-y-3 relative custom-scrollbar">
        <div className="space-y-0 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-4">
            <Chart bets={chartData} />

            <div className="bg-[#0b1120] ring-1 ring-white/5 rounded-xl p-4 flex flex-col gap-3 h-auto lg:h-full lg:min-h-[500px] hidden lg:flex">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Ganhos</h2>
                <TrendingUp className="w-5 h-5 text-[#66dd8b]" />
              </div>

              <div className="flex-1 flex flex-col gap-3 min-h-0">
                <EarningCard 
                  title="Ganho do dia" period="Hoje" 
                  value={periodStats.today.lucro} earnings={periodStats.today.totalGanhos} losses={periodStats.today.totalPercas} bets={periodStats.today.count} 
                />
                <EarningCard 
                  title="Ganho da semana" period="Semana Atual" 
                  value={periodStats.week.lucro} earnings={periodStats.week.totalGanhos} losses={periodStats.week.totalPercas} bets={periodStats.week.count} 
                />
                <EarningCard 
                  title="Ganho do mês" period="Mês Atual" 
                  value={periodStats.month.lucro} earnings={periodStats.month.totalGanhos} losses={periodStats.month.totalPercas} bets={periodStats.month.count} 
                />
              </div>
            </div>
          </div>

          <div className="mt-2 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3">
            {/* Card 1 */}
            <div className="bg-[#0b1120] border border-white/5 lg:border-[#66dd8b]/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto">
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">Lucro Líquido</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">Apostas</span>
                <TrendingUp className="hidden lg:block w-4 h-4 text-[#66dd8b] opacity-80" />
              </div>
              <div className={cn("text-[28px] font-black mt-0.5 hidden lg:block", stats.lucroLiquido >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
                R$ {stats.lucroLiquido.toFixed(2)}
              </div>
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className="text-[22px] font-normal text-indigo-400">
                  {stats.totalApostas}
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0b1120] border border-white/5 lg:border-indigo-400/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto">
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">Taxa de Acerto</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">Lucros</span>
                <Navigation className="hidden lg:block w-4 h-4 text-indigo-400 opacity-80 rotate-45" />
              </div>
              <div className="hidden lg:block">
                <div className="text-[28px] font-black text-white mt-1">
                  {stats.taxaAcerto.toFixed(1)}%
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${stats.taxaAcerto}%` }}></div>
                </div>
              </div>
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className="text-[20px] font-normal text-[#66dd8b]">
                  {stats.lucroLiquido.toFixed(2)}R$
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0b1120] border border-white/5 lg:border-[#66dd8b]/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto">
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider w-full">ROI</span>
                <ChartIcon className="hidden lg:block w-4 h-4 text-[#66dd8b] opacity-80" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className={cn("text-[22px] font-normal mt-0.5", stats.roi >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
                  {stats.roi.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div 
              className="bg-[#0b1120] border border-white/5 lg:border-orange-400/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => {
                setFilters({ ...filters, status: 'Pendente' });
              }}
            >
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">Apostas Pendentes</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">Progressão</span>
                <Hourglass className="hidden lg:block w-4 h-4 text-orange-400 opacity-80" />
              </div>
              <div className="flex flex-col hidden lg:flex">
                <div className="text-[28px] font-black text-white mt-1 leading-none mb-2">
                  {stats.apostasPendentes}
                </div>
                <div className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded w-fit">
                  R$ {stats.valorPendente.toFixed(2)}
                </div>
              </div>
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className="text-[22px] font-normal text-[#66dd8b]">
                  {stats.taxaAcerto.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-[6px]">
          {sortedMonthKeys.length === 0 && (
            <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10 text-gray-400 font-medium">
              Nenhuma aposta registrada nesta banca.
            </div>
          )}

          {sortedMonthKeys.map(month => {
             const weeks = groupedBets[month];
             const monthBets = (Object.values(weeks).flatMap(days => Object.values(days as Record<string, Bet[]>).flat()) as Bet[])
               .sort((a, b) => {
                 const dateCompare = (b.date || '').localeCompare(a.date || '');
                 if (dateCompare !== 0) return dateCompare;
                 const timeA = (a.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                 const timeB = (b.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                 if (timeB !== timeA) return timeB.localeCompare(timeA);
                 return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
               });
             
             const visibleLimit = getVisibleCount(month);
             const visibleMonthBets = monthBets.slice(0, visibleLimit);
             const visibleMonthBetIds = new Set(visibleMonthBets.map(b => b.id));

             const monthLucro = monthBets.reduce((acc, b) => b.status === 'pending' ? acc : acc + calculateLucroValue(b), 0);
             const isExpanded = expandedMonth === month;
             
             return (
               <div key={month} className="space-y-2 mb-3">
                 <div 
                   onClick={() => setExpandedMonth(isExpanded ? null : month)}
                   className={cn(
                     "rounded-xl py-2 px-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md transition-all duration-300 cursor-pointer",
                     isExpanded ? "bg-white/[0.03] ring-[2.5px] ring-indigo-400" : "bg-card border border-white/5"
                   )}
                 >
                   <div className="flex items-center gap-3">
                     <span className={cn("font-medium capitalize", isExpanded ? "text-indigo-300 text-lg" : "text-gray-400 text-sm transition-colors")}>
                       {month}
                     </span>
                   </div>
                   <div className={cn("px-3 py-1 rounded-lg text-xs font-bold border", 
                     monthLucro > 0 ? "bg-[#66dd8b]/10 text-[#66dd8b] border-[#66dd8b]/30" : 
                     monthLucro < 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : 
                     "bg-white/10 text-gray-400 border-white/5"
                   )}>
                     {monthLucro > 0 ? '+' : ''}{monthLucro.toFixed(2)} R$
                   </div>
                 </div>

                 <AnimatePresence>
                   {isExpanded && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3, ease: "easeInOut" }}
                       className="overflow-hidden"
                     >
                       <div className="space-y-1.5 pb-2">
                         {Object.entries(weeks)
                          .sort((a, b) => {
                            const weekA = parseInt(a[0].split(' ')[1]) || 0;
                            const weekB = parseInt(b[0].split(' ')[1]) || 0;
                            return weekB - weekA;
                          })
                          .map(([week, days]) => {
                           const weekBets = Object.values(days as Record<string, Bet[]>).flat() as Bet[];
                           const visibleWeekBets = weekBets.filter(bet => visibleMonthBetIds.has(bet.id));
                           if (visibleWeekBets.length === 0) return null;

                           const weekLucro = weekBets.reduce((acc, b) => b.status === 'pending' ? acc : acc + calculateLucroValue(b), 0);
                           
                           return (
                             <div key={week} className="space-y-1.5">
                               <div className="flex items-center justify-between text-base text-gray-500 font-medium tracking-tight pt-1 px-2">
                                 <span>{week}</span>
                                 <span className={cn("px-1.5 py-0.5 rounded border text-[10px]", 
                                   weekLucro > 0 ? "bg-[#66dd8b]/10 text-[#66dd8b] border-[#66dd8b]/30" : 
                                   weekLucro < 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : 
                                   "bg-white/10 text-gray-400 border-white/5"
                                 )}>
                                   {weekLucro > 0 ? '+' : ''}{weekLucro.toFixed(2)} R$
                                 </span>
                               </div>

                               {Object.entries(days as Record<string, Bet[]>)
                                 .sort((a, b) => {
                                   const dateA = a[1][0]?.date || '';
                                   const dateB = b[1][0]?.date || '';
                                   return dateB.localeCompare(dateA);
                                 })
                                 .map(([day, dayBets]) => {
                                 const visibleDayBets = (dayBets as Bet[])
                                   .filter(bet => visibleMonthBetIds.has(bet.id))
                                   .sort((a, b) => {
                                     const timeA = (a.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                                     const timeB = (b.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                                     if (timeB !== timeA) return timeB.localeCompare(timeA);
                                     return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                                   });

                                 if (visibleDayBets.length === 0) return null;

                                 const dayLucro = (dayBets as Bet[]).reduce((acc, b) => b.status === 'pending' ? acc : acc + calculateLucroValue(b), 0);
                                 const dayKey = (dayBets as Bet[])[0]?.date || day;
                                 const isDayCollapsed = collapsedDays.includes(dayKey);

                                 return (
                                   <div key={day} className="bg-white/[0.02] ring-1 ring-white/10 rounded-xl p-3 min-w-0">
                                      <div 
                                        onClick={() => toggleDayCollapse(dayKey)}
                                        className="flex items-center justify-between text-xs font-medium text-white mb-2 cursor-pointer transition-colors hover:text-indigo-300"
                                      >
                                        <span className="capitalize text-sm">{day}</span>
                                        <span className={cn("px-3.5 py-1 rounded border text-xs", 
                                           dayLucro > 0 ? "bg-[#66dd8b]/10 text-[#66dd8b] border-[#66dd8b]/30" : 
                                           dayLucro < 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : 
                                           "bg-white/10 text-gray-400 border-white/5"
                                         )}>
                                           {dayLucro > 0 ? '+' : ''}{dayLucro.toFixed(2)} R$
                                        </span>
                                      </div>
                                      {!isDayCollapsed && visibleDayBets.map(bet => (
                                        <ActivityItem 
                                          key={bet.id} 
                                          bet={bet} 
                                          displaySettings={displaySettings}
                                          // Keep onEdit and onDelete undefined or do-nothing to make it read-only
                                        />
                                      ))}
                                   </div>
                                 );
                               })}
                             </div>
                           );
                         })}

                         {visibleLimit < monthBets.length && (
                           <div className="flex justify-center pt-2 pb-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleShowMore(month); }}
                               className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all text-white font-medium text-sm cursor-pointer"
                             >
                               <ChevronDown className="w-4 h-4" />
                               Mostrar mais ({Math.min(visibleLimit, monthBets.length)}/{monthBets.length})
                             </button>
                           </div>
                         )}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             );
          })}
        </div>
      </main>
    </div>
  );
};

