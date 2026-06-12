"use client";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/aptos/utils";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export type TimeRange = "1D" | "3D" | "5D" | "1W" | "1M" | "3M" | "6M" | "1Y";

const TIME_RANGES: TimeRange[] = [
  "1D",
  "3D",
  "5D",
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
];

interface TokenChartProps {
  data: {
    timestamp: number;
    price: number;
  }[];
  symbol: string;
  currentPrice: number;
  priceChange: number;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function TokenChart({
  data,
  currentPrice,
  priceChange,
  timeRange,
  onTimeRangeChange,
}: TokenChartProps) {
  const isPositive = priceChange >= 0;

  // Format time based on time range
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);

    switch (timeRange) {
      case "1D":
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "3D":
      case "5D":
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      case "1W":
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      case "1M":
      case "3M":
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      case "6M":
      case "1Y":
        return date.toLocaleDateString([], { month: "short", year: "2-digit" });
      default:
        return date.toLocaleDateString();
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gray-950 border-slate-700/50 backdrop-blur-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent)] opacity-50" />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white">
              ${formatNumber(currentPrice)}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-semibold ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isPositive ? "+" : "-"}${formatNumber(Math.abs(priceChange))} (
                {Math.abs((priceChange / currentPrice) * 100).toFixed(2)}%)
              </span>
              <span className="text-slate-400 text-sm">Past {timeRange}</span>
            </div>
          </div>

          {/* Time Range Buttons */}
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                onClick={() => onTimeRangeChange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatTime}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => "$" + formatNumber(value)}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50 shadow-xl">
                        <p className="text-white font-semibold text-lg">
                          ${formatNumber(payload[0].value as number)}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {new Date(
                            payload[0].payload.timestamp
                          ).toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={3}
                fill="url(#colorGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
