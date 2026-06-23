import React, { createContext, useContext, ReactNode } from 'react';
import { useBetsImpl } from '../hooks/useBetsImpl';

export const BetsContext = createContext<ReturnType<typeof useBetsImpl> | undefined>(undefined);

export const BetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const bets = useBetsImpl();
  return <BetsContext.Provider value={bets}>{children}</BetsContext.Provider>;
};

export const useBets = () => {
  const context = useContext(BetsContext);
  if (context === undefined) {
    throw new Error('useBets must be used within a BetsProvider');
  }
  return context;
};
