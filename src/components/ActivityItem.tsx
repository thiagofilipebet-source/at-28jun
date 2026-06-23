import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';
import { removeUrls } from '../lib/utils';
import { Bet, DisplaySettings } from '../types';
import { BOOKMAKER_LOGOS, normalizeBookmakerName, SPORT_EMOJIS } from '../constants';

interface ActivityItemProps {
  bet: Bet;
  displaySettings: DisplaySettings;
  onClick?: () => void;
  onStatusChange?: (id: string, newStatus: Bet['status']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ bet, displaySettings, onClick, onStatusChange, onEdit, onDelete, isDeleting, isSelected, onToggleSelect }) => {
  const [imgError, setImgError] = useState(false);
  const isGanha = bet.status === 'won' || bet.status === 'half_won' || bet.status === 'cashout';
  const isPerdida = bet.status === 'lost' || bet.status === 'half_lost' || bet.status === 'canceled';
  const isPendente = bet.status === 'pending';
  
  const calculateLucro = () => {
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

  const calculateGanho = () => {
    switch (bet.status) {
      case 'won': return bet.odd * bet.stake;
      case 'half_won': return bet.stake + ((bet.odd * bet.stake) - bet.stake) / 2;
      case 'lost': return 0;
      case 'half_lost': return bet.stake / 2;
      case 'refunded': return bet.stake;
      case 'cashout': return (bet.return_value || 0);
      case 'canceled': return bet.stake;
      default: return 0;
    }
  };

  const lucro = calculateLucro();
  const ganho = calculateGanho();

  const visibleColumns = [
    displaySettings.showCotacao,
    displaySettings.showValor,
    displaySettings.showGanho,
    true // Lucro is always visible
  ].filter(Boolean).length;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      onClick={isDeleting ? onToggleSelect : onClick}
      className={cn(
        "flex w-full items-stretch bg-white/[0.04] border rounded-xl mt-3 cursor-pointer transition-all",
        isDeleting && isSelected ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/5"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 p-4 relative">
        {isDeleting ? (
          <div className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
            isSelected ? "bg-indigo-500 border-indigo-500" : "border-white/20"
          )}>
            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
        ) : (
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit || onDelete) {
                  setIsMenuOpen(!isMenuOpen);
                }
              }}
              className={cn("p-1 rounded transition-colors", (onEdit || onDelete) ? "hover:bg-white/10 cursor-pointer" : "cursor-not-allowed opacity-50")}
              disabled={!onEdit && !onDelete}
            >
              <MoreHorizontal className="w-5 h-5 text-white rotate-90" />
            </button>
            
            {(onEdit || onDelete) && isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-50" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                />
                <div className="absolute top-0 left-full ml-2 w-32 bg-[#1e293b] border border-white/10 rounded-lg shadow-2xl z-[60] py-1 transition-all animate-in fade-in zoom-in-95 duration-100">
                  {onEdit && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsMenuOpen(false);
                        onEdit(); 
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left uppercase cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsMenuOpen(false);
                        onDelete(); 
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-all text-left uppercase cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            {displaySettings.showHora && (
              <span className="bg-slate-900/60 text-white text-[11px] px-2 py-0.5 rounded border border-white/10 font-medium">
                {bet.time}
              </span>
            )}
            {displaySettings.showCasa && bet.bookmaker && (
              (() => {
                const canonicalName = normalizeBookmakerName(bet.bookmaker);
                const logo = BOOKMAKER_LOGOS[canonicalName.toUpperCase()];
                
                const isApostaGanha = canonicalName.toUpperCase() === "APOSTA GANHA";
                const isLottu = canonicalName.toUpperCase() === "LOTTU";
                
                return (
                  <div className={cn(
                    "text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border font-black flex items-center justify-center gap-1 uppercase tracking-wider",
                    (logo && !imgError) ? "border-none bg-transparent p-0" : "bg-sky-500/[0.04] border-sky-500/25 text-sky-300"
                  )}>
                    {logo && !imgError ? (
                      <div className={cn(
                        "flex items-center justify-center flex-shrink-0",
                        isApostaGanha && "bg-white h-[11px] md:h-[13px] px-[2px] rounded-[2px] overflow-hidden"
                      )}>
                        <img 
                          src={logo} 
                          alt="brand" 
                          className={cn(
                            "w-auto object-contain flex-shrink-0",
                            isApostaGanha ? "h-6 md:h-7 max-w-[85px] md:max-w-[100px]" : 
                            isLottu ? "h-6.5 md:h-8.5 max-w-[90px] md:max-w-[110px]" :
                            "h-4 md:h-5 max-w-[70px] md:max-w-[80px]"
                          )}
                          onError={() => {
                            setImgError(true);
                          }}
                        />
                      </div>
                    ) : (
                      <span className="truncate max-w-[100px] text-sky-300">{bet.bookmaker}</span>
                    )}
                  </div>
                );
              })()
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 min-w-0 w-full">
            <span className="text-xl leading-none shrink-0">{SPORT_EMOJIS[bet.sport || 'Futebol'] || '⚽'}</span>
            <span className="text-white font-medium text-[15px] truncate flex-1 min-w-0" title={removeUrls(bet.event)}>{removeUrls(bet.event) || 'Aposta'}</span>
          </div>
        </div>
      </div>
      
      <div 
        className="hidden lg:grid items-center pr-2 text-left shrink-0"
        style={{ 
          gridTemplateColumns: `repeat(${visibleColumns}, 1fr)`,
          width: `${visibleColumns * 100 + 20}px`
        }}
      >
        {displaySettings.showCotacao && (
          <div>
            <div className="font-medium text-white text-base">{bet.odd.toFixed(3)}</div>
            <div className="text-[11px] text-white/50 font-medium tracking-tight">Cotação</div>
          </div>
        )}
        {displaySettings.showValor && (
          <div>
            <div className="font-medium text-white text-base border-gray-400">{bet.stake.toFixed(2)}<span className="text-[10px] ml-px">R$</span></div>
            <div className="text-[11px] text-white/50 font-medium tracking-tight">Valor</div>
          </div>
        )}
        {displaySettings.showGanho && (
          <div>
            <div className={cn("font-medium text-base whitespace-nowrap", isGanha ? 'text-[#66dd8b]' : (isPerdida ? 'text-red-400' : 'text-white'))}>
              {ganho.toFixed(2)}<span className="text-[10px] ml-px">R$</span>
            </div>
            <div className="text-[11px] text-white/50 font-medium tracking-tight">Ganho</div>
          </div>
        )}
        <div>
          <div className={cn("font-medium text-base whitespace-nowrap", lucro > 0 ? 'text-[#66dd8b]' : (lucro < 0 ? 'text-red-400' : 'text-white'))}>
            {lucro.toFixed(2)}<span className="text-[10px] ml-px">R$</span>
          </div>
          <div className="text-[11px] text-white/50 font-medium tracking-tight">Lucro</div>
        </div>
      </div>

      <div 
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange?.(bet.id, bet.status);
        }}
        className={cn("self-stretch flex items-center justify-center w-10 shrink-0 cursor-pointer active:scale-95 transition-all text-center rounded-r-xl", 
          (bet.status === 'won' || bet.status === 'half_won' || bet.status === 'cashout') ? 'bg-[#00c08b]/10' : 
          (bet.status === 'lost' || bet.status === 'half_lost') ? 'bg-[#ff4d4d]/10' : 
          (bet.status === 'refunded' ? 'bg-[#3b82f6]/10' : 
          (bet.status === 'canceled' ? 'bg-[#94a3b8]/10' : 
          'bg-white/5'))
        )}
      >
        <div className="flex items-center justify-center w-full h-full overflow-hidden">
          <div className="flex items-center justify-center w-0 h-0">
            <span className={cn("text-[11px] font-semibold -rotate-90 whitespace-nowrap antialiased",
          (bet.status === 'won' || bet.status === 'half_won' || bet.status === 'cashout') ? 'text-[#00c08b]' : 
          (bet.status === 'lost' || bet.status === 'half_lost') ? 'text-[#ff4d4d]' : 
          (bet.status === 'refunded' ? 'text-[#3b82f6]' : (bet.status === 'canceled' ? 'text-[#94a3b8]' : 'text-gray-500'))
        )}>
          {bet.status === 'won' ? 'Ganha' : 
           bet.status === 'lost' ? 'Perdida' : 
           bet.status === 'pending' ? 'Pendente' :
           bet.status === 'half_won' ? 'M. Ganha' :
           bet.status === 'half_lost' ? 'M. Perdida' :
           bet.status === 'refunded' ? 'Reembolso' :
           bet.status === 'cashout' ? 'Cashout' :
           bet.status === 'canceled' ? 'Cancelada' : bet.status}
        </span>
          </div>
        </div>
      </div>
    </div>
  );
};
