/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from 'src/redis/services/redisCacheService';
import { FmpApiService } from '../api/fmp';
import { IHistoricalPriceResponse } from '../interface/response';
import { getDateFromPeriod } from '../utils/date';

export interface IMarketSummary {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayLow: number;
  dayHigh: number;
}

export interface IPriceHistoryData {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
  }>;
  summary: {
    currentPrice: number;
    dayChange: number;
    dayChangePercent: number;
    threeDaysAgo: number;
    fiveDaysAgo: number;
    weekAgo: number;
    monthAgo: number;
    threeMonthsAgo: number;
    sixMonthsAgo: number;
    yearAgo: number;
  };
}

export interface IDashboardData {
  marketOverview: IMarketSummary[];
  trendingSymbols: string[];
  priceAlerts: Array<{
    symbol: string;
    type: 'high' | 'low';
    threshold: number;
    currentPrice: number;
  }>;
  portfolio?: {
    totalValue: number;
    totalChange: number;
    totalChangePercent: number;
    holdings: Array<{
      symbol: string;
      quantity: number;
      value: number;
      change: number;
    }>;
  };
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly defaultSymbols = [
    'BTCUSD',
    'ETHUSD',
    'APTUSD',
    'SOLUSD',
    'DOGEUSD',
    'XRPUSD',
  ];
  private readonly ttl = 5 * 60 * 1000;

