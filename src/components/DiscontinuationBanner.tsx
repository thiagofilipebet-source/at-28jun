import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DiscontinuationBanner = () => {
  const [show, setShow] = useState(true);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 shadow-lg z-[1000] fixed top-0 left-0 right-0 border-b border-red-600"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold leading-tight">
                ⚠️ O sistema está passando por instabilidades. Para não perder seus dados, exporte suas apostas e bancas agora. Estamos trabalhando para resolver.
              </p>
            </div>
            <button 
              onClick={() => setShow(false)}
              className="p-2 hover:bg-black/20 rounded-full transition-colors shrink-0"
              aria-label="Fechar aviso"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
