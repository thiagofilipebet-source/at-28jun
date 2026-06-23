import React, { useState } from 'react';
import { Wallet, CheckCircle2, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Clock, LogOut, Trash2 } from 'lucide-react';
import { useBets } from '../hooks/useBets';
import { useBankrollContext } from '../context/BankrollContext';
import { cn } from '../lib/utils';
import { Bet } from '../types';
import { BOOKMAKER_LOGOS, VARIATION_MAP, normalizeBookmakerName } from '../constants';
import { calculateWalletBalances, Transaction } from '../services/WalletCalculator';

export const WalletView = () => {
  const { allBets, bulkUpdateBetWithdrawn, updateBet, deleteBets } = useBets();
  const { activeBankrollId } = useBankrollContext();
  
  const [historyLimit, setHistoryLimit] = useState(15);
  const [isConfirmingWithdraw, setIsConfirmingWithdraw] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  const relevantBets = React.useMemo(() => {
    if (!allBets) return [];
    if (!activeBankrollId) return allBets;
    return allBets.filter(b => b.bankroll_id === activeBankrollId);
  }, [allBets, activeBankrollId]);

  const {
    bookmakerBalances,
    bookmakerPending,
    totalBalance,
    totalPending,
    totalDeposits,
    history
  } = React.useMemo(() => calculateWalletBalances(relevantBets), [relevantBets]);

  const availableBookmakers = React.useMemo(() => {
    return Object.keys(bookmakerBalances).sort();
  }, [bookmakerBalances]);

  // Daily wallet changes (today)
  const dailyMetrics = React.useMemo(() => {
    // Obter data de hoje no fuso horário local usando formato YYYY-MM-DD
    const today = new Date().toLocaleDateString('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    const todayBets = relevantBets.filter(b => b.date === today);
    return calculateWalletBalances(todayBets);
  }, [relevantBets]);

  const visibleBookmakers = React.useMemo(() => {
    return availableBookmakers.filter(bm => {
      const balance = bookmakerBalances[bm] || 0;
      const pending = bookmakerPending[bm] || 0;
      return balance > 0 || pending > 0;
    });
  }, [availableBookmakers, bookmakerBalances, bookmakerPending]);

  const handleWithdrawAll = async (bookmaker?: string) => {
    // Find all resolved non-withdrawn bets
    const betsToWithdraw = relevantBets.filter(b => {
      const canonicalBm = normalizeBookmakerName(b.bookmaker, 'UNKNOWN');
      const isTargetBookmaker = !bookmaker || canonicalBm === bookmaker;
      return isTargetBookmaker && b.status !== 'pending' && !b.withdrawn;
    });
    
    if (betsToWithdraw.length > 0) {
      const ids = betsToWithdraw.map(b => b.id);
      await bulkUpdateBetWithdrawn(ids, true);
    }
    setIsConfirmingWithdraw(null);
  };

  const handleDeleteTransaction = (t: Transaction) => {
    setTransactionToDelete(t);
  };

  const confirmDeleteTransaction = () => {
    if (!transactionToDelete || !transactionToDelete.bet) return;
    const { bet, type } = transactionToDelete;

    if (type === 'deposit') {
      updateBet({ ...bet, has_deposited: false });
    } else if (type === 'withdraw') {
      updateBet({ ...bet, withdrawn: false });
    } else if (type === 'stake' || type === 'return') {
      deleteBets([bet.id]);
    }
    setTransactionToDelete(null);
  };

  const displayedHistory = history.slice(0, historyLimit);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-4 h-4 text-[#ff768a]" />;
      case 'stake': return <LogOut className="w-4 h-4 text-[#ffae42]" />;
      case 'return': return <ArrowUpRight className="w-4 h-4 text-[#66dd8b]" />;
      case 'withdraw': return <Wallet className="w-4 h-4 text-primary" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Depósito (Falta de Saldo)';
      case 'stake': return 'Entrada (Aposta)';
      case 'return': return 'Retorno (Aposta Resolvida)';
      case 'withdraw': return 'Saque (Retirada)';
      default: return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-[#ff768a]';
      case 'stake': return 'text-[#ffae42]';
      case 'return': return 'text-[#66dd8b]';
      case 'withdraw': return 'text-primary';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-dashboard h-[100dvh] lg:h-screen w-full relative">
      <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0b1120] z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-normal text-white tracking-tight uppercase">
            Carteira
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 pb-24 space-y-6">
        
        {/* Global Wallet */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
             <Wallet className="w-5 h-5 text-primary" />
             Carteira Geral
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0b1120] border border-white/5 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <DollarSign className="w-32 h-32 text-primary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Saldo Disponível (Livre)</p>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  R$ {totalBalance.toFixed(2)}
                </h2>
              </div>
            </div>
            
            <div className="bg-[#0b1120] border border-white/5 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total em Entradas (Pendentes)</p>
                <h2 className="text-3xl font-bold text-[#ffae42] tracking-tight">
                  R$ {totalPending.toFixed(2)}
                </h2>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                <span>Valores em apostas não resolvidas</span>
              </div>
            </div>
            
            <div className="bg-[#0b1120] border border-white/5 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Capital Investido (Aportes)</p>
                <h2 className="text-3xl font-bold text-[#ff768a] tracking-tight">
                  R$ {totalDeposits.toFixed(2)}
                </h2>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                <span>Calculado por aportes necessários</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Wallet */}
        <div className="space-y-2 pt-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
             <Activity className="w-5 h-5 text-[#ffae42]" />
             Carteira Diária (Hoje)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
               <p className="text-gray-400 text-sm font-medium mb-1">Depósitos Hoje</p>
               <h2 className="text-2xl font-bold text-[#ff768a]">
                 R$ {dailyMetrics.totalDeposits.toFixed(2)}
               </h2>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
               <p className="text-gray-400 text-sm font-medium mb-1">Volume Movimentado Hoje (Depósitos + Ganhos)</p>
               <h2 className="text-2xl font-bold text-white">
                 R$ {(dailyMetrics.totalDeposits + dailyMetrics.history.reduce((acc, t) => t.type === 'return' ? acc + t.amount : acc, 0)).toFixed(2)}
               </h2>
            </div>
          </div>
        </div>

        {/* Bookmakers Grid */}
        <div className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Saldo por Casa de Aposta</h3>
            
            {totalBalance > 0 && (
              <button
                onClick={() => setIsConfirmingWithdraw('ALL')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(102,221,139,0.2)]"
              >
                <Wallet className="w-4 h-4" />
                Sacar Todo Saldo Disponível
              </button>
            )}
          </div>
          
          {visibleBookmakers.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
              <p className="text-lg font-medium">Nenhuma banca cadastrada com saldo ou apostas em aberto.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {visibleBookmakers.map(bm => {
                 const mappedName = bm; // it is already normalized
                 const logo = BOOKMAKER_LOGOS[bm.toUpperCase()];
                 const balance = bookmakerBalances[bm] || 0;
                 
                 return (
                   <div key={bm} className="bg-[#0b1120] border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                      <div className="flex items-center justify-between">
                         {logo ? (
                            <div className={cn(
                               "flex items-center justify-center",
                               mappedName.toUpperCase() === "APOSTA GANHA" && "bg-white h-[13px] px-[2px] rounded-[2px] overflow-hidden"
                            )}>
                               <img src={logo} alt={mappedName} className={cn(
                                 "w-auto object-contain rounded-sm", 
                                 mappedName.toUpperCase() === "APOSTA GANHA" ? "h-7 max-w-[95px]" : 
                                 mappedName.toUpperCase() === "LOTTU" ? "h-[32px] max-w-[110px]" : 
                                 "h-5"
                               )} />
                            </div>
                         ) : (
                            <div className="bg-sky-500/[0.04] border border-sky-500/25 px-2.5 py-1 rounded-md text-xs font-black text-sky-300 uppercase tracking-wider">
                              {mappedName}
                            </div>
                         )}
                      </div>
                      <div className="space-y-3">
                        <div>
                           <p className="text-gray-500 text-xs font-bold uppercase mb-1">Disponível</p>
                           <p className="text-xl font-black text-white">R$ {balance.toFixed(2)}</p>
                        </div>
                        <div>
                           <p className="text-gray-500 text-xs font-bold uppercase mb-1">Em Aberto</p>
                           <p className="text-md font-bold text-[#ffae42]">R$ {(bookmakerPending[bm] || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <button
                        disabled={balance <= 0}
                        onClick={() => setIsConfirmingWithdraw(bm)}
                        className="w-full mt-2 bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-400 text-xs font-bold py-2 rounded-xl transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sacar Tudo (Zerar)
                      </button>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
        
        {/* Transaction History */}
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Histórico Simples de Movimentação
          </h3>
          
          {displayedHistory.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
              <p className="text-sm font-medium">Nenhuma movimentação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedHistory.map((t) => (
                <div key={t.id} className="bg-[#0b1120] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                  <div className="flex items-start sm:items-center gap-3">
                     <div className={cn("p-2 rounded-lg bg-white/5", t.type === 'deposit' && "bg-[#ff768a]/10", t.type === 'stake' && "bg-[#ffae42]/10", t.type === 'return' && "bg-[#66dd8b]/10", t.type === 'withdraw' && "bg-primary/10")}>
                       {getTransactionIcon(t.type)}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-white">{getTransactionLabel(t.type)}</span>
                         <span className="text-[10px] uppercase font-black text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                           {t.bookmaker}
                         </span>
                       </div>
                       <p className="text-xs text-gray-400 mt-1">
                         {t.bet?.event || 'Nenhum evento associado'} • {new Date(t.date).toLocaleDateString('pt-BR')}
                       </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn("text-right font-bold text-lg", getTransactionColor(t.type))}>
                      {t.type === 'stake' || t.type === 'withdraw' ? '-' : '+'}R$ {t.amount.toFixed(2)}
                    </div>
                    <button 
                      onClick={() => handleDeleteTransaction(t)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Desfazer/Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {historyLimit < history.length && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setHistoryLimit(p => p + 15)}
                    className="cursor-pointer px-6 py-2 bg-[#0b1120] border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-bold rounded-xl transition-all"
                  >
                    Mostrar Mais Movimentações ({history.length - historyLimit} restantes)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
      </main>

      {/* Confirmation Modal */}
      {isConfirmingWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Sacar e Zerar</h3>
            <p className="text-gray-400 text-sm mb-6">
              {isConfirmingWithdraw === 'ALL' 
                ? "Tem certeza que deseja zerar TODAS as bancas? Isso marcará todas as apostas resolvidas como sacadas, limpando o saldo disponível correspondente a elas."
                : <>Tem certeza que deseja zerar a banca <strong>{isConfirmingWithdraw}</strong>? Isso marcará as apostas resolvidas como sacadas, limpando o saldo disponível correspondente a elas.</>}
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsConfirmingWithdraw(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleWithdrawAll(isConfirmingWithdraw === 'ALL' ? undefined : isConfirmingWithdraw)}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-colors shadow-[0_0_15px_rgba(102,221,139,0.3)]"
              >
                Confirmar Saque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Desfazer Ação</h3>
            <p className="text-gray-400 text-sm mb-6">
              {transactionToDelete.type === 'deposit' 
                ? "Tem certeza que deseja remover este depósito? Ele foi criado automaticamente para cobrir o valor da aposta." 
                : transactionToDelete.type === 'withdraw' 
                ? "Tem certeza que deseja desfazer este saque? O saldo retornará correspondente à aposta associada."
                : "Tem certeza que deseja excluir esta aposta? Essa ação removerá a aposta e todos os seus retornos da carteira permanentemente."}
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteTransaction}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

