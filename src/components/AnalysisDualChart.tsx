import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface AnalysisDualChartProps {
  data: any[];
  xKey: string;
  dataKey1: string;
  dataKey2: string;
  label1: string;
  label2: string;
  title: string;
}

export const AnalysisDualChart: React.FC<AnalysisDualChartProps> = ({ 
  data, xKey, dataKey1, dataKey2, label1, label2, title 
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64" />;
  }

  return (
    <div className="bg-[#0b1120] p-6 rounded-2xl border border-white/5 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-6 text-center">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={true} />
            <XAxis dataKey={xKey} stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#050914', border: '1px solid #ffffff10', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="#ffffff30" />
            <Bar dataKey={dataKey1} name={label1} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey={dataKey2} name={label2} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
