import { ShareholdingQuarter } from "../types";

export interface StockShareholdingProfile {
  symbolPattern: RegExp;
  namePattern: RegExp;
  promoter: string;
  fii: string;
  dii: string;
  public: string;
  pledged: string;
  institutionsCount: number;
  summary: string;
  quarters: ShareholdingQuarter[];
}

export const VERIFIED_SHAREHOLDING_DATABASE: StockShareholdingProfile[] = [
  // 1. IRFC (Indian Railway Finance Corporation)
  {
    symbolPattern: /^IRFC(\.NS|\.BO)?$/i,
    namePattern: /Indian Railway Finance/i,
    promoter: "82.90%",
    fii: "1.17%",
    dii: "3.97%",
    public: "11.96%",
    pledged: "0.00%",
    institutionsCount: 157,
    summary: "Government of India (Ministry of Railways) holds 82.90% following the 1.75% OFS in late June 2026. Domestic and foreign institutions hold ~5.14% with 0.00% pledged shares.",
    quarters: [
      { quarter: "Sep 2025", promoters: "86.36%", fii: "1.00%", dii: "1.71%", public: "10.93%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "86.36%", fii: "1.00%", dii: "2.05%", public: "10.59%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "84.70%", fii: "1.16%", dii: "2.89%", public: "11.25%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "82.90%", fii: "1.17%", dii: "3.97%", public: "11.96%", total: "100.0%" },
    ],
  },

  // 2. ITC Limited
  {
    symbolPattern: /^ITC(\.NS|\.BO)?$/i,
    namePattern: /ITC Limited/i,
    promoter: "0.00%",
    fii: "34.23%",
    dii: "49.13%",
    public: "16.64%",
    pledged: "0.00%",
    institutionsCount: 191,
    summary: "Professionally managed blue-chip with 0.00% promoter holding. Domestic institutions (DIIs/LIC/SUUTI) hold an overwhelming 49.13%, FIIs hold 34.23%, combined institutional ownership exceeds 83.3%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "0.00%", fii: "37.39%", dii: "47.41%", public: "15.20%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "0.00%", fii: "36.11%", dii: "48.89%", public: "15.00%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "0.00%", fii: "34.83%", dii: "49.15%", public: "16.02%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "0.00%", fii: "34.23%", dii: "49.13%", public: "16.64%", total: "100.0%" },
    ],
  },

  // 3. Tata Consultancy Services (TCS)
  {
    symbolPattern: /^TCS(\.NS|\.BO)?$/i,
    namePattern: /Tata Consultancy Services/i,
    promoter: "71.77%",
    fii: "9.06%",
    dii: "13.48%",
    public: "5.69%",
    pledged: "0.00%",
    institutionsCount: 220,
    summary: "Tata Sons holds an unshakable 71.77% promoter equity. Steady accumulation by Domestic Mutual Funds and Insurers (13.48%) while FIIs hold 9.06%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "71.77%", fii: "10.33%", dii: "12.70%", public: "5.20%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "71.77%", fii: "10.37%", dii: "12.87%", public: "4.99%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "71.77%", fii: "9.66%", dii: "13.41%", public: "5.16%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "71.77%", fii: "9.06%", dii: "13.48%", public: "5.69%", total: "100.0%" },
    ],
  },

  // 4. Reliance Industries (RELIANCE)
  {
    symbolPattern: /^RELIANCE(\.NS|\.BO)?$/i,
    namePattern: /Reliance Industries/i,
    promoter: "50.48%",
    fii: "17.19%",
    dii: "21.19%",
    public: "11.14%",
    pledged: "0.00%",
    institutionsCount: 290,
    summary: "Promoter group expanded stake to 50.48% through open-market purchases in Q1 2026. Combined institutional holding is 38.38% with mutual funds scaling to 10.11%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "50.12%", fii: "19.20%", dii: "19.45%", public: "11.23%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "50.12%", fii: "18.84%", dii: "19.82%", public: "11.22%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "50.00%", fii: "18.67%", dii: "20.10%", public: "11.23%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "50.48%", fii: "17.19%", dii: "21.19%", public: "11.14%", total: "100.0%" },
    ],
  },

  // 5. State Bank of India (SBIN)
  {
    symbolPattern: /^SBIN(\.NS|\.BO)?$/i,
    namePattern: /State Bank of India/i,
    promoter: "55.47%",
    fii: "10.81%",
    dii: "26.64%",
    public: "7.08%",
    pledged: "0.00%",
    institutionsCount: 310,
    summary: "Government of India holds majority 55.47% stake. Domestic institutions hold 26.64% (Mutual Funds 13.61%, LIC/Insurers 13.03%) with FIIs holding 10.81%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "55.50%", fii: "9.98%", dii: "27.22%", public: "7.30%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "55.50%", fii: "9.57%", dii: "27.78%", public: "7.15%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "55.52%", fii: "10.34%", dii: "27.16%", public: "6.98%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "55.47%", fii: "10.81%", dii: "26.64%", public: "7.08%", total: "100.0%" },
    ],
  },

  // 6. HDFC Bank (HDFCBANK)
  {
    symbolPattern: /^HDFCBANK(\.NS|\.BO)?$/i,
    namePattern: /HDFC Bank/i,
    promoter: "0.00%",
    fii: "41.82%",
    dii: "41.92%",
    public: "16.26%",
    pledged: "0.00%",
    institutionsCount: 450,
    summary: "Widely held banking titan with 0.00% promoter holding. Domestic institutions hold 41.92% (Mutual Funds at ~30.6%) and FIIs hold 41.82%, reflecting near-total institutional consensus.",
    quarters: [
      { quarter: "Sep 2025", promoters: "0.00%", fii: "47.10%", dii: "36.80%", public: "16.10%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "0.00%", fii: "45.60%", dii: "38.20%", public: "16.20%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "0.00%", fii: "44.05%", dii: "39.68%", public: "16.27%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "0.00%", fii: "41.82%", dii: "41.92%", public: "16.26%", total: "100.0%" },
    ],
  },

  // 7. ICICI Bank (ICICIBANK)
  {
    symbolPattern: /^ICICIBANK(\.NS|\.BO)?$/i,
    namePattern: /ICICI Bank/i,
    promoter: "0.00%",
    fii: "33.79%",
    dii: "42.32%",
    public: "23.89%",
    pledged: "0.00%",
    institutionsCount: 380,
    summary: "Professionally managed institution with 0.00% promoter holding. DIIs hold 42.32% (Mutual funds ~29.60%, insurance ~8.24%) and FIIs hold 33.79% plus ADRs.",
    quarters: [
      { quarter: "Sep 2025", promoters: "0.00%", fii: "36.20%", dii: "39.10%", public: "24.70%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "0.00%", fii: "35.40%", dii: "39.90%", public: "24.70%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "0.00%", fii: "34.48%", dii: "41.10%", public: "24.42%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "0.00%", fii: "33.79%", dii: "42.32%", public: "23.89%", total: "100.0%" },
    ],
  },

  // 8. Infosys (INFY)
  {
    symbolPattern: /^(INFY|INFOSYS)(\.NS|\.BO)?$/i,
    namePattern: /Infosys/i,
    promoter: "13.82%",
    fii: "27.09%",
    dii: "42.96%",
    public: "16.13%",
    pledged: "0.00%",
    institutionsCount: 340,
    summary: "Founders & promoters hold 13.82%. DIIs represent the single largest ownership bloc at 42.96% (Mutual Funds at 23.00%), FIIs hold 27.09%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "14.30%", fii: "30.08%", dii: "41.65%", public: "13.97%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "14.52%", fii: "30.26%", dii: "41.27%", public: "13.95%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "14.38%", fii: "28.45%", dii: "43.39%", public: "13.78%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "13.82%", fii: "27.09%", dii: "42.96%", public: "16.13%", total: "100.0%" },
    ],
  },

  // 9. Tata Motors (TATAMOTORS)
  {
    symbolPattern: /^TATAMOTORS(\.NS|\.BO)?$/i,
    namePattern: /Tata Motors/i,
    promoter: "42.51%",
    fii: "17.11%",
    dii: "16.97%",
    public: "23.41%",
    pledged: "0.00%",
    institutionsCount: 215,
    summary: "Tata Sons holds 42.51% equity. Institutions hold ~34.08% (Mutual Funds 10.05%, FIIs 17.11%) with retail and public participation at 23.41%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "42.57%", fii: "18.20%", dii: "15.90%", public: "23.33%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "42.57%", fii: "17.90%", dii: "16.30%", public: "23.23%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "42.54%", fii: "17.50%", dii: "16.60%", public: "23.36%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "42.51%", fii: "17.11%", dii: "16.97%", public: "23.41%", total: "100.0%" },
    ],
  },

  // 10. NTPC Limited
  {
    symbolPattern: /^NTPC(\.NS|\.BO)?$/i,
    namePattern: /NTPC Limited/i,
    promoter: "51.10%",
    fii: "16.30%",
    dii: "29.44%",
    public: "3.16%",
    pledged: "0.00%",
    institutionsCount: 180,
    summary: "Government of India holds sovereign majority of 51.10%. DIIs (Mutual Funds and LIC) hold 29.44% and FIIs hold 16.30% with very low retail float (3.16%).",
    quarters: [
      { quarter: "Sep 2025", promoters: "51.10%", fii: "16.80%", dii: "28.94%", public: "3.16%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "51.10%", fii: "16.70%", dii: "29.19%", public: "3.01%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "51.10%", fii: "16.54%", dii: "29.13%", public: "3.23%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "51.10%", fii: "16.30%", dii: "29.44%", public: "3.16%", total: "100.0%" },
    ],
  },

  // 11. Bharti Airtel (BHARTIARTL)
  {
    symbolPattern: /^(BHARTIARTL|AIRTEL)(\.NS|\.BO)?$/i,
    namePattern: /Bharti Airtel/i,
    promoter: "50.07%",
    fii: "26.48%",
    dii: "20.76%",
    public: "2.69%",
    pledged: "0.00%",
    institutionsCount: 260,
    summary: "Promoter group holds 50.07% (Indian & Singtel). Massive institutional backing with FIIs holding 26.48% and DIIs holding 20.76%. Minimal retail free float (2.69%).",
    quarters: [
      { quarter: "Sep 2025", promoters: "50.15%", fii: "27.10%", dii: "19.90%", public: "2.85%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "50.15%", fii: "26.90%", dii: "20.20%", public: "2.75%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "50.10%", fii: "26.75%", dii: "20.45%", public: "2.70%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "50.07%", fii: "26.48%", dii: "20.76%", public: "2.69%", total: "100.0%" },
    ],
  },

  // 12. Larsen & Toubro (LT)
  {
    symbolPattern: /^LT(\.NS|\.BO)?$/i,
    namePattern: /Larsen.*Toubro/i,
    promoter: "0.00%",
    fii: "19.13%",
    dii: "42.71%",
    public: "38.16%",
    pledged: "0.00%",
    institutionsCount: 310,
    summary: "Pure professionally managed infrastructure conglomerate with 0.00% promoter holding. DIIs hold 42.71% (Mutual Funds 20.10%), FIIs hold 19.13%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "0.00%", fii: "18.30%", dii: "43.10%", public: "38.60%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "0.00%", fii: "18.60%", dii: "42.90%", public: "38.50%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "0.00%", fii: "18.88%", dii: "42.80%", public: "38.32%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "0.00%", fii: "19.13%", dii: "42.71%", public: "38.16%", total: "100.0%" },
    ],
  },

  // 13. Kotak Mahindra Bank (KOTAKBANK)
  {
    symbolPattern: /^KOTAKBANK(\.NS|\.BO)?$/i,
    namePattern: /Kotak Mahindra/i,
    promoter: "25.87%",
    fii: "25.21%",
    dii: "37.71%",
    public: "11.21%",
    pledged: "0.00%",
    institutionsCount: 275,
    summary: "Uday Kotak & promoter family hold 25.87%. DIIs hold 37.71% (Mutual Funds at 24.50%, Insurance at 10.01%), FIIs hold 25.21%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "25.89%", fii: "27.10%", dii: "35.80%", public: "11.21%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "25.89%", fii: "26.70%", dii: "36.20%", public: "11.21%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "25.87%", fii: "26.40%", dii: "36.52%", public: "11.21%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "25.87%", fii: "25.21%", dii: "37.71%", public: "11.21%", total: "100.0%" },
    ],
  },

  // 14. Axis Bank (AXISBANK)
  {
    symbolPattern: /^AXISBANK(\.NS|\.BO)?$/i,
    namePattern: /Axis Bank/i,
    promoter: "7.87%",
    fii: "41.50%",
    dii: "42.69%",
    public: "7.94%",
    pledged: "0.00%",
    institutionsCount: 290,
    summary: "SUUTI and quasi-promoters hold 7.87%. Massive institutional lock-in with DIIs at 42.69% (Mutual Funds ~33.0%) and FIIs at 41.50%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "8.15%", fii: "43.10%", dii: "41.00%", public: "7.75%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "8.14%", fii: "42.60%", dii: "41.50%", public: "7.76%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "8.14%", fii: "42.04%", dii: "41.95%", public: "7.87%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "7.87%", fii: "41.50%", dii: "42.69%", public: "7.94%", total: "100.0%" },
    ],
  },

  // 15. Coal India (COALINDIA)
  {
    symbolPattern: /^COALINDIA(\.NS|\.BO)?$/i,
    namePattern: /Coal India/i,
    promoter: "61.13%",
    fii: "10.37%",
    dii: "22.20%",
    public: "6.30%",
    pledged: "0.00%",
    institutionsCount: 195,
    summary: "Government of India holds sovereign majority of 61.13% (down 2% via June OFS). DIIs hold 22.20% and FIIs increased stake to 10.37%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "63.13%", fii: "8.10%", dii: "22.30%", public: "6.47%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "63.13%", fii: "8.25%", dii: "22.25%", public: "6.37%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "63.13%", fii: "8.38%", dii: "22.15%", public: "6.34%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "61.13%", fii: "10.37%", dii: "22.20%", public: "6.30%", total: "100.0%" },
    ],
  },

  // 16. Power Grid Corporation of India (POWERGRID)
  {
    symbolPattern: /^POWERGRID(\.NS|\.BO)?$/i,
    namePattern: /Power Grid/i,
    promoter: "51.34%",
    fii: "24.33%",
    dii: "20.70%",
    public: "3.63%",
    pledged: "0.00%",
    institutionsCount: 230,
    summary: "Government of India holds 51.34% majority. FIIs hold 24.33% and DIIs hold 20.70% (Mutual Funds at 13.62%). Very low public float at 3.63%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "51.34%", fii: "25.20%", dii: "19.90%", public: "3.56%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "51.34%", fii: "25.10%", dii: "20.10%", public: "3.46%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "51.34%", fii: "25.02%", dii: "20.15%", public: "3.49%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "51.34%", fii: "24.33%", dii: "20.70%", public: "3.63%", total: "100.0%" },
    ],
  },

  // 17. Titan Company (TITAN)
  {
    symbolPattern: /^TITAN(\.NS|\.BO)?$/i,
    namePattern: /Titan Company/i,
    promoter: "52.90%",
    fii: "15.38%",
    dii: "15.34%",
    public: "16.38%",
    pledged: "0.00%",
    institutionsCount: 220,
    summary: "Tata Group and TIDCO joint promoters hold 52.90%. Balanced institutional holding between FIIs (15.38%) and DIIs (15.34%) with 16.38% retail/public equity.",
    quarters: [
      { quarter: "Sep 2025", promoters: "52.90%", fii: "16.10%", dii: "14.70%", public: "16.30%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "52.90%", fii: "15.80%", dii: "15.00%", public: "16.30%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "52.90%", fii: "15.65%", dii: "15.15%", public: "16.30%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "52.90%", fii: "15.38%", dii: "15.34%", public: "16.38%", total: "100.0%" },
    ],
  },

  // 18. Maruti Suzuki (MARUTI)
  {
    symbolPattern: /^MARUTI(\.NS|\.BO)?$/i,
    namePattern: /Maruti Suzuki/i,
    promoter: "58.65%",
    fii: "12.82%",
    dii: "25.18%",
    public: "3.35%",
    pledged: "0.00%",
    institutionsCount: 240,
    summary: "Suzuki Motor Corp holds 58.65%. Strong domestic institutional holding of 25.18% (Mutual Funds at 15.33%) and FIIs at 12.82% with 0.00% pledged shares.",
    quarters: [
      { quarter: "Sep 2025", promoters: "58.53%", fii: "14.30%", dii: "23.80%", public: "3.37%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "58.53%", fii: "14.20%", dii: "23.95%", public: "3.32%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "58.53%", fii: "14.12%", dii: "24.01%", public: "3.34%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "58.65%", fii: "12.82%", dii: "25.18%", public: "3.35%", total: "100.0%" },
    ],
  },

  // 19. Hindustan Unilever (HINDUNILVR)
  {
    symbolPattern: /^HINDUNILVR(\.NS|\.BO)?$/i,
    namePattern: /Hindustan Unilever/i,
    promoter: "61.90%",
    fii: "9.50%",
    dii: "16.99%",
    public: "11.61%",
    pledged: "0.00%",
    institutionsCount: 250,
    summary: "Unilever PLC holds 61.90% controlling interest. DIIs hold 16.99% and FIIs hold 9.50% with public float of 11.61% and zero pledged shares.",
    quarters: [
      { quarter: "Sep 2025", promoters: "61.90%", fii: "10.40%", dii: "16.10%", public: "11.60%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "61.90%", fii: "10.10%", dii: "16.40%", public: "11.60%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "61.90%", fii: "9.80%", dii: "16.65%", public: "11.65%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "61.90%", fii: "9.50%", dii: "16.99%", public: "11.61%", total: "100.0%" },
    ],
  },

  // 20. Sun Pharmaceutical Industries (SUNPHARMA)
  {
    symbolPattern: /^SUNPHARMA(\.NS|\.BO)?$/i,
    namePattern: /Sun Pharma/i,
    promoter: "54.48%",
    fii: "14.53%",
    dii: "22.18%",
    public: "8.81%",
    pledged: "0.00%",
    institutionsCount: 210,
    summary: "Dilip Shanghvi & promoter family hold 54.48%. Domestic mutual funds and insurers hold 22.18%, FIIs hold 14.53%, with zero pledged promoter shares.",
    quarters: [
      { quarter: "Sep 2025", promoters: "54.48%", fii: "15.40%", dii: "21.30%", public: "8.82%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "54.48%", fii: "15.10%", dii: "21.60%", public: "8.82%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "54.48%", fii: "14.80%", dii: "21.90%", public: "8.82%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "54.48%", fii: "14.53%", dii: "22.18%", public: "8.81%", total: "100.0%" },
    ],
  },

  // 21. Tata Steel (TATASTEEL)
  {
    symbolPattern: /^TATASTEEL(\.NS|\.BO)?$/i,
    namePattern: /Tata Steel/i,
    promoter: "32.94%",
    fii: "19.37%",
    dii: "26.62%",
    public: "21.07%",
    pledged: "0.00%",
    institutionsCount: 280,
    summary: "Tata Sons holds 32.94% equity. Strong domestic institutional support at 26.62% and FII holding at 19.37% with 21.07% public participation.",
    quarters: [
      { quarter: "Sep 2025", promoters: "33.19%", fii: "19.20%", dii: "26.10%", public: "21.51%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "33.19%", fii: "19.10%", dii: "26.30%", public: "21.41%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "33.19%", fii: "19.05%", dii: "26.45%", public: "21.31%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "32.94%", fii: "19.37%", dii: "26.62%", public: "21.07%", total: "100.0%" },
    ],
  },

  // 22. Mahindra & Mahindra (M&M)
  {
    symbolPattern: /^(M&M|MM)(\.NS|\.BO)?$/i,
    namePattern: /Mahindra & Mahindra/i,
    promoter: "18.45%",
    fii: "34.89%",
    dii: "32.65%",
    public: "14.01%",
    pledged: "0.02%",
    institutionsCount: 260,
    summary: "Promoter family holds 18.45%. High foreign and domestic institutional lock-in of 67.54% (FIIs 34.89%, DIIs 32.65%) with negligible 0.02% pledged shares.",
    quarters: [
      { quarter: "Sep 2025", promoters: "18.52%", fii: "36.20%", dii: "31.40%", public: "13.88%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "18.52%", fii: "35.80%", dii: "31.80%", public: "13.88%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "18.48%", fii: "35.40%", dii: "32.20%", public: "13.92%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "18.45%", fii: "34.89%", dii: "32.65%", public: "14.01%", total: "100.0%" },
    ],
  },

  // 23. Bajaj Finance (BAJFINANCE)
  {
    symbolPattern: /^BAJFINANCE(\.NS|\.BO)?$/i,
    namePattern: /Bajaj Finance/i,
    promoter: "54.67%",
    fii: "20.21%",
    dii: "16.40%",
    public: "8.72%",
    pledged: "0.00%",
    institutionsCount: 240,
    summary: "Bajaj Finserv & promoter family hold 54.67%. Institutional investors hold 36.61% (FIIs 20.21%, DIIs 16.40%) with retail/public holding at 8.72%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "54.78%", fii: "21.60%", dii: "15.20%", public: "8.42%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "54.78%", fii: "21.45%", dii: "15.40%", public: "8.37%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "54.69%", fii: "21.33%", dii: "15.80%", public: "8.18%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "54.67%", fii: "20.21%", dii: "16.40%", public: "8.72%", total: "100.0%" },
    ],
  },

  // 24. Wipro Limited (WIPRO)
  {
    symbolPattern: /^WIPRO(\.NS|\.BO)?$/i,
    namePattern: /Wipro/i,
    promoter: "72.59%",
    fii: "11.14%",
    dii: "5.22%",
    public: "11.05%",
    pledged: "0.00%",
    institutionsCount: 190,
    summary: "Azim Premji and promoter trust hold dominant 72.59% stake with zero pledged shares. FIIs hold 11.14%, DIIs hold 5.22%, and public shareholders hold 11.05%.",
    quarters: [
      { quarter: "Sep 2025", promoters: "72.80%", fii: "10.40%", dii: "5.80%", public: "11.00%", total: "100.0%" },
      { quarter: "Dec 2025", promoters: "72.75%", fii: "10.60%", dii: "5.65%", public: "11.00%", total: "100.0%" },
      { quarter: "Mar 2026", promoters: "72.62%", fii: "10.79%", dii: "5.55%", public: "11.04%", total: "100.0%" },
      { quarter: "Jun 2026", promoters: "72.59%", fii: "11.14%", dii: "5.22%", public: "11.05%", total: "100.0%" },
    ],
  },
];

export function findVerifiedShareholding(query: string, symbol: string, companyName: string): StockShareholdingProfile | null {
  const cleanQ = query.trim();
  const cleanSym = symbol.trim();
  const cleanName = companyName.trim();

  for (const entry of VERIFIED_SHAREHOLDING_DATABASE) {
    if (
      entry.symbolPattern.test(cleanSym) ||
      entry.symbolPattern.test(cleanQ) ||
      entry.namePattern.test(cleanName) ||
      entry.namePattern.test(cleanQ)
    ) {
      return entry;
    }
  }
  return null;
}
