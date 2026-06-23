import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bankroll } from '../types';
import { ShieldAlert, RefreshCcw, Eye } from 'lucide-react';
import { SharedBankrollView } from './SharedBankrollView';

export const AdminView = () => {
  const [bankrolls, setBankrolls] = useState<Bankroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBankrollId, setSelectedBankrollId] = useState<string | null>(null);

  const fetchBankrolls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bankrolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching ALL bankrolls:', error);
      } else {
        setBankrolls(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching bankrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankrolls();
  }, []);

  if (selectedBankrollId) {
    return (
      <div className="flex-1 flex flex-col h-screen relative bg-dashboard">
        <div className="absolute top-4 left-4 z-[100]">
           <button 
             onClick={() => setSelectedBankrollId(null)}
             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg border border-red-500/50"
           >
             ← Voltar ao Painel Admin
           </button>
        </div>
        <SharedBankrollView bankrollId={selectedBankrollId} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-dashboard h-[100dvh] lg:h-screen w-full relative">
      <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0b1120] z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-normal text-white md:tracking-wider tracking-tight uppercase truncate">
            Painel Administrativo
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              const confirm = window.confirm("Isso exibirá um aviso de atualização para todos os usuários online. Continuar?");
              if (!confirm) return;
              
              const { error, count, data } = await supabase
                .from('app_settings')
                .update({ latest_version: Date.now().toString() })
                .neq('id', '00000000-0000-0000-0000-000000000000')
                .select();
                
              if (error) {
                alert("Erro ao notificar atualização: " + error.message);
              } else if (data && data.length === 0) {
                alert("Nenhuma linha foi atualizada. A tabela app_settings pode estar vazia ou a política RLS bloqueou a ação.");
              } else {
                alert("Sinal de atualização enviado com sucesso!");
              }
            }}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-bold transition-all"
          >
            Forçar Atualização de Clientes
          </button>
          <button 
            onClick={fetchBankrolls}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="bg-[#0b1120] border border-white/5 rounded-2xl p-6">
           <h2 className="text-lg font-bold text-white mb-4">Todas as Bancas do Sistema</h2>
           
           {loading ? (
             <div className="text-center text-gray-500 py-10">
               <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4" />
               Carregando bancas...
             </div>
           ) : bankrolls.length === 0 ? (
             <div className="text-center text-gray-500 py-10">
               Nenhuma banca encontrada no sistema.
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-white/5">
                     <th className="p-3 text-sm font-semibold text-gray-400">Nome</th>
                     <th className="p-3 text-sm font-semibold text-gray-400 hidden sm:table-cell">Usuário</th>
                     <th className="p-3 text-sm font-semibold text-gray-400 hidden md:table-cell">Criada em</th>
                     <th className="p-3 text-sm font-semibold text-gray-400 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   {bankrolls.map((b: any) => (
                     <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                       <td className="p-3 text-white font-medium">{b.name}</td>
                       <td className="p-3 text-gray-400 text-sm hidden sm:table-cell" title={b.user_id}>
                         {b.user_id ? b.user_id.split('-')[0] + '...' : 'N/A'}
                       </td>
                       <td className="p-3 text-gray-500 text-sm hidden md:table-cell">{new Date(b.created_at).toLocaleDateString('pt-BR')}</td>
                       <td className="p-3 text-right">
                         <button 
                           onClick={() => setSelectedBankrollId(b.id)}
                           className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-sm font-bold transition-all"
                         >
                           <Eye className="w-4 h-4" />
                           Ver
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};
