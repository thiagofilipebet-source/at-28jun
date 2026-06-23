import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  History,
  Wallet,
  LineChart,
  Calendar,
  Settings,
  MessageSquare,
  HelpCircle,
  LogOut,
  Target,
  Smartphone,
  PieChart,
  ShieldAlert,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useBankrollContext } from '../context/BankrollContext';
import { supabase } from '../lib/supabase';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <div 
    onClick={onClick}
    className={cn(
      "group flex items-center gap-3 w-full font-medium text-sm px-6 py-3.5 transition-colors cursor-pointer",
      active 
        ? "text-primary bg-card/80 border-l-[3px] border-primary" 
        : "text-gray-300 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-gray-400 group-hover:text-gray-300")} />
    <span className="flex-1 font-semibold">{label}</span>
  </div>
);

const SubNavItem = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "group flex items-center gap-3 w-full font-medium text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer",
      active 
        ? "text-primary bg-card" 
        : "text-gray-400 hover:text-white"
    )}
  >
    <div className={cn(
      "w-3 h-3 rounded-full border-2 flex items-center justify-center",
      active ? "border-primary" : "border-gray-500 group-hover:border-gray-400"
    )}>
      {active && <div className="w-1 h-1 bg-primary rounded-full" />}
    </div>
    <span className="flex-1 font-semibold">{label}</span>
  </div>
);

export const Sidebar = () => {
  const { 
    activeBankrollId, 
    currentView, 
    setCurrentView, 
    isSettingsOpen, 
    setIsSettingsOpen,
    isStatsOpen,
    setIsStatsOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    hideAdminButton,
    theme,
    setTheme
  } = useBankrollContext();
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const savedName = localStorage.getItem(`userName_${session.user.id}`);
        setUser({
          name: savedName || session.user.user_metadata?.full_name || 'Usuário',
          email: session.user.email
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleInstallInstructions = () => {
    alert(
      'COMO INSTALAR O BETAMOS:\n\n' +
      'No Android (Chrome):\n1. Clique nos 3 pontos no canto superior.\n2. Selecione "Instalar aplicativo" ou "Adicionar à tela de início".\n\n' +
      'No iOS (Safari):\n1. Clique no ícone de compartilhar (quadrado com seta).\n2. Role para baixo e selecione "Adicionar à Tela de Início".'
    );
  };

  return (
    <>
      <aside className="w-[280px] h-screen bg-sidebar border-r border-white/5 flex flex-col shrink-0 overflow-hidden relative z-10">
        <div className="pt-8 pb-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img src="https://res.cloudinary.com/dfnndawb7/image/upload/v1777493470/betamos_qlx8mw.png" className="w-full h-full object-cover" alt="BETAMOS Logo" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-white leading-none uppercase">BETAMOS</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pb-4">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')}
          />
          <NavItem 
            icon={Wallet} 
            label="Carteira" 
            active={currentView === 'wallet'}
            onClick={() => setCurrentView('wallet')}
          />
          <NavItem 
             icon={Target} 
             label="Minhas Bancas" 
             onClick={() => setCurrentView('bankrolls')}
             active={currentView === 'bankrolls'}
          />
          <NavItem 
             icon={PieChart} 
             label="Análise" 
             onClick={() => setCurrentView('analysis')}
             active={currentView === 'analysis'}
          />
          <NavItem 
             icon={Settings} 
             label="Configurações" 
             onClick={() => setIsSettingsOpen(true)}
             active={isSettingsOpen}
          />

          {['thiagofilipepsi@gmail.com', 'anakellysantos0@gmail.com'].includes(user?.email || '') && !hideAdminButton && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <NavItem 
                 icon={ShieldAlert} 
                 label="Painel Admin" 
                 onClick={() => setCurrentView('admin')}
                 active={currentView === 'admin'}
              />
            </div>
          )}

          <div className="mt-auto px-6 mt-4">
            <div className="flex items-center justify-between p-3 bg-[#0a101f] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden text-primary font-bold text-xs shrink-0">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                  <input 
                    type="text" 
                    value={user?.name || ''} 
                    onChange={handleNameChange}
                    onBlur={saveName}
                    placeholder="Seu Nome"
                    className="font-bold text-sm text-white bg-transparent outline-none border-b border-transparent focus:border-white/20 truncate w-full"
                  />
                </div>
              </div>
              <button 
                onClick={async () => await supabase.auth.signOut()}
                className="p-1 hover:text-white text-gray-500 transition-colors shrink-0"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">Versão 1.9.1</span>
          </div>
        </nav>
      </aside>
    </>
  );
};
