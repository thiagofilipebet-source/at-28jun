/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BankrollProvider, useBankrollContext } from './context/BankrollContext';
import { SportMappingsProvider } from './context/SportMappingsContext';
import { BankrollsView } from './components/BankrollsView';
import { AnalysisView } from './components/AnalysisView';
import { WalletView } from './components/WalletView';
import { MobileNav } from './components/MobileNav';
import { MoreView } from './components/MoreView';
import { SettingsSidebar } from './components/SettingsSidebar';
import { BetsProvider } from './context/BetsContext';
import { Auth } from './components/Auth';
import { SharedBankrollView } from './components/SharedBankrollView';
import { AdminView } from './components/AdminView';
import { UpdateBanner } from './components/UpdateBanner';
import { DiscontinuationBanner } from './components/DiscontinuationBanner';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { LoadingScreen } from './components/LoadingScreen';
import { AnimatePresence, motion } from 'motion/react';
import { RefreshCcw, X } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

class ErrorBoundary extends (React.Component as any) {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dashboard flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
            <RefreshCcw className="w-8 h-8 text-red-500 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">OPS! ALGO DEU ERRADO</h1>
          <p className="text-gray-400 max-w-md mb-8">
            O aplicativo encontrou um erro inesperado. Por favor, recarregue a página para continuar.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
          >
            Recarregar Agora
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { 
    currentView, 
    setCurrentView,
    activeBankrollId,
    isSettingsOpen, 
    setIsSettingsOpen,
    loadingBankrolls,
    filters,
    setFilters
  } = useBankrollContext();

  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Redirect to login if user is not authenticated and tries to access internal routes
  useEffect(() => {
    const isPublicPath = location.pathname.startsWith('/share/') || location.pathname === '/login';
    if (!session && !isPublicPath && !loadingAuth) {
      navigate('/', { replace: true });
    }
  }, [session, location.pathname, loadingAuth]);

  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        const { data: { session: s }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.warn('Initial session check warn:', error.message);
          }
          
          setSession(s);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
        } else {
          setSession(session);
        }
        setLoadingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle all routing and URL synchronization in a single effect
  useEffect(() => {
    if (loadingAuth || !session || location.pathname.startsWith('/share/')) return;

    const rawPath = location.pathname.substring(1);
    const pathFromUrl = rawPath || 'dashboard';
    const allowedViews = ['dashboard', 'bankrolls', 'stats', 'analysis', 'wallet', 'admin', 'more'];

    // 1. Validate the current URL path
    if (allowedViews.includes(pathFromUrl)) {
      // Rule: Can't stay on dashboard without an active bankroll
      if (pathFromUrl === 'dashboard' && !activeBankrollId && !loadingBankrolls) {
        if (currentView !== 'bankrolls') setCurrentView('bankrolls');
        if (location.pathname !== '/bankrolls') navigate('/bankrolls', { replace: true });
        return;
      }

      // Sync URL -> State
      if (pathFromUrl !== currentView) {
        setCurrentView(pathFromUrl as any);
      }

      // Ensure root URL '/' is redirected to the canonical path (/dashboard or /bankrolls)
      if (rawPath === '') {
        const target = (activeBankrollId && !loadingBankrolls) ? '/dashboard' : '/bankrolls';
        navigate(target, { replace: true });
      }
    } else if (rawPath !== '' && !location.pathname.startsWith('/share/')) {
      // Invalid path, go to dashboard or bankrolls
      const target = activeBankrollId ? '/dashboard' : '/bankrolls';
      navigate(target, { replace: true });
    }
  }, [location.pathname, activeBankrollId, loadingBankrolls, session, loadingAuth]);

  // Sync State -> URL (only when currentView changes)
  useEffect(() => {
    if (!currentView || loadingAuth || !session || location.pathname.startsWith('/share/')) return;
    
    // Only navigate if the URL doesn't match the state
    const currentPath = location.pathname.substring(1);
    if (currentView !== currentPath && (currentView !== 'dashboard' || currentPath !== '')) {
      navigate(`/${currentView}`);
    }
  }, [currentView, session, loadingAuth]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const clearFilters = () => {
    setFilters({
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
  };

  // Show loading screen if we are still fetching session OR bankrolls (if session exists)
  const isActuallyLoading = loadingAuth || (session && loadingBankrolls);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
      case 'stats':
        return <Dashboard />;
      case 'analysis':
        return <AnalysisView />;
      case 'bankrolls':
        return <BankrollsView />;
      case 'wallet':
        return <WalletView />;
      case 'more':
        return <MoreView />;
      case 'admin':
        return <AdminView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <DiscontinuationBanner />
      <UpdateBanner />
      <AnimatePresence mode="wait">
        {isActuallyLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      {!session ? (
        <Auth />
      ) : (
        <div className="flex h-screen w-full overflow-hidden bg-dashboard">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
            {renderView()}
          </div>
          <MobileNav />

          {/* Clear Filters Button */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                onClick={clearFilters}
                className="fixed bottom-24 lg:bottom-8 right-6 z-[80] flex items-center gap-2 px-6 py-3 bg-[#ff768a] text-white rounded-full font-bold shadow-2xl shadow-rose-500/20 hover:bg-[#ff617a] transition-all hover:scale-105 active:scale-95 group"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>Filtros</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Settings Sidebar Overlay */}
          {isSettingsOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] animate-in fade-in duration-300"
              onClick={() => setIsSettingsOpen(false)}
            />
          )}
          <SettingsSidebar 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const shareId = params.get('share');

  if (shareId) {
    return (
      <ErrorBoundary>
        <SharedBankrollView bankrollId={shareId} />
      </ErrorBoundary>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <BankrollProvider>
          <SportMappingsProvider>
            <BetsProvider>
              <AppContent />
            </BetsProvider>
          </SportMappingsProvider>
        </BankrollProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
