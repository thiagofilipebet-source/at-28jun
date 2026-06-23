import React, { useContext } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { cn } from '../lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { BankrollContext } from '../context/BankrollContext';

// ...
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn("border rounded-lg p-2.5 shadow-xl", theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#061423] border-white/10')}>
        <p className={cn("font-bold text-sm mb-1", theme === 'light' ? 'text-gray-900' : 'text-white')}>{payload[0].payload.fullDate}</p>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-2.5 h-2.5 rounded-sm", theme === 'light' ? 'bg-primary' : 'bg-white')}></div>
          <p className={cn("font-bold text-sm", theme === 'light' ? 'text-gray-900' : 'text-white')}>
            Lucro: {Number(payload[0].value).toFixed(2)} R$
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface ChartProps {
  bets: any[];
}

export const Chart: React.FC<ChartProps> = ({ bets }) => {
  const context = useContext(BankrollContext);
  const theme = context?.theme || 'dark';
  const [localTimeRange, setLocalTimeRange] = React.useState<any>('all');
  const timeRange = context?.timeRange || localTimeRange;
  const setTimeRange = context?.setTimeRange || setLocalTimeRange;
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = React.useMemo(() => {
    const settledBets = bets.filter(b => b.status !== 'Pendente');
    const activeBets = [...settledBets];

    activeBets.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    let cumulative = 0;
    const cData: any[] = [];
    
    if (activeBets.length > 0) {
      const firstBet = activeBets[0];
      const betDateObj = new Date(`${firstBet.date}T${firstBet.time || '00:00'}`);
      const sDate = new Date(betDateObj.getTime() - 3600000);
      
      cData.push({
        id: 'start-zero',
        date: sDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: 'Início',
        profit: 0
      });
    }
    
    activeBets.forEach((bet, index) => {
      cumulative += (bet.profit || 0);
      const betDateObj = new Date(`${bet.date}T${bet.time || '00:00'}`);
      cData.push({
        id: bet.id || `bet-${index}`,
        date: betDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: betDateObj.toLocaleDateString('pt-BR'),
        time: bet.time || '',
        profit: Number(cumulative.toFixed(2))
      });
    });
    
    return cData;
  }, [bets]);

  const yAxisTicks = React.useMemo(() => {
    const max = Math.max(...chartData.map(d => d.profit), 0);
    const roundedMax = Math.ceil((max * 1.15) / 100) * 100;
    const step = roundedMax / 9;
    return Array.from({ length: 10 }, (_, i) => Math.round(step * i));
  }, [chartData]);

  const renderCustomizedLabel = (props: any) => {
    const { x, y, value, index } = props;
    const total = chartData.length;
    
    // Objetivo: no máximo 10 pontos.
    const step = Math.max(1, Math.ceil((total - 1) / 9));
    
    // Mostra o primeiro, o último e pontos espaçados pelo step
    // Evita o overlap garantindo que o penúltimo ponto mostrado tenha distância suficiente do último
    const isLast = index === total - 1;
    const isStepPoint = index % step === 0;
    
    let shouldShow = false;
    if (index === 0 || isLast) {
      shouldShow = true;
    } else if (isStepPoint) {
      // Se não for o último, mostra o step point apenas se estiver a uma certa distância de indíces do fim
      if (total - 1 - index >= step * 0.7) {
        shouldShow = true;
      }
    }

    if (!shouldShow || value === undefined || value === null) return null;

    // Ajuste para o último ponto não ficar cortado à direita
    const rectX = isLast ? -72 : -35;
    const textX = isLast ? -37 : 0;

    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={rectX} y={-24} width={70} height={18} fill={theme === 'light' ? '#f1f5f9' : '#0b1120'} stroke={theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'} strokeWidth="1" rx={4} />
        <text x={textX} y={-11} fill={theme === 'light' ? '#1f2937' : '#ffffff'} fontSize={10} fontWeight="bold" textAnchor="middle">
          {Number(value).toFixed(2)}
        </text>
      </g>
    );
  };

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[380px] lg:h-full lg:min-h-[580px]" />;
  }

  return (
    <div className={cn(
      "lg:col-span-3 relative flex flex-col overflow-hidden rounded-xl h-[380px] lg:h-full lg:min-h-[500px] mx-2 lg:mx-0",
      theme === 'light' ? "bg-[#00d18e] lg:bg-white lg:ring-1 lg:ring-gray-200 lg:pt-4" : "bg-[#00d18e] lg:bg-[#0b1120] lg:ring-1 lg:ring-white/5 lg:pt-4"
    )} style={{ outline: 'none', border: 'none' }}>
      
      <div className="lg:hidden flex items-center justify-end px-4 pt-3">
        <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 w-full relative min-h-[100px] lg:min-h-[400px]">
        {/* Label fixo do zero */}
        <span className={cn("absolute bottom-0 text-[10px] z-10 pb-1 text-right pr-2", theme === 'light' ? "text-gray-400" : "text-white/50")} style={{ width: '80px' }}>0 R$</span>

        {/* CORREÇÃO: substituído absolute inset-0 por w-full h-full com minHeight explícito */}
        <div className="w-full h-full" style={{ minHeight: isMobile ? 280 : 500 }}>
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} style={{ outline: 'none', border: 'none' }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isMobile ? (theme === 'light' ? '#00d18e' : '#ffffff') : (theme === 'light' ? '#00d18e' : '#66dd8b')} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isMobile ? (theme === 'light' ? '#00d18e' : '#ffffff') : (theme === 'light' ? '#00d18e' : '#66dd8b')} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfitDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme === 'light' ? '#00d18e' : '#66dd8b'} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={theme === 'light' ? '#00d18e' : '#66dd8b'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)'} horizontal={true} vertical={true} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: theme === 'light' ? '#9ca3af' : 'rgba(255,255,255,0.5)', fontSize: 10 }}
                tickLine={false} 
                axisLine={false} 
                dy={10}
                minTickGap={30}
                hide={true}
              />
              <YAxis 
                tick={{ fill: theme === 'light' ? '#9ca3af' : 'rgba(255,255,255,0.5)', fontSize: 10 }}
                tickLine={false} 
                axisLine={false} 
                domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
                ticks={yAxisTicks.slice(1)}
                tickFormatter={(value) => {
                  if (Math.abs(value) < 1000) return `${value} R$`;
                  return `${(value / 1000).toFixed(1)} mil R$`;
                }}
                width={80}
              />
              <Tooltip cursor={false} content={<CustomTooltip theme={theme} />} />
              <Area 
                type={isMobile ? "monotone" : "linear"}
                dataKey="profit" 
                stroke={isMobile ? (theme === 'light' ? '#ffffff' : '#ffffff') : (theme === 'light' ? '#00d18e' : '#66dd8b')}
                strokeWidth={isMobile ? 3 : 2}
                fillOpacity={1} 
                fill="url(#colorProfit)"
              >
                {!isMobile && <LabelList dataKey="profit" content={renderCustomizedLabel} />}
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:hidden px-2 pb-2 flex items-center justify-between gap-1 mt-auto">
        {(['tudo', '1d', '1s', '1m', '1a'] as const).map((label) => (
          <button 
            key={label}
            onClick={() => setTimeRange(label === 'tudo' ? 'all' : label as any)}
            className={cn(
              "flex-1 py-1.5 text-[10px] font-bold rounded-full border transition-colors uppercase tracking-tight",
              (timeRange === (label === 'tudo' ? 'all' : label)) 
                ? "bg-white text-[#00d18e] border-white" 
                : "text-white border-white/30 hover:bg-white/10"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

