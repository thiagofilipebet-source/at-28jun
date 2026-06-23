import { Bet } from '../types';
import { VARIATION_MAP, normalizeBookmakerName } from '../constants';

export interface Transaction {
  id: string;
  type: 'deposit' | 'stake' | 'return' | 'withdraw';
  amount: number;
  date: string;
  bookmaker: string;
  bet?: Bet;
}

/**
 * Wallet Calculator Service
 * Implements betting logic as described by the user.
 * 
 * Logic:
 * - Pending bet: a new action in the same house is a new deposit if balance is insufficient.
 * - Win: (Stake + Profit) added to wallet.
 * - Lose: Balance doesn't increase.
 * - Withdrawn: If a bet is marked with withdrawn=true, the entire available balance is zeroed after it.
 */
export function calculateWalletBalances(bets: Bet[]) {
  const bookmakerBalances: Record<string, number> = {};
  const bookmakerPending: Record<string, number> = {};
  const history: Transaction[] = [];
  
  let totalDeposits = 0;
  
  // Sort bets chronologically.
  const sortedBets = [...bets].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (da === db) {
      // Secondary sort: ensure pending resolves are calculated correctly
      // But we just have 'date' string in most cases.
      return (a.created_at || '').localeCompare(b.created_at || '');
    }
    return da - db;
  });

  for (const bet of sortedBets) {
    const bm = normalizeBookmakerName(bet.bookmaker, 'UNKNOWN');
    if (!bookmakerBalances[bm]) bookmakerBalances[bm] = 0;
    if (!bookmakerPending[bm]) bookmakerPending[bm] = 0;

    const stake = bet.stake || 0;
    const betDate = bet.date;
    
    // 1. Placing the bet
    if (bet.has_deposited !== false) {
      // The user explicitly deposited for this bet or is auto-deposit (default)
      const depositAmount = stake;
      totalDeposits += depositAmount;
      history.push({
        id: `dep_${bet.id}_${Date.now()}`,
        type: 'deposit',
        amount: depositAmount,
        date: betDate,
        bookmaker: bm,
        bet
      });
      // Logic: deposit is made and immediately used for the stake.
      // Balance remains unchanged (0 used from balance).
    } else {
      // The user intended to use existing balance.
      // If balance is insufficient, we auto-deposit the difference to avoid negative balance.
      const availableBalance = bookmakerBalances[bm] || 0;
      const balanceToUse = Math.min(availableBalance, stake);
      const overdraft = stake - balanceToUse;
      
      bookmakerBalances[bm] -= balanceToUse;
      
      if (overdraft > 0) {
        totalDeposits += overdraft;
        history.push({
          id: `dep_auto_${bet.id}_${Date.now()}`,
          type: 'deposit',
          amount: overdraft,
          date: betDate,
          bookmaker: bm,
          bet
        });
      }
    }

    
    history.push({
      id: `stk_${bet.id}_${Date.now()}`,
      type: 'stake',
      amount: stake,
      date: betDate,
      bookmaker: bm,
      bet
    });
    
    bookmakerPending[bm] += stake;

    // 2. Resolving the bet
    if (bet.status !== 'pending') {
      bookmakerPending[bm] -= stake;
      let returnVal = 0;
      
      if (bet.status === 'won' || bet.status === 'half_won' || bet.status === 'cashout') {
        const profit = bet.profit || 0;
        returnVal = stake + profit;
      } else if (bet.status === 'half_lost') {
        returnVal = stake / 2;
      } else if (bet.status === 'canceled' || bet.status === 'refunded') {
        returnVal = stake;
      }
      
      if (returnVal > 0 || bet.status === 'lost') {
        bookmakerBalances[bm] += returnVal;
        history.push({
          id: `ret_${bet.id}_${Date.now()}`,
          type: 'return',
          amount: returnVal,
          date: betDate,
          bookmaker: bm,
          bet
        });
      }
      
      // 3. Withdraw if marked
      if (bet.withdrawn && bookmakerBalances[bm] > 0) {
        const withdrawAmount = bookmakerBalances[bm];
        history.push({
          id: `wtd_${bet.id}_${Date.now()}`,
          type: 'withdraw',
          amount: withdrawAmount,
          date: betDate,
          bookmaker: bm,
          bet
        });
        bookmakerBalances[bm] = 0;
      }
    }
  }

  const totalBalance = Object.values(bookmakerBalances).reduce((a, b) => a + b, 0);
  const totalPending = Object.values(bookmakerPending).reduce((a, b) => a + b, 0);

  // Reverse history so newest is first
  history.reverse();

  return {
    bookmakerBalances,
    bookmakerPending,
    totalBalance,
    totalPending,
    totalDeposits,
    history
  };
}
