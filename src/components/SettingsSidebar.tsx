import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle2, X, ShieldAlert, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { BankrollContext } from '../context/BankrollContext';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const { hideAdminButton, setHideAdminButton, theme, setTheme } = useContext(BankrollContext)!;
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isOpen) {
      const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          setCurrentUserEmail(user.email || '');
          setForm(prev => ({
            ...prev,
            fullName: user.user_metadata?.full_name || '',
            email: user.email || ''
          }));
        }
      };
      getUser();
    }
  }, [isOpen]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: form.fullName }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Nome atualizado com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Um link de confirmação foi enviado para o novo e-mail.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 z-[100] w-full max-w-xl bg-[#0b1120] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col h-[100dvh] max-h-[100dvh]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-[#0b1120]">
        <h2 className="text-xl font-normal text-white tracking-tight">
          Configurações
        </h2>
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-normal">{message.text}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Aparência */}
          <section className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <h3 className="font-normal text-white tracking-wider text-sm">Aparência</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-white">Modo Dia</p>
                <p className="text-[10px] text-gray-500">Alternar entre tema claro e escuro</p>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                  theme === 'light' ? "bg-primary" : "bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    theme === 'light' ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </section>

          {/* Minha Conta */}
          <section className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-normal text-white tracking-wider text-sm">Minha Conta</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1 p-2.5 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-primary/5">
                <label className="text-[10px] font-medium text-gray-500 tracking-widest pl-1">Nome</label>
                <input 
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none px-1"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </section>

          {/* Change Email */}
          <section className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-normal text-white tracking-wider text-sm">Alterar E-mail</h3>
            </div>
            
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-1 p-2.5 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-primary/5">
                <label className="text-[10px] font-medium text-gray-500 tracking-widest pl-1">Novo E-mail</label>
                <input 
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none px-1"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Processando...' : 'Atualizar E-mail'}
              </button>
            </form>
          </section>

          {/* Change Password */}
          <section className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="font-normal text-white tracking-wider text-sm">Alterar Senha</h3>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1 p-2.5 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-primary/5">
                <label className="text-[10px] font-medium text-gray-500 tracking-widest pl-1">Nova Senha</label>
                <input 
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="No mínimo 6 caracteres"
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none px-1 placeholder:text-gray-700"
                />
              </div>
              <div className="space-y-1 p-2.5 border border-white/10 rounded-xl bg-white/[0.02] transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-primary/5">
                <label className="text-[10px] font-medium text-gray-500 tracking-widest pl-1">Confirmar Senha</label>
                <input 
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none px-1"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-indigo-500/10 cursor-pointer"
              >
                {loading ? 'Atualizando...' : 'Redefinir Senha'}
              </button>
            </form>
          </section>

          {/* Ocultar botão admin */}
          {['thiagofilipepsi@gmail.com', 'anakellysantos0@gmail.com'].includes(currentUserEmail) && (
            <section className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="font-normal text-white tracking-wider text-sm">Privacidade</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-white">Ocultar botão Admin</p>
                  <p className="text-[10px] text-gray-500">Esconde o botão para tirar prints de tela</p>
                </div>
                <button
                  onClick={() => setHideAdminButton(!hideAdminButton)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                    hideAdminButton ? "bg-primary" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      hideAdminButton ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
