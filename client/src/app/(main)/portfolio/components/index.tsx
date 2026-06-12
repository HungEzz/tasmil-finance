"use client";

import {
  calculatePortfolioStats,
  calculateRiskProfile,
  calculateTokenData,
  fetchAptosCoins,
} from "@/lib/aptos/aptos-helpers";
import { useEffect, useMemo, useState } from "react";
import { TokenData } from "@/types/portfolio";
import ChartOverview from "./chart-overview";
import { PortfolioStatsCard } from "./portfolio-overview";
import { EmptyPortfolioState } from "./state/empty";
import { ErrorState } from "./state/error";
import { LoadingState } from "./state/loading";
import { NoWalletState } from "./state/no-wallet";
import TokenBreakdown from "./token-breakdown/token-breakdown";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWalletStore } from "@/store/use-wallet";

const Portfolio = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet();
  const { tasmilAddress, signing } = useWalletStore();

  const riskProfile = useMemo(() => calculateRiskProfile(tokens), [tokens]);
  const portfolioStats = useMemo(
    () => calculatePortfolioStats(tokens),
    [tokens]
  );

  const fetchPortfolioData = async () => {
    if (signing) return;
    if (!tasmilAddress || !account) {
      setError("No wallet address available");
      setHasData(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const coins = await fetchAptosCoins(tasmilAddress);

      if (!coins || coins.length === 0) {
        setHasData(false);
        setTokens([]);
      } else {
        // Calculate token data with real prices
        const tokenData = await calculateTokenData(coins);
        setTokens(tokenData);
        setHasData(tokenData.length > 0);
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setError("Failed to fetch portfolio data");
      setHasData(false);
      setTokens([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolioData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasmilAddress]);

  if (isLoading || signing) {
    return <LoadingState />;
  }

  if (!tasmilAddress || !account) {
    return <NoWalletState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPortfolioData} />;
  }

  if (!hasData || tokens.length === 0) {
    return (
      <EmptyPortfolioState
        isLoading={isLoading}
        onRefresh={fetchPortfolioData}
      />
    );
  }

  return (
    <div className="w-full min-h-screen max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioStatsCard
          stats={portfolioStats}
          riskProfile={riskProfile}
          fetchPortfolioData={fetchPortfolioData}
          isLoading={isLoading}
        />
        <ChartOverview tokens={tokens} />
      </div>

      <TokenBreakdown tokens={tokens} />
    </div>
  );
};

export default Portfolio;
