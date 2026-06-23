import React, { createContext, useContext, useState, useEffect } from 'react';
import { SportMapping } from '../types';
import { supabase } from '../lib/supabase';

interface SportMappingsContextType {
  mappings: SportMapping[];
  loading: boolean;
  addMapping: (keyword: string, sport: string, type: 'sport' | 'house') => Promise<SportMapping | null>;
  deleteMapping: (id: string) => Promise<boolean>;
  refreshMappings: () => Promise<void>;
}

const SportMappingsContext = createContext<SportMappingsContextType | undefined>(undefined);

export const SportMappingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const addMapping = async (keyword: string, sport: string, type: 'sport' | 'house' = 'sport') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        alert('Usuário não autenticado. Por favor, faça login novamente.');
        return null;
      }

      console.log('Tentando salvar mapeamento:', { keyword, sport, type, user_id: user.id });

      const { data, error } = await supabase
        .from('sport_mappings')
        .insert([{ 
          user_id: user.id, 
          keyword: keyword.trim().toLowerCase(), 
          sport,
          type
        }])
        .select();
      
      if (error) {
        console.error('Erro Supabase (addMapping):', error);
        
        if (error.code === '42P01') {
          alert('ERRO: A tabela "sport_mappings" não existe no banco de dados. Você precisa executar o script SQL fornecido no terminal.');
        } else {
          alert(`Erro ao salvar: ${error.message}`);
        }
        return null;
      }
      
      if (data && data.length > 0) {
        setMappings(prev => [...prev, data[0]]);
        return data[0];
      }
      return null;
    } catch (err) {
      console.error('Erro inesperado ao adicionar mapeamento:', err);
      alert('Ocorreu um erro inesperado ao salvar.');
      return null;
    }
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

  return (
    <SportMappingsContext.Provider value={{ mappings, loading, addMapping, deleteMapping, refreshMappings: fetchMappings }}>
      {children}
    </SportMappingsContext.Provider>
  );
};

export const useSportMappingsContext = () => {
  const context = useContext(SportMappingsContext);
  if (context === undefined) {
    throw new Error('useSportMappingsContext must be used within a SportMappingsProvider');
  }
  return context;
};
