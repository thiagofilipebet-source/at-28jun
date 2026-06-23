import React from 'react';
import { X, Calendar, Navigation, Pencil, Share2, Copy, Trash2 } from 'lucide-react';
import { cn, removeUrls } from '../lib/utils';
import { Bet } from '../types';
import { BOOKMAKER_LOGOS, normalizeBookmakerName, SPORT_EMOJIS } from '../constants';

interface BetDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBet: Bet | null;
  onDelete: (id: string) => void;
  onEdit: (bet: Bet) => void;
}

export const BetDetailSidebar: React.FC<BetDetailSidebarProps> = ({ isOpen, onClose, selectedBet, onDelete, onEdit }) => {
  const [imgError, setImgError] = React.useState(false);
  
  if (!selectedBet) return null;

  const rawName = selectedBet.bookmaker?.trim();
  const canonicalName = rawName ? normalizeBookmakerName(rawName) : '';
  const logo = canonicalName ? BOOKMAKER_LOGOS[canonicalName.toUpperCase()] : (rawName ? BOOKMAKER_LOGOS[rawName.toUpperCase()] : undefined);

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0b1120] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-3.5 border-b border-white/10 shrink-0 bg-[#0b1120]">
        <h2 className="text-base font-bold text-white tracking-tight uppercase">DETALHES DA APOSTA</h2>
        <button 
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {/* Data and type Tag */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/60 text-white text-[9px] px-2 py-0.5 rounded border border-white/10 font-bold flex items-center gap-1.5 tracking-tight">
            <Calendar className="w-2.5 h-2.5 text-gray-400" />
            {new Date(selectedBet.date + "T" + selectedBet.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' -')}
          </div>
        </div>

        {/* stats Grid */}
        <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-white/[0.03] border border-white/5 rounded-xl shadow-xl">
          <div className="space-y-0.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">ODD</div>
            <div className="text-base font-black text-white">{selectedBet.odd.toFixed(3)}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">Valor</div>
            <div className="text-base font-black text-white">{selectedBet.stake.toFixed(2)}R$</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">Ganho</div>
            <div className="text-base font-black text-white">{((selectedBet.status === 'won' || selectedBet.status === 'half_won') ? (selectedBet.return_value || selectedBet.odd * selectedBet.stake) : 0).toFixed(2)}R$</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">Lucro</div>
            <div className={cn("text-base font-black", 
              (selectedBet.status === 'won' || selectedBet.status === 'half_won') ? "text-[#66dd8b]" : 
              (selectedBet.status === 'lost' || selectedBet.status === 'half_lost') ? "text-red-400" : "text-white"
            )}>
              {(selectedBet.profit || 0).toFixed(2)}R$
            </div>
          </div>
        </div>

        {/* selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[12px] font-bold text-white tracking-tight">Seleção</h3>
            {selectedBet.bookmaker && (
              <div className={cn(
                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border",
                (logo && !imgError) ? "border-none bg-transparent p-0" : "bg-sky-500/[0.04] border-sky-500/25 text-sky-300"
              )}>
                {logo && !imgError ? (
                  <div className={cn(
                    "flex items-center justify-center flex-shrink-0",
                    canonicalName.toUpperCase() === "APOSTA GANHA" && "bg-white h-[11px] md:h-[13px] px-[2px] rounded-[2px] overflow-hidden"
                  )}>
                    <img 
                      src={logo} 
                      alt="brand" 
                      className={cn(
                        "w-auto object-contain flex-shrink-0",
                        canonicalName.toUpperCase() === "APOSTA GANHA" ? "h-6 md:h-7 max-w-[85px] md:max-w-[100px]" : 
                        canonicalName.toUpperCase() === "LOTTU" ? "h-6.5 md:h-8.5 max-w-[90px] md:max-w-[110px]" :
                        "h-4 md:h-5 max-w-[70px] md:max-w-[80px]"
                      )}
                      onError={() => setImgError(true)}
                    />
                  </div>
                ) : (
                  <span className="text-sky-300">{selectedBet.bookmaker}</span>
                )}
              </div>
            )}
          </div>
          <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-base shrink-0">{SPORT_EMOJIS[selectedBet.sport || 'Futebol'] || '⚽'}</span>
              <span className="text-white font-normal text-[13px] tracking-tight leading-snug break-words">
                {removeUrls(selectedBet.event) || 'Aposta'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-slate-900 px-2 py-0.5 rounded border border-white/10 text-[10px] font-black text-white">
                {selectedBet.odd.toFixed(3)}
              </div>
              <div className={cn("px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-widest min-w-[65px] text-center",
                (selectedBet.status === 'won' || selectedBet.status === 'half_won') ? "bg-[#66dd8b]/10 text-[#66dd8b] border-[#66dd8b]/30" :
                (selectedBet.status === 'lost' || selectedBet.status === 'half_lost') ? "bg-red-500/10 text-red-400 border-red-500/30" :
                "bg-white/10 text-gray-400 border-white/10"
              )}>
                {selectedBet.status === 'won' ? 'Ganha' : 
                 selectedBet.status === 'lost' ? 'Perdida' : 
                 selectedBet.status === 'pending' ? 'Pendente' :
                 selectedBet.status === 'half_won' ? 'M. Ganha' :
                 selectedBet.status === 'half_lost' ? 'M. Perdida' :
                 selectedBet.status === 'refunded' ? 'Reembolso' :
                 selectedBet.status === 'cashout' ? 'Cashout' :
                 selectedBet.status === 'canceled' ? 'Cancelada' : selectedBet.status}
              </div>
            </div>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-1.5">
          <h3 className="text-[12px] font-bold text-white tracking-tight px-1">Comentário</h3>
          <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 min-h-[35px] text-white/70 text-[11px] leading-relaxed italic">
            {selectedBet.comment || 'Nenhum comentário'}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 pt-4 border-t border-white/5">
          <button 
            onClick={() => onEdit(selectedBet)}
            className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all group"
          >
            <Pencil className="w-3 h-3 text-gray-400 group-hover:text-white" />
            <span className="text-[8px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Editar</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all group">
            <Share2 className="w-3 h-3 text-gray-400 group-hover:text-white" />
            <span className="text-[8px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Compartilhar</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all group">
            <Copy className="w-3 h-3 text-gray-400 group-hover:text-white" />
            <span className="text-[8px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Copiar</span>
          </button>
          <button 
            onClick={() => onDelete(selectedBet.id)}
            className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
          >
            <Trash2 className="w-3 h-3 text-gray-400 group-hover:text-red-400" />
            <span className="text-[8px] font-bold text-gray-400 group-hover:text-red-400 uppercase tracking-wider">Remover</span>
          </button>
        </div>
      </div>
    </div>
  );
};
