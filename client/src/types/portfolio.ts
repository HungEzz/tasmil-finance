export interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  amount: number;
  value: number;
  share: number;
}

export interface PortfolioStats {
  netWorth: number;
  netWorthChange: number;
  netWorthChangePercent: number;
  claimable: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface RiskProfile {
  largeCap: number;
  stablecoins: number;
  midCap: number;
  smallCap: number;
  microCap: number;
}

export interface PortfolioState {
  isLoading: boolean;
  hasData: boolean;
  error: string | null;
  portfolioStats: PortfolioStats;
  tokens: TokenData[];
  riskProfile: RiskProfile;
}
