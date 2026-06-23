import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export const UpdateBanner = () => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    let currentVersion: string | null = null;
    
    // Fetch initial version
    const fetchInitial = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('latest_version').limit(1).maybeSingle();
        if (mounted && data) {
          currentVersion = data.latest_version;
        }
      } catch (err) {
        console.error('Error fetching initial app settings:', err);
      }
    };
    
    fetchInitial();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-[#0b1120] text-white px-4 py-3 rounded-full shadow-xl shadow-black/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border border-white/10">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="w-4 h-4 text-primary" />
        Nova atualização
      </div>
      <button 
        onClick={() => {
          // Force a hard reload
          window.location.reload();
        }}
        className="bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] hover:opacity-90 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 text-white shadow-lg"
      >
        <RefreshCw className="w-3 h-3" />
        Atualizar
      </button>
      <button 
        onClick={() => setShow(false)}
        className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        aria-label="Ignorar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
