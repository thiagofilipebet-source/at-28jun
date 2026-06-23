import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-[500px] p-6 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Share2 className="w-5 h-5" />
                <span className="font-bold text-lg">Compartilhar</span>
              </div>
              <button 
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/40 font-bold text-xs tracking-widest uppercase text-center">COMPARTILHANDO LINK BANKROLL</span>
              <div className="flex items-center justify-between p-4 bg-[#061423] rounded-xl border border-white/10">
                <span className="text-white text-sm truncate pr-2" title={url}>{url.length > 30 ? url.substring(0, 30) + '...' : url}</span>
                <button 
                  onClick={handleCopy}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <button 
                onClick={onClose}
                className="py-3 px-6 text-white/60 font-bold hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-[#5a5de3] to-[#9b51e0] text-white font-bold rounded-lg shadow-xl shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
