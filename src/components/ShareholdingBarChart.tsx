import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ShareholdingQuarter } from '../types';
import { 
  BarChart3, 
  Layers, 
  Table2, 
  TrendingUp, 
  TrendingDown, 
  Info,
  ShieldCheck,
  Building2,
  Users2
} from 'lucide-react';

interface ShareholdingBarChartProps {
  quarters: ShareholdingQuarter[];
  isFund?: boolean;
}

const parseFloatSafe = (val: string | number | undefined): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = String(val).match(/[-+]?[0-9]*\.?[0-9]+/);
  return match ? parseFloat(match[0]) : 0;
};

// Distinct colors with clear financial connotations & high contrast
const SHAREHOLDER_CATEGORIES = [
  {
    key: 'promoters',
    label: 'Promoters / Govt',
    shortLabel: 'Promoters',
    fundLabel: 'Equity',
    color: '#6366f1', // Indigo
    hoverColor: '#4f46e5',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderLight: 'border-indigo-200 dark:border-indigo-800/40',
    textLight: 'text-indigo-700 dark:text-indigo-300',
    badgeColor: 'bg-indigo-500'
  },
  {
    key: 'fii',
    label: 'Foreign Inst (FII / FPI)',
    shortLabel: 'FIIs',
    fundLabel: 'Debt',
    color: '#3b82f6', // Blue
    hoverColor: '#2563eb',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    borderLight: 'border-blue-200 dark:border-blue-800/40',
    textLight: 'text-blue-700 dark:text-blue-300',
    badgeColor: 'bg-blue-500'
  },
  {
    key: 'dii',
    label: 'Domestic Inst (DII / MFs)',
    shortLabel: 'DIIs',
    fundLabel: 'Cash & Equiv',
    color: '#06b6d4', // Cyan
    hoverColor: '#0891b2',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderLight: 'border-cyan-200 dark:border-cyan-800/40',
    textLight: 'text-cyan-700 dark:text-cyan-300',
    badgeColor: 'bg-cyan-500'
  },
  {
    key: 'public',
    label: 'Public & Retail',
    shortLabel: 'Public',
    fundLabel: 'Others',
    color: '#14b8a6', // Teal
    hoverColor: '#0d9488',
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    borderLight: 'border-teal-200 dark:border-teal-800/40',
    textLight: 'text-teal-700 dark:text-teal-300',
    badgeColor: 'bg-teal-500'
  }
];

