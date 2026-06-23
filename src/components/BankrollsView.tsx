import React from 'react';
import { Plus, Settings, Trash2, X, Clock } from 'lucide-react';
import { useBankrollContext } from '../context/BankrollContext';
import { useBets } from '../hooks/useBets';
import { cn, removeUrls } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DeleteConfirmationBar } from './DeleteConfirmationBar';
import { BankrollSidebar } from './BankrollSidebar';

export const BankrollsView = () => {
  const { 
    bankrolls, 
    loadingBankrolls: loading, 
    sqlError, 
    refreshBankrolls, 
    addBankroll, 
    updateBankroll, 
    deleteBankroll, 
    isSavingBankroll: isSaving,
    setActiveBankrollId, 
    setCurrentView,
    editingBankrollId,
    setEditingBankrollId
  } = useBankrollContext();
  
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [bankrollToDelete, setBankrollToDelete] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    initial_value: '',
    auto_bet: false,
    auto_bet_value_enabled: false,
    auto_bet_odd_enabled: false,
    auto_bet_unit: undefined,
    auto_bet_house_enabled: false,
    auto_bet_sport_enabled: false,
    is_public: false
  });

  const { allBets, refreshBets, deleteOrphanedBets } = useBets();
  const orphanedBetsCount = React.useMemo(() => allBets.filter(b => !b.bankroll_id).length, [allBets]);

  // Effect to handle editing triggered from outside (e.g. Dashboard)
  React.useEffect(() => {
    if (editingBankrollId && bankrolls.length > 0) {
      const bankroll = bankrolls.find(b => b.id === editingBankrollId);
      if (bankroll) {
        // Simulating the startEdit logic
        setFormData({
          name: bankroll.name,
          initial_value: bankroll.initial_value.toString(),
          auto_bet: bankroll.auto_bet,
          auto_bet_value_enabled: bankroll.auto_bet_value_enabled,
          auto_bet_odd_enabled: bankroll.auto_bet_odd_enabled,
          auto_bet_unit: bankroll.auto_bet_unit,
          auto_bet_house_enabled: bankroll.auto_bet_house_enabled,
          auto_bet_sport_enabled: bankroll.auto_bet_sport_enabled,
          is_public: bankroll.is_public || false
        });
        setEditingId(bankroll.id);
        setIsAdding(true);
        // Clear it so it doesn't trigger again on every render
        setEditingBankrollId(null);
      }
    }
  }, [editingBankrollId, bankrolls]);

  const calculateLucro = (bet: any) => {
    switch (bet.status) {
      case 'won': return (bet.odd * bet.stake) - bet.stake;
      case 'half_won': return ((bet.odd * bet.stake) - bet.stake) / 2;
      case 'lost': return -bet.stake;
      case 'half_lost': return -bet.stake / 2;
      case 'refunded': return 0;
      case 'cashout': return (bet.return_value || 0) - bet.stake; 
      case 'canceled': return 0;
      default: return 0;
    }
  };
  
  const getBankrollStats = (bankrollId: string, initialValue: number) => {
    const bankrollBets = allBets.filter(b => b.bankroll_id === bankrollId);
    const completedBets = bankrollBets.filter(b => b.status !== 'pending');
    const pendingCount = bankrollBets.filter(b => b.status === 'pending').length;
    
    const investment = completedBets.reduce((acc, b) => acc + b.stake, 0);
    const profit = completedBets.reduce((acc, b) => acc + calculateLucro(b), 0);

    const roi = investment > 0 ? (profit / investment) * 100 : 0;
    const progress = initialValue > 0 ? (profit / initialValue) * 100 : 0;

    return { roi, progress, pendingCount };
  };

  const handleSelectBankroll = (id: string) => {
    setActiveBankrollId(id);
    setCurrentView('dashboard');
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    const initialValue = parseFloat(formData.initial_value);

    if (!name) {
      alert('Por favor, dê um nome para a banca.');
      return;
    }
    
    if (isNaN(initialValue)) {
      alert('Por favor, insira um valor inicial válido.');
      return;
    }

    if (isSaving) return;
    
    let successRecord = null;
    const updatePayload = {
      name: name,
      initial_value: initialValue,
      auto_bet: !!formData.auto_bet,
      auto_bet_value_enabled: !!formData.auto_bet_value_enabled,
      auto_bet_odd_enabled: !!formData.auto_bet_odd_enabled,
      auto_bet_unit: formData.auto_bet_unit,
      auto_bet_house_enabled: !!formData.auto_bet_house_enabled,
      auto_bet_sport_enabled: !!formData.auto_bet_sport_enabled,
      is_public: !!formData.is_public
    };

    if (editingId) {
      successRecord = await updateBankroll(editingId, updatePayload);
      if (successRecord) {
        setEditingId(null);
        setIsAdding(false);
      }
    } else {
      successRecord = await addBankroll(updatePayload);
      if (successRecord) {
        console.log('Banca adicionada com sucesso no View:', successRecord.id);
        setIsAdding(false);
      }
    }
    
    if (successRecord) {
      if (!editingId) {
        // Se for uma nova banca, seleciona ela e vai para o dashboard
        setActiveBankrollId(successRecord.id);
        setCurrentView('dashboard');
      }

      setFormData({
        name: '',
        initial_value: '',
        auto_bet: false,
        auto_bet_value_enabled: false,
        auto_bet_odd_enabled: false,
        auto_bet_unit: 'percent' as any,
        auto_bet_house_enabled: false,
        auto_bet_sport_enabled: false,
        is_public: false
      });
      setIsAdding(false);
    }
  };

  const startEdit = (e: React.MouseEvent, b: any) => {
    e.stopPropagation();
    setFormData({
      name: b.name,
      initial_value: b.initial_value.toString(),
      auto_bet: b.auto_bet,
      auto_bet_value_enabled: b.auto_bet_value_enabled,
      auto_bet_odd_enabled: b.auto_bet_odd_enabled,
      auto_bet_unit: b.auto_bet_unit,
      auto_bet_house_enabled: b.auto_bet_house_enabled,
      auto_bet_sport_enabled: b.auto_bet_sport_enabled,
      is_public: b.is_public || false
    });
    setEditingId(b.id);
    setIsAdding(true);
  };

  if (loading && bankrolls.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dashboard">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-400 font-bold animate-pulse">Carregando bancas...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-dashboard custom-scrollbar p-4 md:p-8">
      <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">Minhas Bancas</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Sincronizar removido a pedido do usuário */}
        </div>
      </header>

      {orphanedBetsCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-amber-400 font-bold text-sm">Apostas Detectadas sem Banca ({orphanedBetsCount})</p>
              <p className="text-gray-400 text-xs">Existem apostas que foram criadas sem estarem vinculadas a uma banca.</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              if (window.confirm(`Deseja realmente deletar as ${orphanedBetsCount} apostas fantasma?`)) {
                const success = await deleteOrphanedBets();
                if (success) alert('Apostas deletadas com sucesso!');
              }
            }}
            className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs transition-all uppercase tracking-wider"
          >
            Limpar Apostas Fantasma
          </button>
        </motion.div>
      )}

      {sqlError && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
              <Settings className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-red-400 font-bold mb-2">Ação Requerida no Banco de Dados</h2>
              <p className="text-gray-300 text-sm mb-4">
                Parece que a tabela de bancas ainda não foi configurada. Execute este script no SQL Editor do Supabase:
              </p>
              <pre className="bg-black/60 p-4 rounded-xl text-xs text-gray-400 overflow-x-auto select-all border border-white/5 mb-4">
{`-- 1. CRIAR OU ATUALIZAR TABELA DE BANCAS
CREATE TABLE IF NOT EXISTS bankrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  initial_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  auto_bet BOOLEAN DEFAULT false,
  auto_bet_value_enabled BOOLEAN DEFAULT false,
  auto_bet_odd_enabled BOOLEAN DEFAULT false,
  auto_bet_unit TEXT,
  auto_bet_house_enabled BOOLEAN DEFAULT false,
  auto_bet_sport_enabled BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SE A TABELA JÁ EXITIA, RODE ISTO PARA ADICIONAR AS NOVAS COLUNAS:
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS auto_bet BOOLEAN DEFAULT false;
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS auto_bet_value_enabled BOOLEAN DEFAULT false;
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS auto_bet_odd_enabled BOOLEAN DEFAULT false;
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS auto_bet_unit TEXT;
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS auto_bet_house_enabled BOOLEAN DEFAULT false;
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS auto_bet_sport_enabled BOOLEAN DEFAULT false;
ALTER TABLE bankrolls ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. CRIAR OU ATUALIZAR TABELA DE MAPEAMENTOS (DICIONÁRIO)
CREATE TABLE IF NOT EXISTS sport_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    sport TEXT NOT NULL,
    type TEXT DEFAULT 'sport' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SE A TABELA JÁ EXISTIA, ADICIONE A COLUNA TYPE:
ALTER TABLE sport_mappings ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sport' NOT NULL;

-- 3. CRIAR OU ATUALIZAR TABELA DE APOSTAS
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bankroll_id UUID REFERENCES bankrolls(id) ON DELETE CASCADE NOT NULL,
  event TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT,
  odd DECIMAL(10,3) NOT NULL,
  stake DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('won', 'lost', 'pending', 'half_won', 'half_lost', 'refunded', 'cashout', 'canceled')) DEFAULT 'pending',
  type TEXT,
  sport TEXT,
  bookmaker TEXT,
  comment TEXT,
  profit DECIMAL(12,2) NOT NULL DEFAULT 0,
  return_value DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEGURANÇA (RLS)
ALTER TABLE bankrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_mappings ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACESSO
DROP POLICY IF EXISTS "Users can manage their own bankrolls" ON bankrolls;
CREATE POLICY "Users can manage their own bankrolls" ON bankrolls FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir leitura publica - bankrolls" ON bankrolls;
CREATE POLICY "Permitir leitura publica - bankrolls" ON bankrolls FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can manage their own bets" ON bets;
CREATE POLICY "Users can manage their own bets" ON bets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir leitura publica - bets" ON bets;
CREATE POLICY "Permitir leitura publica - bets" ON bets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bankrolls 
    WHERE bankrolls.id = bets.bankroll_id 
    AND bankrolls.is_public = true
  )
);

DROP POLICY IF EXISTS "Users can manage their own mappings" ON sport_mappings;
CREATE POLICY "Users can manage their own mappings" ON sport_mappings FOR ALL USING (auth.uid() = user_id);`}
              </pre>
              <p className="text-gray-500 text-xs uppercase tracking-tight">Após rodar o SQL, clique em "Sincronizar" acima.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BankrollSidebar
          isOpen={isAdding}
          isEditMode={!!editingId}
          onClose={() => { setIsAdding(false); setEditingId(null); }}
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          formData={formData}
          setFormData={setFormData}
          isSaving={isSaving}
        />

        {bankrolls.map((b) => {
          const stats = getBankrollStats(b.id, b.initial_value);
          
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.01 }}
              onClick={() => handleSelectBankroll(b.id)}
              className="bg-[#0b101b] border border-white/5 rounded-2xl flex flex-col relative group transition-all hover:border-primary/20 shadow-2xl overflow-hidden cursor-pointer"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-primary transition-colors">
                    {removeUrls(b.name)}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => startEdit(e, b)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setConfirmDelete(false);
                        setBankrollToDelete(b.id); 
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#151c2c] rounded-lg p-5 flex flex-col items-center justify-center border border-white/[0.02]">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">ROI</span>
                    <span className={cn(
                      "text-xl font-bold tracking-tight",
                      stats.roi >= 0 ? "text-[#4ade80]" : "text-red-400"
                    )}>
                      {stats.roi.toFixed(2)}%
                    </span>
                  </div>
                  <div className="bg-[#151c2c] rounded-lg p-5 flex flex-col items-center justify-center border border-white/[0.02]">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">PROGRESSÃO</span>
                    <span className={cn(
                      "text-xl font-bold tracking-tight",
                      stats.progress >= 0 ? "text-[#4ade80]" : "text-red-400"
                    )}>
                      {stats.progress.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {stats.pendingCount > 0 && (
                <div className="bg-[#1e293b]/30 py-3.5 px-6 flex items-center justify-center gap-2 border-t border-white/5">
                  <Clock className="w-3.5 h-3.5 text-blue-400 opacity-60" />
                  <span className="text-[11px] font-medium text-blue-300/80 tracking-tight">
                    {stats.pendingCount} {stats.pendingCount === 1 ? 'aposta em pendente' : 'apostas em pendente'}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}

        {!isAdding && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => setIsAdding(true)}
            className="border border-dashed border-white/10 hover:border-primary/40 bg-transparent hover:bg-primary/[0.02] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all group min-h-[220px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all">
              <Plus className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
            </div>
            <span className="text-gray-400 font-medium group-hover:text-primary transition-colors text-sm tracking-tight">Adicionar bankroll</span>
          </motion.button>
        )}
      </div>

      <DeleteConfirmationBar
        isVisible={!!bankrollToDelete}
        itemType="bankroll"
        selectedCount={1}
        confirmDeletion={confirmDelete}
        onConfirmChange={setConfirmDelete}
        onCancel={() => {
          setBankrollToDelete(null);
          setConfirmDelete(false);
        }}
        onDelete={() => {
          if (bankrollToDelete) {
            deleteBankroll(bankrollToDelete);
            setBankrollToDelete(null);
            setConfirmDelete(false);
          }
        }}
      />
    </main>
  );
};
