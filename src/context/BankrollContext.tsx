import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bankroll } from '../types';
import { useBankrolls as useSupabaseBankrolls } from '../hooks/useBankrolls';

export type ViewType = 'dashboard' | 'bankrolls' | 'stats' | 'more' | 'analysis' | 'wallet' | 'admin';
export type TimeRange = 'all' | '1d' | '1s' | '1m' | '1a';

interface FilterPreferences {
  dateStart: string;
  dateEnd: string;
  title: string;
  status: string;
  sport: string;
  house: string;
  valMin: string;
  valMax: string;
  oddMin: string;
  oddMax: string;
  betType: string;
}

interface BankrollContextType {
  activeBankrollId: string | null;
  setActiveBankrollId: (id: string | null) => void;
  editingBankrollId: string | null;
  setEditingBankrollId: (id: string | null) => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isAddBetModalOpen: boolean;
  setIsAddBetModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isStatsOpen: boolean;
  setIsStatsOpen: (open: boolean) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (open: boolean) => void;
  hideAdminButton: boolean;
  setHideAdminButton: (hide: boolean) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  filters: FilterPreferences;
  setFilters: (filters: FilterPreferences) => void;
  bankrolls: Bankroll[];
  loadingBankrolls: boolean;
  sqlError: string | null;
  isSavingBankroll: boolean;
  refreshBankrolls: () => void;
  addBankroll: (bankroll: Omit<Bankroll, 'id' | 'created_at' | 'user_id'>) => Promise<Bankroll | null>;
  updateBankroll: (id: string, updates: Partial<Bankroll>) => Promise<Bankroll | null>;
  deleteBankroll: (id: string) => Promise<boolean>;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const BankrollContext = createContext<BankrollContextType | undefined>(undefined);

export const BankrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    bankrolls, 
    loading: loadingBankrolls, 
    sqlError,
    isSaving: isSavingBankroll,
    addBankroll,
    updateBankroll,
    deleteBankroll,
    refreshBankrolls: doRefreshBankrolls 
  } = useSupabaseBankrolls();
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [activeBankrollId, setActiveBankrollId] = useState<string | null>(() => {
    const saved = localStorage.getItem('activeBankrollId');
    return (saved === 'null' || !saved) ? null : saved;
  });

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem('currentView') as ViewType;
    const allowedViews: ViewType[] = ['dashboard', 'bankrolls', 'stats', 'more', 'analysis', 'wallet', 'admin'];
    if (savedView && allowedViews.includes(savedView)) {
      // Only allow dashboard if we have an active bankroll ID saved
      const savedId = localStorage.getItem('activeBankrollId');
      if (savedView === 'dashboard' && (!savedId || savedId === 'null')) return 'bankrolls';
      return savedView;
    }
    return 'bankrolls';
  });

  // Cross-tab synchronization for localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeBankrollId') {
        const newVal = (e.newValue === 'null' || !e.newValue) ? null : e.newValue;
        if (newVal !== activeBankrollId) {
          setActiveBankrollId(newVal);
        }
      }
      if (e.key === 'currentView') {
        const newVal = e.newValue as ViewType;
        if (newVal && newVal !== currentView) {
          setCurrentView(newVal);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeBankrollId, currentView]);

  const [editingBankrollId, setEditingBankrollId] = useState<string | null>(null);

  const [isAddBetModalOpen, setIsAddBetModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [hideAdminButton, setHideAdminButton] = useState(() => {
    return localStorage.getItem('hideAdminButton') === 'true';
  });
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [filters, setFilters] = useState<FilterPreferences>({
    dateStart: '',
    dateEnd: '',
    title: '',
    status: '',
    sport: '',
    house: '',
    valMin: '',
    valMax: '',
    oddMin: '',
    oddMax: '',
    betType: ''
  });

  useEffect(() => {
    localStorage.setItem('hideAdminButton', hideAdminButton.toString());
  }, [hideAdminButton]);

  // Redirection and Auto-selection logic
  useEffect(() => {
    if (loadingBankrolls) return;

    if (bankrolls.length === 0) {
      // Force bankrolls view if no bankrolls exist
      setCurrentView('bankrolls');
      setActiveBankrollId(null);
    } else {
      // If we have bankrolls but none is active, pick the most recent one
      if (!activeBankrollId || !bankrolls.find(b => b.id === activeBankrollId)) {
        const sorted = [...bankrolls].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        if (sorted[0]) {
          setActiveBankrollId(sorted[0].id);
        }
      }
    }
  }, [bankrolls, loadingBankrolls, activeBankrollId]);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (activeBankrollId) {
      localStorage.setItem('activeBankrollId', activeBankrollId);
    } else {
      localStorage.setItem('activeBankrollId', 'null');
      // If no active bankroll, we shouldn't be in dashboard
      if (currentView === 'dashboard') setCurrentView('bankrolls');
    }
  }, [activeBankrollId]);

  return (
    <BankrollContext.Provider value={{ 
      activeBankrollId, 
      setActiveBankrollId, 
      editingBankrollId,
      setEditingBankrollId,
      currentView, 
      setCurrentView,
      isAddBetModalOpen,
      setIsAddBetModalOpen,
      isSettingsOpen,
      setIsSettingsOpen,
      isStatsOpen,
      setIsStatsOpen,
      isCalendarOpen,
      setIsCalendarOpen,
      isFiltersOpen,
      setIsFiltersOpen,
      hideAdminButton,
      setHideAdminButton,
      timeRange,
      setTimeRange,
      filters,
      setFilters,
      bankrolls,
      loadingBankrolls,
      sqlError,
      isSavingBankroll,
      refreshBankrolls: doRefreshBankrolls,
      addBankroll,
      updateBankroll,
      deleteBankroll,
      theme,
      setTheme
    }}>
      {children}
    </BankrollContext.Provider>
  );
};

export const useBankrollContext = () => {
  const context = useContext(BankrollContext);
  if (!context) {
    throw new Error('useBankrollContext must be used within a BankrollProvider');
  }
  return context;
};
