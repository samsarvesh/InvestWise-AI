import { CompanyAnalysis } from "../types";
import { ensureCompleteHistoricalChartData } from "../utils/chartDataGenerator";

/**
 * Analyzes a company by dispatching the query to the server-side analysis endpoint.
 * All Gemini model interactions and financial exchange queries are handled on the server.
 */
export async function analyzeCompany(query: string): Promise<CompanyAnalysis> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Please enter a valid company name or ticker symbol.");
  }

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData?.error) {
            errorMessage = errData.error;
          }
        } catch {
          // If response body is not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data || !data.name || !data.currentPrice) {
        throw new Error("Incomplete analysis response received from server.");
      }

      // Ensure 10-year historical chart dataset is complete and sorted
      const rawNumPrice = data.rawPrice || parseFloat(String(data.currentPrice).replace(/[^0-9.]/g, '')) || 100;
      data.chartData = ensureCompleteHistoricalChartData(
        data.chartData,
        rawNumPrice,
        data.cagr1yr,
        data.cagr5yr,
        data.cagr10yr,
        data.fundamentals?.peRatio,
        data.pbRatio,
        data.symbol
      );

      return data as CompanyAnalysis;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed to analyze company. Please try again.");
}
