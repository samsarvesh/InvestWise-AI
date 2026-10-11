import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
  Bar
} from 'recharts';
import { Check, TrendingUp, TrendingDown, Activity, Info, BarChart2 } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  timestamp?: number;
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

const parsePointDateMs = (d: ChartDataPoint): number => {
  if (d.timestamp && typeof d.timestamp === 'number' && !isNaN(d.timestamp)) {
    return d.timestamp;
  }
  const parsed = new Date(d.date).getTime();
  if (!isNaN(parsed)) return parsed;
  // If formatted as DD-MM-YYYY or DD Mon YYYY
  const parts = d.date.split(/[-/ ]/);
  if (parts.length === 3) {
    const fallbackParsed = Date.parse(d.date);
    if (!isNaN(fallbackParsed)) return fallbackParsed;
  }
  return 0;
};

export const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const [range, setRange] = useState('3Yr');
  const [metric, setMetric] = useState<ChartMetric>('price');
  
  // Toggles
  const [showPrice, setShowPrice] = useState(true);
  const [showDMA50, setShowDMA50] = useState(true);
  const [showDMA200, setShowDMA200] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [showMedianRef, setShowMedianRef] = useState(true);

  // Robust Date-based range filtering
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (range === 'Max') return data;

    const lastPoint = data[data.length - 1];
    const lastTimeMs = parsePointDateMs(lastPoint);

    let monthsToSubtract = 36;
    switch (range) {
      case '1M': monthsToSubtract = 1; break;
      case '6M': monthsToSubtract = 6; break;
      case '1Yr': monthsToSubtract = 12; break;
      case '3Yr': monthsToSubtract = 36; break;
      case '5Yr': monthsToSubtract = 60; break;
      case '10Yr': monthsToSubtract = 120; break;
      default: monthsToSubtract = 36;
    }

    if (lastTimeMs > 0) {
      const cutoffDate = new Date(lastTimeMs);
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsToSubtract);
      const cutoffTime = cutoffDate.getTime();

      const result = data.filter(d => {
        const ptTime = parsePointDateMs(d);
        return ptTime > 0 && ptTime >= cutoffTime;
      });

      if (result.length >= 2) {
        return result;
      }
    }

    // High fidelity fallback: slice by number of monthly records
    const count = Math.min(data.length, monthsToSubtract);
    return data.slice(Math.max(0, data.length - count));
  }, [data, range]);

  // Statistics for the filtered range
  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        startPrice: 0,
        latestPrice: 0,
        priceChangePct: 0,
        highPrice: 0,
        lowPrice: 0,
        latestPE: 0,
        medianPE: 0,
        minPE: 0,
        maxPE: 0,
        latestPB: 0,
        medianPB: 0,
        minPB: 0,
        maxPB: 0,
      };
    }

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    const prices = filteredData.map(d => d.price).filter(p => p > 0);
    const highPrice = prices.length ? Math.max(...prices) : 0;
    const lowPrice = prices.length ? Math.min(...prices) : 0;
    const priceChangePct = first.price > 0 ? ((last.price - first.price) / first.price) * 100 : 0;

    // PE stats
    const peList = filteredData.map(d => d.peRatio).filter(v => v > 0).sort((a, b) => a - b);
    const latestPE = last.peRatio || (peList.length ? peList[peList.length - 1] : 0);
    const minPE = peList.length ? peList[0] : 0;
    const maxPE = peList.length ? peList[peList.length - 1] : 0;
    const medianPE = peList.length ? peList[Math.floor(peList.length / 2)] : 0;

    // PB stats
    const pbList = filteredData.map(d => d.pbRatio).filter(v => v > 0).sort((a, b) => a - b);
    const latestPB = last.pbRatio || (pbList.length ? pbList[pbList.length - 1] : 0);
    const minPB = pbList.length ? pbList[0] : 0;
    const maxPB = pbList.length ? pbList[pbList.length - 1] : 0;
    const medianPB = pbList.length ? pbList[Math.floor(pbList.length / 2)] : 0;

    return {
      startPrice: first.price,
      latestPrice: last.price,
      priceChangePct,
      highPrice,
      lowPrice,
      latestPE,
      medianPE,
      minPE,
      maxPE,
      latestPB,
      medianPB,
      minPB,
      maxPB,
    };
  }, [filteredData]);

  // Contextual metric description
  const metricHeader = useMemo(() => {
    if (metric === 'price') {
      const isPositive = stats.priceChangePct >= 0;
      return (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-sans font-black text-slate-900 dark:text-white">
            ₹{stats.latestPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
            isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPositive ? '+' : ''}{stats.priceChangePct.toFixed(1)}% ({range})
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Range: ₹{stats.lowPrice.toFixed(1)} – ₹{stats.highPrice.toFixed(1)}
          </span>
        </div>
      );
    }

    if (metric === 'pe') {
      const peDiff = stats.medianPE > 0 ? ((stats.latestPE - stats.medianPE) / stats.medianPE) * 100 : 0;
      return (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-sans font-black text-indigo-600 dark:text-indigo-400">
            {stats.latestPE.toFixed(1)}x
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Median: <strong className="text-slate-800 dark:text-slate-200">{stats.medianPE.toFixed(1)}x</strong>
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            peDiff <= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          }`}>
            {peDiff <= 0 ? `${Math.abs(peDiff).toFixed(1)}% Below Median` : `${peDiff.toFixed(1)}% Above Median`}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Min: {stats.minPE.toFixed(1)}x · Max: {stats.maxPE.toFixed(1)}x
          </span>
        </div>
      );
    }

    const pbDiff = stats.medianPB > 0 ? ((stats.latestPB - stats.medianPB) / stats.medianPB) * 100 : 0;
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-sans font-black text-purple-600 dark:text-purple-400">
          {stats.latestPB.toFixed(2)}x
        </span>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          Median: <strong className="text-slate-800 dark:text-slate-200">{stats.medianPB.toFixed(2)}x</strong>
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
          pbDiff <= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        }`}>
          {pbDiff <= 0 ? `${Math.abs(pbDiff).toFixed(1)}% Below Median` : `${pbDiff.toFixed(1)}% Above Median`}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Min: {stats.minPB.toFixed(2)}x · Max: {stats.maxPB.toFixed(2)}x
        </span>
      </div>
    );
  }, [metric, stats, range]);

  const CustomCheckbox = ({ 
    label, 
    checked, 
    onChange, 
    colorClass 
  }: { 
    label: string; 
    checked: boolean; 
    onChange: () => void; 
    colorClass: string;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <div 
        onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
          checked ? colorClass : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );

  return (
    <div className="w-full glass-card p-6 md:p-8 space-y-6">
      {/* Top Controls: Metric Tabs and Time Ranges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        
        {/* Metric Selector Tabs */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold">
          <button
            onClick={() => setMetric('price')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'price'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Price Chart
          </button>
          <button
            onClick={() => setMetric('pe')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'pe'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            PE Ratio
          </button>
          <button
            onClick={() => setMetric('pb')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'pb'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Price to Book
          </button>
        </div>

        {/* Time Range Selector Buttons */}
        <div className="flex flex-wrap items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold">
          {['1M', '6M', '1Yr', '3Yr', '5Yr', '10Yr', 'Max'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                range === r
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Key Metric Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {metricHeader}
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {filteredData.length} data points ({range})
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="peGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="pbGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-800" />
            
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }} 
              tick={{ fontSize: 11, fill: '#64748b' }}
              minTickGap={45}
              dy={10}
            />

            <YAxis 
              yAxisId="primary"
              orientation="right"
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }} 
              tick={{ fontSize: 11, fill: '#64748b' }}
              domain={[
                (dataMin: number) => {
                  if (isNaN(dataMin) || dataMin === 0) return 0;
                  const pad = metric === 'price' ? dataMin * 0.08 : dataMin * 0.12;
                  return Math.max(0, Number((dataMin - pad).toFixed(metric === 'price' ? 0 : 1)));
                },
                (dataMax: number) => {
                  if (isNaN(dataMax)) return 100;
                  const pad = metric === 'price' ? dataMax * 0.08 : dataMax * 0.12;
                  return Number((dataMax + pad).toFixed(metric === 'price' ? 0 : 1));
                }
              ]}
              tickFormatter={(v) => metric === 'price' ? `₹${v.toLocaleString('en-IN')}` : `${v}x`}
              dx={8}
            />

            {showVolume && metric === 'price' && (
              <YAxis 
                yAxisId="volume"
                orientation="left"
                hide={true}
                domain={[0, (dataMax: number) => dataMax * 4]}
              />
            )}

            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                borderRadius: '10px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                padding: '12px 14px'
              }}
              formatter={(value: any, name: any) => {
                if (name === "Price") return [`₹${Number(value).toFixed(2)}`, name];
                if (name === "50 DMA" || name === "200 DMA") return [`₹${Number(value).toFixed(2)}`, name];
                if (name === "PE Ratio") return [`${Number(value).toFixed(1)}x`, name];
                if (name === "Price to Book") return [`${Number(value).toFixed(2)}x`, name];
                if (name === "Volume") return [`${Number(value).toLocaleString()}`, name];
                return [value, name];
              }}
              labelStyle={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}
            />

            {/* Optional Volume Bars in Price mode */}
            {showVolume && metric === 'price' && (
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#cbd5e1" 
                opacity={0.35} 
                name="Volume" 
              />
            )}

            {/* Price Metric Area */}
            {metric === 'price' && showPrice && (
              <Area
                yAxisId="primary"
                type="monotone"
                dataKey="price"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#priceGradient)"
                name="Price"
                animationDuration={600}
                connectNulls
              />
            )}

            {/* 50 DMA line */}
            {metric === 'price' && showDMA50 && (
              <Line 
                yAxisId="primary"
                type="monotone" 
                dataKey="dma50" 
                stroke="#f59e0b" 
                strokeWidth={1.8} 
                dot={false} 
                name="50 DMA" 
                animationDuration={600}
              />
            )}

            {/* 200 DMA line */}
            {metric === 'price' && showDMA200 && (
              <Line 
                yAxisId="primary"
                type="monotone" 
                dataKey="dma200" 
                stroke="#64748b" 
                strokeWidth={1.8} 
                dot={false} 
                name="200 DMA" 
                animationDuration={600}
              />
            )}

            {/* PE Ratio Area & Median Reference */}
            {metric === 'pe' && (
              <>
                <Area
                  yAxisId="primary"
                  type="monotone"
                  dataKey="peRatio"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#peGradient)"
                  name="PE Ratio"
                  animationDuration={600}
                  connectNulls
                />
                {showMedianRef && stats.medianPE > 0 && (
                  <ReferenceLine 
                    yAxisId="primary"
                    y={stats.medianPE} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: `Median PE: ${stats.medianPE.toFixed(1)}x`, 
                      fill: '#d97706', 
                      fontSize: 11, 
                      fontWeight: 'bold',
                      position: 'top' 
                    }} 
                  />
                )}
              </>
            )}

            {/* Price to Book Area & Median Reference */}
            {metric === 'pb' && (
              <>
                <Area
                  yAxisId="primary"
                  type="monotone"
                  dataKey="pbRatio"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#pbGradient)"
                  name="Price to Book"
                  animationDuration={600}
                  connectNulls
                />
                {showMedianRef && stats.medianPB > 0 && (
                  <ReferenceLine 
                    yAxisId="primary"
                    y={stats.medianPB} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: `Median PB: ${stats.medianPB.toFixed(2)}x`, 
                      fill: '#d97706', 
                      fontSize: 11, 
                      fontWeight: 'bold',
                      position: 'top' 
                    }} 
                  />
                )}
              </>
            )}

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Context-Aware Indicator Toggles */}
      <div className="flex flex-wrap justify-center items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        {metric === 'price' && (
          <>
            <CustomCheckbox 
              label="Price" 
              checked={showPrice} 
              onChange={() => setShowPrice(!showPrice)}
              colorClass="bg-indigo-600 border-indigo-600"
            />
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
              colorClass="bg-slate-600 border-slate-600"
            />
            <CustomCheckbox 
              label="Volume Bars" 
              checked={showVolume} 
              onChange={() => setShowVolume(!showVolume)}
              colorClass="bg-slate-500 border-slate-500"
            />
          </>
        )}

        {metric === 'pe' && (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              PE Ratio Line
            </div>
            <CustomCheckbox 
              label={`Median PE Benchmark (${stats.medianPE.toFixed(1)}x)`} 
              checked={showMedianRef} 
              onChange={() => setShowMedianRef(!showMedianRef)}
              colorClass="bg-amber-500 border-amber-500"
            />
          </>
        )}

        {metric === 'pb' && (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              Price to Book Line
            </div>
            <CustomCheckbox 
              label={`Median PB Benchmark (${stats.medianPB.toFixed(2)}x)`} 
              checked={showMedianRef} 
              onChange={() => setShowMedianRef(!showMedianRef)}
              colorClass="bg-amber-500 border-amber-500"
            />
          </>
        )}
      </div>
    </div>
  );
};
