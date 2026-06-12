import { Card, CardContent } from "@/components/ui/card";
import { PortfolioStats, RiskProfile } from "@/types/portfolio";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PortfolioStatsCardProps {
  stats: PortfolioStats;
  riskProfile: RiskProfile;
  fetchPortfolioData: () => void;
  isLoading: boolean;
}

const DISTRIBUTION = [
  {
    key: "largeCap",
    label: "APT",
    color: "from-cyan-400 to-cyan-500",
    getValue: (r: RiskProfile) => r.largeCap,
    legend: (v: number) => `APT ${v.toFixed(1)}%`,
  },
  {
    key: "stablecoins",
    label: "Stablecoins",
    color: "from-primary to-secondary",
    getValue: (r: RiskProfile) => r.stablecoins,
    legend: (v: number) => `Stablecoins ${v.toFixed(1)}%`,
  },
  {
    key: "midCap",
    label: "Other tokens",
    color: "from-yellow-400 to-yellow-500",
    getValue: (r: RiskProfile) => r.midCap,
    legend: (v: number) => `Other tokens ${v.toFixed(1)}%`,
  },
];

function formatCurrency(value: number): string {
  if (value === 0) return "$0.00";
  if (value < 0.01) return `$${value.toFixed(6)}`;
  if (value < 1) return `$${value.toFixed(4)}`;
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercentage(value: number): string {
  if (value === 0) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function PortfolioStatsCard({
  stats,
  riskProfile,
  fetchPortfolioData,
  isLoading,
}: PortfolioStatsCardProps) {
  const segments = DISTRIBUTION.filter((d) => d.getValue(riskProfile) > 0);

  return (
    <Card className="glass border-primary/20 shadow-lg shadow-primary/5 rounded-xl">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg text-muted font-medium">Net Worth</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPortfolioData}
            disabled={isLoading}
            className="gap-2 border-primary/20 hover:border-primary/40 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl sm:text-3xl font-bold text-foreground">
            {formatCurrency(stats.netWorth)}
          </span>
          {stats.netWorthChangePercent !== 0 && (
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.netWorthChangePercent > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {stats.netWorthChangePercent > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatPercentage(stats.netWorthChangePercent)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 my-8">
          <Metric
            label="Total Assets"
            value={formatCurrency(stats.totalAssets)}
          />
          <Metric
            label="Liabilities"
            value={formatCurrency(stats.totalLiabilities)}
          />
          <Metric label="Claimable" value={formatCurrency(stats.claimable)} />
        </div>

        <h3 className="text-base font-semibold text-muted mb-3 mt-2">
          Risk Profile
        </h3>
        <div className="space-y-4">
          <div className="h-2 bg-border rounded-full overflow-hidden flex shadow-inner">
            {segments.map(({ key, color, getValue }) => (
              <div
                key={key}
                className={`bg-gradient-to-r ${color} h-full`}
                style={{ width: `${getValue(riskProfile)}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {segments.map(({ key, color, legend, getValue }) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 bg-gradient-to-r ${color} rounded-full`}
                />
                <span className="text-foreground font-medium">
                  {legend(getValue(riskProfile))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-left">
      <div className="text-base text-muted mb-1 font-medium">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}
