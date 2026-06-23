import React, { useState, useEffect } from 'react';
import { Settings, LogOut, MessageSquare, HelpCircle, Target, ArrowRight, Smartphone, Wallet, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBankrollContext } from '../context/BankrollContext';

export const MoreView = () => {
  const { currentView, setCurrentView, isSettingsOpen, setIsSettingsOpen, hideAdminButton } = useBankrollContext();
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      if (authUser) {
        const savedName = localStorage.getItem(`userName_${authUser.id}`);
        setUser({
          name: savedName || authUser.user_metadata?.full_name || 'Usuário',
          email: authUser.email
        });
      }
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      setUser({ ...user, name: e.target.value });
    }
  };

  const saveName = async () => {
    if (user) {
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      if (authUser) {
        localStorage.setItem(`userName_${authUser.id}`, user.name);
      }
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-dashboard p-6 space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Mais Opções</h1>
      </header>

      <div className="space-y-4">
        {/* User Card */}
        <div className="flex items-center justify-between p-4 bg-[#0a101f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-4 w-full overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden text-primary font-bold shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <input 
                type="text" 
                value={user?.name || ''} 
                onChange={handleNameChange}
                onBlur={saveName}
                placeholder="Seu Nome"
                className="font-bold text-white bg-transparent outline-none border-b border-transparent focus:border-white/20 truncate w-full"
              />
            </div>
          </div>
        </div>

        {/* Action List */}
        <div className="bg-[#0b1120] border border-white/5 rounded-2xl overflow-hidden">
          {['thiagofilipepsi@gmail.com', 'anakellysantos0@gmail.com'].includes(user?.email || '') && !hideAdminButton && (
            <button 
              onClick={() => setCurrentView('admin')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left bg-primary/5"
            >
              <div className="flex items-center gap-4 text-primary font-bold">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <span>Painel Admin</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          <button 
            onClick={() => setCurrentView('wallet')}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
          >
            <div className="flex items-center gap-4 text-gray-300">
              <Wallet className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Carteira</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
          >
            <div className="flex items-center gap-4 text-gray-300">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Configurações</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-500/10 transition-colors text-left"
          >
            <div className="flex items-center gap-4 text-red-400">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair da Conta</span>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
};
