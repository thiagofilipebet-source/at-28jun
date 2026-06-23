import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chart } from './Chart';
import { CalendarModal } from './CalendarModal';
import { 
  PlusCircle, 
  LineChart as ChartIcon, 
  SlidersHorizontal, 
  Calendar, 
  Settings, 
  Wrench, 
  Share2, 
  ChevronDown, 
  TrendingUp, 
  Navigation, 
  Hourglass, 
  X, 
  Monitor,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  HelpCircle,
  History,
  PieChart,
  BarChart2,
  Lock
} from 'lucide-react';
import { cn, removeUrls } from '../lib/utils';
import { BOOKMAKER_LOGOS, VARIATION_MAP, normalizeBookmakerName } from '../constants';

// Types & Hooks
import { Bet, DisplaySettings } from '../types';
import { useBets } from '../hooks/useBets';
import { useBankrollContext } from '../context/BankrollContext';
import { useSportMappingsContext } from '../context/SportMappingsContext';

// Components
import { ActivityItem } from './ActivityItem';
import { EarningCard } from './EarningCard';
import { AddBetSidebar } from './AddBetSidebar';
import { StatusModal } from './StatusModal';
import { DisplaySettingsSidebar } from './DisplaySettingsSidebar';
import { BetDetailSidebar } from './BetDetailSidebar';
import { DeleteConfirmationBar } from './DeleteConfirmationBar';
import { ShareModal } from './ShareModal';
import { StatsSidebar } from './StatsSidebar';
import { FilterSidebar } from './FilterSidebar';

