"use client";

import { useEffect, useState } from "react";
import { TokenCard } from "./token-card";
import { TokenChart, TimeRange } from "./token-chart";

interface Token {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  open: number;
  previousClose: number;
  timestamp: number;
}

export function MarketOverview() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("1D");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "/api/dashboard/market?symbols=BTCUSD,ETHUSD,SOLUSD,APTUSD",
        );
        const data = await response.json();
        // API returns array of arrays, flatten it and extract first item from each subarray
        const flattenedData = data.map((arr: Token[]) => arr[0]);
        setTokens(flattenedData);
        if (flattenedData.length > 0) {
          setSelectedToken(flattenedData[0].symbol);
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    // Set up polling every minute
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken);

  // Generate mock chart data based on current price and timestamp
  const generateChartData = (token: Token) => {
    const now = token.timestamp * 1000; // Convert to milliseconds
    const data = [];
    for (let i = 0; i < 24; i++) {
      const time = now - (23 - i) * 3600 * 1000; // Hourly data points
      const randomChange = (Math.random() - 0.5) * 2; // Random price variation
      data.push({
        timestamp: time,
        price: token.price * (1 + randomChange / 100),
      });
    }
    return data;
  };

  return (
    <div className="relative space-y-8 p-8 h-screen overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] bg-slate-800/30 animate-pulse rounded-xl backdrop-blur-sm border border-slate-700/50"
                />
              ))
          : tokens.map((token) => (
              <TokenCard
                key={token.symbol}
                symbol={token.symbol}
                name={token.name.replace(/\s*USD$/, "")}
                price={token.price}
                change={token.changePercentage}
                isSelected={token.symbol === selectedToken}
                onClick={() => setSelectedToken(token.symbol)}
              />
            ))}
      </div>

      {!isLoading && selectedTokenData && (
        <TokenChart
          data={generateChartData(selectedTokenData)}
          symbol={selectedTokenData.symbol}
          currentPrice={selectedTokenData.price}
          priceChange={selectedTokenData.changePercentage}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      )}
    </div>
  );
}
