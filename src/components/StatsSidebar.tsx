import React from 'react';
import { motion } from 'motion/react';
import { X, HelpCircle, TrendingUp, TrendingDown, Target, Wallet, BarChart2, Hash, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBankrollContext } from '../context/BankrollContext';
import { useBets } from '../hooks/useBets';
import { Bet, Bankroll } from '../types';

interface StatsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  externalBets?: Bet[];
  externalBankroll?: Bankroll;
}

export const StatsSidebar: React.FC<StatsSidebarProps> = ({ isOpen, onClose, externalBets, externalBankroll }) => {
  const context = useBankrollContext();
  const betsHook = useBets();
  
  const activeBankroll = externalBankroll || context.bankrolls.find(b => b.id === context.activeBankrollId);
  const bets = externalBets || betsHook.bets;
  const bankrollId = externalBankroll?.id || context.activeBankrollId;

  // Derived Stats
  const stats = React.useMemo(() => {
    if (!activeBankroll) return null;

    const currentBets = bets.filter(b => b.bankroll_id === bankrollId);
    const settledBets = currentBets.filter(b => b.status !== 'pending');
    
    const profits = settledBets.reduce((acc, b) => acc + (b.profit || 0), 0);
    const totalStakeSettled = settledBets.reduce((acc, b) => acc + b.stake, 0);
    const totalStakeAll = currentBets.reduce((acc, b) => acc + b.stake, 0);
    const pendingStake = currentBets.filter(b => b.status === 'pending').reduce((acc, b) => acc + b.stake, 0);
    
    // Capital
    const capitalInicial = activeBankroll.initial_value;
    const capitalAtual = capitalInicial + profits;
    
    // Win Rate
    const wonCount = settledBets.filter(b => b.status === 'won' || b.status === 'half_won').length;
    const lostCount = settledBets.filter(b => b.status === 'lost' || b.status === 'half_lost').length;
    const refundedCount = settledBets.filter(b => b.status === 'refunded' || b.status === 'canceled').length;
    const pendingCount = currentBets.filter(b => b.status === 'pending').length;
    
    const winRate = settledBets.length > 0 ? (wonCount / settledBets.length) * 100 : 0;
    const roi = totalStakeSettled > 0 ? (profits / totalStakeSettled) * 100 : 0;
    const progressao = ((capitalAtual / capitalInicial) - 1) * 100;

    // Streaks
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    // Sorted by date to calculate streaks and drawdown
    const chronBets = [...settledBets].sort((a, b) => a.date.localeCompare(b.date));
    
    let currentBankroll = capitalInicial;
    let maxBankroll = capitalInicial;
    let maxDrawdownValue = 0;

    chronBets.forEach(bet => {
      // Streaks
      if (bet.status === 'won' || bet.status === 'half_won') {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (bet.status === 'lost' || bet.status === 'half_lost') {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      }

      // Drawdown
      currentBankroll += (bet.profit || 0);
      if (currentBankroll > maxBankroll) {
        maxBankroll = currentBankroll;
      }
      const dd = maxBankroll - currentBankroll;
      if (dd > maxDrawdownValue) {
        maxDrawdownValue = dd;
      }
    });

    // Averages
    const avgStake = currentBets.length > 0 ? totalStakeAll / currentBets.length : 0;
    const maxStake = currentBets.length > 0 ? Math.max(...currentBets.map(b => b.stake)) : 0;
    const avgOdd = currentBets.length > 0 ? currentBets.reduce((acc, b) => acc + b.odd, 0) / currentBets.length : 0;
    const maxWinningOdd = wonCount > 0 ? Math.max(...settledBets.filter(b => b.status === 'won').map(b => b.odd)) : 0;
    const maxProfit = settledBets.length > 0 ? Math.max(...settledBets.map(b => b.profit)) : 0;
    const maxLoss = settledBets.length > 0 ? Math.min(...settledBets.map(b => b.profit)) : 0;

    const totalGanho = settledBets.filter(b => b.profit > 0).reduce((acc, b) => acc + b.profit, 0);
    const totalPerdido = settledBets.filter(b => b.profit < 0).reduce((acc, b) => acc + Math.abs(b.profit), 0);
    const mediaGanho = wonCount > 0 ? totalGanho / wonCount : 0;
    const mediaPerda = lostCount > 0 ? totalPerdido / lostCount : 0;
    const avgWinningOdd = wonCount > 0 ? settledBets.filter(b => b.status === 'won').reduce((acc, b) => acc + b.odd, 0) / wonCount : 0;
    const avgLosingOdd = lostCount > 0 ? settledBets.filter(b => b.status === 'lost').reduce((acc, b) => acc + b.odd, 0) / lostCount : 0;

    return {
      apostas: currentBets.length,
      lucros: profits,
      roi,
      progressao,
      sucesso: winRate,
      drawdown: maxDrawdownValue,
      deposito: capitalInicial,
      retirada: capitalAtual,
      totalGanho,
      totalPerdido,
      mediaGanho,
      mediaPerda,
      vencedoras: wonCount,
      perdedoras: lostCount,
      reembolsados: refundedCount,
      emCurso: pendingCount,
      valorEmJogo: totalStakeSettled,
      valorEmCurso: pendingStake,
      serieVitoriasMax: maxWinStreak,
      serieDerrotasMax: -maxLossStreak,
      valorMedio: avgStake,
      valorMaximo: maxStake,
      cotacaoMedia: avgOdd,
      cotacaoMediaVencedora: avgWinningOdd,
      cotacaoMediaPerdedora: avgLosingOdd,
      maiorCotacaoGanhas: maxWinningOdd,
      maiorLucro: maxProfit,
      maiorPerda: maxLoss,
    };
  }, [bets, activeBankroll, bankrollId]);

  if (!isOpen) return null;

  const StatItem = ({ label, value, colorClass = "text-white", isCurrency = false }: { label: string, value: string | number, colorClass?: string, isCurrency?: boolean }) => (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 flex items-center justify-between gap-2 h-[38px]">
      <span className="text-[11px] font-medium text-gray-400 truncate">{label}</span>
      <span className={cn("text-xs font-bold shrink-0", colorClass)}>
        {typeof value === 'number' && !isCurrency ? value : value}
        {isCurrency && <span className="text-[9px] ml-0.5 opacity-80">R$</span>}
      </span>
    </div>
  );

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
        className="relative w-full max-w-sm md:max-w-md bg-[#050914] h-full flex flex-col shadow-2xl border-l border-white/5"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-white tracking-tight">Estatísticas</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!stats ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400">
            Selecione uma banca para ver as estatísticas.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar pb-10">
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              <StatItem label="Apostas" value={stats.apostas} colorClass="text-indigo-400" />
              <StatItem label="Lucros" value={stats.lucros.toFixed(2)} colorClass={stats.lucros >= 0 ? "text-[#66dd8b]" : "text-red-400"} isCurrency />
              <StatItem label="ROI" value={`${stats.roi.toFixed(2)}%`} colorClass={stats.roi >= 0 ? "text-[#66dd8b]" : "text-red-400"} />
              <StatItem label="Progressão" value={`${stats.progressao.toFixed(2)}%`} colorClass={stats.progressao >= 0 ? "text-[#66dd8b]" : "text-red-400"} />
              <StatItem label="Sucesso %" value={`${stats.sucesso.toFixed(2)}%`} colorClass="text-teal-400" />
              <StatItem label="Drawdown" value={stats.drawdown.toFixed(2)} colorClass="text-red-400" isCurrency />
              
              <StatItem label="Depósito" value={stats.deposito.toFixed(2)} colorClass="text-white" isCurrency />
              <StatItem label="Retirada" value={stats.retirada.toFixed(2)} colorClass="text-white" isCurrency />
              
              <StatItem label="Apostas vencedoras" value={stats.vencedoras} colorClass="text-[#66dd8b]" />
              <StatItem label="Apostas perdedoras" value={stats.perdedoras} colorClass="text-red-400" />
              <StatItem label="Apostas reembolsados" value={stats.reembolsados} colorClass="text-indigo-400" />
              <StatItem label="Apostas em curso" value={stats.emCurso} colorClass="text-white" />
              
              <StatItem label="Valor em jogo" value={stats.valorEmJogo.toFixed(2)} colorClass="text-white" isCurrency />
              <StatItem label="Valor em curso" value={stats.valorEmCurso.toFixed(2)} colorClass="text-white" isCurrency />
              
              <StatItem label="Série vitórias max" value={stats.serieVitoriasMax} colorClass="text-[#66dd8b]" />
              <StatItem label="Série derrotas max" value={stats.serieDerrotasMax} colorClass="text-red-400" />
              
              <StatItem label="Valor médio aposta" value={stats.valorMedio.toFixed(2)} colorClass="text-white" isCurrency />
              <StatItem label="Valor máximo aposta" value={stats.valorMaximo.toFixed(2)} colorClass="text-white" isCurrency />
              
              <StatItem label="Total Ganho" value={stats.totalGanho.toFixed(2)} colorClass="text-[#66dd8b]" isCurrency />
              <StatItem label="Total Perdido" value={stats.totalPerdido.toFixed(2)} colorClass="text-red-400" isCurrency />
              
              <StatItem label="Média Ganho" value={stats.mediaGanho.toFixed(2)} colorClass="text-[#66dd8b]" isCurrency />
              <StatItem label="Média Perda" value={stats.mediaPerda.toFixed(2)} colorClass="text-red-400" isCurrency />
              
              <StatItem label="Cotação média" value={stats.cotacaoMedia.toFixed(3)} colorClass="text-white" />
              <StatItem label="Maior cotação ganha" value={stats.maiorCotacaoGanhas.toFixed(3)} colorClass="text-white" />
              
              <StatItem label="Média odd ganha" value={stats.cotacaoMediaVencedora.toFixed(3)} colorClass="text-[#66dd8b]" />
              <StatItem label="Média odd perda" value={stats.cotacaoMediaPerdedora.toFixed(3)} colorClass="text-red-400" />
              
              <StatItem label="Maior lucro" value={stats.maiorLucro.toFixed(2)} colorClass="text-[#66dd8b]" isCurrency />
              <StatItem label="Maior perda" value={Math.abs(stats.maiorPerda).toFixed(2)} colorClass="text-red-400" isCurrency />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
