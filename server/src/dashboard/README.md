# Dashboard API - Hệ Thống Tối Ưu Cho Financial Modeling Prep

## Tổng Quan

Hệ thống Dashboard API được thiết kế để tối ưu hóa việc sử dụng nhiều API từ Financial Modeling Prep với các tính năng:

- **Request Batching**: Gộp nhiều request để giảm số lần gọi API
- **Intelligent Caching**: Cache thông minh với TTL tự động
- **Circuit Breaker**: Tự động ngắt khi API không ổn định
- **Fallback Mechanisms**: Dữ liệu dự phòng khi API lỗi
- **Rate Limiting**: Tuân thủ giới hạn API (250 requests/phút)
- **Error Handling**: Xử lý lỗi toàn diện với retry logic

## Kiến Trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ DashboardController │ ──▶ │ DashboardService │ ──▶ │ FmpApiService   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ RequestManager  │ ◀── │ EnhancedFmpApi  │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Batch Processing│    │ Circuit Breaker │
                       └─────────────────┘    └─────────────────┘
```

## API Endpoints

### 1. Dashboard Overview

```http
GET /api/dashboard
```

**Mô tả**: Lấy tổng quan dashboard với market overview và trending symbols

**Response**:

```json
{
  "marketOverview": [
    {
      "symbol": "BTCUSD",
      "price": 45000,
      "change": 1250,
      "changePercent": 2.85,
      "volume": 28500000000,
      "marketCap": 850000000000,
      "high52Week": 69000,
      "low52Week": 15500
    }
  ],
  "trendingSymbols": ["BTCUSD", "ETHUSD", "AAPL"],
  "priceAlerts": []
}
```

### 2. Market Overview

```http
GET /api/dashboard/market-overview?symbols=BTCUSD,ETHUSD,AAPL
```

**Mô tả**: Lấy thông tin tổng quan thị trường cho các symbols cụ thể

### 3. Historical Price

```http
GET /api/dashboard/price-history/BTCUSD?period=1M
```

**Mô tả**: Lấy dữ liệu giá lịch sử với các period: 1D, 7D, 1M, 3M, 1Y

### 4. Trending Symbols

```http
GET /api/dashboard/trending
```

**Mô tả**: Lấy danh sách symbols đang trending dựa trên volume và price changes

### 5. Search Symbols

```http
GET /api/dashboard/search?q=BTC
```

**Mô tả**: Tìm kiếm symbols theo tên hoặc ticker

### 6. Compare Symbols

```http
POST /api/dashboard/compare
Content-Type: application/json

{
  "symbols": ["BTCUSD", "ETHUSD", "AAPL"],
  "period": "1M"
}
```

**Mô tả**: So sánh nhiều symbols trong một khoảng thời gian

### 7. Health Check

```http
GET /api/dashboard/health
```

**Mô tả**: Kiểm tra tình trạng hệ thống và API connections

## Các Tính Năng Tối Ưu

### 1. Request Batching

- **Quote Batching**: Gộp tối đa 50 symbols trong 1 request
- **Intelligent Timing**: Xử lý sau 500ms hoặc khi đủ batch size
- **Parallel Processing**: Xử lý nhiều batch đồng thời

### 2. Caching Strategy

```typescript
// Cache TTL dựa trên loại dữ liệu
const cacheTTL = {
  quotes: 30, // 30 giây cho real-time data
  historical_1D: 300, // 5 phút cho dữ liệu ngày
  historical_1M: 1800, // 30 phút cho dữ liệu tháng
  market_overview: 60, // 1 phút cho tổng quan
  trending: 300, // 5 phút cho trending
};
```

### 3. Circuit Breaker

- **Threshold**: Mở circuit sau 5 lỗi liên tiếp
- **Recovery**: Thử lại sau 1 phút
- **Fallback**: Sử dụng dữ liệu cache cũ hoặc fallback data

### 4. Error Handling

```typescript
// Retry logic với exponential backoff
const retryDelays = [1000, 2000, 4000]; // 1s, 2s, 4s

// Fallback priority
1. Fresh cache data
2. Stale cache data (< 1 hour old)
3. Stored fallback data
4. Default empty response
```

## Cách Sử Dụng

### 1. Environment Variables

```env
FMP_KEY=your_financial_modeling_prep_api_key
REDIS_URL=redis://localhost:6379
```

### 2. Import Module

```typescript
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
})
export class AppModule {}
```

### 3. Inject Services

```typescript
constructor(
  private dashboardService: DashboardService,
  private fmpApiService: FmpApiService,
) {}

// Lấy dashboard data
const dashboardData = await this.dashboardService.getDashboardData();

// Lấy quotes theo batch
const quotes = await this.fmpApiService.getBatchQuotes(['BTCUSD', 'ETHUSD']);
```

## Monitoring và Metrics

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "fmpApi": {
    "status": "healthy",
    "queueLength": 3,
    "requestCount": 45
  },
  "rateLimiting": {
    "requestCount": 45,
    "maxRequests": 250
  },
  "circuitBreakers": {
    "/quote": {
      "failures": 0,
      "lastFailureTime": 0,
      "state": "CLOSED"
    }
  },
  "queueStats": {
    "quote": { "queueLength": 2, "processorExists": true },
    "historical": { "queueLength": 0, "processorExists": true }
  }
}
```

## Performance Benefits

### Trước Khi Tối Ưu

- 10 symbols = 10 API calls
- Không cache = Gọi API mỗi request
- Không error handling = Lỗi khi API down
- Rate limit violations = API bị block

### Sau Khi Tối Ưu

- 10 symbols = 1 API call (batching)
- Cache hit ratio ~80% = Giảm 80% API calls
- Circuit breaker = Tự động fallback
- Rate limiting = Không bao giờ bị block

## Best Practices

1. **Batch Requests**: Luôn request nhiều symbols cùng lúc thay vì từng cái một
2. **Cache Awareness**: Hiểu TTL của từng loại dữ liệu
3. **Error Handling**: Luôn có fallback strategy
4. **Monitoring**: Theo dõi health check để phát hiện issues sớm
5. **Rate Limiting**: Không gọi quá 250 requests/phút

## Troubleshooting

### Common Issues

1. **"No FMP_KEY found"**
   - Thiết lập environment variable FMP_KEY

2. **"Circuit breaker opened"**
   - API đang gặp vấn đề, hệ thống tự động dùng fallback data

3. **"Rate limit reached"**
   - Hệ thống tự động chờ, không cần can thiệp

4. **Empty responses**
   - Kiểm tra symbol có hợp lệ không
   - Kiểm tra API key có quyền truy cập không
