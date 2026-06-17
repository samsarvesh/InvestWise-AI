import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { CompanyAnalysis } from '../types';
import { StatCard } from './StatCard';
import { ScoreBadge } from './ScoreBadge';
import { StockChart } from './StockChart';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Briefcase, 
  Activity,
  CheckCircle2,
  Info,
  Banknote,
  Coins,
  Percent,
  Calendar,
  Wallet,
  Star,
  ShieldCheck,
  PieChart as PieChartIcon,
  Gauge,
  TrendingDown
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisViewProps {
  data: CompanyAnalysis;
  onAddToWatchlist?: () => void;
  isWatched?: boolean;
}

const parsePrice = (priceStr: string | undefined): number => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const parseFloatSafe = (val: string | undefined): number => {
  if (!val) return 0;
  const match = val.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (match) {
    return parseFloat(match[0]) || 0;
  }
  return 0;
};

const calculateVolatilityMetrics = (chartData: Array<{ date: string; price: number }>) => {
  if (!chartData || chartData.length < 5) {
    return {
      annualizedVol: 0,
      dailyVol: 0,
      avgDailyMove: 0,
      maxDrawdown: 0,
      riskLevel: 'Stable/Unavailable',
      description: 'Insufficient historical pricing data to evaluate volatility metrics.'
    };
  }

  // Sort chronologically ascending
  const sorted = [...chartData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // We want the most recent 30 trading/daily points for the "30-day historical volatility"
  // Let's take the last 30 points of the sorted array
  const recentPoints = sorted.slice(-30);
  
  // Calculate daily returns for these points
  const returns: number[] = [];
  
  for (let i = 1; i < recentPoints.length; i++) {
    const prev = recentPoints[i-1].price;
    const curr = recentPoints[i].price;
    if (prev > 0) {
      const ret = (curr - prev) / prev;
      returns.push(ret);
    }
  }

  // Max drawdown over the whole chartData to give a better historical picture
  let localMax = 0;
  let tempMaxDrawdown = 0;
  for (const point of sorted) {
    if (point.price > localMax) {
      localMax = point.price;
    } else if (localMax > 0) {
      const dd = (localMax - point.price) / localMax;
      if (dd > tempMaxDrawdown) {
        tempMaxDrawdown = dd;
      }
    }
  }

  if (returns.length < 2) {
    return {
      annualizedVol: 0,
      dailyVol: 0,
      avgDailyMove: 0,
      maxDrawdown: tempMaxDrawdown * 100,
      riskLevel: 'Stable/Steady',
      description: 'Pricing data is flat or contains too few periods to calculate variance.'
    };
  }

  // Average return
  const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  
  // Variance
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / (returns.length - 1);
  const dailyVol = Math.sqrt(variance);
  
  // Annualized Volatility: daily standard deviation * sqrt(252 trading days)
  const annualizedVol = dailyVol * Math.sqrt(252);
  
  // Average absolute daily move
  const avgDailyMove = returns.reduce((sum, val) => sum + Math.abs(val), 0) / returns.length;

  let riskLevel = 'Moderate';
  let description = '';
  const volPct = annualizedVol * 100;

  if (volPct < 15) {
    riskLevel = 'Low';
    description = 'Stable price actions with minimal day-to-day fluctuations. Suitable for defensive or yield-focused investing.';
  } else if (volPct < 30) {
    riskLevel = 'Moderate';
    description = 'Standard market variance with sensible price fluctuations. Balanced risk-reward profile suitable for growth.';
  } else if (volPct < 45) {
    riskLevel = 'High';
    description = 'Elevated day-to-day variance indicating rapid trading interest and momentum swing potential.';
  } else {
    riskLevel = 'Extreme';
    description = 'Very wide volatility ranges. Prone to aggressive price gaps, speculative plays, and severe near-term shocks.';
  }

  return {
    annualizedVol: volPct,
    dailyVol: dailyVol * 100,
    avgDailyMove: avgDailyMove * 100,
    maxDrawdown: tempMaxDrawdown * 100,
    riskLevel,
    description
  };
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onAddToWatchlist, isWatched }) => {
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [animKey, setAnimKey] = useState(0);

  const volatilityMetrics = useMemo(() => {
    return calculateVolatilityMetrics(data.chartData);
  }, [data.chartData]);

  useEffect(() => {
    const currentNum = parsePrice(data.currentPrice);
    if (prevPrice !== null && prevPrice !== currentNum) {
      if (currentNum > prevPrice) {
        setDirection('up');
      } else if (currentNum < prevPrice) {
        setDirection('down');
      }
      setAnimKey((prev) => prev + 1);

      const timer = setTimeout(() => {
        setDirection('neutral');
      }, 2500);
      return () => clearTimeout(timer);
    }
    setPrevPrice(currentNum);
  }, [data.currentPrice, data.lastUpdated]);

  const getColor = () => {
    if (direction === 'up') return 'text-emerald-500 dark:text-emerald-400';
    if (direction === 'down') return 'text-rose-500 dark:text-rose-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[95%] mx-auto px-4 py-12 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif font-bold italic text-slate-950 dark:text-white">{data.name}</h1>
            <div className="flex flex-col">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-mono font-bold text-gray-600 dark:text-gray-400">
                {data.symbol}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {data.sector} • {data.industry}
            </p>
            <p className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4 ml-1" />
              Last Updated: {data.lastUpdated}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onAddToWatchlist}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-sm shadow-lg ${
              isWatched 
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 shadow-amber-600/10' 
                : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 shadow-gray-600/5 hover:shadow-emerald-600/20'
            }`}
          >
            <Star className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
            {isWatched ? 'In Favorites' : 'Add to Favorite'}
          </button>
          <ScoreBadge score={data.aiScore} />
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 glass-card border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/5">
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Current Price</span>
          </div>
          <div className="flex items-center gap-3 py-1 flex-wrap min-h-[3.5rem]">
            <motion.div
              key={animKey}
              initial={{ 
                y: direction === 'up' ? 14 : direction === 'down' ? -14 : 0,
                opacity: 0.5 
              }}
              animate={{ 
                y: 0, 
                opacity: 1 
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 220, 
                damping: 16 
              }}
              className={`text-5xl font-sans font-black tracking-tight transition-colors duration-700 ${getColor()}`}
            >
              {data.currentPrice}
            </motion.div>
            
            {direction !== 'neutral' && (
              <motion.span
                initial={{ scale: 0, y: direction === 'up' ? 8 : -8 }}
                animate={{ scale: 1, y: 0 }}
                className={`text-2xl font-black ${
                  direction === 'up' ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {direction === 'up' ? '▲' : '▼'}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time market valuation per share</p>
        </div>
        <div className="p-8 glass-card border-amber-100 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-900/5">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Market Cap</span>
          </div>
          <div className="text-5xl font-sans font-black text-amber-600 dark:text-amber-400 tracking-tight">{data.fundamentals.marketCap}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Total value of all outstanding shares</p>
        </div>
      </div>

      {/* Other Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="P/E Ratio" 
          value={data.fundamentals.peRatio} 
          icon={Activity} 
          color="text-emerald-500" 
          description={
            data.isFund 
              ? "Fund average ratio" 
              : data.sectorPeRatio 
                ? `${parseFloatSafe(data.fundamentals.peRatio) <= parseFloatSafe(data.sectorPeRatio) ? "Lower" : "Higher"} than Sector (${data.sectorPeRatio})`
                : "Sector comparison ready"
          }
        />
        <StatCard 
          label="P/B Ratio" 
          value={data.pbRatio} 
          icon={BarChart3} 
          color="text-indigo-500" 
          description={
            data.isFund 
              ? "Fund asset ratio" 
              : data.sectorPbRatio 
                ? `${parseFloatSafe(data.pbRatio) <= parseFloatSafe(data.sectorPbRatio) ? "Lower" : "Higher"} than Sector (${data.sectorPbRatio})`
                : "Sector comparison ready"
          }
        />
        <StatCard label="Book Value" value={data.bookValue} icon={Wallet} color="text-purple-500" />
        <StatCard label="ROE (%)" value={data.roe} icon={Percent} color="text-rose-500" />
        <StatCard label="ROCE (%)" value={data.roce} icon={Activity} color="text-orange-500" />
        <StatCard label="CAGR 1Y" value={data.cagr1yr} icon={Calendar} color="text-teal-500" />
        <StatCard label="CAGR 5Y" value={data.cagr5yr} icon={Calendar} color="text-cyan-500" />
        <StatCard label="CAGR 10Y" value={data.cagr10yr} icon={Calendar} color="text-sky-500" />
      </div>

      {/* Sector Valuation Comparison Panel */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-950 dark:text-white">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Valuation vs Sector Benchmarks
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Comparing the asset and earnings valuation ratios of the target relative to the sector/industry average benchmarks.
          </p>
        </div>

        {data.isFund ? (
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold">Portfolio Aggregates:</span> Valuation metrics represent weighted averages of the underlying holdings of the fund. We contrast these statistics against categorized peer group distributions below.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PE Card */}
            <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Price-to-Earnings comparison</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  parseFloatSafe(data.fundamentals.peRatio) <= parseFloatSafe(data.sectorPeRatio)
                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                    : 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                }`}>
                  {parseFloatSafe(data.fundamentals.peRatio) <= parseFloatSafe(data.sectorPeRatio) ? 'Favorable / Lower' : 'Premium / Higher'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Company P/E</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{data.fundamentals.peRatio || 'N/A'}</div>
                </div>
                <div className="border-l border-slate-200 dark:border-white/10 pl-4">
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Sector Avg P/E</span>
                  <div className="text-3xl font-black text-slate-600 dark:text-slate-400 mt-0.5">{data.sectorPeRatio || 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      parseFloatSafe(data.fundamentals.peRatio) <= parseFloatSafe(data.sectorPeRatio)
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-rose-400'
                    }`}
                    style={{ 
                      width: `${Math.min(
                        Math.max(
                          (parseFloatSafe(data.fundamentals.peRatio) / (parseFloatSafe(data.sectorPeRatio) || 1)) * 50, 
                          12
                        ), 
                        100
                      )}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  <span>Below Average</span>
                  <span>Above Average</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {parseFloatSafe(data.fundamentals.peRatio) <= parseFloatSafe(data.sectorPeRatio) ? (
                  <span className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      Company's P/E of <strong className="text-slate-900 dark:text-white">{data.fundamentals.peRatio}</strong> is <strong className="text-emerald-500 dark:text-emerald-400">lower</strong> than the sector average of <strong className="text-slate-900 dark:text-white">{data.sectorPeRatio}</strong>, representing a potential discount pricing opportunity.
                    </span>
                  </span>
                ) : (
                  <span className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Company's P/E of <strong className="text-slate-900 dark:text-white">{data.fundamentals.peRatio}</strong> is <strong className="text-amber-500 dark:text-amber-400">higher</strong> than the sector average of <strong className="text-slate-900 dark:text-white">{data.sectorPeRatio}</strong>, reflecting a high-growth valuation premium.
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* PB Card */}
            <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Price-to-Book comparison</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  parseFloatSafe(data.pbRatio) <= parseFloatSafe(data.sectorPbRatio)
                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                    : 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                }`}>
                  {parseFloatSafe(data.pbRatio) <= parseFloatSafe(data.sectorPbRatio) ? 'Favorable / Lower' : 'Premium / Higher'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Company P/B</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{data.pbRatio || 'N/A'}</div>
                </div>
                <div className="border-l border-slate-200 dark:border-white/10 pl-4">
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Sector Avg P/B</span>
                  <div className="text-3xl font-black text-slate-600 dark:text-slate-400 mt-0.5">{data.sectorPbRatio || 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      parseFloatSafe(data.pbRatio) <= parseFloatSafe(data.sectorPbRatio)
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-rose-400'
                    }`}
                    style={{ 
                      width: `${Math.min(
                        Math.max(
                          (parseFloatSafe(data.pbRatio) / (parseFloatSafe(data.sectorPbRatio) || 1)) * 50, 
                          12
                        ), 
                        100
                      )}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  <span>Below Average</span>
                  <span>Above Average</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {parseFloatSafe(data.pbRatio) <= parseFloatSafe(data.sectorPbRatio) ? (
                  <span className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      Company's P/B of <strong className="text-slate-900 dark:text-white">{data.pbRatio}</strong> is <strong className="text-emerald-500 dark:text-emerald-400">lower</strong> than the sector average of <strong className="text-slate-900 dark:text-white">{data.sectorPbRatio}</strong>, suggesting underlying assets are priced attractively.
                    </span>
                  </span>
                ) : (
                  <span className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Company's P/B of <strong className="text-slate-900 dark:text-white">{data.pbRatio}</strong> is <strong className="text-amber-500 dark:text-amber-400">higher</strong> than the sector average of <strong className="text-slate-900 dark:text-white">{data.sectorPbRatio}</strong>, reflecting premium asset valuations or strong return on assets.
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <StockChart data={data.chartData} />

      {/* Volatility & Risk Analysis Section */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-950 dark:text-white">
            <Gauge className="w-5 h-5 text-indigo-500 animate-pulse" />
            Volatility & Price Risk Analysis (30-Day)
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Computed historical returns metrics over the trailing 30 daily price cycles to measure recent asset variance and maximum peak-to-trough drawdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main gauge / risk indicator */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Annualized Volatility Benchmark</span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                volatilityMetrics.riskLevel === 'Low'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                  : volatilityMetrics.riskLevel === 'Moderate'
                    ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30'
                    : volatilityMetrics.riskLevel === 'High'
                      ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30'
                      : 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30'
              }`}>
                {volatilityMetrics.riskLevel} Volatility
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 py-2">
              <div className="text-center md:text-left shrink-0">
                <div className="text-5xl font-sans font-black tracking-tight text-slate-950 dark:text-white">
                  {volatilityMetrics.annualizedVol.toFixed(2)}%
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Annualized Price Variance</div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {/* Visual linear risk meter */}
                <div className="space-y-1.5">
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 relative">
                    <div 
                      className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                      style={{ width: '100%', opacity: 0.25 }}
                    />
                    {/* Active needle positioned dynamically */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-lg shadow-indigo-500/50 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `${Math.min(Math.max((volatilityMetrics.annualizedVol / 60) * 100, 4), 96)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                    <span className="text-emerald-500">Stable (&lt;15%)</span>
                    <span className="text-amber-500">Moderate (15-30%)</span>
                    <span className="text-rose-500">High (30%+)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                  {volatilityMetrics.description}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats on volatility */}
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Average Daily Move</span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">±{volatilityMetrics.avgDailyMove.toFixed(2)}%</div>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Daily Standard Dev</span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{volatilityMetrics.dailyVol.toFixed(3)}%</div>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Max Dynamic Drawdown</span>
                <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">-{volatilityMetrics.maxDrawdown.toFixed(2)}%</div>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Fundamentals & Technicals */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-950 dark:text-white">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Financial Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Annual Revenue</span>
                <div className="text-4xl font-sans font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{data.fundamentals.revenue}</div>
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-2 font-medium">Total top-line earnings generated</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Net Profit</span>
                <div className="text-4xl font-sans font-black text-blue-600 dark:text-blue-400 tracking-tight">{data.fundamentals.profit}</div>
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-2 font-medium">Bottom-line net income after taxes</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-sans">
              {data.fundamentals.summary}
            </p>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">Sector Context</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">{data.sectorPerformance}</p>
            </div>
          </section>

          <section className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-950 dark:text-white">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Technical Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Current Trend</h4>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{data.technicalAnalysis.trend}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Chart Patterns</h4>
                  <p className="text-gray-700 dark:text-gray-400 text-sm">{data.technicalAnalysis.chartPatterns}</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-2">Key Levels</h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm font-mono">{data.technicalAnalysis.keyLevels}</p>
              </div>
            </div>
          </section>

          {data.dividendAndShareholding && (
            <section className="glass-card p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-950 dark:text-white">
                <PieChartIcon className="w-5 h-5 text-purple-600" />
                {data.isFund ? 'Yield & Asset Allocation' : 'Dividend & Shareholding'}
              </h2>
              
              <div className="space-y-8">
                {/* Dividend Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        {data.isFund ? 'Yield (IDCW)' : 'Dividend Yield'}
                      </span>
                      <div className="text-2xl font-black text-purple-700 dark:text-purple-400">{data.dividendAndShareholding.dividendYield}</div>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Banknote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        {data.isFund ? 'Expense Ratio' : 'Payout Ratio'}
                      </span>
                      <div className="text-2xl font-black text-purple-700 dark:text-purple-400">{data.dividendAndShareholding.payoutRatio}</div>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Shareholding Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
                    {data.isFund ? 'Asset Allocation' : 'Ownership Breakdown'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        {data.isFund ? 'Equity' : 'Promoters'}
                      </span>
                      <div className="text-xl font-black text-indigo-700 dark:text-indigo-400">{data.dividendAndShareholding.promoterHolding}</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        {data.isFund ? 'Debt' : 'FIIs'}
                      </span>
                      <div className="text-xl font-black text-blue-700 dark:text-blue-400">{data.dividendAndShareholding.fiiHolding}</div>
                    </div>
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-2xl border border-cyan-100 dark:border-cyan-900/20">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        {data.isFund ? 'Cash' : 'DIIs'}
                      </span>
                      <div className="text-xl font-black text-cyan-700 dark:text-cyan-400">{data.dividendAndShareholding.diiHolding}</div>
                    </div>
                    <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/20">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        {data.isFund ? 'Others' : 'Public'}
                      </span>
                      <div className="text-xl font-black text-teal-700 dark:text-teal-400">{data.dividendAndShareholding.publicHolding}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    {data.dividendAndShareholding.summary}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Peers & Risks */}
        <div className="space-y-8">
          <section className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-950 dark:text-white">
              <Users className="w-5 h-5 text-indigo-600" />
              Professional Peer Comparison
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5 mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Competitor</th>
                    <th className="px-4 py-3 text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {data.peerComparison.peers.map((peer, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{peer.name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                          {peer.performance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
              {data.peerComparison.summary}
            </p>
          </section>

          <section className="glass-card p-8 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              Key Strengths
            </h2>
            <ul className="space-y-3">
              {data.keyStrengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-card p-8 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              Risk Factors
            </h2>
            <ul className="space-y-3">
              {data.riskFactors.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-rose-800 dark:text-rose-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Final Recommendation - Shrunken as requested */}
      <section className="glass-card p-6 border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500 rounded-xl text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">AI Recommendation</h2>
        </div>
        <div className="text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium markdown-body">
          <Markdown>{data.recommendation}</Markdown>
        </div>
      </section>
    </motion.div>
  );
};
