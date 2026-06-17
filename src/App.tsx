import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp, ShieldCheck, PieChart, Zap, Briefcase, BarChart4, Star, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCompany } from './services/geminiService';
import { CompanyAnalysis } from './types';
import { AnalysisView } from './components/AnalysisView';
import { SubtleBackground } from './components/SubtleBackground';

export default function App() {
  const [query, setQuery] = useState('');
  const [portfolioQuery, setPortfolioQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'portfolio' | 'market'>('search');
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('investwise_watchlist');
    return saved ? JSON.parse(saved) : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
  });

  useEffect(() => {
    localStorage.setItem('investwise_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPortfolioSuggestions, setShowPortfolioSuggestions] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (analysis) {
      const timer = setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [analysis]);

  const commonStocks = [
    { symbol: 'RELIANCE', trending: true },
    { symbol: 'TCS', trending: false },
    { symbol: 'HDFCBANK', trending: true },
    { symbol: 'INFY', trending: false },
    { symbol: 'ICICIBANK', trending: false },
    { symbol: 'HINDUNILVR', trending: false },
    { symbol: 'ITC', trending: true },
    { symbol: 'SBIN', trending: true },
    { symbol: 'BHARTIARTL', trending: false },
    { symbol: 'KOTAKBANK', trending: false },
    { symbol: 'AAPL', trending: true },
    { symbol: 'TSLA', trending: true },
    { symbol: 'MSFT', trending: true },
    { symbol: 'AMZN', trending: false },
    { symbol: 'GOOGL', trending: false },
    { symbol: 'META', trending: true },
    { symbol: 'NVDA', trending: true },
    { symbol: 'Vanguard 500', trending: false },
    { symbol: 'Nifty 50', trending: true },
    { symbol: 'SENSEX', trending: true },
    { symbol: 'TATA MOTORS', trending: true },
    { symbol: 'TATA STEEL', trending: false },
    { symbol: 'TATA CONSULTANCY SERVICES', trending: false },
    { symbol: 'TATA POWER', trending: true },
    { symbol: 'TATA CONSUMER', trending: false },
    { symbol: 'TATA CHEMICALS', trending: false },
    { symbol: 'TATA COMMUNICATIONS', trending: false },
    { symbol: 'ADANI ENTERPRISES', trending: true },
    { symbol: 'ADANI PORTS', trending: true },
    { symbol: 'WIPRO', trending: false },
    { symbol: 'AXISBANK', trending: false },
    { symbol: 'L&T', trending: true },
    { symbol: 'MARUTI', trending: false },
    { symbol: 'SUNPHARMA', trending: false },
    { symbol: 'TITAN', trending: false },
    { symbol: 'ULTRACEMCO', trending: false },
    { symbol: 'BAJFINANCE', trending: false },
    { symbol: 'ZOMATO', trending: true },
    { symbol: 'PAYTM', trending: true },
    { symbol: 'JIOFIN', trending: true },
    { symbol: 'RVNL', trending: true },
    { symbol: 'IREDA', trending: true },
    { symbol: 'PLTR', trending: true },
    { symbol: 'PYPL', trending: false },
    { symbol: 'PEP', trending: false },
    { symbol: 'PFE', trending: false },
    { symbol: 'PG', trending: false },
    { symbol: 'POWERGRID', trending: true },
    { symbol: 'PNB', trending: true },
    { symbol: 'POLYCAB', trending: false }
  ];

  const filteredSuggestions = commonStocks
    .filter(s => {
      const q = query.toLowerCase().trim();
      if (!q) return false;
      return s.symbol.toLowerCase().startsWith(q);
    })
    .sort((a, b) => (a.trending === b.trending ? 0 : a.trending ? -1 : 1))
    .map(s => s.symbol);

  const filteredPortfolioSuggestions = commonStocks
    .filter(s => {
      const q = portfolioQuery.toLowerCase().trim();
      if (!q) return false;
      return s.symbol.toLowerCase().startsWith(q);
    })
    .sort((a, b) => (a.trending === b.trending ? 0 : a.trending ? -1 : 1))
    .map(s => s.symbol);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError(null);
    setActiveTab('search');
    try {
      const result = await analyzeCompany(finalQuery);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const benchmarks = {
    India: [
      { name: 'Nifty 50', symbol: '^NSEI' },
      { name: 'Nifty Next 50', symbol: '^NSMIDCP' },
      { name: 'Nifty 100', symbol: '^CNX100' },
      { name: 'Nifty 200', symbol: '^CNX200' },
      { name: 'Nifty 500', symbol: '^CNX500' },
      { name: 'Nifty Bank', symbol: '^NSEBANK' },
      { name: 'Nifty Midcap 100', symbol: 'NIFTY_MIDCAP_100.NS' },
      { name: 'Nifty Smallcap 100', symbol: 'NIFTY_SMALLCAP_100.NS' },
      { name: 'Nifty Microcap 250', symbol: 'NIFTY_MICROCAP_250.NS' },
      { name: 'Nifty LargeMidcap 250', symbol: 'NIFTY_LARGEMIDCAP_250.NS' },
    ],
    US: [
      { name: 'S&P 500', symbol: '^GSPC' },
      { name: 'Nasdaq 100', symbol: '^IXIC' },
      { name: 'Dow Jones', symbol: '^DJI' },
    ],
    Japan: [
      { name: 'Nikkei 225', symbol: '^N225' },
    ],
    China: [
      { name: 'Shanghai Composite', symbol: '000001.SS' },
      { name: 'Hang Seng', symbol: '^HSI' },
    ]
  };

  const addToWatchlist = (symbol: string) => {
    if (!symbol) return;
    const upper = symbol.toUpperCase();
    if (!watchlist.includes(upper)) {
      setWatchlist([...watchlist, upper]);
      setSuccessMessage(`Added ${upper} to favorites`);
    }
    
    // Auto-focus the input field
    setTimeout(() => {
      portfolioInputRef.current?.focus();
    }, 0);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 text-slate-900 dark:text-slate-100">
      {/* Subtle Animated Background */}
      <SubtleBackground />

      {/* Navigation / Header */}
      <nav className="border-b border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-[95%] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setAnalysis(null); setActiveTab('search'); }}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-bold text-xl tracking-tight text-slate-950 dark:text-white">InvestWise <span className="text-emerald-800 dark:text-emerald-400">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-800 dark:text-slate-300">
              <button 
                onClick={() => setActiveTab('market')}
                className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors uppercase tracking-widest ${activeTab === 'market' ? 'text-emerald-700 dark:text-emerald-400 font-black' : ''}`}
              >
                Markets
              </button>
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors uppercase tracking-widest ${activeTab === 'portfolio' ? 'text-emerald-700 dark:text-emerald-400 font-black' : ''}`}
              >
                Favorites
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {activeTab === 'search' && (
          <>
            {/* Hero / Search Section */}
            <section className={`relative transition-all duration-700 ${analysis ? 'pt-12 pb-8' : 'pt-32 pb-32'}`}>
              <div className="max-w-[95%] mx-auto px-4 text-center">
                {!analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                  >
                    <h1 className="text-5xl md:text-7xl font-serif font-bold italic mb-6 tracking-tight text-slate-950 dark:text-white">
                      <span className="text-slate-950 dark:text-white">Your Personal</span> <br />
                      <span className="gradient-text">Investment Oracle</span>
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                      Advanced AI analysis for stocks and mutual funds. Get deep insights into fundamentals, 
                      chart patterns, and sector performance in seconds.
                    </p>
                  </motion.div>
                )}

                <motion.form 
                  layout
                  onSubmit={handleSearch}
                  className="relative max-w-2xl mx-auto"
                >
                  <div className="relative group">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Enter company name or stock symbol (e.g. Apple, TSLA, Vanguard 500)..."
                      className="w-full h-16 pl-14 pr-32 bg-emerald-100/30 dark:bg-black/40 border-2 border-emerald-400/30 dark:border-white/10 rounded-2xl shadow-2xl focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/10 transition-all outline-none text-lg font-medium text-slate-950 dark:text-white backdrop-blur-md"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                    </button>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                          {filteredSuggestions.map((suggestion) => {
                            const isTrending = commonStocks.find(s => s.symbol === suggestion)?.trending;
                            return (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  setQuery(suggestion);
                                  handleSearch(undefined, suggestion);
                                  setShowSuggestions(false);
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-3">
                                  <TrendingUp className={`w-4 h-4 ${isTrending ? 'text-emerald-600' : 'text-gray-400'}`} />
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{suggestion}</span>
                                </div>
                                {isTrending && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                    Trending
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.form>
              </div>
            </section>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-4"
                >
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-emerald-400/20 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">Analyzing Market Data...</p>
                    <p className="text-gray-700 dark:text-gray-400 text-sm">Fetching fundamentals, technicals, and peer comparisons</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xl mx-auto px-4 py-12"
                >
                  <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200 mb-2">Analysis Failed</h3>
                    <p className="text-rose-700 dark:text-rose-400 mb-6">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              ) : analysis ? (
                <div ref={reportRef} className="scroll-mt-20">
                  <AnalysisView 
                    key="results" 
                    data={analysis} 
                    onAddToWatchlist={() => addToWatchlist(analysis.symbol)}
                    isWatched={watchlist.includes(analysis.symbol.toUpperCase())}
                  />
                </div>
              ) : null}
            </AnimatePresence>
          </>
        )}

        {activeTab === 'portfolio' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[95%] mx-auto px-4 py-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-serif font-bold italic text-slate-950 dark:text-white">My Favorites</h2>
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/50"
                    >
                      <Check className="w-3 h-3" />
                      {successMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-2 relative">
                <div className="relative">
                  <input 
                    ref={portfolioInputRef}
                    type="text" 
                    value={portfolioQuery}
                    onChange={(e) => {
                      setPortfolioQuery(e.target.value);
                      setShowPortfolioSuggestions(true);
                    }}
                    onFocus={() => setShowPortfolioSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPortfolioSuggestions(false), 200)}
                    placeholder="Symbol..." 
                    className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all text-slate-950 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addToWatchlist(portfolioQuery);
                        setPortfolioQuery('');
                      }
                    }}
                  />
                  {/* Portfolio Suggestions */}
                  <AnimatePresence>
                    {showPortfolioSuggestions && filteredPortfolioSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[200px]"
                      >
                        {filteredPortfolioSuggestions.map((suggestion) => {
                          const isTrending = commonStocks.find(s => s.symbol === suggestion)?.trending;
                          return (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                addToWatchlist(suggestion);
                                setPortfolioQuery('');
                                setShowPortfolioSuggestions(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-between group text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Plus className={`w-3 h-3 ${isTrending ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <span className="font-medium text-gray-800 dark:text-gray-200">{suggestion}</span>
                              </div>
                              {isTrending && (
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  onClick={() => {
                    addToWatchlist(portfolioQuery);
                    setPortfolioQuery('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((item) => (
                <div 
                  key={item}
                  className="glass-card p-6 flex items-center justify-between group hover:border-emerald-500/50 transition-all"
                >
                  <div 
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() => handleSearch(undefined, item)}
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      {item[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white">{item}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-500">Click to analyze</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromWatchlist(item)}
                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-12"
          >
            <h2 className="text-3xl font-serif font-bold italic mb-8 text-slate-950 dark:text-white">Global Benchmarks</h2>
            <div className="space-y-12">
              {Object.entries(benchmarks).map(([country, items]) => (
                <div key={country}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-950 dark:text-white">
                    <span className="w-1 h-6 bg-emerald-600 rounded-full" />
                    {country}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {items.map((bench) => (
                      <div 
                        key={bench.symbol}
                        onClick={() => handleSearch(undefined, bench.name)}
                        className="glass-card p-6 group cursor-pointer hover:border-blue-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <BarChart4 className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-slate-950 dark:text-white">{bench.name}</h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-500">{bench.symbol}</span>
                          <span className="text-xs font-bold text-emerald-600">Analyze →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-100 dark:border-white/5 pt-12 pb-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-[95%] mx-auto px-4">
          <div className="flex flex-col gap-8">
            {/* Logo & Creator Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">W</div>
                <span className="font-bold text-2xl tracking-tight text-slate-950 dark:text-white">InvestWise <span className="text-emerald-600 dark:text-emerald-400 font-black drop-shadow-sm">AI</span></span>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm font-bold text-slate-950 dark:text-gray-100">
                  Created by <span className="text-slate-950 dark:text-white font-black underline underline-offset-4 decoration-emerald-500/50">Sam Sarvesh</span>
                </p>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">
                  Made with <span className="text-rose-500">❤</span> in India
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-white/5 w-full"></div>
            
            {/* Legal Disclaimer */}
            <div className="w-full">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">Legal Disclaimer</h4>
              <p className="text-[10px] leading-relaxed text-gray-400 dark:text-gray-500 font-medium text-justify">
                This AI-generated analysis is for informational purposes only and does not constitute financial advice. 
                The financial markets involve significant risk, and past performance is not indicative of future results. 
                Always consult with a qualified financial advisor before making investment decisions. 
                InvestWise AI and its creators are not responsible for any financial losses incurred based on the data provided. 
                All data is sourced from public information and processed via artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