export const Dashboard = () => {
  const { 
    activeBankrollId, 
    isAddBetModalOpen, 
    setIsAddBetModalOpen, 
    currentView, 
    setCurrentView, 
    bankrolls, 
    loadingBankrolls, 
    isStatsOpen, 
    setIsStatsOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    isFiltersOpen,
    setIsFiltersOpen,
    setEditingBankrollId,
    filters,
    setFilters
  } = useBankrollContext();
  const { mappings } = useSportMappingsContext();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const activeBankroll = bankrolls.find(b => b.id === activeBankrollId);

  const displayName = activeBankroll?.name || 'Dashboard Geral';
  const mobileDisplayName = activeBankroll?.name || 'Sem Banca';

  const { 
    bets, 
    stats, 
    groupedBets, 
    chartData, 
    addBets, 
    updateBet, 
    deleteBets, 
    updateBetStatus,
    refreshBets,
    calculateLucro
  } = useBets();

  const periodStats = React.useMemo(() => {
    const now = new Date();
    
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Today
    const todayStr = formatDate(now);
    const todayBets = bets.filter(b => b.date === todayStr);

    // Week
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const startOfWeekStr = formatDate(startOfWeek);
    const weekBets = bets.filter(b => b.date >= startOfWeekStr);

    // Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = formatDate(startOfMonth);
    const monthBets = bets.filter(b => b.date >= startOfMonthStr);

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
  }, [bets]);

  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const getVisibleCount = (month: string) => visibleCounts[month] || 25;

  const handleShowMore = (month: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [month]: (prev[month] || 25) + 25
    }));
  };

  const sortedMonthKeys = React.useMemo(() => {
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
      return dateB.getMonth() - dateA.getMonth(); // Reverse chronological
    });
  }, [groupedBets]);

  const [isBankrollMenuOpen, setIsBankrollMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const exportBankroll = () => {
    if (localStorage.getItem('hasExportedBankroll') === 'true') {
      alert('Você só pode exportar sua banca uma vez.');
      return;
    }
    const headers = [
      "Data", "Tipo", "Esporte", "Título da aposta", "Cotação", "Valor", 
      "Ganho", "Lucro", "Estado", "Casa de apostas", "Tipster", "Categoria", 
      "Competição", "Tipo de aposta", "Closing Odds", "Comissão", 
      "Bónus de ganho", "Ao vivo", "Aposta gratuita", "Cashout", "Eachway", "Comentário"
    ];
    const escapeCsv = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
    const formatNumber = (num: number) => num.toFixed(2);
    
    const csvRows = [headers.map(escapeCsv).join(';')];
    for (const bet of bets) {
      let dateObj = new Date(bet.date + 'T' + (bet.time || '12:00'));
      let formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()} ${bet.time || '12:00'}`;
      if (isNaN(dateObj.getTime())) {
          formattedDate = `${bet.date} ${bet.time || '12:00'}`;
      }

      let statusStr = 'Pendente';
      if (bet.status === 'won') statusStr = 'Ganha';
      else if (bet.status === 'lost') statusStr = 'Perdida';
      else if (bet.status === 'pending') statusStr = 'Pendente';
      else if (bet.status === 'returned') statusStr = 'Devolvida';
      else if (bet.status === 'half_won') statusStr = 'Meio ganha';
      else if (bet.status === 'half_lost') statusStr = 'Meio perdida';

      const profit = bet.profit || 0;
      let ganhoStr = statusStr === 'Pendente' ? '' : formatNumber(profit + bet.stake);
      let lucroStr = statusStr === 'Pendente' ? '' : formatNumber(profit);

      const row = [
        formattedDate,
        bet.type === 'Múltipla' ? 'Múltipla' : 'Simples',
        bet.sport || 'Futebol',
        bet.event || '',
        bet.odd?.toFixed(3) || '0.000',
        bet.stake?.toFixed(2) || '0.00',
        ganhoStr,
        lucroStr,
        statusStr,
        bet.bookmaker || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        bet.comment || ''
      ];
      csvRows.push(row.map(escapeCsv).join(';'));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'minhas_apostas.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    localStorage.setItem('hasExportedBankroll', 'true');
    setIsToolsMenuOpen(false);
  };

  const importBets = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event: any) => {
            const text = event.target.result;
            const rows = text.split(/\r?\n/).filter((r: string) => r.trim() !== '');
            if (rows.length < 2) {
               alert('Arquivo CSV vazio ou sem dados.');
               return;
            }
            
            const headerRow = rows[0].toLowerCase();
            const delimiter = headerRow.includes(';') ? ';' : ',';

            const ParseCsvLine = (line: string, delim: string) => {
              const result = [];
              let current = '';
              let inQuotes = false;
              for (let i = 0; i < line.length; i++) {
                  const char = line[i];
                  if (char === '"') {
                      if (inQuotes && line[i + 1] === '"') {
                          current += '"';
                          i++;
                      } else {
                          inQuotes = !inQuotes;
                      }
                  } else if (char === delim && !inQuotes) {
                      result.push(current.trim());
                      current = '';
                  } else {
                      current += char;
                  }
              }
              result.push(current.trim());
              return result;
            };

            const data = rows.slice(1).map((row: string) => {
                const cols = ParseCsvLine(row, delimiter);

                if (headerRow.includes('type') && headerRow.includes('sport') && headerRow.includes('event')) {
                  // Enhanced parsing for stake: "Aposta: R$80.00" or just "80.00"
                  const stakeRaw = cols[4] || '0';
                  const stakeVal = parseFloat(stakeRaw.toString().replace(/[^0-9,.]/g, '').replace(',', '.'));
                  const oddVal = parseFloat(cols[3]?.replace(',', '.') || '0');

                  const betBase = {
                    bankroll_id: activeBankrollId || '',
                    date: new Date().toISOString().split('T')[0], // Default date
                    time: '12:00', // Default time
                    odd: isNaN(oddVal) ? 0 : oddVal,
                    stake: isNaN(stakeVal) ? 0 : stakeVal,
                    status: (cols[7]?.toLowerCase().includes('ganha') ? 'won' : 
                            cols[7]?.toLowerCase().includes('perdida') ? 'lost' : 'pending') as Bet['status'],
                    event: cols[2] || '',
                    bookmaker: cols[8] || '',
                    sport: cols[1] || 'Futebol',
                    comment: cols[9] || '',
                    type: (cols[0]?.toLowerCase().includes('múltipla') ? 'Múltipla' : 'Simples') as NonNullable<Bet['type']>
                  };

                  return {
                    ...betBase,
                    id: crypto.randomUUID(),
                    profit: calculateLucro(betBase as any),
                    created_at: new Date().toISOString()
                  } as Bet;
                } else {
                  if (cols.length < 8) return null;
                  
                  const dataRaw = cols[0] || '';
                  const dateTime = dataRaw.split(' ');
                  
                  let parsedDate = new Date().toISOString().split('T')[0];
                  let parsedTime = '12:00';
                  
                  if (dateTime[0]) {
                    const parts = dateTime[0].split('/');
                    if (parts.length === 3) {
                      parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    } else if (dateTime[0].includes('-')) {
                      parsedDate = dateTime[0];
                    }
                  }
                  if (dateTime[1]) {
                    parsedTime = dateTime[1].substring(0, 5);
                  }
                  
                  let status: Bet['status'] = 'pending';
                  const rawStatus = (cols[8] || cols[6] || '').toUpperCase();
                  
                  if (rawStatus === 'W' || rawStatus.includes('GANHA') || rawStatus === 'WON') status = 'won';
                  else if (rawStatus === 'L' || rawStatus.includes('PERDIDA') || rawStatus === 'LOST') status = 'lost';
                  else if (rawStatus === 'P' || rawStatus.includes('PENDENTE') || rawStatus === 'PENDING') status = 'pending';
                  else if (rawStatus.includes('MEIO GANHA') || rawStatus.includes('HALF_WON')) status = 'half_won';
                  else if (rawStatus.includes('MEIO PERDIDA') || rawStatus.includes('HALF_LOST')) status = 'half_lost';
                  else if (rawStatus.includes('DEVOLVIDA') || rawStatus.includes('RETURNED')) status = 'refunded';

                  const oddVal = parseFloat((cols[4] || '0').replace(',', '.'));
                  const stakeVal = parseFloat((cols[5] || '0').replace(',', '.'));

                  const eventTitle = cols[3] || '';
                  const bookmaker = cols[9] || cols[7] || '';
                  const sportStr = cols[2] || '';
                  const typeRawStr = cols[1] || '';
                  const commentStr = cols.length > 21 ? cols[21] : '';

                  const betBase = {
                    bankroll_id: activeBankrollId || '',
                    date: parsedDate,
                    time: parsedTime,
                    odd: isNaN(oddVal) ? 0 : oddVal,
                    stake: isNaN(stakeVal) ? 0 : stakeVal,
                    status: status,
                    type: (typeRawStr.toLowerCase().includes('múltipla') || typeRawStr.toLowerCase().includes('multiple') ? 'Múltipla' : 'Simples') as NonNullable<Bet['type']>,
                    event: eventTitle,
                    bookmaker: bookmaker,
                    sport: sportStr,
                    comment: commentStr
                  };

                  return {
                    ...betBase,
                    id: crypto.randomUUID(),
                    profit: calculateLucro(betBase as any),
                    created_at: new Date().toISOString()
                  } as Bet;
                }
            });

            
            if (data.length > 0) {
               addBets(data);
               alert(`${data.length} apostas importadas com sucesso!`);
            } else {
               alert('Nenhuma aposta válida encontrada no arquivo. Verifique o formato do CSV.');
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
    setIsToolsMenuOpen(false);
  };
  
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    showHora: true,
    showFormato: true,
    showCasa: true,
    showGanho: true,
    showCotacao: true,
    showValor: true,
    autoOddAutomation: true,
  });

  const [expandedMonth, setExpandedMonth] = useState<string | null>(() => {
    const d = new Date();
    return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/\s+de\s+/gi, ' ').toLowerCase();
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBetIds, setSelectedBetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [isSavingBet, setIsSavingBet] = useState(false);

  // Status selection state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusBetId, setStatusBetId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<Bet['status']>('pending');
  const [tempReturnValue, setTempReturnValue] = useState<number | undefined>(undefined);

  // Form State for AddBet
  const [date, setDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  });
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [showMaisOpcoes, setShowMaisOpcoes] = useState(false);
  const [selections, setSelections] = useState([
    { id: '1', titulo: '', cotacao: '', esporte: 'Futebol', status: 'pending' as Bet['status'], valor: '', casaAposta: '', comment: '' }
  ]);
 
  const handleAddBetClick = () => {
    setIsEditMode(false);
    setSelectedBet(null);
    const d = new Date();
    setDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
    setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setSelections([{ id: '1', titulo: '', cotacao: '', esporte: 'Futebol', status: 'pending' as Bet['status'], valor: '', casaAposta: '', comment: '', has_deposited: true, return_value: '' } as any]);
    setIsAddBetModalOpen(true);
  };

  useEffect(() => {
    if (isAddBetModalOpen && !isEditMode) {
      const d = new Date();
      setDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setSelections([{ id: '1', titulo: '', cotacao: '', esporte: 'Futebol', status: 'pending' as Bet['status'], valor: '', casaAposta: '', comment: '', has_deposited: true, return_value: '' } as any]);
    }
  }, [isAddBetModalOpen, isEditMode]);

  const [initialExpandDone, setInitialExpandDone] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<string[]>([]);
  
  const toggleDayCollapse = (dayKey: string) => {
    setCollapsedDays(prev => prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]);
  };

  // Ensure a month is expanded when data arrives
  useEffect(() => {
    if (sortedMonthKeys.length > 0 && !initialExpandDone) {
      setInitialExpandDone(true);
    }
  }, [sortedMonthKeys, initialExpandDone]);
  const handleStatusChange = (id: string, currentStatus: Bet['status']) => {
    const bet = bets.find(b => b.id === id);
    setStatusBetId(id);
    setTempStatus(currentStatus);
    setTempReturnValue(bet?.return_value);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (statusBetId) {
      await updateBetStatus(statusBetId, tempStatus, tempReturnValue);
      setIsStatusModalOpen(false);
      setStatusBetId(null);
      setTempReturnValue(undefined);
    }
  };

  const startEdit = (bet: Bet) => {
    setIsEditMode(true);
    setSelectedBet(bet);
    setDate(bet.date);
    setTime(bet.time || '12:00');
    setSelections([{
      id: bet.id,
      date: bet.date,
      time: bet.time || '12:00',
      titulo: bet.event || '',
      cotacao: bet.odd.toString(),
      esporte: bet.sport || 'Futebol',
      status: bet.status,
      valor: bet.stake.toString(),
      casaAposta: bet.bookmaker || '',
      comment: bet.comment || '',
      has_deposited: bet.has_deposited ?? true,
      return_value: bet.return_value !== undefined ? bet.return_value.toString() : ''
    }]);
    setIsAddBetModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBankrollId = activeBankrollId;
    
    if (!finalBankrollId) {
      alert('Nenhuma banca ativa encontrada.');
      return;
    }

    try {
      setIsSavingBet(true);
      
      // Normalize time to HH:mm (e.g. 9:00 -> 09:00)
      const normalizedTime = time.split(':').map(p => p.trim().padStart(2, '0')).join(':');

      if (isEditMode && selectedBet) {
        const s = selections[0];
        const updated: Bet = {
          ...selectedBet,
          date,
          time: normalizedTime,
          odd: parseFloat(s.cotacao) || 0,
          stake: parseFloat(s.valor) || 0,
          status: s.status,
          event: s.titulo,
          bookmaker: s.casaAposta?.trim(),
          sport: s.esporte,
          bankroll_id: finalBankrollId,
          comment: s.comment,
          has_deposited: s.has_deposited ?? true,
        };
        // @ts-ignore dynamic field access from our selection type
        if (s.status === 'cashout' && s.return_value) {
           // @ts-ignore
           updated.return_value = parseFloat(s.return_value) || 0;
        } else if (s.status !== 'cashout') {
           updated.return_value = undefined;
        }

        await updateBet(updated);
      } else {
        const newBets: Omit<Bet, 'id' | 'user_id' | 'profit'>[] = selections.map(s => {
          const newBet: Omit<Bet, 'id' | 'user_id' | 'profit'> = {
            bankroll_id: finalBankrollId,
            date: (s as any).date || date,
            time: ((s as any).time || normalizedTime).slice(0, 5),
            odd: parseFloat(s.cotacao) || 0,
            stake: parseFloat(s.valor) || 0,
            status: s.status,
            type: selections.length > 1 ? 'Múltipla' : 'Simples',
            event: s.titulo,
            bookmaker: s.casaAposta?.trim(),
            sport: s.esporte,
            comment: s.comment,
            has_deposited: s.has_deposited ?? true
          };
          // @ts-ignore
          if (s.status === 'cashout' && s.return_value) {
            // @ts-ignore
            newBet.return_value = parseFloat(s.return_value) || 0;
          }
          return newBet;
        });
        await addBets(newBets);
      }

      // Reset on success
      setIsEditMode(false);
      setSelectedBet(null);
      const d = new Date();
      setDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setSelections([{ id: '1', titulo: '', cotacao: '', esporte: 'Futebol', status: 'pending' as Bet['status'], valor: '', casaAposta: '', comment: '', has_deposited: true, return_value: '' } as any]);
      setShowMaisOpcoes(false);
      setIsAddBetModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar aposta:', error);
    } finally {
      setIsSavingBet(false);
    }
  };

  const handleDeleteSelections = () => {
    if (!confirmDeletion) return;
    deleteBets(selectedBetIds);
    setSelectedBetIds([]);
    setIsDeleting(false);
    setConfirmDeletion(false);
  };

  const toggleBetSelection = (id: string) => {
    setSelectedBetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-dashboard relative overflow-hidden">
      {/* Top Header */}
      <header className="hidden lg:flex h-16 px-6 border-b border-white/5 items-center justify-between shrink-0 bg-[#0b1120] z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-normal text-white tracking-tight uppercase">
            {displayName}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAddBetClick}
            className="flex items-center gap-2 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all shadow-xl shadow-indigo-500/10 cursor-pointer"
          >
            <PlusCircle className="w-4 md:w-5 h-4 md:h-5" />
            <span className="hidden sm:inline">Adicionar aposta</span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </header>

      {/* Mobile Special Header */}
      <header className="lg:hidden flex h-14 items-center justify-between px-4 bg-[#0b1120] sticky top-0 z-40">
        <button 
          onClick={() => setCurrentView('bankrolls')}
          className="p-2 -ml-2 text-indigo-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <span className="text-white text-base font-normal tracking-tight uppercase truncate">{mobileDisplayName}</span>
        </div>

        <button 
          onClick={() => setCurrentView('more')}
          className="p-2 -mr-2 text-indigo-400"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Toolbar - Hidden on mobile statistics view if desired, but user didn't specify. Keeping it for now. */}

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

        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => {
              setIsBankrollMenuOpen(!isBankrollMenuOpen);
              if (!isBankrollMenuOpen) setIsToolsMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 text-xs font-bold hover:bg-white/5 hover:text-white transition-all border border-white/5 bg-white/[0.02]"
          >
            <Settings className="w-3.5 h-3.5" />
            Bankroll
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isBankrollMenuOpen && "rotate-180")} />
          </button>

          {isBankrollMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-[999] py-2 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => {
                  if (activeBankrollId) {
                    setEditingBankrollId(activeBankrollId);
                    setCurrentView('bankrolls');
                  }
                  setIsBankrollMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
              >
                <ChartIcon className="w-4 h-4 text-indigo-400" />
                Editar bankroll
              </button>
              <button 
                onClick={() => {
                  setIsDisplaySettingsOpen(true);
                  setIsBankrollMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left border-t border-white/5"
              >
                <Monitor className="w-4 h-4 text-indigo-400" />
                Exibição de aposta
              </button>
            </div>
          )}

          <button 
            onClick={() => {
              setIsToolsMenuOpen(!isToolsMenuOpen);
              if (!isToolsMenuOpen) setIsBankrollMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 text-xs font-bold hover:bg-white/5 hover:text-white transition-all border border-white/5 bg-white/[0.02]"
          >
            <Wrench className="w-3.5 h-3.5" />
            Ferramentas
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isToolsMenuOpen && "rotate-180")} />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-[999] py-2 animate-in fade-in zoom-in-95 duration-200">
               <button 
                  disabled={true}
                  onClick={importBets}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-500 transition-all text-left cursor-not-allowed"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  Importar apostas
                </button>
                <button 
                  disabled={localStorage.getItem('hasExportedBankroll') === 'true'}
                  onClick={exportBankroll}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left ${localStorage.getItem('hasExportedBankroll') === 'true' ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                >
                  <Download className={`w-4 h-4 ${localStorage.getItem('hasExportedBankroll') === 'true' ? 'text-gray-600' : 'text-primary'}`} />
                  Exportar bankroll
                </button>
            </div>
          )}
          {activeBankroll && (
            activeBankroll.is_public ? (
              <button 
                disabled={true}
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-500 text-xs font-bold transition-all border border-white/5 bg-white/[0.02] cursor-not-allowed"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar
              </button>
            ) : (
              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 text-xs font-bold hover:bg-white/5 hover:text-orange-400 transition-all border border-white/5 bg-white/[0.02] cursor-default"
                title="Banca Privada"
              >
                <Lock className="w-3.5 h-3.5" />
                Privado
              </button>
            )
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-2 lg:p-6 space-y-2 lg:space-y-3 relative">
        {/* Statistics Section (Visible in Home/Dashboard view on mobile, or always on desktop) */}
        <div className={cn("space-y-0 lg:space-y-6", currentView !== 'dashboard' && "hidden lg:block")}>
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

              <button 
                onClick={() => setCurrentView('analysis')}
                className="w-full bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xl shadow-indigo-500/10 cursor-pointer shrink-0"
              >
                Ver Relatório Detalhado
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          
          {/* New Row for Mobile: Análise & Calendário */}
          <div className="lg:hidden p-2 grid grid-cols-2 gap-2 mt-2">
            <button 
              onClick={() => setCurrentView('analysis')}
              className="flex items-center justify-center gap-2 py-1.5 bg-[#0b1120] rounded-xl border border-white/5 text-gray-300 font-medium transition-all hover:bg-white/5 cursor-pointer w-full"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span className="text-xs">Análise</span>
            </button>
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center justify-center gap-2 py-1.5 bg-[#0b1120] rounded-xl border border-white/5 text-gray-300 font-medium transition-all hover:bg-white/5 w-full"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">Calendário</span>
            </button>
          </div>
        <div className="mt-2 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3">
            {/* Card 1: Lucro Líquido (Desktop) / APOSTAS (Mobile) */}
            <div className="bg-[#0b1120] border border-white/5 lg:border-[#66dd8b]/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto">
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">Lucro Líquido</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">Apostas</span>
                <TrendingUp className="hidden lg:block w-4 h-4 text-[#66dd8b] opacity-80" />
                <HelpCircle className="lg:hidden w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 opacity-50" />
              </div>
              
              {/* Desktop Value */}
              <div className={cn("text-[28px] font-black mt-0.5 hidden lg:block", stats.lucroLiquido >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
                R$ {stats.lucroLiquido.toFixed(2)}
              </div>

              {/* Mobile Version */}
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className="text-[22px] font-normal text-indigo-400">
                  {stats.totalApostas}
                </div>
              </div>
            </div>

            {/* Card 2: Taxa de Acerto (Desktop) / LUCROS (Mobile) */}
            <div className="bg-[#0b1120] border border-white/5 lg:border-indigo-400/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto">
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">Taxa de Acerto</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">Lucros</span>
                <Navigation className="hidden lg:block w-4 h-4 text-indigo-400 opacity-80 rotate-45" />
                <HelpCircle className="lg:hidden w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 opacity-50" />
              </div>

              {/* Desktop Version */}
              <div className="hidden lg:block">
                <div className="text-[28px] font-black text-white mt-1">
                  {stats.taxaAcerto.toFixed(1)}%
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${stats.taxaAcerto}%` }}></div>
                </div>
              </div>

              {/* Mobile Version */}
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className="text-[20px] font-normal text-[#66dd8b]">
                  {stats.lucroLiquido.toFixed(2)}R$
                </div>
              </div>
            </div>

            {/* Card 3: ROI (Desktop) / ROI (Mobile) */}
            <div className="bg-[#0b1120] border border-white/5 lg:border-[#66dd8b]/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto">
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">ROI</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">ROI</span>
                <BarChart2 className="hidden lg:block w-4 h-4 text-[#66dd8b] opacity-80" />
                <HelpCircle className="lg:hidden w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 opacity-50" />
              </div>

              {/* Desktop Version */}
              <div className="hidden lg:block">
                <div className={cn("text-[28px] font-black mt-1", stats.roi >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
                  {stats.roi.toFixed(1)}%
                </div>
              </div>

              {/* Mobile Version */}
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className={cn("text-[22px] font-normal", stats.roi >= 0 ? "text-[#66dd8b]" : "text-red-400")}>
                  {stats.roi.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Card 4: Apostas Pendentes (Desktop) / PROGRESSÃO (Mobile) */}
            <div 
              className="bg-[#0b1120] border border-white/5 lg:border-orange-400/40 rounded-xl p-3 lg:p-5 flex flex-col relative h-[75px] lg:h-auto cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => {
                setFilters({ ...filters, status: 'Pendente' });
                // If on mobile, might want to switch to 'apostas' view, but currently on mobile it might use shared view?
                if (currentView === 'dashboard') {
                  // actually mostly it scrolls down, but let's make sure it's filtering
                }
              }}
            >
              <div className="flex justify-between items-start mb-1 lg:mb-2 text-center">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider lg:inline hidden">Apostas Pendentes</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider lg:hidden w-full">Progressão</span>
                <Hourglass className="hidden lg:block w-4 h-4 text-orange-400 opacity-80" />
                <HelpCircle className="lg:hidden w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 opacity-50" />
              </div>

              {/* Desktop Version */}
              <div className="flex flex-col hidden lg:flex">
                <div className="text-[28px] font-black text-white mt-1 leading-none mb-2">
                  {stats.apostasPendentes}
                </div>
                <div className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded w-fit">
                  R$ {stats.valorPendente.toFixed(2)}
                </div>
              </div>

              {/* Mobile Version */}
              <div className="lg:hidden flex flex-col items-center justify-center flex-1">
                <div className="text-[22px] font-normal text-[#66dd8b]">
                  {stats.taxaAcerto.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grouped Bets (Apostas) - Visible in Apostas view on mobile, or bottom on desktop */}
        <div className={cn("space-y-[6px]", currentView === 'dashboard' && "hidden lg:block")}>
          {Object.entries(groupedBets).length === 0 && (
            <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10 text-gray-400 font-medium">
              Nenhuma aposta registrada. Clique em "Adicionar aposta" para começar.
            </div>
          )}

          {sortedMonthKeys.map(month => {
             const weeks = groupedBets[month];
             const monthBets = (Object.values(weeks).flatMap(days => Object.values(days as Record<string, Bet[]>).flat()) as Bet[])
               .sort((a, b) => {
                 const dateCompare = (b.date || '').localeCompare(a.date || '');
                 if (dateCompare !== 0) return dateCompare;
                 
                 // Reverse chronological time (Latest first)
                 const timeA = (a.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                 const timeB = (b.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                 
                 if (timeB !== timeA) return timeB.localeCompare(timeA);
                 const createdA = new Date(a.created_at || 0).getTime();
                 const createdB = new Date(b.created_at || 0).getTime();
                 return createdB - createdA;
               });
             const visibleLimit = getVisibleCount(month);
             const visibleMonthBets = monthBets.slice(0, visibleLimit);
             const visibleMonthBetIds = new Set(visibleMonthBets.map(b => b.id));

             const monthLucro = monthBets.reduce((acc, b) => b.status === 'pending' ? acc : acc + calculateLucro(b), 0);
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
                       className="overflow-hidden min-w-0"
                     >
                       <div className="space-y-1.5 pb-2 min-w-0">
                         {Object.entries(weeks)
                          .sort((a, b) => {
                            // Extract week number from "Semana N"
                            const weekA = parseInt(a[0].split(' ')[1]) || 0;
                            const weekB = parseInt(b[0].split(' ')[1]) || 0;
                            return weekB - weekA;
                          })
                          .map(([week, days]) => {
                           const weekBets = Object.values(days as Record<string, Bet[]>).flat() as Bet[];
                           const visibleWeekBets = weekBets.filter(bet => visibleMonthBetIds.has(bet.id));
                           if (visibleWeekBets.length === 0) return null;

                           const weekLucro = weekBets.reduce((acc, b) => b.status === 'pending' ? acc : acc + calculateLucro(b), 0);
                           
                           return (
                             <div key={week} className="space-y-1.5 min-w-0">
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
                                   // a[1] is the array of bets for this day
                                   const dateA = a[1][0]?.date || '';
                                   const dateB = b[1][0]?.date || '';
                                   // Newest days at the top
                                   return dateB.localeCompare(dateA);
                                 })
                                 .map(([day, dayBets]) => {
                                 const visibleDayBets = (dayBets as Bet[])
                                   .filter(bet => visibleMonthBetIds.has(bet.id))
                                   .sort((a, b) => {
                                     const timeA = (a.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                                     const timeB = (b.time || '00:00').split(':').map(p => p.trim().padStart(2, '0')).join(':');
                                     if (timeB !== timeA) return timeB.localeCompare(timeA);
                                     const createdA = new Date(a.created_at || 0).getTime();
                                     const createdB = new Date(b.created_at || 0).getTime();
                                     return createdB - createdA;
                                   });

                                 if (visibleDayBets.length === 0) return null;

                                 const dayLucro = (dayBets as Bet[]).reduce((acc, b) => b.status === 'pending' ? acc : acc + calculateLucro(b), 0);
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
                                          onStatusChange={handleStatusChange}
                                          onEdit={() => startEdit(bet)}
                                          onDelete={() => {
                                            setIsDeleting(true);
                                            setSelectedBetIds([bet.id]);
                                          }}
                                          isDeleting={isDeleting}
                                          isSelected={selectedBetIds.includes(bet.id)}
                                          onToggleSelect={() => toggleBetSelection(bet.id)}
                                          onClick={() => {
                                            if (!isDeleting) {
                                              setSelectedBet(bet);
                                              setIsDetailOpen(true);
                                            }
                                          }}
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

      {/* Overlay modals */}
      {(isAddBetModalOpen || isDisplaySettingsOpen || isDetailOpen || isCalendarOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setIsAddBetModalOpen(false);
            setIsDisplaySettingsOpen(false);
            setIsDetailOpen(false);
            setIsCalendarOpen(false);
          }}
        />
      )}

      {/* Extracted Sidebars and Modals */}
      <CalendarModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <StatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        tempStatus={tempStatus}
        setTempStatus={setTempStatus}
        tempReturnValue={tempReturnValue}
        setTempReturnValue={setTempReturnValue}
        onConfirm={confirmStatusChange}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`${window.location.origin}/?share=${activeBankroll?.id || activeBankrollId}`}
      />

      <AddBetSidebar 
        isOpen={isAddBetModalOpen}
        isEditMode={isEditMode}
        onClose={() => {
          setIsAddBetModalOpen(false);
          setIsEditMode(false);
          setSelectedBet(null);
          const d = new Date();
          setDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
          setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
          setSelections([{ id: '1', titulo: '', cotacao: '', esporte: 'Futebol', status: 'pending' as Bet['status'], valor: '', casaAposta: '', comment: '', has_deposited: true, return_value: '' } as any]);
        }}
        onSubmit={handleFormSubmit}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        selections={selections}
        addSelection={() => setSelections(prev => {
          const lastSelection = prev[prev.length - 1];
          let nextTime = time;
          let nextDate = date;
          if (lastSelection) {
            nextDate = lastSelection.date || date;
            nextTime = lastSelection.time || time;
          }
          return [...prev, { id: Date.now().toString(), date: nextDate, time: nextTime, titulo: '', cotacao: '', esporte: 'Futebol', status: 'pending', valor: '', casaAposta: '', comment: '', has_deposited: true, return_value: '' } as any];
        })}
        removeSelection={(id) => setSelections(prev => prev.filter(s => s.id !== id))}
        updateSelection={(id, field, value) => {
          let updates: any = { [field]: value };
          
          if ((field === 'titulo' || field === 'comment')) {
            const cleanedValue = removeUrls(value);
            if (field === 'titulo') updates.titulo = cleanedValue;
            
            // Valor Automático
            if (activeBankroll?.auto_bet_value_enabled) {
              const unit = parseFloat(activeBankroll.auto_bet_unit || '0');
              if (unit > 0) {
                // Improved regex to capture numbers like 0,25 or 1.5 strictly before %
                // Using [^0-9,.] ensures we don't start matching mid-decimal-number
                const percentMatch = cleanedValue.match(/(^|[^0-9,.])(\d+([.,]\d+)?)\s*%/);
                const limitMatch = cleanedValue.match(/LIMITE[^0-9]*(\d+([.,]\d+)?)/i);
                
                if (percentMatch) {
                  const percentStr = percentMatch[2].replace(',', '.');
                  const percent = parseFloat(percentStr);
                  let amount = unit * percent;
                  
                  if (limitMatch) {
                    const limitStr = limitMatch[1].replace(',', '.');
                    const limit = parseFloat(limitStr);
                    if (amount > limit) amount = limit;
                  }
                  
                  updates.valor = amount.toFixed(2);
                }
              }
            }

            // Odd Automática
            if (activeBankroll?.auto_bet_odd_enabled) {
              const oddMatch = cleanedValue.match(/odd[^0-9]*(\d+([.,]\d+)?)/i);
              if (oddMatch) {
                updates.cotacao = oddMatch[1].replace(',', '.');
              }
            }

            // Casa Automática
            if (activeBankroll?.auto_bet_house_enabled) {
              const lowerValue = cleanedValue.toLowerCase();
              
              // Primeiro verifica o dicionário personalizado de casas
              const houseMapping = mappings.find(m => m.type === 'house' && lowerValue.includes(m.keyword.toLowerCase()));
              
              if (houseMapping) {
                updates.casaAposta = houseMapping.sport; // Aqui "sport" armazena o nome da casa
              } else {
                // Primeiro verifica variações padrão (ex: FAZ1BET -> FAZ 1 BET)
                const variationKeys = Object.keys(VARIATION_MAP);
                const foundVariation = variationKeys.find(v => lowerValue.includes(v.toLowerCase()));
                
                if (foundVariation) {
                  updates.casaAposta = normalizeBookmakerName(foundVariation);
                } else {
                  // Senão, usa o banco de dados padrão
                  const bookmakerKeys = Object.keys(BOOKMAKER_LOGOS);
                  const foundBookmaker = bookmakerKeys.find(b => lowerValue.includes(b.toLowerCase()));
                  if (foundBookmaker) {
                    updates.casaAposta = normalizeBookmakerName(foundBookmaker);
                  }
                }
              }
            }

            // Detecção de Esporte
            if (activeBankroll?.auto_bet_sport_enabled) {
              const lowerValue = cleanedValue.toLowerCase();
              
              // Primeiro verifica o dicionário personalizado de esportes
              const sportMapping = mappings.find(m => (m.type === 'sport' || !m.type) && lowerValue.includes(m.keyword.toLowerCase()));
              if (sportMapping) {
                updates.esporte = sportMapping.sport;
              } else {
                // Se não achar no dicionário, usa os padrões
                const sports = ['futebol', 'basquete', 'tenis', 'volei', 'esports'];
                const foundSport = sports.find(s => lowerValue.includes(s));
                if (foundSport) {
                  updates.esporte = foundSport.charAt(0).toUpperCase() + foundSport.slice(1);
                }
              }
            }
          }
          
          setSelections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        }}
        showMaisOpcoes={showMaisOpcoes}
        setShowMaisOpcoes={setShowMaisOpcoes}
        isSaving={isSavingBet}
      />

      <DisplaySettingsSidebar 
        isOpen={isDisplaySettingsOpen}
        onClose={() => setIsDisplaySettingsOpen(false)}
        settings={displaySettings}
        onSettingsChange={setDisplaySettings}
      />

      <BetDetailSidebar 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        selectedBet={selectedBet}
        onDelete={(id) => {
          deleteBets([id]);
          setIsDetailOpen(false);
        }}
        onEdit={(bet) => {
          setIsDetailOpen(false);
          startEdit(bet);
        }}
      />

      <StatsSidebar 
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <FilterSidebar 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />

      <DeleteConfirmationBar 
        isVisible={isDeleting}
        selectedCount={selectedBetIds.length}
        confirmDeletion={confirmDeletion}
        onConfirmChange={setConfirmDeletion}
        onCancel={() => {
          setIsDeleting(false);
          setSelectedBetIds([]);
          setConfirmDeletion(false);
        }}
        onDelete={handleDeleteSelections}
      />
    </div>
  );
};
