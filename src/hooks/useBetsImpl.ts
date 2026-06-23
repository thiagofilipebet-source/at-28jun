import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Bet, BetStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useBankrollContext } from '../context/BankrollContext';
import { db } from '../lib/db';

export const useBetsImpl = () => {
  const { activeBankrollId, filters, timeRange } = useBankrollContext();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isFetchingRef = useRef(false); // Evita fetchs simultâneos

  // ─── Filtros (client-side, sem custo de egress) ───────────────────────────

  const filteredBets = useMemo(() => {
    try {
      return bets.filter(bet => {
        if (!bet) return false;
        if (activeBankrollId && bet.bankroll_id !== activeBankrollId) return false;

        if (timeRange && timeRange !== 'all') {
          const betTime = new Date(bet.date + 'T12:00:00').getTime();
          const now = new Date();
          const todayAtNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).getTime();

          switch (timeRange) {
            case '1d': {
              const todayStr = new Date().toLocaleDateString('en-CA', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              });
              if (bet.date !== todayStr) return false;
              break;
            }
            case '1s':
              if (betTime < todayAtNoon - 7 * 24 * 60 * 60 * 1000) return false;
              break;
            case '1m':
              if (betTime < todayAtNoon - 30 * 24 * 60 * 60 * 1000) return false;
              break;
            case '1a':
              if (betTime < todayAtNoon - 365 * 24 * 60 * 60 * 1000) return false;
              break;
          }
        }

        if (filters.title) {
          const search = filters.title.toLowerCase();
          const match =
            bet.event?.toLowerCase().includes(search) ||
            bet.comment?.toLowerCase().includes(search) ||
            bet.sport?.toLowerCase().includes(search) ||
            bet.bookmaker?.toLowerCase().includes(search) ||
            bet.type?.toLowerCase().includes(search);
          if (!match) return false;
        }

        if (filters.status) {
          const statusMap: Record<string, string> = {
            Ganha: 'won',
            Perdida: 'lost',
            Pendente: 'pending',
            Reembolsada: 'refunded',
            Cancelada: 'canceled',
            'M. Ganha': 'half_won',
            'M. Perdida': 'half_lost',
            Cashout: 'cashout',
          };
          if (bet.status !== statusMap[filters.status]) return false;
        }

        if (filters.sport && bet.sport !== filters.sport) return false;
        if (filters.house && bet.house !== filters.house) return false;
        if (filters.betType && bet.bet_type !== filters.betType) return false;

        if (filters.dateStart) {
          const start = new Date(filters.dateStart + 'T00:00:00').getTime();
          if (new Date(bet.date + 'T00:00:00').getTime() < start) return false;
        }
        if (filters.dateEnd) {
          const end = new Date(filters.dateEnd + 'T23:59:59').getTime();
          if (new Date(bet.date + 'T12:00:00').getTime() > end) return false;
        }

        if (filters.valMin && bet.stake < parseFloat(filters.valMin)) return false;
        if (filters.valMax && bet.stake > parseFloat(filters.valMax)) return false;
        if (filters.oddMin && bet.odd < parseFloat(filters.oddMin)) return false;
        if (filters.oddMax && bet.odd > parseFloat(filters.oddMax)) return false;

        return true;
      });
    } catch (err) {
      console.error('Error filtering bets:', err);
      return [];
    }
  }, [bets, activeBankrollId, filters, timeRange]);

  // ─── FIX 1: fetchBets com guard de concorrência ────────────────────────────
  const fetchBets = useCallback(async () => {
    if (isFetchingRef.current) return; // Evita chamadas simultâneas
    isFetchingRef.current = true;

    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session?.user) {
        setLoading(false);
        return;
      }

      if (!bets.length) setLoading(true);

      let allBets: any[] = [];
      let page = 0;
      const pageSize = 1000;
      const MAX_PAGES = 5; // Limite máximo de 5 requisições (5000 apostas) para evitar estourar o limite de egress
      let hasMore = true;

      while (hasMore && page < MAX_PAGES) {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Supabase fetch error:', error);
          break;
        }

        if (data && data.length > 0) {
          allBets = [...allBets, ...data];
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      setBets(allBets);

      // Sincronizar cache local
      await db.bets.clear();
      if (allBets.length > 0) {
        await db.bets.bulkPut(allBets);
      }
    } catch (error) {
      console.error('Erro ao buscar apostas:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // sem dependências — fetchBets é estável

  // ─── FIX 2: Carregar cache e só buscar se cache vazio ─────────────────────
  useEffect(() => {
    const loadCachedBets = async () => {
      try {
        const cached = await db.bets.toArray();
        if (cached && cached.length > 0) {
          setBets(cached);
          setLoading(false);
          // Cache existe: ainda busca em background para garantir sincronismo sem realtime
        }
      } catch (error) {
        console.error('Erro ao carregar cache do IndexedDB:', error);
      }
      // Sempre busca para garantir dados limpos (sem realtime)
      await fetchBets();
    };

    loadCachedBets();
  }, []); // Apenas na montagem

  // ─── FIX 3: Auth listener sem dependência de activeBankrollId ─────────────
  useEffect(() => {
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (event === 'INITIAL_SESSION') {
        return; // loadCachedBets will handle the initial load
      }
      if (event === 'SIGNED_IN' && user) {
        fetchBets();
      } else if (event === 'SIGNED_OUT' || (!user && event !== 'TOKEN_REFRESHED')) {
        setBets([]);
        db.bets.clear();
      }
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []); // FIX: sem activeBankrollId — evita recriar listener e rebuscar dados

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const calculateLucroValue = (bet: Omit<Bet, 'profit'>): number => {
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

  const addBets = async (newBets: Omit<Bet, 'id' | 'user_id' | 'profit'>[]) => {
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Usuário não autenticado');

      const betsWithExtras = newBets.map((b, index) => ({
        ...b,
        id: crypto.randomUUID(),
        user_id: session.user.id,
        profit: calculateLucroValue(b as any),
        created_at: new Date(Date.now() + index * 1000).toISOString(),
      }));

      const { data, error } = await supabase.from('bets').insert(betsWithExtras).select();
      if (error) throw error;

      if (data) {
        setBets((prev) => [...data, ...prev]);
        await db.bets.bulkPut(data);
        return data;
      }
      return null;
    } catch (error: any) {
      console.error('Erro ao adicionar apostas:', error);
      alert('Erro ao adicionar aposta: ' + error.message);
      return null;
    }
  };

  const updateBet = async (updatedBet: Bet) => {
    try {
      const betToUpdate = { ...updatedBet, profit: calculateLucroValue(updatedBet) };
      const { error } = await supabase.from('bets').update(betToUpdate).eq('id', betToUpdate.id);
      if (error) throw error;
      setBets((prev) => prev.map((b) => (b.id === betToUpdate.id ? betToUpdate : b)));
      await db.bets.put(betToUpdate);
    } catch (error) {
      console.error('Erro ao atualizar aposta:', error);
    }
  };

  const deleteBets = async (ids: string[]) => {
    try {
      const { error } = await supabase.from('bets').delete().in('id', ids);
      if (error) throw error;
      setBets((prev) => prev.filter((b) => !ids.includes(b.id)));
      await db.bets.bulkDelete(ids);
    } catch (error) {
      console.error('Erro ao deletar apostas:', error);
    }
  };

  const updateBetStatus = async (id: string, status: BetStatus, returnValue?: number) => {
    try {
      const betToUpdate = bets.find((b) => b.id === id);
      if (!betToUpdate) return;

      const updatedBet = {
        ...betToUpdate,
        status,
        return_value: status === 'cashout' && returnValue !== undefined ? returnValue : betToUpdate.return_value,
      };
      
      updatedBet.profit = calculateLucroValue(updatedBet);

      const updateData: any = { status: updatedBet.status, profit: updatedBet.profit };
      if (status === 'cashout' && returnValue !== undefined) {
        updateData.return_value = returnValue;
      }

      const { error } = await supabase
        .from('bets')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      setBets((prev) => prev.map((b) => (b.id === id ? updatedBet : b)));
      await db.bets.put(updatedBet);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const updateBetWithdrawn = async (id: string, withdrawn: boolean) => {
    try {
      const betToUpdate = bets.find((b) => b.id === id);
      if (!betToUpdate) return;

      const updatedBet = { ...betToUpdate, withdrawn };
      const { error } = await supabase.from('bets').update({ withdrawn }).eq('id', id);
      if (error) throw error;

      setBets((prev) => prev.map((b) => (b.id === id ? updatedBet : b)));
      await db.bets.put(updatedBet);
    } catch (error: any) {
      console.error('Erro ao atualizar saque:', error);
      alert('Erro ao atualizar status de saque: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const bulkUpdateBetWithdrawn = async (ids: string[], withdrawn: boolean) => {
    try {
      if (!ids.length) return;
      const { error } = await supabase.from('bets').update({ withdrawn }).in('id', ids);
      if (error) throw error;
      setBets((prev) => prev.map((b) => (ids.includes(b.id) ? { ...b, withdrawn } : b)));
      const updated = bets.filter((b) => ids.includes(b.id)).map((b) => ({ ...b, withdrawn }));
      if (updated.length) await db.bets.bulkPut(updated);
    } catch (error: any) {
      console.error('Erro ao fazer saque em lote:', error);
      alert('Erro ao fazer saque em lote: ' + (error.message || 'Erro desconhecido'));
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    try {
      const currentBets = filteredBets || [];
      const totalProfit = currentBets.reduce((acc, bet) => acc + (bet.profit || 0), 0);
      const totalStake = currentBets.reduce((acc, bet) => acc + (bet.stake || 0), 0);
      const roiNum = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
      const winCount = currentBets.filter((b) => b.status === 'won' || b.status === 'half_won').length;
      const betCount = currentBets.length;
      const winRateNum = betCount > 0 ? (winCount / betCount) * 100 : 0;
      const activeBets = currentBets.filter((b) => b.status !== 'pending');

      return {
        lucroLiquido: totalProfit,
        roi: isNaN(roiNum) ? 0 : roiNum,
        taxaAcerto: isNaN(winRateNum) ? 0 : winRateNum,
        totalApostas: betCount,
        investimentoTotal: activeBets.reduce((acc, b) => acc + (b.stake || 0), 0),
        totalGanhos: currentBets.filter((b) => (b.profit || 0) > 0).reduce((acc, b) => acc + (b.profit || 0), 0),
        totalPercas: Math.abs(currentBets.filter((b) => (b.profit || 0) < 0).reduce((acc, b) => acc + (b.profit || 0), 0)),
        apostasPendentes: currentBets.filter((b) => b.status === 'pending').length,
        valorPendente: currentBets.filter((b) => b.status === 'pending').reduce((acc, b) => acc + (b.stake || 0), 0),
      };
    } catch (err) {
      console.error('Error calculating stats:', err);
      return { lucroLiquido: 0, roi: 0, taxaAcerto: 0, totalApostas: 0, investimentoTotal: 0, totalGanhos: 0, totalPercas: 0, apostasPendentes: 0, valorPendente: 0 };
    }
  }, [filteredBets]);

  // ─── Agrupamento ───────────────────────────────────────────────────────────

  const getGroupedBets = (betsToGroup: Bet[]) => {
    try {
      const getWeekNumber = (dStr: string) => {
        if (!dStr) return 0;
        const d = new Date(dStr + 'T12:00:00');
        if (isNaN(d.getTime())) return 0;
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      };

      return (betsToGroup || []).reduce((acc, bet) => {
        if (!bet || !bet.date) return acc;
        const d = new Date(bet.date + 'T12:00:00');
        if (isNaN(d.getTime())) return acc;

        const monthStr = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        const month = monthStr.replace(/\s+de\s+/gi, ' ').toLowerCase();
        const week = `Semana ${getWeekNumber(bet.date)}`;
        const day = `${d.toLocaleString('pt-BR', { weekday: 'long' })} ${d.getDate()}`;

        if (!acc[month]) acc[month] = {};
        if (!acc[month][week]) acc[month][week] = {};
        if (!acc[month][week][day]) acc[month][week][day] = [];
        acc[month][week][day].push(bet);
        return acc;
      }, {} as Record<string, Record<string, Record<string, Bet[]>>>);
    } catch (err) {
      console.error('Error grouping bets:', err);
      return {};
    }
  };

  const groupedBets = useMemo(() => getGroupedBets(filteredBets), [filteredBets]);

  const dailyProfits = useMemo(() => {
    const profits: Record<string, number> = {};
    filteredBets.forEach((bet) => {
      if (bet.status !== 'pending') {
        profits[bet.date] = (profits[bet.date] || 0) + (bet.profit || 0);
      }
    });
    return profits;
  }, [filteredBets]);

  const chartData = useMemo(() => filteredBets.filter((b) => b.status !== 'pending'), [filteredBets]);

  return {
    bets: filteredBets,
    allBets: bets,
    stats,
    groupedBets,
    chartData,
    dailyProfits,
    addBets,
    updateBet,
    deleteBets,
    updateBetStatus,
    updateBetWithdrawn,
    bulkUpdateBetWithdrawn,
    deleteOrphanedBets: async () => {
      try {
        const { error } = await supabase.from('bets').delete().is('bankroll_id', null);
        if (error) throw error;
        setBets((prev) => prev.filter((b) => !!b.bankroll_id));
        await db.bets.filter((b) => !b.bankroll_id).delete();
        return true;
      } catch (error) {
        console.error('Erro ao deletar apostas órfãs:', error);
        return false;
      }
    },
    refreshBets: fetchBets,
    calculateLucro: calculateLucroValue,
    getGroupedBets,
  };
};