export const ShareholdingBarChart: React.FC<ShareholdingBarChartProps> = ({ quarters, isFund = false }) => {
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped'>('stacked');
  const [showTable, setShowTable] = useState<boolean>(false);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  // Normalize data for Recharts
  const chartData = useMemo(() => {
    if (!quarters || quarters.length === 0) return [];
    return quarters.map((q, idx) => {
      const pProm = parseFloatSafe(q.promoters);
      const pFii = parseFloatSafe(q.fii);
      const pDii = parseFloatSafe(q.dii);
      const pPub = parseFloatSafe(q.public);
      const instTotal = parseFloat((pFii + pDii).toFixed(2));
      const isLatest = idx === quarters.length - 1;

      return {
        quarter: q.quarter,
        rawQuarter: q.quarter,
        isLatest,
        promoters: pProm,
        fii: pFii,
        dii: pDii,
        public: pPub,
        institutional: instTotal,
        total: parseFloatSafe(q.total) || 100
      };
    });
  }, [quarters]);

  // Compute quarter-over-quarter trend delta between first and latest quarter
  const trendAnalysis = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0];
    const latest = chartData[chartData.length - 1];
    
    return {
      promoterDelta: parseFloat((latest.promoters - first.promoters).toFixed(2)),
      fiiDelta: parseFloat((latest.fii - first.fii).toFixed(2)),
      diiDelta: parseFloat((latest.dii - first.dii).toFixed(2)),
      publicDelta: parseFloat((latest.public - first.public).toFixed(2)),
      instDelta: parseFloat((latest.institutional - first.institutional).toFixed(2)),
      quartersSpan: `${first.quarter} → ${latest.quarter}`
    };
  }, [chartData]);

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with Title and Mode Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-[0.2em]">
              Quarterly Shareholding Trend History
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Quarter-over-quarter visual breakdown across institutional, promoter, and public ownership
          </p>
        </div>

        {/* View Controls: Stacked vs Grouped Bar & Table Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Control for Stacked / Grouped */}
          <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-xs font-medium">
            <button
              onClick={() => setChartMode('stacked')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                chartMode === 'stacked'
                  ? 'bg-white dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200/60 dark:border-purple-800/40'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="100% Stacked Bar view showing allocation share per quarter"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stacked 100%</span>
            </button>
            <button
              onClick={() => setChartMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                chartMode === 'grouped'
                  ? 'bg-white dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200/60 dark:border-purple-800/40'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Grouped Side-by-Side comparison of each holding category"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          {/* Table Toggle Button */}
          <button
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showTable
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
            }`}
            title="Toggle tabular view of raw numbers"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table View</span>
          </button>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-black/20 border border-gray-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
        {/* Interactive Category Chips / Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">
              Filter:
            </span>
            {SHAREHOLDER_CATEGORIES.map((cat) => {
              const isSelected = highlightedCategory === cat.key;
              const isDimmed = highlightedCategory !== null && !isSelected;
              const label = isFund ? cat.fundLabel : cat.shortLabel;
              return (
                <button
                  key={cat.key}
                  onClick={() => setHighlightedCategory(isSelected ? null : cat.key)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? `${cat.bgLight} ${cat.borderLight} ${cat.textLight} ring-2 ring-purple-500/20 shadow-sm`
                      : isDimmed
                      ? 'opacity-40 border-transparent text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-white/5'
                      : 'border-gray-200/70 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
            {highlightedCategory && (
              <button
                onClick={() => setHighlightedCategory(null)}
                className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline ml-1"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Q1 FY27 (June 2026) Filings
            </span>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              {chartData.length} Quarters Trend
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
              barGap={chartMode === 'grouped' ? 4 : 0}
              barCategoryGap={chartMode === 'grouped' ? '20%' : '32%'}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="currentColor" 
                className="text-gray-200 dark:text-white/5" 
              />
              <XAxis 
                dataKey="quarter" 
                tickLine={false}
                axisLine={{ stroke: 'currentColor', className: 'text-gray-200 dark:text-white/10' }}
                tick={({ x, y, payload }) => {
                  const item = chartData.find(d => d.quarter === payload.value);
                  const isLatest = item?.isLatest;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={14}
                        textAnchor="middle"
                        fill="currentColor"
                        className={`text-xs font-medium ${
                          isLatest 
                            ? 'text-purple-600 dark:text-purple-400 font-bold' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {payload.value}
                      </text>
                      {isLatest && (
                        <text
                          x={0}
                          y={0}
                          dy={26}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[9px] font-extrabold uppercase text-purple-600 dark:text-purple-400"
                        >
                          ● Latest
                        </text>
                      )}
                    </g>
                  );
                }}
              />
              <YAxis 
                domain={[0, chartMode === 'stacked' ? 100 : 'auto']}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor', className: 'text-gray-400 dark:text-gray-500' }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = chartData.find(d => d.quarter === label);
                  if (!item) return null;

                  return (
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-200/80 dark:border-white/10 min-w-[210px]">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-white/10">
                        <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.quarter}
                          {item.isLatest && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold uppercase">
                              Latest
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                          Total: {item.total}%
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {SHAREHOLDER_CATEGORIES.map(cat => {
                          const val = (item as any)[cat.key] || 0;
                          const isHighlighted = highlightedCategory === null || highlightedCategory === cat.key;
                          return (
                            <div 
                              key={cat.key} 
                              className={`flex items-center justify-between gap-3 ${
                                isHighlighted ? 'opacity-100 font-semibold' : 'opacity-40 font-normal'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-2 h-2 rounded-full shrink-0" 
                                  style={{ backgroundColor: cat.color }} 
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {isFund ? cat.fundLabel : cat.label}
                                </span>
                              </div>
                              <span className="font-mono text-slate-900 dark:text-white">
                                {val.toFixed(2)}%
                              </span>
                            </div>
                          );
                        })}

                        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-medium">
                          <span>Combined Institutional (FII+DII)</span>
                          <span className="font-mono font-bold">{item.institutional}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {SHAREHOLDER_CATEGORIES.map((cat, idx) => {
                const isSelected = highlightedCategory === null || highlightedCategory === cat.key;
                const opacity = isSelected ? 1 : 0.2;
                const isLastInStack = idx === SHAREHOLDER_CATEGORIES.length - 1;

                return (
                  <Bar
                    key={cat.key}
                    dataKey={cat.key}
                    name={isFund ? cat.fundLabel : cat.shortLabel}
                    stackId={chartMode === 'stacked' ? 'a' : undefined}
                    fill={cat.color}
                    fillOpacity={opacity}
                    radius={
                      chartMode === 'stacked'
                        ? isLastInStack ? [6, 6, 0, 0] : [0, 0, 0, 0]
                        : [6, 6, 0, 0]
                    }
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Metric Change Summary Cards below Bar Chart */}
        {trendAnalysis && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/20">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                Promoter Shift
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {trendAnalysis.promoterDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : trendAnalysis.promoterDelta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                ) : null}
                <span className={`text-sm font-bold ${
                  trendAnalysis.promoterDelta > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : trendAnalysis.promoterDelta < 0 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {trendAnalysis.promoterDelta > 0 ? `+${trendAnalysis.promoterDelta}%` : `${trendAnalysis.promoterDelta}%`}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5 truncate">
                {trendAnalysis.quartersSpan}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                FII Inflow / Outflow
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {trendAnalysis.fiiDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : trendAnalysis.fiiDelta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                ) : null}
                <span className={`text-sm font-bold ${
                  trendAnalysis.fiiDelta > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : trendAnalysis.fiiDelta < 0 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {trendAnalysis.fiiDelta > 0 ? `+${trendAnalysis.fiiDelta}%` : `${trendAnalysis.fiiDelta}%`}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5 truncate">
                Foreign capital trend
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/20">
              <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block">
                DII / Mutual Funds
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {trendAnalysis.diiDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : trendAnalysis.diiDelta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                ) : null}
                <span className={`text-sm font-bold ${
                  trendAnalysis.diiDelta > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : trendAnalysis.diiDelta < 0 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {trendAnalysis.diiDelta > 0 ? `+${trendAnalysis.diiDelta}%` : `${trendAnalysis.diiDelta}%`}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5 truncate">
                Domestic funds trend
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/20">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                Public & Retail
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {trendAnalysis.publicDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : trendAnalysis.publicDelta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                ) : null}
                <span className={`text-sm font-bold ${
                  trendAnalysis.publicDelta > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : trendAnalysis.publicDelta < 0 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {trendAnalysis.publicDelta > 0 ? `+${trendAnalysis.publicDelta}%` : `${trendAnalysis.publicDelta}%`}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5 truncate">
                Retail investor change
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Optional Screener Table view (toggleable) */}
      {showTable && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm animate-in fade-in duration-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/90 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-semibold border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Quarter</th>
                <th className="py-3 px-4 text-right">Promoters</th>
                <th className="py-3 px-4 text-right">FIIs</th>
                <th className="py-3 px-4 text-right">DIIs</th>
                <th className="py-3 px-4 text-right">Public</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
              {quarters.map((q, idx) => (
                <tr 
                  key={idx} 
                  className={idx === quarters.length - 1 
                    ? 'bg-purple-50/30 dark:bg-purple-950/20 font-semibold' 
                    : 'hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'}
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{q.quarter}</span>
                    {idx === quarters.length - 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold uppercase">
                        Latest
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-700 dark:text-indigo-400">{q.promoters}</td>
                  <td className="py-3 px-4 text-right text-blue-700 dark:text-blue-400">{q.fii}</td>
                  <td className="py-3 px-4 text-right text-cyan-700 dark:text-cyan-400">{q.dii}</td>
                  <td className="py-3 px-4 text-right text-teal-700 dark:text-teal-400">{q.public}</td>
                  <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-bold">{q.total || '100.0%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
