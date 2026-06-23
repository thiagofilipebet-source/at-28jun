import { useState, useEffect } from 'react';
import { SportMapping } from '../types';
import { supabase } from '../lib/supabase';

export const useSportMappings = () => {
  const [mappings, setMappings] = useState<SportMapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('sport_mappings')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Erro ao buscar mapeamentos:', error);
    } else {
      setMappings(data || []);
    }
    setLoading(false);
  };

  const addMapping = async (keyword: string, sport: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('sport_mappings')
      .insert([{ user_id: user.id, keyword: keyword.toLowerCase(), sport }])
      .select();
    
    if (error) {
      console.error('Erro ao adicionar mapeamento:', error);
      alert(`Erro ao salvar mapeamento: ${error.message}. Verifique se a tabela 'sport_mappings' foi criada.`);
      return null;
    }
    
    setMappings(prev => [...prev, data[0]]);
    return data[0];
  };

  const deleteMapping = async (id: string) => {
    const { error } = await supabase
      .from('sport_mappings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao deletar mapeamento:', error);
      return false;
    }
    
    setMappings(prev => prev.filter(m => m.id !== id));
    return true;
  };

  return { mappings, loading, addMapping, deleteMapping, refreshMappings: fetchMappings };
};
