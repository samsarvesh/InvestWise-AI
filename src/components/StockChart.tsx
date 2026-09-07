import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from 'recharts';
import { Check } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  dma50: number;
  dma200: number;
  peRatio: number;
  pbRatio: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
}

type ChartMetric = 'price' | 'pe' | 'pb';

export const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const [range, setRange] = useState('1Yr');
  const [metric, setMetric] = useState<ChartMetric>('price');
  
  // Visibility toggles (Screener style)
  const [showPrice, setShowPrice] = useState(true);
  const [showDMA50, setShowDMA50] = useState(true);
  const [showDMA200, setShowDMA200] = useState(true);

  const filteredData = useMemo(() => {
    const total = data.length;
    let result = [];
    switch (range) {
      case '1M': result = data.slice(Math.max(0, total - 20)); break;
      case '6M': result = data.slice(Math.max(0, total - 40)); break;
      case '1Yr': result = data.slice(Math.max(0, total - 52)); break;
      case '3Yr': result = data.slice(Math.max(0, total - 64)); break;
      case '5Yr': result = data.slice(Math.max(0, total - 80)); break;
      case '10Yr': result = data.slice(Math.max(0, total - 80)); break;
      case 'Max': result = data; break;
      default: result = data;
    }
    return result;
  }, [data, range]);

  const CustomCheckbox = ({ label, checked, onChange, colorClass }: { label: string, checked: boolean, onChange: () => void, colorClass: string }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div 
        onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
          checked ? colorClass : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );

  return (
    <div className="w-full h-auto glass-card p-4 mt-8">
      <div className="flex flex-col gap-6 mb-6">
        {/* Top Controls: Range and Metric */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-lg">
            {['1M', '6M', '1Yr', '3Yr', '5Yr', '10Yr', 'Max'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  range === r
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setMetric('price')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                metric === 'price'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setMetric('pe')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                metric === 'pe'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              PE Ratio
            </button>
            <button
              onClick={() => setMetric('pb')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                metric === 'pb'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Price to Book
            </button>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.03}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" className="dark:stroke-gray-700/50" />
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }} 
              className="dark:[&_.recharts-cartesian-axis-line]:stroke-gray-700 dark:[&_.recharts-cartesian-axis-tick-line]:stroke-gray-700"
              tick={{ fontSize: 10, fill: '#64748b' }}
              minTickGap={60}
              dy={10}
            />
            <YAxis 
              orientation="right"
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }} 
              className="dark:[&_.recharts-cartesian-axis-line]:stroke-gray-700 dark:[&_.recharts-cartesian-axis-tick-line]:stroke-gray-700"
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={['auto', 'auto']}
              dx={10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
              labelStyle={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
            />
            
            {/* The Main Area Selection */}
            {showPrice && (
              <Area
                type="monotone"
                dataKey={metric === 'price' ? "price" : metric === 'pe' ? "peRatio" : "pbRatio"}
                stroke="#312e81"
                strokeWidth={1.8}
                fill="url(#colorArea)"
                name={metric === 'price' ? "Price" : metric === 'pe' ? "PE Ratio" : "Price to Book"}
                animationDuration={800}
                connectNulls
              />
            )}

            {/* Moving Averages */}
            {metric === 'price' && showDMA50 && (
              <Line 
                type="monotone" 
                dataKey="dma50" 
                stroke="#f59e0b" 
                strokeWidth={1.5} 
                dot={false} 
                name="50 DMA" 
                animationDuration={800}
              />
            )}
            {metric === 'price' && showDMA200 && (
              <Line 
                type="monotone" 
                dataKey="dma200" 
                stroke="#475569" 
                strokeWidth={1.5} 
                dot={false} 
                name="200 DMA" 
                animationDuration={800}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Controls: Toggles */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 border-t border-gray-100 dark:border-white/5 pt-6">
        <CustomCheckbox 
          label="Price" 
          checked={showPrice} 
          onChange={() => setShowPrice(!showPrice)}
          colorClass="bg-indigo-600 border-indigo-600"
        />
        {metric === 'price' && (
          <>
            <CustomCheckbox 
              label="50 DMA" 
              checked={showDMA50} 
              onChange={() => setShowDMA50(!showDMA50)}
              colorClass="bg-amber-500 border-amber-500"
            />
            <CustomCheckbox 
              label="200 DMA" 
              checked={showDMA200} 
              onChange={() => setShowDMA200(!showDMA200)}
              colorClass="bg-gray-500 border-gray-500"
            />
          </>
        )}
      </div>
    </div>
  );
};
