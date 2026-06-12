/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from 'src/redis/services/redisCacheService';
import { IHistoricalPriceResponse, IQuoteResponse } from '../interface/response';

interface RequestQueueItem {
  url: string;
  resolve: (value: any) => void;
  reject: (error?: any) => void;
  retryCount: number;
  timestamp: number;
}

@Injectable()
export class FmpApiService {
  private readonly logger = new Logger(FmpApiService.name);
  private readonly baseUrl = 'https://financialmodelingprep.com';
  private readonly apiKey: string;
  private readonly requestQueue: RequestQueueItem[] = [];
  private readonly maxRequestsPerMinute = 250;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly ttl = 5 * 60 * 1000;
  private processing = false;

  constructor(
    private configService: ConfigService,
    private cacheService: RedisCacheService,
  ) {
    this.apiKey = this.configService.get<string>('FMP_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('FMP_KEY not found in environment variables');
    }
    void this.processQueue();
  }

  /**
   * https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=BTCUSD
   */
  async getHistoricalPrice(
    symbol: string,
    from?: string,
    to?: string,
  ): Promise<IHistoricalPriceResponse> {
    const cacheKey = `fmp:historical:${symbol}:'all':${from || ''}:${to || ''}`;

    const cached = await this.cacheService.get<IHistoricalPriceResponse>(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${symbol}`);
      return cached;
    }

    let url = `/stable/historical-price-eod/full?symbol=${symbol}`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('apikey', this.apiKey);

    if (params.toString()) {
      url += `&${params.toString()}`;
    }

    // API trả về Array, không phải object
    const result = await this.makeRequest<Array<{
      symbol: string;
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      change: number;
      changePercent: number;
      vwap: number;
    }>>(url);

    // Transform thành format interface expect
    const transformedResult: IHistoricalPriceResponse = {
      symbol,
      historical: result.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        change: item.change,
        changePercent: item.changePercent,
        // Bỏ vwap vì interface không có
      }))
    };

    await this.cacheService.set(cacheKey, transformedResult, this.ttl);
    return transformedResult;
  }

  async getQuote(symbol: string): Promise<IQuoteResponse> {
    const cacheKey = `fmp:quote:${symbol}`;

    const cached = await this.cacheService.get<IQuoteResponse>(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${symbol}`);
      return cached;
    }

    const url = `/stable/quote?symbol=${symbol}&apikey=${this.apiKey}`;
    const result = await this.makeRequest<IQuoteResponse>(url);

    await this.cacheService.set(cacheKey, result, this.ttl);
    return result;
  }

  async getBatchQuotes(symbols: string[]): Promise<IQuoteResponse[]> {
    if (symbols.length === 0) return [];

    const promises = symbols.map(async (symbol) => {
      try {
        return await this.getQuote(symbol);
      } catch (error) {
        this.logger.error(`Error fetching quote for ${symbol}: ${error}`);
      }
    });

    const settledResults = await Promise.allSettled(promises);

    const results: IQuoteResponse[] = [];
    settledResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    });

    return results;
  }

  async getBatchHistoricalPrices(symbols: string[], from?: string, to?: string): Promise<Record<string, IHistoricalPriceResponse>> {
    const results: Record<string, IHistoricalPriceResponse> = {};

    const promises = symbols.map(async (symbol) => {
      try {
        const data = await this.getHistoricalPrice(symbol, from, to);
        results[symbol] = data;
      } catch (error) {
        this.logger.error(`Error fetching historical prices for ${symbol}: ${error}`);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const item: RequestQueueItem = {
        url: `${this.baseUrl}${endpoint}`,
        resolve,
        reject,
        retryCount: 0,
        timestamp: Date.now(),
      };
      this.requestQueue.push(item);
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (true) {
      const now = Date.now();
      if (now - this.lastResetTime > 60000) {
        this.requestCount = 0;
        this.lastResetTime = now;
      }

      if (this.requestCount >= this.maxRequestsPerMinute) {
        await this.sleep(1000);
        continue;
      }

      const item = this.requestQueue.shift();
      if (!item) {
        await this.sleep(100);
        continue;
      }

      try {
        await this.executeRequest(item);
      } catch (error) {
        this.logger.error(`Error processing request: ${error}`);
      }
    }
  }

  private async executeRequest(item: RequestQueueItem): Promise<void> {
    try {
      const seperator = item.url.includes('?') ? '&' : '?';
      const urlWithKey = `${item.url}${seperator}`;

      this.logger.debug(`Making request to ${urlWithKey}`);

      // Timeout after 10 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(urlWithKey, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Tasmil-Finance/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.requestCount++;

      if (!response.ok) {
        throw new HttpException(`FMP API error: ${response.status} -${response.statusText}`,
          response.status === 429 ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      const data: unknown = await response.json();

      if (typeof data === 'object' && data !== null && 'error' in data) {
        throw new HttpException(`FMP API error: ${(data as { error: string }).error}`, HttpStatus.BAD_GATEWAY);
      }

      item.resolve(data);

    } catch (error) {
      await this.handleRequestError(item, error);
    }
  }

  private async handleRequestError(item: RequestQueueItem, error: any): Promise<void> {
    item.retryCount++;

    if (item.retryCount <= this.maxRetries) {
      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, item.retryCount - 1);
      this.logger.warn(
        `Request failed, retrying in ${delay}ms (attempt ${item.retryCount}/${this.maxRetries}): ${item.url}`
      );

      await this.sleep(delay);
      this.requestQueue.unshift(item); // Add back to front of queue
    } else {
      this.logger.error(`Request failed after ${this.maxRetries} retries: ${item.url}`, error);
      item.reject(error);
    }
  }

  private chuckArray<T>(array: T[], chunkSize: number): T[][] {
    const chucks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chucks.push(array.slice(i, i + chunkSize));
    }
    return chucks;
  }

  healthCheck(): { status: string, queueLength: number; requestCount: number } {
    return {
      status: 'healthy',
      queueLength: this.requestQueue.length,
      requestCount: this.requestCount,
    };
  }
}
