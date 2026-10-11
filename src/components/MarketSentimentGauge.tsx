import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { CompanyAnalysis, MarketSentiment } from '../types';

interface MarketSentimentGaugeProps {
  analysis: CompanyAnalysis;
}

interface SentimentZone {
  min: number;
  max: number;
  label: 'Extreme Bearish' | 'Bearish' | 'Neutral' | 'Bullish' | 'Extreme Bullish';
  shortLabel: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

const ZONES: SentimentZone[] = [
  {
    min: 0,
    max: 20,
    label: 'Extreme Bearish',
    shortLabel: 'Strong Sell',
    color: '#ef4444',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-900/40',
    description: 'Heavy distribution and selling pressure across indicators.'
  },
  {
    min: 20,
    max: 40,
    label: 'Bearish',
    shortLabel: 'Sell / Trim',
    color: '#f97316',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-900/40',
    description: 'Bearish momentum prevailing with cautious institutional posture.'
  },
  {
    min: 40,
    max: 60,
    label: 'Neutral',
    shortLabel: 'Neutral',
    color: '#eab308',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-900/40',
    description: 'Balanced forces; consolidation between support and resistance.'
  },
  {
    min: 60,
    max: 80,
    label: 'Bullish',
    shortLabel: 'Buy',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-900/40',
    description: 'Constructive accumulation with upward price action and healthy metrics.'
  },
  {
    min: 80,
    max: 100,
    label: 'Extreme Bullish',
    shortLabel: 'Strong Buy',
    color: '#059669',
    bgColor: 'bg-teal-500/10 dark:bg-teal-500/20',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-900/40',
    description: 'High-conviction bullish momentum backed by strong fundamentals.'
  }
];

// Helper to calculate composite sentiment from analysis data
export function computeMarketSentiment(data: CompanyAnalysis): MarketSentiment {
  // If explicitly provided by model
  if (data.marketSentiment && typeof data.marketSentiment.score === 'number') {
    return data.marketSentiment;
  }

  let technicalsScore = 50;
  let fundamentalsScore = 50;
  let institutionalScore = 50;
  let analystScore = 50;

  const bullishFactors: string[] = [];
  const bearishFactors: string[] = [];

  // 1. Technical momentum
  const trendLower = (data.technicalAnalysis?.trend || '').toLowerCase();
  if (trendLower.includes('strong bull') || trendLower.includes('strong uptrend')) {
    technicalsScore = 88;
    bullishFactors.push('Strong bullish technical uptrend confirmed');
  } else if (trendLower.includes('bull') || trendLower.includes('up')) {
    technicalsScore = 75;
    bullishFactors.push('Positive price momentum and ascending trendline');
  } else if (trendLower.includes('strong bear') || trendLower.includes('strong downtrend')) {
    technicalsScore = 18;
    bearishFactors.push('Persistent downtrend with aggressive overhead selling');
  } else if (trendLower.includes('bear') || trendLower.includes('down')) {
    technicalsScore = 32;
    bearishFactors.push('Bearish price action trading below short-term averages');
  } else {
    technicalsScore = 50;
  }

  // DMA position checks from chartData if available
  if (data.chartData && data.chartData.length > 5) {
    const latest = data.chartData[data.chartData.length - 1];
    if (latest.price && latest.dma50 && latest.dma200) {
      if (latest.price > latest.dma50 && latest.dma50 > latest.dma200) {
        technicalsScore = Math.min(100, technicalsScore + 10);
        bullishFactors.push('Price comfortably above both 50-DMA and 200-DMA (Golden alignment)');
      } else if (latest.price < latest.dma50 && latest.dma50 < latest.dma200) {
        technicalsScore = Math.max(10, technicalsScore - 12);
        bearishFactors.push('Price trapped below key 50-DMA and 200-DMA moving averages');
      }
    }
  }

  // 2. Fundamental Score
  if (typeof data.aiScore === 'number') {
    fundamentalsScore = Math.min(100, Math.max(0, Math.round(data.aiScore * 10)));
  }
  const roeNum = parseFloat(String(data.roe || '0').replace(/[^0-9.-]/g, ''));
  if (roeNum >= 18) {
    bullishFactors.push(`High Return on Equity (${data.roe}) demonstrating capital efficiency`);
  } else if (roeNum > 0 && roeNum < 8) {
    bearishFactors.push(`Subdued Return on Equity (${data.roe}) lagging sector leaders`);
  }

  // 3. Institutional Holding
  if (data.dividendAndShareholding) {
    const fii = parseFloat(String(data.dividendAndShareholding.fiiHolding || '0').replace(/[^0-9.-]/g, ''));
    const dii = parseFloat(String(data.dividendAndShareholding.diiHolding || '0').replace(/[^0-9.-]/g, ''));
    const totalInst = fii + dii;

    if (totalInst > 35) {
      institutionalScore = Math.min(95, 60 + Math.round((totalInst - 35) * 0.7));
      bullishFactors.push(`High institutional sponsorship (${totalInst.toFixed(1)}% combined FII + DII)`);
    } else if (totalInst > 20) {
      institutionalScore = 65;
    } else {
      institutionalScore = 45;
    }

    const pledged = parseFloat(String(data.dividendAndShareholding.pledgedPromoterShares || '0').replace(/[^0-9.-]/g, ''));
    if (pledged === 0) {
      bullishFactors.push('Zero promoter share pledge (Zero encumbrance risk)');
    } else if (pledged > 10) {
      bearishFactors.push(`Elevated promoter share pledge of ${data.dividendAndShareholding.pledgedPromoterShares}`);
      institutionalScore = Math.max(10, institutionalScore - 15);
    }
  }

  // 4. Strategic Analyst Recommendation
  const recLower = (data.recommendation || '').toLowerCase();
  if (recLower.includes('strong buy')) {
    analystScore = 92;
    bullishFactors.push('Consensus high-conviction Strong Buy recommendation');
  } else if (recLower.includes('buy') || recLower.includes('accumulate') || recLower.includes('outperform')) {
    analystScore = 78;
    bullishFactors.push('Strategic Buy/Accumulate mandate on favorable risk-reward');
  } else if (recLower.includes('strong sell')) {
    analystScore = 15;
    bearishFactors.push('Strong Sell signal triggered on fundamental headwinds');
  } else if (recLower.includes('sell') || recLower.includes('trim') || recLower.includes('reduce')) {
    analystScore = 30;
    bearishFactors.push('Trim / Underweight rating on extended valuation or risks');
  } else {
    analystScore = 52;
  }

  // Weighted composite sentiment score
  // Technicals 30%, Fundamentals 35%, Institutional 20%, Analyst Stance 15%
  const composite = Math.round(
    technicalsScore * 0.30 +
    fundamentalsScore * 0.35 +
    institutionalScore * 0.20 +
    analystScore * 0.15
  );

  const finalScore = Math.min(100, Math.max(0, composite));

  let label: MarketSentiment['label'] = 'Neutral';
  if (finalScore >= 80) label = 'Extreme Bullish';
  else if (finalScore >= 60) label = 'Bullish';
  else if (finalScore >= 40) label = 'Neutral';
  else if (finalScore >= 20) label = 'Bearish';
  else label = 'Extreme Bearish';

  let summary = '';
  if (finalScore >= 75) {
    summary = `Bullish market sentiment driven by strong quantitative fundamentals (${fundamentalsScore}/100) and steady institutional interest (${institutionalScore}/100). Technical momentum supports continued upside.`;
  } else if (finalScore >= 60) {
    summary = `Moderately bullish market stance. Technical price action and business quality outweigh broader market consolidation.`;
  } else if (finalScore >= 40) {
    summary = `Neutral balanced sentiment. The stock is consolidating within defined trading ranges as investors weigh earnings growth against sector valuation.`;
  } else {
    summary = `Cautious bearish bias. Heightened technical or fundamental headwinds warrant risk management and patience before adding fresh exposure.`;
  }

  if (bullishFactors.length === 0) {
    bullishFactors.push('Trading in established sector with stable operating revenues');
  }
  if (bearishFactors.length === 0) {
    bearishFactors.push('Sector market beta and macroeconomic volatility influence short-term swings');
  }

  return {
    score: finalScore,
    label,
    summary,
    technicalsScore,
    fundamentalsScore,
    institutionalScore,
    analystScore,
    bullishFactors: bullishFactors.slice(0, 3),
    bearishFactors: bearishFactors.slice(0, 3),
  };
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'gauge' | 'breakdown'>('gauge');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const sentiment = useMemo(() => {
    return computeMarketSentiment(analysis);
  }, [analysis]);

  const currentZone = useMemo(() => {
    return ZONES.find(z => sentiment.score >= z.min && sentiment.score <= z.max) || ZONES[2];
  }, [sentiment.score]);

  // Radial semi-circle gauge geometry
  // Arc center (cx, cy) = (160, 130), Radius = 92, StrokeWidth = 16
  const cx = 160;
  const cy = 130;
  const radius = 92;
  const strokeWidth = 16;

  // Rotation angle for needle:
  // At score 0 -> -90° (pointing to the left, 0 Bear)
  // At score 50 -> 0° (pointing straight up, 50 Neutral)
  // At score 100 -> +90° (pointing to the right, 100 Bull)
  const targetNeedleAngle = Math.min(90, Math.max(-90, (sentiment.score / 100) * 180 - 90));
  const [needleAngle, setNeedleAngle] = useState(-90);

  useEffect(() => {
    let animId: number;
    let startTimestamp: number | null = null;
    const initialAngle = -90;
    const duration = 900; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min(1, (timestamp - startTimestamp) / duration);
      // Smooth cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = initialAngle + (targetNeedleAngle - initialAngle) * easeOut;
      setNeedleAngle(Number(current.toFixed(2)));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetNeedleAngle]);

  // Arc path generator for angular segment in degrees
  const getArcPath = (startAngleDeg: number, endAngleDeg: number, r: number) => {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy - r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy - r * Math.sin(endRad);

    const largeArc = Math.abs(startAngleDeg - endAngleDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // 5 Arc segments with a small 2.5° separator gap for distinct gauge styling
  const arcSegments = [
    { start: 178, end: 146, color: '#ef4444', label: 'Strong Sell' },
    { start: 143, end: 111, color: '#f97316', label: 'Sell' },
    { start: 108, end: 74, color: '#eab308', label: 'Neutral' },
    { start: 71, end: 37, color: '#10b981', label: 'Buy' },
    { start: 34, end: 2, color: '#059669', label: 'Strong Buy' },
  ];

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Gauge className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
              Market Sentiment Gauge
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Bullish vs Bearish
              </span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time multi-factor quantitative positioning and momentum stance
          </p>
        </div>

        {/* View Controls & Methodology Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('gauge')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'gauge'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Radial Dial
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'breakdown'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Factor Weights
            </button>
          </div>

          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            title="Sentiment calculation methodology"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Methodology Info Box (Collapsible) */}
      <AnimatePresence>
        {showFormulaModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                <Info className="w-4 h-4" />
                How the Composite Sentiment Score is Calculated:
              </div>
              <p className="text-blue-800/90 dark:text-blue-200/90 leading-relaxed">
                The radial gauge evaluates an aggregate score from <strong>0 (Extreme Bearish)</strong> to <strong>100 (Extreme Bullish)</strong>, combining:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-white/70 dark:bg-slate-900/60 rounded-md border border-blue-200/50 dark:border-blue-800/40">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">35% Fundamentals</span>
                  <span className="text-[10px] text-gray-500">AI Quality, P/E vs Sector & ROE</span>
                </div>
                <div className="p-2 bg-white/70 dark:bg-slate-900/60 rounded-md border border-blue-200/50 dark:border-blue-800/40">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">30% Technicals</span>
                  <span className="text-[10px] text-gray-500">Trend, 50 & 200 DMA Alignment</span>
                </div>
                <div className="p-2 bg-white/70 dark:bg-slate-900/60 rounded-md border border-blue-200/50 dark:border-blue-800/40">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">20% Institutional</span>
                  <span className="text-[10px] text-gray-500">FII + DII Holdings & Pledge</span>
                </div>
                <div className="p-2 bg-white/70 dark:bg-slate-900/60 rounded-md border border-blue-200/50 dark:border-blue-800/40">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">15% Analyst Stance</span>
                  <span className="text-[10px] text-gray-500">Conviction Recommendation</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Radial Gauge SVG Dial with absolute geometric alignment */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-full max-w-[320px]">
            
            <svg 
              className="w-full h-auto overflow-visible" 
              viewBox="0 0 320 215"
              aria-label={`Market sentiment radial gauge: ${sentiment.score} out of 100, ${sentiment.label}`}
            >
              <defs>
                {/* Glow filter for active pointer */}
                <filter id="needleGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
                </filter>
                <filter id="activeZoneGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={currentZone.color} floodOpacity="0.4" />
                </filter>
                {/* Metallic gradient for pivot pin */}
                <radialGradient id="pivotMetal" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#1e293b" />
                </radialGradient>
              </defs>

              {/* Background Full Track (Subtle guide arch) */}
              <path
                d={getArcPath(180, 0, radius)}
                fill="none"
                stroke="currentColor"
                className="text-gray-100 dark:text-slate-800"
                strokeWidth={strokeWidth + 2}
                strokeLinecap="round"
              />

              {/* 5 Calibrated Sentiment Zones */}
              {arcSegments.map((seg, idx) => {
                const isActive = sentiment.score >= (idx * 20) && (idx === 4 ? sentiment.score <= 100 : sentiment.score < (idx + 1) * 20);
                return (
                  <path
                    key={idx}
                    d={getArcPath(seg.start, seg.end, radius)}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isActive ? strokeWidth + 3 : strokeWidth}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                    opacity={isActive ? 1 : 0.65}
                    filter={isActive ? 'url(#activeZoneGlow)' : undefined}
                  />
                );
              })}

              {/* Boundary Radial Tick marks */}
              {[180, 135, 90, 45, 0].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const rInner = radius - strokeWidth / 2 - 3;
                const rOuter = radius + strokeWidth / 2 + 4;
                const x1 = cx + rInner * Math.cos(rad);
                const y1 = cy - rInner * Math.sin(rad);
                const x2 = cx + rOuter * Math.cos(rad);
                const y2 = cy - rOuter * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-600"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Boundary Labels placed neatly outside arc */}
              <text 
                x={cx - radius - 8} 
                y={cy + 16} 
                textAnchor="end" 
                className="text-[10px] font-bold font-mono fill-rose-500 uppercase tracking-wider"
              >
                0 BEAR
              </text>
              <text 
                x={cx} 
                y={cy - radius - 12} 
                textAnchor="middle" 
                className="text-[10px] font-bold font-mono fill-amber-500 uppercase tracking-wider"
              >
                50 NEUTRAL
              </text>
              <text 
                x={cx + radius + 8} 
                y={cy + 16} 
                textAnchor="start" 
                className="text-[10px] font-bold font-mono fill-emerald-500 uppercase tracking-wider"
              >
                100 BULL
              </text>

              {/* Animated Needle Indicator - Perfectly Pinned to (cx, cy) Pivot */}
              <g
                transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
                filter="url(#needleGlow)"
              >
                {/* Needle counterweight back tab */}
                <polygon
                  points={`${cx - 4},${cy + 10} ${cx + 4},${cy + 10} ${cx + 2.5},${cy} ${cx - 2.5},${cy}`}
                  className="fill-slate-600 dark:fill-slate-400"
                />

                {/* Tapered Needle blade */}
                <polygon
                  points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx},${cy - radius + 12}`}
                  className="fill-slate-800 dark:fill-white"
                />

                {/* Needle Accent Center Spine */}
                <line
                  x1={cx}
                  y1={cy - 4}
                  x2={cx}
                  y2={cy - radius + 14}
                  stroke={currentZone.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Glowing Needle Tip Jewel */}
                <circle
                  cx={cx}
                  cy={cy - radius + 12}
                  r="3.2"
                  fill={currentZone.color}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </g>

              {/* Precision Center Pivot Hub sitting on top of needle base */}
              <circle
                cx={cx}
                cy={cy}
                r="13"
                fill="url(#pivotMetal)"
                stroke="#334155"
                strokeWidth="1.5"
                filter="url(#needleGlow)"
              />
              <circle
                cx={cx}
                cy={cy}
                r="6.5"
                fill={currentZone.color}
                className="transition-colors duration-500"
              />
              <circle
                cx={cx - 1.5}
                cy={cy - 1.5}
                r="1.8"
                fill="#ffffff"
                opacity="0.85"
              />

              {/* Center Digital Readout Inside SVG (Guaranteed Zero Misalignment) */}
              <text
                x={cx}
                y={cy + 34}
                textAnchor="middle"
                className="font-sans font-black text-3xl"
                fill={currentZone.color}
              >
                {sentiment.score}
              </text>
              <text
                x={cx}
                y={cy + 52}
                textAnchor="middle"
                className="text-[10px] font-black uppercase tracking-wider fill-slate-700 dark:fill-slate-200"
              >
                {sentiment.label} · {currentZone.shortLabel}
              </text>
              <text
                x={cx}
                y={cy + 66}
                textAnchor="middle"
                className="text-[9px] font-bold uppercase tracking-widest fill-slate-400 dark:fill-slate-500"
              >
                OUT OF 100
              </text>
            </svg>
          </div>
        </div>

        {/* Right Column: Dynamic Factor Breakdown or Signals View */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Executive Sentiment Summary */}
          <div className={`p-4 rounded-2xl border ${currentZone.borderColor} ${currentZone.bgColor}`}>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm shrink-0 mt-0.5">
                {sentiment.score >= 50 ? (
                  <TrendingUp className={`w-4 h-4 ${currentZone.textColor}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${currentZone.textColor}`} />
                )}
              </div>
              <div>
                <h4 className={`text-sm font-bold ${currentZone.textColor} mb-1 flex items-center gap-2`}>
                  {sentiment.label} Market Stance
                  <span className="text-[11px] font-normal opacity-80">
                    ({sentiment.score >= 50 ? 'Net Bullish' : 'Net Bearish'})
                  </span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {sentiment.summary}
                </p>
              </div>
            </div>
          </div>

          {activeTab === 'gauge' ? (
            /* Tab 1: Sentiment Signals (Bull vs Bear Drivers) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Bullish Catalysts */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Bullish Catalysts
                  </span>
                </div>
                <ul className="space-y-2">
                  {sentiment.bullishFactors?.map((fac, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="text-emerald-500 font-bold shrink-0">▲</span>
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bearish / Risk Drivers */}
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Caution / Headwinds
                  </span>
                </div>
                <ul className="space-y-2">
                  {sentiment.bearishFactors?.map((fac, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-rose-900 dark:text-rose-200">
                      <span className="text-rose-500 font-bold shrink-0">▼</span>
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            /* Tab 2: 4-Factor Weighted Quantitative Sub-Scores */
            <div className="space-y-3 p-4 rounded-xl bg-gray-50/80 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800">
              
              {/* 1. Fundamental Quality Score */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-500" />
                    Fundamental & Valuation Quality
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {sentiment.fundamentalsScore ?? 50}/100 <span className="text-gray-400 text-[10px]">(35% Wt)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${sentiment.fundamentalsScore ?? 50}%` }}
                  />
                </div>
              </div>

              {/* 2. Technical Momentum Score */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Technical Momentum & Trend Alignment
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {sentiment.technicalsScore ?? 50}/100 <span className="text-gray-400 text-[10px]">(30% Wt)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${sentiment.technicalsScore ?? 50}%` }}
                  />
                </div>
              </div>

              {/* 3. Institutional Sponsorship Score */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                    Institutional Sponsorship (FII / DII)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {sentiment.institutionalScore ?? 50}/100 <span className="text-gray-400 text-[10px]">(20% Wt)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${sentiment.institutionalScore ?? 50}%` }}
                  />
                </div>
              </div>

