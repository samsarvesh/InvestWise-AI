export interface CompanyAnalysis {
  name: string;
  symbol: string;
  sector: string;
  industry: string;
  isFund: boolean;
  sectorPerformance: string;
  sectorPeRatio?: string;
  sectorPbRatio?: string;
  currentPrice: string;
  pbRatio: string;
  bookValue: string;
  roe: string;
  roce: string;
  cagr1yr: string;
  cagr5yr: string;
  cagr10yr: string;
  fundamentals: {
    revenue: string;
    profit: string;
    peRatio: string;
    marketCap: string;
    summary: string;
  };
  technicalAnalysis: {
    trend: string;
    chartPatterns: string;
    keyLevels: string;
  };
  dividendAndShareholding?: {
    dividendYield: string;
    payoutRatio: string;
    promoterHolding: string;
    fiiHolding: string;
    diiHolding: string;
    publicHolding: string;
    summary: string;
  };
  peerComparison: {
    peers: Array<{ name: string; performance: string }>;
    summary: string;
  };
  aiScore: number;
  recommendation: string;
  lastUpdated: string;
  keyStrengths: string[];
  riskFactors: string[];
  chartData: Array<{
    date: string;
    price: number;
    volume: number;
    dma50: number;
    dma200: number;
    peRatio: number;
    pbRatio: number;
  }>;
}

export interface SearchResult {
  title: string;
  url: string;
}
