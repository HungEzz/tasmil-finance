import { TokenData, RiskProfile, PortfolioStats } from "@/types/portfolio";
import { TOKENS } from "@/constants/token";

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
const config = new AptosConfig({ network: Network.MAINNET });
const client = new Aptos(config)

// CoinGecko API for price data
const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Token mapping for CoinGecko IDs
const TOKEN_MAPPING: Record<string, string> = {
  APT: "aptos",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  WETH: "ethereum",
  WBTC: "wrapped-bitcoin",
  ALT: "aptos-launch-token",
  MOJO: "mojo-the-summoning",
  LSD: "lsd",
  HAIR: "hair",
};

// Function to get token symbol from move address
function getTokenSymbolFromAddress(coinType: string): string {
  // Check if it matches any known token addresses
  for (const [symbol, tokenInfo] of Object.entries(TOKENS)) {
    if (tokenInfo.moveAddress === coinType || tokenInfo.hexAddress === coinType) {
      return symbol;
    }
  }

  // Fallback to extracting from the coin type
  if (coinType === "0x1::aptos_coin::AptosCoin") {
    return "APT";
  }

  // Extract the last part of the coin type as symbol
  const parts = coinType.split("::");
  return parts[parts.length - 1] || "UNK";
}

export async function fetchTokenPrices(
  symbols: string[]
): Promise<Record<string, { price: number; change24h: number }>> {
  try {
    const coinIds = symbols
      .map((symbol) => TOKEN_MAPPING[symbol])
      .filter(Boolean)
      .join(",");

    if (!coinIds) return {};

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) throw new Error("Failed to fetch prices");

    const data = await response.json();

    // Convert back to symbol-based mapping
    const priceData: Record<string, { price: number; change24h: number }> = {};

    Object.entries(TOKEN_MAPPING).forEach(([symbol, coinId]) => {
      if (data[coinId]) {
        priceData[symbol] = {
          price: data[coinId].usd || 0,
          change24h: data[coinId].usd_24h_change || 0,
        };
      }
    });

    return priceData;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return {};
  }
}

export async function fetchAptosBalance(address: string): Promise<number> {
  const resources = await client.getAccountResources({ accountAddress: address });
  const coinStore = resources.find(
    (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  );
  let value = 0;
  if (coinStore) {
    const data = coinStore.data as unknown as { coin: { value: string }; value: string };
    if (data.coin && data.coin.value) {
      value = Number(data.coin.value);
    } else if (data.value) {
      value = Number(data.value);
    }
  }
  return value / 1e8;
}

export interface AptosCoinInfo {
  symbol: string;
  name: string;
  balance: number;
}

export async function fetchAptosCoins(address: string): Promise<AptosCoinInfo[]> {
  const resources = await client.getAccountResources({ accountAddress: address });
  return resources
    .filter((r) => r.type.startsWith("0x1::coin::CoinStore<"))
    .map((r) => {
      const match = r.type.match(/CoinStore<(.+)>/);
      const coinType = match ? match[1] : "";
      const symbol = getTokenSymbolFromAddress(coinType);

      let value = 0;
      const data = r.data as unknown as { coin: { value: string }; value: string };
      if (data.coin && data.coin.value) {
        value = Number(data.coin.value);
      } else if (data.value) {
        value = Number(data.value);
      }

      // Get decimals from token info, fallback to 8
      const decimals = TOKENS[symbol]?.decimals || 8;

      return {
        symbol,
        name: TOKENS[symbol]?.name || coinType,
        balance: value / Math.pow(10, decimals),
      };
    });
}

export async function fetchAptosHistory(address: string): Promise<any[]> {
  const txs = await client.getAccountTransactions({ accountAddress: address, options: { limit: 20 } });
  return txs;
}

export async function calculateTokenData(coins: AptosCoinInfo[]): Promise<TokenData[]> {
  if (!coins || coins.length === 0) return [];

  console.log("coins: ", coins);

  // Get unique symbols for price fetching
  const symbols = [...new Set(coins.map((coin) => coin.symbol))];

  // Fetch real price data
  const priceData = await fetchTokenPrices(symbols);

  let totalValue = 0;

  const tokenData = coins
    .map((coin) => {
      const price = priceData[coin.symbol]?.price || 0;
      const change24h = priceData[coin.symbol]?.change24h || 0;
      const value = coin.balance * price; // Real USD value

      totalValue += value;

      return {
        symbol: coin.symbol,
        name: coin.name,
        price: price,
        change24h: change24h,
        amount: coin.balance,
        value: value,
        share: 0, // Will be calculated after we know total
      };
    })
    .filter((token) => token.amount > 0); // Only show tokens with actual balance

  // Calculate share percentages based on USD value
  return tokenData.map((token) => ({
    ...token,
    share: totalValue > 0 ? (token.value / totalValue) * 100 : 0,
  }));
}

export function calculateRiskProfile(tokens: TokenData[]): RiskProfile {
  if (!tokens || tokens.length === 0) {
    return { largeCap: 0, stablecoins: 0, midCap: 0, smallCap: 0, microCap: 0 };
  }

  let largeCap = 0;
  let stablecoins = 0;
  let midCap = 0;
  const smallCap = 0;
  const microCap = 0;

  tokens.forEach((token) => {
    if (["USDC", "USDT", "DAI"].includes(token.symbol)) {
      stablecoins += token.share;
    } else if (["APT"].includes(token.symbol)) {
      largeCap += token.share;
    } else {
      midCap += token.share;
    }
  });

  return { largeCap, stablecoins, midCap, smallCap, microCap };
}

export function calculatePortfolioStats(tokens: TokenData[]): PortfolioStats {
  const totalBalance = tokens.reduce((sum, token) => sum + token.value, 0);

  return {
    netWorth: totalBalance,
    netWorthChange: 0, // No historical data available
    netWorthChangePercent: 0, // No historical data available
    claimable: 0, // No claimable data from API
    totalAssets: totalBalance,
    totalLiabilities: 0, // No liability data from API
  };
}

export function formatBalance(value: number, decimals: number = 6): string {
  return value.toFixed(decimals);
}
