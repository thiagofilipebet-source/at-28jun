import Dexie, { Table } from 'dexie';
import { Bet, Bankroll } from '../types';

export class AppDatabase extends Dexie {
  bets!: Table<Bet>;
  bankrolls!: Table<Bankroll>;

  constructor() {
    super('BettingAppDatabase');
    this.version(2).stores({
      bets: 'id, bankroll_id, user_id, date, status, withdrawn',
      bankrolls: 'id, user_id'
    });
  }
}

export const db = new AppDatabase();