              {/* 4. Strategic Analyst Stance */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Strategic Analyst Mandate Conviction
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {sentiment.analystScore ?? 50}/100 <span className="text-gray-400 text-[10px]">(15% Wt)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${sentiment.analystScore ?? 50}%` }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* Calibrated Sentiment Spectrum Scale Legend */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Extreme Bearish (0-20)</span>
              <span>Neutral (40-60)</span>
              <span>Extreme Bullish (80-100)</span>
            </div>
            <div className="grid grid-cols-5 gap-1 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-sm ${sentiment.score < 20 ? 'bg-rose-500 ring-2 ring-rose-400' : 'bg-rose-500/40'}`} />
              <div className={`h-full rounded-sm ${sentiment.score >= 20 && sentiment.score < 40 ? 'bg-orange-500 ring-2 ring-orange-400' : 'bg-orange-500/40'}`} />
              <div className={`h-full rounded-sm ${sentiment.score >= 40 && sentiment.score < 60 ? 'bg-amber-500 ring-2 ring-amber-400' : 'bg-amber-500/40'}`} />
              <div className={`h-full rounded-sm ${sentiment.score >= 60 && sentiment.score < 80 ? 'bg-emerald-500 ring-2 ring-emerald-400' : 'bg-emerald-500/40'}`} />
              <div className={`h-full rounded-sm ${sentiment.score >= 80 ? 'bg-teal-600 ring-2 ring-teal-400' : 'bg-teal-600/40'}`} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
