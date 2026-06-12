"use client";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/aptos/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { TimeRange } from "./token-chart";

interface TokenCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  isSelected?: boolean;
  onClick?: () => void;
}

interface PriceHistory {
  timestamp: number;
  price: number;
}

export function TokenCard({
  symbol,
  name,
  price,
  change,
  isSelected,
  onClick,
}: TokenCardProps) {
  const isPositive = change >= 0;
  const [historicalData, setHistoricalData] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);

        // Default to 1M for mini chart to show month trend
        const period: TimeRange = "1M";
        const response = await fetch(
          `/api/dashboard/get-history?symbols=${symbol}&period=${period}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(`Historical data for ${symbol}:`, data);

        if (data[symbol] && Array.isArray(data[symbol])) {
          setHistoricalData(
            data[symbol].map((item: any) => ({
              timestamp: item.timestamp,
              price: item.price,
            }))
          );
        } else {
          // Fallback: generate mock data if API fails
          const mockData = Array.from({ length: 30 }, (_, i) => ({
            timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
            price: price * (1 + (Math.random() - 0.5) * 0.1),
          }));
          setHistoricalData(mockData);
        }
      } catch (error) {
        console.error(`Failed to fetch historical data for ${symbol}:`, error);

        // Generate fallback mock data
        const mockData = Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          price: price * (1 + (Math.random() - 0.5) * 0.1),
        }));
        setHistoricalData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, price]);

  return (
    <Card
      className={`relative bg-gray-950 overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group ${
        isSelected ? "ring-2 ring-primary/30 border-primary/30" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-lg">{name}</h3>
            <p className="text-slate-400 text-sm font-medium">{symbol}</p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              isPositive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isPositive ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-white mb-1">
            ${formatNumber(price)}
          </div>
          <div
            className={`text-sm font-medium ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : "-"}$
            {formatNumber(Math.abs((change * price) / 100))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-16 -mx-2">
          {isLoading ? (
            <div className="h-full bg-slate-700/30 animate-pulse rounded-lg" />
          ) : historicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No chart data
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
}
