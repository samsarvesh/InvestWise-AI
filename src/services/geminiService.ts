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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    throw new Error(
      "Gemini API Key is missing. If you deployed this app on Vercel, please make sure you have: 1. Added GEMINI_API_KEY under 'Project Settings' -> 'Environment Variables' in your Vercel Dashboard, and 2. Triggered a new Deployment (redeploy) so Vite can bundle the key during the build phase. (Client-side SPAs require environment variables to be set at build-time)."
    );
  }

  const attempts = [
    { model: "gemini-3-flash-preview", useSearch: true },
    { model: "gemini-3-flash-preview", useSearch: false },
    { model: "gemini-3.5-flash", useSearch: true },
    { model: "gemini-3.5-flash", useSearch: false },
    { model: "gemini-2.5-flash", useSearch: true },
    { model: "gemini-2.5-flash", useSearch: false },
    { model: "gemini-1.5-flash", useSearch: true },
    { model: "gemini-1.5-flash", useSearch: false },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      console.log(`Attempting Gemini analysis with model: ${attempt.model} (Search: ${attempt.useSearch})`);
      
      const config: any = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            sector: { type: Type.STRING },
            industry: { type: Type.STRING },
            isFund: { type: Type.BOOLEAN, description: "True if the query is a mutual fund, ETF, or index fund." },
            sectorPerformance: { type: Type.STRING },
            sectorPeRatio: { type: Type.STRING, description: "Average P/E ratio for the company's sector or industry (e.g. '24.5' or 'N/A')" },
            sectorPbRatio: { type: Type.STRING, description: "Average P/B ratio for the company's sector or industry (e.g. '3.2' or 'N/A')" },
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
                payoutRatio: { type: Type.STRING },
                promoterHolding: { type: Type.STRING },
                fiiHolding: { type: Type.STRING },
                diiHolding: { type: Type.STRING },
                publicHolding: { type: Type.STRING },
                summary: { type: Type.STRING },
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
            lastUpdated: { type: Type.STRING, description: "The specific timestamp of when this information was retrieved from live sources." },
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
        },
      };

      if (attempt.useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      if (attempt.model.startsWith("gemini-3")) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: `Analyze the following stock or mutual fund: ${query}. 
        Provide a comprehensive investment report including:
        1. Sector and Industry details. For funds, provide the Fund Category and Sub-category.
        2. Current sector performance or Category average performance. Crucially, find the actual average Sector P/E Ratio (or Category average PE for funds) and average Sector P/B Ratio (or Category average PB for funds) to compare against the company's ratios.
        3. Key Metrics: Current Price, Market Cap (or AUM for funds), P/E Ratio, P/B Ratio, Book Value (or NAV for funds), ROE (%), ROCE (%), CAGR (1yr, 5yr, 10yr).
        4. Fundamentals (Revenue, Profit, Summary). For funds, provide Expense Ratio, Exit Load, and Portfolio Summary.
        5. Technical analysis (Trend, Chart patterns, Key levels).
        6. Peer comparison.
        7. Key Strengths: Identify at least 5 core strengths.
        8. Risk factors.
        9. Dividend & Shareholding: 
           - For Stocks: Provide Dividend Yield, Payout Ratio, Promoter Holding (%), FII Holding (%), DII Holding (%), and Public Holding (%).
           - For Funds/ETFs: Provide Yield (IDCW), Expense Ratio (in place of Payout Ratio), and Asset Allocation: Equity % (in place of Promoter), Debt % (in place of FII), Cash % (in place of DII), and Others % (in place of Public).
           - Provide a brief summary of the shareholding or asset allocation pattern.
        10. Historical Chart Data: Provide exactly 80 data points: 20 daily points for the last month, 20 weekly points for the last 5 months, and 40 monthly points for the last 5 years. Each point must have: date (DD MMM YYYY), price (number), volume (number), dma50 (number), dma200 (number), peRatio (number), and pbRatio (number). 
        CRITICAL: For each data point, dma50 and dma200 MUST be the historical 50-day and 200-day moving averages as of that specific date, NOT the current values. Ensure they are calculated accurately relative to the price at that time.
        11. An overall investment score out of 10.
        12. A final recommendation.
        
        Formatting Instructions:
        - For Indian companies, format all large numbers (Revenue, Profit, Market Cap) using the Indian short-form convention (e.g., "1.5 Lkhs Cr", "500 Cr").
        - For non-Indian companies, use millions and billions (e.g., "1.5B", "500M").
        - Ensure currency symbols are appropriate (₹ for Indian, $ for US, etc.) in all financial strings.
        
        Use the Google Search tool to find the absolute LATEST REAL-TIME PRICES AND DATA as of today (${new Date().toLocaleDateString()}). Prioritize data from Google Finance, Yahoo Finance, NSE/BSE official sites, and recent news to ensure the most current information.
        
        Provide the exact timestamp of the data you find in the "lastUpdated" field (e.g., "02 May 2026, 02:45 PM").
        
        CRITICAL: Output MUST be a single valid JSON object. Do not include any thinking process, thought blocks, or conversational text in the final output.`,
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

      // If there's still non-JSON text around the object, try to find the first { and last }
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
