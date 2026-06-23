import { useState, useEffect, useRef, useMemo } from 'react';
import { Bankroll } from '../types';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';

export const useBankrolls = () => {
  const [bankrolls, setBankrolls] = useState<Bankroll[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const initializationPromise = useRef<Promise<void> | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchBankrolls = async (forceRemote: boolean = false) => {
    if (isFetchingRef.current && !forceRemote) return;
    isFetchingRef.current = true;
    
    // Tentativa de retry para erros de lock transientes (comum em múltiplas instâncias)
    let attempts = 0;
    const maxAttempts = 3;

    const performFetch = async (): Promise<boolean> => {
      try {
        if (!isLoadedRef.current) setLoading(true);

        // Verify auth - necessary if remote fetch
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (authError) {
          const isLockError = authError.message.includes('Lock') || authError.message.includes('lock');
          if (isLockError && attempts < maxAttempts) {
             attempts++;
             await new Promise(r => setTimeout(r, 500 * attempts)); // Escalonamento
             return await performFetch();
          }
          // Se não for lock ou excedeu tentativas, apenas para
          setLoading(false);
          isFetchingRef.current = false;
          return false;
        }

        if (!user) {
          setLoading(false);
          isFetchingRef.current = false;
          return true;
        }

        const { data, error } = await supabase
          .from('bankrolls')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) {
          const isRetryable = error.message.includes('Lock') || 
                             error.message.includes('lock') || 
                             error.message.includes('Failed to fetch') ||
                             error.message.includes('steal');

          if (isRetryable && attempts < maxAttempts) {
             attempts++;
             await new Promise(r => setTimeout(r, 600 * attempts));
             return await performFetch();
          }
          console.error('DEBUG: Erro ao buscar bancas:', error);
          if (error.code === '42P01') {
            setSqlError('A tabela bankrolls ainda não foi criada no Supabase ou colunas estão faltando.');
          } else {
            setSqlError(error.message);
          }
        } else {
          setSqlError(null);
          const bankrollsData = data || [];
          setBankrolls(bankrollsData);
          
          // Sync IndexedDB
          await db.bankrolls.clear();
          if (bankrollsData.length > 0) {
            await db.bankrolls.bulkPut(bankrollsData);
          }
          isLoadedRef.current = true;
        }
        return true;
      } catch (error: any) {
        const isRetryable = error.message?.includes('Lock') || 
                           error.message?.includes('lock') || 
                           error.message?.includes('steal');
                           
        if (isRetryable && attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, 400 * attempts));
          return await performFetch();
        }
        console.error('Erro detalhado ao buscar bancas (catch):', error);
        setSqlError(error.message);
        return false;
      }
    };

    await performFetch();
    setLoading(false);
    isFetchingRef.current = false;
  };

  const loadAll = async (user: any) => {
    try {
      // 1. Try Cache if not already loaded in memory
      if (bankrolls.length === 0) {
        const cached = await db.bankrolls.toArray();
        if (cached && cached.length > 0 && user) {
          const userCached = cached.filter(b => b.user_id === user.id);
          setBankrolls(userCached);
          setLoading(false);
          isLoadedRef.current = true;
          return; // Skip remote fetch if we have cached data, Realtime will catch new changes
        }
      }

      // 2. Fetch remote
      await fetchBankrolls(true);
    } catch (error) {
      console.error('Erro geral ao carregar bancas:', error);
      // Fallback to direct remote fetch if cache fails
      await fetchBankrolls(true);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        loadAll(user);
      } else {
        setBankrolls([]);
        db.bankrolls.clear();
        isLoadedRef.current = false;
      }
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  const addBankroll = async (bankroll: Omit<Bankroll, 'id' | 'created_at' | 'user_id'>) => {
    if (!currentUser) {
      alert('Você precisa estar logado para criar uma banca.');
      return null;
    }

    setIsSaving(true);
    try {
      console.log('DEBUG: Iniciando inserção de banca...', bankroll);

      const payload = { 
        name: bankroll.name.trim(),
        initial_value: Number(bankroll.initial_value) || 0,
        auto_bet: !!bankroll.auto_bet,
        auto_bet_value_enabled: !!bankroll.auto_bet_value_enabled,
        auto_bet_odd_enabled: !!bankroll.auto_bet_odd_enabled,
        auto_bet_unit: bankroll.auto_bet_unit || null,
        auto_bet_house_enabled: !!bankroll.auto_bet_house_enabled,
        auto_bet_sport_enabled: !!bankroll.auto_bet_sport_enabled,
        user_id: currentUser.id 
      };

      console.log('DEBUG: Payload preparado:', payload);

      const { data, error } = await supabase
        .from('bankrolls')
        .insert([payload])
        .select();
      
      if (error) {
        console.error('DEBUG: Erro Supabase:', error);
        alert(`Erro ao criar banca: ${error.message}`);
        return null;
      }
      
      if (data && data[0]) {
        console.log('DEBUG: Inserção bem sucedida!', data[0]);
        setBankrolls(prev => [data[0], ...prev]);
        await db.bankrolls.put(data[0]);
        return data[0];
      }
      
      return null;
    } catch (error: any) {
      console.error('DEBUG: Erro Inesperado:', error);
      alert('Ocorreu um erro inesperado: ' + error.message);
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const updateBankroll = async (id: string, updates: Partial<Bankroll>) => {
    try {
      const bankrollToUpdate = bankrolls.find(b => b.id === id);
      if (!bankrollToUpdate) return false;

      // Prepara objeto
      const payload: any = {};
      
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.initial_value !== undefined) payload.initial_value = Number(updates.initial_value);
      if (updates.auto_bet !== undefined) payload.auto_bet = !!updates.auto_bet;
      if (updates.auto_bet_value_enabled !== undefined) payload.auto_bet_value_enabled = !!updates.auto_bet_value_enabled;
      if (updates.auto_bet_odd_enabled !== undefined) payload.auto_bet_odd_enabled = !!updates.auto_bet_odd_enabled;
      if (updates.auto_bet_unit !== undefined) payload.auto_bet_unit = updates.auto_bet_unit;
      if (updates.auto_bet_house_enabled !== undefined) payload.auto_bet_house_enabled = !!updates.auto_bet_house_enabled;
      if (updates.auto_bet_sport_enabled !== undefined) payload.auto_bet_sport_enabled = !!updates.auto_bet_sport_enabled;
      if (updates.is_public !== undefined) payload.is_public = !!updates.is_public;

      const { error } = await supabase
        .from('bankrolls')
        .update(payload)
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar banca:', error);
        alert('Erro ao salvar: ' + error.message);
        return null;
      }
      
      const updatedBankroll = { ...bankrollToUpdate, ...updates } as Bankroll;
      setBankrolls(prev => prev.map(b => b.id === id ? updatedBankroll : b));
      await db.bankrolls.put(updatedBankroll);
      return updatedBankroll;
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar banca:', error);
      alert('Erro inesperado: ' + error.message);
      return false;
    }
  };

  const deleteBankroll = async (id: string) => {
    try {
      // Excluir as apostas associadas a essa banca primeiro (evita erro de constraint)
      await supabase
        .from('bets')
        .delete()
        .eq('bankroll_id', id);

      const { error } = await supabase
        .from('bankrolls')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setBankrolls(prev => prev.filter(b => b.id !== id));
      await db.bankrolls.delete(id);
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar banca:', error);
      alert('Erro: ' + error.message);
      return false;
    }
  };

  return {
    bankrolls,
    loading,
    sqlError,
    isSaving,
    addBankroll,
    updateBankroll,
    deleteBankroll,
    refreshBankrolls: fetchBankrolls
  };
};
