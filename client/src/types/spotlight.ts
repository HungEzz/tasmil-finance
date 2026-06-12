export interface TokenData {
  rank: number;
  icon: string;
  name: string;
  symbol: string;
  price: string | number;
  age: string;
  change1h: number;
  change6h: number;
  change24h: number;
  volume24h: string;
  txns24h: string;
  marketCap: string;
  liquidity: string;
  makers24h: string;
  tags?: string[];
}
