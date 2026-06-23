import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';

interface AnalysisChartProps {
  data: any[];
  xKey: string;
  barDataKey: string;
  title: string;
  height?: number;
  xAxisAngle?: number;
  xAxisHeight?: number;
  showExternalLabels?: boolean;
}

const ExternalLabel = (props: any) => {
  const { x, y, width, height, viewBox, data, barDataKey, xKey, value, payload } = props;
  if (x == null || y == null || width == null || height == null || !viewBox) return null;

  // Use props.value or payload name to find the corresponding data item to ensure it's not out of sync
  const targetValue = value !== undefined ? value : (payload && payload[xKey]);
  const item = data.find((d: any) => d[xKey] === targetValue);
  const barValue = item ? item[barDataKey] : 0;
  const labelValue = targetValue || '';
  
  const isPositive = barValue >= 0;
  const color = isPositive ? '#10b981' : '#f43f5e';
  
  const apexY = isPositive ? y : y + height;
  const targetY = isPositive ? viewBox.y - 40 : viewBox.y + viewBox.height + 40;
  
  const textY = isPositive ? targetY - 10 : targetY + 10;

  return (
    <g>
      {/* Connector line */}
      <path 
        d={`M${x + width / 2},${apexY} L${x + width / 2},${targetY}`} 
        stroke={color} 
        strokeWidth={1} 
        strokeDasharray="3 3"
        fill="none"
      />
      {/* Arrow head */}
      <polygon 
        points={
          isPositive 
            ? `${x + width / 2 - 3},${targetY + 4} ${x + width / 2 + 3},${targetY + 4} ${x + width / 2},${targetY}` 
            : `${x + width / 2 - 3},${targetY - 4} ${x + width / 2 + 3},${targetY - 4} ${x + width / 2},${targetY}`
        }
        fill={color}
      />
      <text
        x={x + width / 2}
        y={textY}
        fill={color}
        textAnchor={isPositive ? "start" : "end"}
        fontSize={11}
        fontWeight={500}
        transform={`rotate(${isPositive ? -45 : -45}, ${x + width / 2}, ${textY})`}
      >
        {labelValue}
      </text>
    </g>
  );
};

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ 
  data, 
  xKey, 
  barDataKey, 
  title, 
  height = 256,
  xAxisAngle = 0,
  xAxisHeight = 30,
  showExternalLabels = false
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: `${height}px` }} />;
  }

  return (
    <div className="bg-[#0b1120] p-6 rounded-2xl border border-white/5 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-6 text-center">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
          <BarChart 
            data={data} 
            margin={{ 
              top: showExternalLabels ? 80 : 10, 
              right: 20, 
              left: -20, 
              bottom: showExternalLabels ? 80 : (xAxisAngle !== 0 ? xAxisHeight : 0) 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={true} />
            
            {showExternalLabels ? (
              <XAxis dataKey={xKey} hide={true} />
            ) : (
              <XAxis 
                dataKey={xKey} 
                stroke="#ffffff50" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                angle={xAxisAngle}
                textAnchor={xAxisAngle !== 0 ? "end" : "middle"}
                height={xAxisHeight}
                interval={0}
              />
            )}
            
            <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#050914', border: '1px solid #ffffff10', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: '#ffffff05' }}
            />
            <ReferenceLine y={0} stroke="#ffffff30" />
            <Bar dataKey={barDataKey} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry[barDataKey] >= 0 ? '#10b981' : '#f43f5e'} />
              ))}
              {showExternalLabels && (
                <LabelList
                  dataKey={xKey}
                  content={(props) => <ExternalLabel {...props} data={data} barDataKey={barDataKey} xKey={xKey} />}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
