import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { CompanyAnalysis } from "../types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function analyzeCompany(query: string): Promise<CompanyAnalysis> {
  // 1. Try real-time server-side quantitative market API first (fetching live exchange quotes from Yahoo Finance + Gemini)
  try {
    const apiRes = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && data.name && data.currentPrice) {
        if (data.chartData && data.chartData.length > 0) {
          data.chartData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return data as CompanyAnalysis;
      }
    }
  } catch (backendErr) {
    console.warn("Backend /api/analyze failed, falling back to direct client-side model call:", backendErr);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    throw new Error(
      "Gemini API Key is missing. If you deployed this app on Vercel, please make sure you have: 1. Added GEMINI_API_KEY under 'Project Settings' -> 'Environment Variables' in your Vercel Dashboard, and 2. Triggered a new Deployment (redeploy) so Vite can bundle the key during the build phase. (Client-side SPAs require environment variables to be set at build-time)."
    );
  }

  const attempts = [
    { model: "gemini-3.7-flash", useSearch: true },
    { model: "gemini-2.5-flash", useSearch: true },
    { model: "gemini-3.7-flash", useSearch: false },
    { model: "gemini-2.5-flash", useSearch: false },
  ];

  let lastError: any = null;

  const jsonSchemaDescription = `{
  "name": "Official Full Entity Name (e.g. ITC Limited, Reliance Industries Ltd, Apple Inc., Nifty 50)",
  "symbol": "Ticker with exchange (e.g. ITC.NS, RELIANCE.NS, AAPL, ^NSEI)",
  "sector": "Sector name (e.g. Fast Moving Consumer Goods, Technology, Energy)",
  "industry": "Specific industry (e.g. Cigarettes & Tobacco, Consumer Products, Semiconductors)",
  "isFund": false,
  "sectorPerformance": "Sector average return or performance (e.g. +1.4%)",
  "sectorPeRatio": "Sector average P/E ratio (e.g. 38.2)",
  "sectorPbRatio": "Sector average P/B ratio (e.g. 8.5)",
  "currentPrice": "Exact live / latest closing price with currency symbol (e.g. ₹425.80 or $232.50 or 25,050.20 for Nifty 50)",
  "pbRatio": "Price to Book (P/B) ratio (e.g. 7.4)",
  "bookValue": "Book value per share with currency (e.g. ₹58.40 or $46.20)",
  "roe": "Return on Equity % (e.g. 29.5%)",
  "roce": "Return on Capital Employed % (e.g. 39.2%)",
  "cagr1yr": "1-Year CAGR price return % (e.g. -1.2%)",
  "cagr5yr": "5-Year CAGR price return % (e.g. +15.4%)",
  "cagr10yr": "10-Year CAGR price return % (e.g. +10.8%)",
  "fundamentals": {
    "revenue": "Latest annual / TTM revenue (e.g. ₹70,850 Cr or $394.3B)",
    "profit": "Latest annual / TTM net profit (e.g. ₹20,530 Cr or $101.4B)",
    "peRatio": "Accurate TTM P/E ratio (e.g. 26.2)",
    "marketCap": "Total Market Capitalization or Fund AUM (e.g. ₹5,38,000 Cr or $3.52T)",
    "summary": "Clear, quantitative summary of business revenue streams, profitability, and operational standing."
  },
  "technicalAnalysis": {
    "trend": "Bullish / Neutral / Bearish",
    "chartPatterns": "Description of current price action, consolidation, breakout, or channel patterns",
    "keyLevels": "Key Support: ₹410, Resistance: ₹445"
  },
  "dividendAndShareholding": {
    "dividendYield": "Dividend Yield % (e.g. 3.2%)",
    "dividendPerShare": "Annual Dividend per Share with currency (e.g. ₹2.90)",
    "payoutRatio": "Dividend Payout Ratio % (e.g. 38.5%)",
    "fiveYearAvgDividendYield": "5-Year Average Dividend Yield % (e.g. 3.02%)",
    "lastDividendDate": "Ex-Dividend Date (e.g. 13 Mar 2026)",
    "lastDividendAmount": "Recent declared dividend per share (e.g. ₹1.05)",
    "promoterHolding": "Promoter Holding % (e.g. 0.0% if none or 82.89%)",
    "fiiHolding": "FII / FPI Holding % (e.g. 1.42%)",
    "diiHolding": "DII / Mutual Funds Holding % (e.g. 3.37%)",
    "publicHolding": "Public / Retail Holding % (e.g. 12.32%)",
    "governmentHolding": "Government stake % (if applicable, e.g. 82.89%)",
    "pledgedPromoterShares": "Pledged shares % (e.g. 0.00%)",
    "institutionsCount": 64,
    "historicalQuarters": [
      {
        "quarter": "Jun 2024",
        "promoters": "86.36%",
        "fii": "1.08%",
        "dii": "1.63%",
        "public": "10.93%",
        "total": "100.0%"
      }
    ],
    "summary": "Quarterly institutional flow and promoter pledge status.",
    "dividendAnalysis": "Analysis of dividend consistency, payout sustainability, and cash coverage."
  },
  "peerComparison": {
    "peers": [
      { "name": "Peer Company Name 1", "performance": "+6.4%" },
      { "name": "Peer Company Name 2", "performance": "-2.1%" },
      { "name": "Peer Company Name 3", "performance": "+12.8%" }
    ],
    "summary": "Relative valuation and growth comparison with top sector competitors."
  },
  "chartData": [
    {
      "date": "15 Jan 2023",
      "price": 332.5,
      "volume": 14200000,
      "dma50": 328.0,
      "dma200": 310.5,
      "peRatio": 22.4,
      "pbRatio": 5.8
    }
  ],
  "aiScore": 8.5,
  "recommendation": "Buy / Hold / Accumulate with concise rationale",
  "lastUpdated": "Exact timestamp of latest live trading data (e.g. Aug 25, 2026, 03:30 PM IST)",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4", "Strength 5"],
  "riskFactors": ["Risk 1", "Risk 2", "Risk 3"]
}`;

  for (const attempt of attempts) {
    try {
      console.log(`Attempting Gemini analysis with model: ${attempt.model} (Search: ${attempt.useSearch})`);
      
      const config: any = {
        temperature: 0.0,
        responseMimeType: "application/json",
      };

      if (attempt.useSearch) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            sector: { type: Type.STRING },
            industry: { type: Type.STRING },
            isFund: { type: Type.BOOLEAN },
            sectorPerformance: { type: Type.STRING },
            sectorPeRatio: { type: Type.STRING },
            sectorPbRatio: { type: Type.STRING },
            currentPrice: { type: Type.STRING },
            pbRatio: { type: Type.STRING },
            bookValue: { type: Type.STRING },
            roe: { type: Type.STRING },
            roce: { type: Type.STRING },
            cagr1yr: { type: Type.STRING },
            cagr5yr: { type: Type.STRING },
            cagr10yr: { type: Type.STRING },
            fundamentals: {
              type: Type.OBJECT,
              properties: {
                revenue: { type: Type.STRING },
                profit: { type: Type.STRING },
                peRatio: { type: Type.STRING },
                marketCap: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ["revenue", "profit", "peRatio", "marketCap", "summary"],
            },
            technicalAnalysis: {
              type: Type.OBJECT,
              properties: {
                trend: { type: Type.STRING },
                chartPatterns: { type: Type.STRING },
                keyLevels: { type: Type.STRING },
              },
              required: ["trend", "chartPatterns", "keyLevels"],
            },
            dividendAndShareholding: {
              type: Type.OBJECT,
              properties: {
                dividendYield: { type: Type.STRING },
                dividendPerShare: { type: Type.STRING },
                payoutRatio: { type: Type.STRING },
                fiveYearAvgDividendYield: { type: Type.STRING },
                lastDividendDate: { type: Type.STRING },
                lastDividendAmount: { type: Type.STRING },
                promoterHolding: { type: Type.STRING },
                fiiHolding: { type: Type.STRING },
                diiHolding: { type: Type.STRING },
                publicHolding: { type: Type.STRING },
                governmentHolding: { type: Type.STRING },
                pledgedPromoterShares: { type: Type.STRING },
                institutionsCount: { type: Type.NUMBER },
                historicalQuarters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      quarter: { type: Type.STRING },
                      promoters: { type: Type.STRING },
                      fii: { type: Type.STRING },
                      dii: { type: Type.STRING },
                      public: { type: Type.STRING },
                      total: { type: Type.STRING },
                    },
                    required: ["quarter", "promoters", "fii", "dii", "public"],
                  },
                },
                summary: { type: Type.STRING },
                dividendAnalysis: { type: Type.STRING },
              },
              required: ["dividendYield", "payoutRatio", "promoterHolding", "fiiHolding", "diiHolding", "publicHolding", "summary"],
            },
            peerComparison: {
              type: Type.OBJECT,
              properties: {
                peers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      performance: { type: Type.STRING },
                    },
                  },
                },
                summary: { type: Type.STRING },
              },
              required: ["peers", "summary"],
            },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  volume: { type: Type.NUMBER },
                  dma50: { type: Type.NUMBER },
                  dma200: { type: Type.NUMBER },
                  peRatio: { type: Type.NUMBER },
                  pbRatio: { type: Type.NUMBER },
                },
                required: ["date", "price", "volume", "dma50", "dma200", "peRatio", "pbRatio"],
              },
            },
            aiScore: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
            lastUpdated: { type: Type.STRING },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "name",
            "symbol",
            "sector",
            "industry",
            "isFund",
            "sectorPerformance",
            "sectorPeRatio",
            "sectorPbRatio",
            "fundamentals",
            "technicalAnalysis",
            "dividendAndShareholding",
            "peerComparison",
            "chartData",
            "aiScore",
            "recommendation",
            "lastUpdated",
            "keyStrengths",
            "riskFactors",
          ],
        };
      }

      if (attempt.model.startsWith("gemini-3")) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const currentDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: `You are an elite quantitative research analyst connecting directly to financial market databases.
Perform an in-depth real-time search using Google Search to gather exact, authentic, verified data for: "${query}".

FINANCIAL SEARCH PROTOCOL:
1. Search queries to execute:
   - "${query} share price NSE BSE Screener.in Google Finance"
   - "${query} market cap PE ratio ROE ROCE book value Screener.in"
   - "${query} quarterly shareholding pattern promoter FII DII"
2. Retrieve the true live/last closing market price, exact Market Cap, P/E ratio, P/B ratio, Book Value, ROE, ROCE, 1Y/5Y/10Y CAGR returns, Dividend Yield, and latest Shareholding breakdown.
3. For Indian stocks (NSE/BSE): Format Market Cap in ₹ Crores (e.g. ₹5,40,000 Cr), price in ₹ (e.g. ₹425.50), ROE and ROCE from Screener.in.
4. For US stocks (NYSE/NASDAQ): Format Market Cap in $B / $T, price in $ (e.g. $230.15).
5. For Market Indices (e.g. Nifty 50, Sensex, S&P 500): Provide the index level as price (e.g. 24,850.30), index P/E, and index CAGR returns.
6. For Mutual Funds / ETFs: Provide latest NAV as price, AUM as market cap, and expense ratio / portfolio statistics.

CHART DATA REQUIREMENT:
Provide exactly 24-30 chronological historical monthly data points showing the realistic price history over the past 3-5 years up to today (${currentDateStr}). Ensure the latest point equals the currentPrice.

OUTPUT SPECIFICATION:
Respond STRICTLY with a valid JSON object with the following schema:
${jsonSchemaDescription}

Ensure every single number is factual, consistent with live market data, and verifiable on Google Finance and Screener.in.`,
        config,
      });

      const text = response.text;
      if (!text) throw new Error("Failed to get analysis from AI");

      let jsonStr = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Extract JSON substring
      const firstBrace = jsonStr.indexOf("{");
      const lastBrace = jsonStr.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
      
      const data = JSON.parse(jsonStr) as CompanyAnalysis;
      
      // Ensure chart data is sorted by date ascending
      if (data.chartData && data.chartData.length > 0) {
        data.chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      return data;
    } catch (e: any) {
      console.warn(`Attempt failed with model ${attempt.model} (Search: ${attempt.useSearch}):`, e.message || e);
      lastError = e;
    }
  }

  throw new Error(`Failed to call the Gemini API: ${lastError?.message || lastError || "permission denied"}. Please try again.`);
}
