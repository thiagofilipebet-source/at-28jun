export type BetStatus = 'won' | 'lost' | 'pending' | 'half_won' | 'half_lost' | 'refunded' | 'cashout' | 'canceled';

export interface Bankroll {
  id: string;
  user_id?: string;
  name: string;
  initial_value: number;
  created_at?: string;
  auto_bet?: boolean;
  auto_bet_value_enabled?: boolean;
  auto_bet_odd_enabled?: boolean;
  auto_bet_unit?: string;
  auto_bet_house_enabled?: boolean;
  auto_bet_sport_enabled?: boolean;
  is_public?: boolean;
}

export interface SportMapping {
  id: string;
  user_id: string;
  keyword: string;
  sport: string;
  type: 'sport' | 'house';
  created_at?: string;
}

export interface Bet {
  id: string;
  user_id?: string;
  bankroll_id: string;
  event: string;
  date: string; // YYYY-MM-DD
  time?: string;
  odd: number;
  closing_odd?: number;
  stake: number;
  status: BetStatus;
  profit: number; 
  return_value?: number;
  sport?: string;
  bookmaker?: string;
  comment?: string;
  type?: string;
  withdrawn?: boolean;
  has_deposited?: boolean;
  created_at?: string;
}

export interface DisplaySettings {
  showHora: boolean;
  showFormato: boolean;
  showCasa: boolean;
  showGanho: boolean;
  showCotacao: boolean;
  showValor: boolean;
  autoOddAutomation: boolean;
}
