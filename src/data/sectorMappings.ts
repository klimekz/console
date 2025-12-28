// Mapping of common stock tickers to their sectors and industries
// This provides a basic mapping - in production you'd use a financial data API

export interface TickerInfo {
  name: string;
  sector: string;
  industry: string;
}

export const tickerMappings: Record<string, TickerInfo> = {
  // Technology
  AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics' },
  MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software' },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services' },
  GOOG: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services' },
  META: { name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Social Media' },
  AMZN: { name: 'Amazon.com Inc.', sector: 'Technology', industry: 'E-Commerce' },
  NVDA: { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
  AMD: { name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors' },
  INTC: { name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors' },
  TSM: { name: 'Taiwan Semiconductor', sector: 'Technology', industry: 'Semiconductors' },
  AVGO: { name: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors' },
  CSCO: { name: 'Cisco Systems', sector: 'Technology', industry: 'Networking' },
  ORCL: { name: 'Oracle Corporation', sector: 'Technology', industry: 'Software' },
  CRM: { name: 'Salesforce Inc.', sector: 'Technology', industry: 'Software' },
  ADBE: { name: 'Adobe Inc.', sector: 'Technology', industry: 'Software' },
  NOW: { name: 'ServiceNow Inc.', sector: 'Technology', industry: 'Software' },
  IBM: { name: 'IBM Corporation', sector: 'Technology', industry: 'IT Services' },
  PLTR: { name: 'Palantir Technologies', sector: 'Technology', industry: 'Software' },
  SNOW: { name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Computing' },
  NET: { name: 'Cloudflare Inc.', sector: 'Technology', industry: 'Cloud Computing' },

  // Financial Services
  JPM: { name: 'JPMorgan Chase & Co.', sector: 'Financial Services', industry: 'Banking' },
  BAC: { name: 'Bank of America', sector: 'Financial Services', industry: 'Banking' },
  WFC: { name: 'Wells Fargo & Co.', sector: 'Financial Services', industry: 'Banking' },
  GS: { name: 'Goldman Sachs', sector: 'Financial Services', industry: 'Investment Banking' },
  MS: { name: 'Morgan Stanley', sector: 'Financial Services', industry: 'Investment Banking' },
  V: { name: 'Visa Inc.', sector: 'Financial Services', industry: 'Payments' },
  MA: { name: 'Mastercard Inc.', sector: 'Financial Services', industry: 'Payments' },
  PYPL: { name: 'PayPal Holdings', sector: 'Financial Services', industry: 'Payments' },
  SQ: { name: 'Block Inc.', sector: 'Financial Services', industry: 'Payments' },
  BRK: { name: 'Berkshire Hathaway', sector: 'Financial Services', industry: 'Diversified' },
  'BRK.A': { name: 'Berkshire Hathaway', sector: 'Financial Services', industry: 'Diversified' },
  'BRK.B': { name: 'Berkshire Hathaway', sector: 'Financial Services', industry: 'Diversified' },
  C: { name: 'Citigroup Inc.', sector: 'Financial Services', industry: 'Banking' },
  SCHW: { name: 'Charles Schwab', sector: 'Financial Services', industry: 'Brokerage' },
  BLK: { name: 'BlackRock Inc.', sector: 'Financial Services', industry: 'Asset Management' },

  // Healthcare
  JNJ: { name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  UNH: { name: 'UnitedHealth Group', sector: 'Healthcare', industry: 'Health Insurance' },
  PFE: { name: 'Pfizer Inc.', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  ABBV: { name: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  MRK: { name: 'Merck & Co.', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  LLY: { name: 'Eli Lilly & Co.', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  TMO: { name: 'Thermo Fisher Scientific', sector: 'Healthcare', industry: 'Medical Devices' },
  ABT: { name: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices' },
  DHR: { name: 'Danaher Corporation', sector: 'Healthcare', industry: 'Medical Devices' },
  BMY: { name: 'Bristol-Myers Squibb', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  AMGN: { name: 'Amgen Inc.', sector: 'Healthcare', industry: 'Biotechnology' },
  GILD: { name: 'Gilead Sciences', sector: 'Healthcare', industry: 'Biotechnology' },
  MRNA: { name: 'Moderna Inc.', sector: 'Healthcare', industry: 'Biotechnology' },

  // Consumer Discretionary
  TSLA: { name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles' },
  NKE: { name: 'Nike Inc.', sector: 'Consumer Discretionary', industry: 'Apparel' },
  SBUX: { name: 'Starbucks Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants' },
  MCD: { name: 'McDonald\'s Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants' },
  HD: { name: 'Home Depot Inc.', sector: 'Consumer Discretionary', industry: 'Retail' },
  LOW: { name: 'Lowe\'s Companies', sector: 'Consumer Discretionary', industry: 'Retail' },
  TGT: { name: 'Target Corporation', sector: 'Consumer Discretionary', industry: 'Retail' },
  COST: { name: 'Costco Wholesale', sector: 'Consumer Discretionary', industry: 'Retail' },
  WMT: { name: 'Walmart Inc.', sector: 'Consumer Staples', industry: 'Retail' },
  DIS: { name: 'Walt Disney Company', sector: 'Consumer Discretionary', industry: 'Entertainment' },
  NFLX: { name: 'Netflix Inc.', sector: 'Consumer Discretionary', industry: 'Streaming' },

  // Energy
  XOM: { name: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Oil & Gas' },
  CVX: { name: 'Chevron Corporation', sector: 'Energy', industry: 'Oil & Gas' },
  COP: { name: 'ConocoPhillips', sector: 'Energy', industry: 'Oil & Gas' },
  SLB: { name: 'Schlumberger Limited', sector: 'Energy', industry: 'Oil Services' },
  OXY: { name: 'Occidental Petroleum', sector: 'Energy', industry: 'Oil & Gas' },
  EOG: { name: 'EOG Resources', sector: 'Energy', industry: 'Oil & Gas' },

  // Industrials
  BA: { name: 'Boeing Company', sector: 'Industrials', industry: 'Aerospace' },
  CAT: { name: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Machinery' },
  GE: { name: 'General Electric', sector: 'Industrials', industry: 'Conglomerate' },
  HON: { name: 'Honeywell International', sector: 'Industrials', industry: 'Conglomerate' },
  UPS: { name: 'United Parcel Service', sector: 'Industrials', industry: 'Logistics' },
  FDX: { name: 'FedEx Corporation', sector: 'Industrials', industry: 'Logistics' },
  LMT: { name: 'Lockheed Martin', sector: 'Industrials', industry: 'Defense' },
  RTX: { name: 'RTX Corporation', sector: 'Industrials', industry: 'Defense' },

  // Communication Services
  T: { name: 'AT&T Inc.', sector: 'Communication Services', industry: 'Telecom' },
  VZ: { name: 'Verizon Communications', sector: 'Communication Services', industry: 'Telecom' },
  TMUS: { name: 'T-Mobile US', sector: 'Communication Services', industry: 'Telecom' },
  CMCSA: { name: 'Comcast Corporation', sector: 'Communication Services', industry: 'Media' },

  // Materials
  LIN: { name: 'Linde plc', sector: 'Materials', industry: 'Chemicals' },
  APD: { name: 'Air Products & Chemicals', sector: 'Materials', industry: 'Chemicals' },
  NEM: { name: 'Newmont Corporation', sector: 'Materials', industry: 'Mining' },
  FCX: { name: 'Freeport-McMoRan', sector: 'Materials', industry: 'Mining' },

  // Utilities
  NEE: { name: 'NextEra Energy', sector: 'Utilities', industry: 'Electric Utilities' },
  DUK: { name: 'Duke Energy', sector: 'Utilities', industry: 'Electric Utilities' },
  SO: { name: 'Southern Company', sector: 'Utilities', industry: 'Electric Utilities' },

  // Real Estate
  AMT: { name: 'American Tower', sector: 'Real Estate', industry: 'REITs' },
  PLD: { name: 'Prologis Inc.', sector: 'Real Estate', industry: 'REITs' },
  CCI: { name: 'Crown Castle', sector: 'Real Estate', industry: 'REITs' },
  EQIX: { name: 'Equinix Inc.', sector: 'Real Estate', industry: 'Data Centers' },

  // Popular ETFs
  SPY: { name: 'SPDR S&P 500 ETF', sector: 'ETF', industry: 'Broad Market' },
  QQQ: { name: 'Invesco QQQ Trust', sector: 'ETF', industry: 'Technology' },
  IWM: { name: 'iShares Russell 2000', sector: 'ETF', industry: 'Small Cap' },
  DIA: { name: 'SPDR Dow Jones ETF', sector: 'ETF', industry: 'Broad Market' },
  VTI: { name: 'Vanguard Total Stock', sector: 'ETF', industry: 'Broad Market' },
  VOO: { name: 'Vanguard S&P 500', sector: 'ETF', industry: 'Broad Market' },
  VGT: { name: 'Vanguard Info Tech', sector: 'ETF', industry: 'Technology' },
  VHT: { name: 'Vanguard Healthcare', sector: 'ETF', industry: 'Healthcare' },
  VFH: { name: 'Vanguard Financials', sector: 'ETF', industry: 'Financial Services' },
  XLK: { name: 'Technology Select SPDR', sector: 'ETF', industry: 'Technology' },
  XLF: { name: 'Financial Select SPDR', sector: 'ETF', industry: 'Financial Services' },
  XLE: { name: 'Energy Select SPDR', sector: 'ETF', industry: 'Energy' },
  XLV: { name: 'Health Care Select SPDR', sector: 'ETF', industry: 'Healthcare' },
  XLI: { name: 'Industrial Select SPDR', sector: 'ETF', industry: 'Industrials' },
  XLC: { name: 'Communication Services SPDR', sector: 'ETF', industry: 'Communication Services' },
  XLY: { name: 'Consumer Discretionary SPDR', sector: 'ETF', industry: 'Consumer Discretionary' },
  XLP: { name: 'Consumer Staples SPDR', sector: 'ETF', industry: 'Consumer Staples' },
  ARKK: { name: 'ARK Innovation ETF', sector: 'ETF', industry: 'Innovation' },
  ARKW: { name: 'ARK Next Gen Internet', sector: 'ETF', industry: 'Technology' },
  GLD: { name: 'SPDR Gold Shares', sector: 'ETF', industry: 'Commodities' },
  SLV: { name: 'iShares Silver Trust', sector: 'ETF', industry: 'Commodities' },
  TLT: { name: 'iShares 20+ Year Treasury', sector: 'ETF', industry: 'Bonds' },
  BND: { name: 'Vanguard Total Bond', sector: 'ETF', industry: 'Bonds' },
  VNQ: { name: 'Vanguard Real Estate ETF', sector: 'ETF', industry: 'Real Estate' },
  SCHD: { name: 'Schwab US Dividend', sector: 'ETF', industry: 'Dividend' },
  VYM: { name: 'Vanguard High Dividend', sector: 'ETF', industry: 'Dividend' },
  EEM: { name: 'iShares Emerging Markets', sector: 'ETF', industry: 'Emerging Markets' },
  VWO: { name: 'Vanguard Emerging Markets', sector: 'ETF', industry: 'Emerging Markets' },
  VXUS: { name: 'Vanguard Intl Stock', sector: 'ETF', industry: 'International' },
  EFA: { name: 'iShares EAFE', sector: 'ETF', industry: 'International' },
  SMH: { name: 'VanEck Semiconductor', sector: 'ETF', industry: 'Semiconductors' },
  SOXX: { name: 'iShares Semiconductor', sector: 'ETF', industry: 'Semiconductors' },
};

export function getTickerInfo(ticker: string): TickerInfo | null {
  const normalized = ticker.toUpperCase().trim();
  return tickerMappings[normalized] || null;
}

export function getSectorColor(sector: string): string {
  const colors: Record<string, string> = {
    'Technology': '#3b82f6',
    'Financial Services': '#10b981',
    'Healthcare': '#ef4444',
    'Consumer Discretionary': '#f59e0b',
    'Consumer Staples': '#84cc16',
    'Energy': '#f97316',
    'Industrials': '#6366f1',
    'Communication Services': '#8b5cf6',
    'Materials': '#14b8a6',
    'Utilities': '#eab308',
    'Real Estate': '#ec4899',
    'ETF': '#64748b',
  };
  return colors[sector] || '#71717a';
}