  constructor(
    private readonly fmpApiService: FmpApiService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  // async getDashboardData() {
  //   try {
  //     this.logger.log('Getting dashboard data');    }
  // }

  async getMarketOverview(symbols?: string): Promise<any> {
    const targetSymbol = symbols ? symbols.split(',') : this.defaultSymbols;

    const cacheKey = `dashboard:market-overview:${targetSymbol.join(',')}`;

    try {
      const cached = await this.redisCacheService.get(cacheKey);
      if (cached) {
        this.logger.log('Market overview data retrieved from cache');
        return cached;
      }

      const response = await this.fmpApiService.getBatchQuotes(targetSymbol);

      const marketSummary = response.map((quote) => {
        return quote;
      });

      await this.redisCacheService.set(cacheKey, marketSummary, 60 * 1000);

      return marketSummary;
    } catch (error) {
      this.logger.error(`Error getting market overview: ${error}`);
      return [];
    }
  }

  async getPriceHistory(
    symbol: string,
    period: '1D' | '3D' | '5D' | '1W' | '1M' | '3M' | '6M' | '1Y' = '1M',
  ): Promise<IPriceHistoryData> {
    const cacheKey = `dashboard:price-history:${symbol}:${period}`;
    try {
      const cached =
        await this.redisCacheService.get<IPriceHistoryData>(cacheKey);
      if (cached) {
        this.logger.log(`Price history retrieved from cache for ${cacheKey}`);
        return cached;
      }

      const limitMap = {
        '1D': 1,
        '3D': 3,
        '5D': 5,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365,
      };

      const { from, to } = getDateFromPeriod(limitMap[period]);
      const historicalData = await this.fmpApiService.getHistoricalPrice(
        symbol,
        from,
        to,
      );
      // console.log('historicalData', historicalData);
      if (!historicalData?.historical?.length) {
        throw new Error('No historical data found');
      }

      const currentQuote = await this.fmpApiService.getQuote(symbol);
      const currentPrice =
        currentQuote.price || historicalData.historical[0]?.close || 0;

      const processedData = historicalData.historical.reverse().map((item) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        change: item.close - item.open,
        changePercent: ((item.close - item.open) / item.open) * 100,
      }));

      const summary = this.calculatePriceSummary(
        processedData.map((item) => ({
          date: item.date,
          price: item.close,
          change: item.change,
        })),
        currentPrice,
      );

      const priceHistoryData: IPriceHistoryData = {
        symbol,
        data: processedData,
        summary,
      };

      const cacheTtl = period === '1D' ? 300 : period === '1W' ? 600 : 1800;

      await this.redisCacheService.set(cacheKey, priceHistoryData, cacheTtl);
      return priceHistoryData;
    } catch (error) {
      this.logger.error(`Error getting price history for ${symbol}: ${error}`);
      throw error;
    }
  }

  async getTrendingSymbols(): Promise<string[]> {
    const cacheKey = 'dashboard:trending-symbols';
    try {
      const cached = await this.redisCacheService.get<string[]>(cacheKey);
      if (cached) {
        this.logger.log('Trending symbols retrieved from cache');
        return cached;
      }

      const quotes = await this.fmpApiService.getBatchQuotes(
        this.defaultSymbols,
      );

      const trending = quotes
        .filter((quote) => quote.volume > 0 && quote.changePercentage !== 0)
        .sort((a, b) => {
          const scoreA = Math.log(a.volume || 1) * Math.abs(a.changePercentage);
          const scoreB = Math.log(b.volume || 1) * Math.abs(b.changePercentage);
          return scoreB - scoreA;
        })
        .slice(0, 5)
        .map((quote) => quote.symbol);

      console.log('trending', trending);

      await this.redisCacheService.set(cacheKey, trending, this.ttl);
      return trending;
    } catch (error) {
      this.logger.error(`Error getting trending symbols: ${error}`);
      return this.defaultSymbols.slice(0, 5);
    }
  }

  async compareSymbols(
    symbols: string[],
    period: '1D' | '3D' | '5D' | '1W' | '1M' | '3M' | '6M' | '1Y' = '1M',
  ): Promise<{
    comparison: Array<{
      symbol: string;
      currentPrice: number;
      periodChange: number;
      periodChangePercent: number;
      volume: number;
    }>;
    chartData: Array<{
      date: string;
      [symbol: string]: number | string;
    }>;
  }> {
    if (symbols.length === 0) {
      throw new Error('No symbols provided');
    }
    const cacheKey = `dashboard:compare:${symbols.join(',')}:${period}`;

    try {
      const cached = await this.redisCacheService.get(cacheKey);
      if (cached) {
        this.logger.log(`Comparison data retrieved from cache for ${cacheKey}`);
        return {
          comparison: [],
          chartData: [],
        };
      }

      const [quotes, priceHistoryMap] = await Promise.all([
        this.fmpApiService.getBatchQuotes(symbols),
        this.fmpApiService.getBatchHistoricalPrices(
          symbols,
          this.getPeriodLimit(period).toString(),
        ),
      ]);

      const comparison = quotes.map((quote) => {
        const historical = priceHistoryMap[quote.symbol]?.historical;
        const oldestPrice =
          historical?.[historical.length - 1]?.close || quote.price;
        const periodChange = quote.price - oldestPrice;
        const periodChangePercent = (periodChange / oldestPrice) * 100;

        return {
          symbol: quote.symbol,
          currentPrice: quote.price,
          periodChange,
          periodChangePercent,
          volume: quote.volume,
        };
      });

      const chartData = this.buildAlignedChartData(priceHistoryMap);

      const result = { comparison, chartData };
      await this.redisCacheService.set(cacheKey, result, this.ttl);

      return result;
    } catch (error) {
      this.logger.error(`Error comparing symbols: ${error}`);
      throw error;
    }
  }

  private buildAlignedChartData(
    historicalDataMap: Record<string, IHistoricalPriceResponse>,
  ) {
    const allDates = new Set<string>();

    Object.values(historicalDataMap).forEach((data) => {
      data.historical?.forEach((item) => {
        allDates.add(item.date);
      });
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const dataPoint: any = { date };

      Object.entries(historicalDataMap).forEach(([symbol, data]) => {
        const dayData = data.historical?.find((item) => item.date === date);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        dataPoint[symbol] = dayData?.close || null;
      });

      return dataPoint;
    });
  }

  private calculatePriceSummary(
    data: Array<{
      date: string;
      price: number;
      change: number;
    }>,
    currentPrice: number,
  ) {
    if (data.length === 0) {
      return {
        currentPrice,
        dayChange: 0,
        dayChangePercent: 0,
        threeDaysAgo: 0,
        fiveDaysAgo: 0,
        weekAgo: 0,
        monthAgo: 0,
        threeMonthsAgo: 0,
        sixMonthsAgo: 0,
        yearAgo: 0,
      };
    }

    const latestData = data[0];
    const threeDaysAgo = data[Math.min(3, data.length - 1)];
    const fiveDaysAgo = data[Math.min(5, data.length - 1)];
    const weekAgoData = data[Math.min(7, data.length - 1)];
    const monthAgoData = data[Math.min(30, data.length - 1)];
    const threeMonthsAgoData = data[Math.min(90, data.length - 1)];
    const sixMonthsAgoData = data[Math.min(180, data.length - 1)];
    const yearAgoData = data[Math.min(365, data.length - 1)];

    return {
      currentPrice,
      dayChange: latestData.change,
      dayChangePercent:
        (latestData.change / (currentPrice - latestData.change)) * 100,
      threeDaysAgo: currentPrice - threeDaysAgo.price,
      fiveDaysAgo: currentPrice - fiveDaysAgo.price,
      weekAgo: currentPrice - weekAgoData.price,
      monthAgo: currentPrice - monthAgoData.price,
      threeMonthsAgo: currentPrice - threeMonthsAgoData.price,
      sixMonthsAgo: currentPrice - sixMonthsAgoData.price,
      yearAgo: currentPrice - yearAgoData.price,
    };
  }

  private getPeriodLimit(period: string): number {
    const limitMap = {
      '1D': 1,
      '3D': 3,
      '5D': 5,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
    };

    return limitMap[period] || 30;
  }
}
