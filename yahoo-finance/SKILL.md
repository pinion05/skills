---
name: yahoo-finance
description: Use for fetching real-time and historical stock prices, crypto prices, market data, and financial information from Yahoo Finance. Supports Korean stocks (KRX), US stocks, and global markets including cryptocurrencies like Bitcoin and Ethereum.
triggerKeywords:
  - stock price
  - 주식 가격
  - stock quote
  - 주식 시세
  - market data
  - 시장 데이터
  - crypto price
  - 암호화폐 가격
  - bitcoin
  - 비트코인
  - ethereum
  - 이더리움
  - 삼성전자 주식
  - apple stock
  - tesla stock
  - 테슬라 주식
  - investment
  - 투자
  - financial data
  - 재무정보
  - portfolio
  - 포트폴리오
---

# Yahoo Finance Skill

Real-time stock, crypto, and market data from Yahoo Finance API (unofficial community API).

## 📊 What This Skill Does

Fetches real-time financial data including:
- **Stocks**: Korean (KRX), US, and global markets
- **Crypto**: Bitcoin, Ethereum, and other cryptocurrencies
- **Market data**: Prices, changes, volume, market cap
- **Historical data**: Past prices and trends
- **Fundamentals**: Financial statements, earnings, SEC filings
- **Options**: Option chain data
- **Screening**: Stock screener with custom filters
- **Insights**: Analyst recommendations, price targets
- **Search**: Find stocks by company name

## ⚠️ Important Disclaimer

**This is an UNOFFICIAL API** not created or endorsed by Yahoo Inc.
- Yahoo provides no official API or guarantees about service availability
- Use at your own risk - developers cannot be responsible for any losses
- Service may break or change without notice
- **Delisted stocks**: All data (including historical) is removed when a stock is delisted

## 🚀 Quick Start

```bash
# Install dependency
bun add yahoo-finance2
```

```javascript
import YahooFinance from 'yahoo-finance2';

// Create instance with options
const yf = new YahooFinance({
  // Suppress survey notice (recommended)
  suppressNotices: ['yahooSurvey']
});

// Basic usage
const quote = await yf.quote('AAPL');
console.log(`Apple: $${quote.regularMarketPrice}`);
```

## 📦 Available Modules

### Core Modules
- `quote` - Real-time stock/crypto quotes
- `historical` - Historical price data
- `chart` - Chart data with custom intervals
- `search` - Search for stocks by name/symbol

### Financial Data
- `quoteSummary` - Comprehensive company data
  - Submodules: `assetProfile`, `balanceSheetHistory`, `cashflowStatementHistory`,
    `earnings`, `earningsHistory`, `financialData`, `incomeStatementHistory`,
    `defaultKeyStatistics`, `price`, `summaryDetail`, `summaryProfile`, `secFilings`
- `fundamentalsTimeSeries` - Fundamental metrics over time
- `recommendationsBySymbol` - Analyst recommendations
- `trendingSymbols` - Trending stocks by region

### Advanced
- `options` - Option chains
- `screener` - Stock screening with filters
- `insights` - Analyst insights and price targets

## 📈 Common Stock Symbols

### Korean Stocks (KRX)
- `005930.KS` - Samsung Electronics (삼성전자)
- `000660.KS` - SK Hynix (SK하이닉스)
- `373220.KS` - LG Energy Solution (LG에너지솔루션)
- `035420.KS` - NAVER (네이버)
- `035720.KS` - Kakao (카카오)
- `005380.KS` - Hyundai Motor (현대차)
- `051910.KS` - LG Chem (LG화학)
- `066570.KS` - LG Electronics (LG전자)

### US Stocks
- `AAPL` - Apple
- `TSLA` - Tesla
- `NVDA` - NVIDIA
- `MSFT` - Microsoft
- `GOOGL` - Google/Alphabet
- `AMZN` - Amazon
- `META` - Meta
- `AMD` - AMD

### Crypto
- `BTC-USD` - Bitcoin
- `ETH-USD` - Ethereum
- `SOL-USD` - Solana
- `XRP-USD` - Ripple

### Global Markets
- Japan: `{code}.T` (e.g., `7203.T` for Toyota)
- China Shanghai: `{code}.SS`
- China Hong Kong: `{code}.HK` (e.g., `0700.HK` for Tencent)
- London: `{code}.L`
- Germany: `{code}.DE`
- France: `{code}.PA`

## 🎯 Usage Examples

### Example 1: Real-Time Quote
```javascript
const result = await yf.quote('005930.KS');

console.log({
  symbol: result.symbol,
  price: result.regularMarketPrice,
  currency: result.currency,
  exchangeName: result.exchangeName,
  marketState: result.marketState, // REGULAR, CLOSED, PRE, POST
  marketTime: new Date(result.regularMarketTime),
  change: result.regularMarketChange,
  changePercent: result.regularMarketChangePercent,
  previousClose: result.regularMarketPreviousClose,
  open: result.regularMarketOpen,
  dayHigh: result.regularMarketDayHigh,
  dayLow: result.regularMarketDayLow,
  volume: result.regularMarketVolume,
  marketCap: result.marketCap,
  fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
  fiftyTwoWeekLow: result.fiftyTwoWeekLow
});
```

### Example 2: Multiple Stocks
```javascript
const quotes = await yf.quote(['AAPL', 'TSLA', '005930.KS']);

quotes.forEach(quote => {
  console.log(`${quote.symbol}: $${quote.regularMarketPrice}`);
});
```

### Example 3: Historical Data
```javascript
const result = await yf.historical('AAPL', {
  period1: '2024-01-01',      // Start date (YYYY-MM-DD or timestamp)
  period2: '2024-12-31',      // End date
  interval: '1d',             // 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
  includePrePost: true,       // Include pre/post market data
  events: 'div,splits'        // Include dividends and splits
});

result.quotes.forEach(quote => {
  console.log(`${quote.date}: $${quote.close}`);
});
```

### Example 4: Chart Data (more flexible than historical)
```javascript
const result = await yf.chart('AAPL', {
  period1: '2024-01-01',
  period2: '2024-12-31',
  interval: '1d',
  includePrePost: true
});

// meta has timestamp info
console.log('Trading period:', result.meta);

// quotes has OHLCV data
result.quotes.forEach(q => {
  console.log(`${q.date}: Open $${q.open}, High $${q.high}, Low $${q.low}, Close $${q.close}, Vol ${q.volume}`);
});
```

### Example 5: Search Stocks
```javascript
const result = await yf.search('Apple');

result.quotes.forEach(quote => {
  console.log(`${quote.symbol} - ${quote.shortname} (${quote.quoteType})`);
  // Example: AAPL - Apple Inc (EQUITY)
});
```

### Example 6: Company Fundamentals (quoteSummary)
```javascript
const result = await yf.quoteSummary('AAPL', {
  modules: [
    'price',                // Current price, target price, valuation metrics
    'summaryDetail',        // Key stats (P/E, Market Cap, Dividend yield)
    'assetProfile',         // Company description, sector, industry, employees
    'incomeStatementHistory',     // Income statements (annual)
    'balanceSheetHistory',        // Balance sheets (annual)
    'cashflowStatementHistory',   // Cash flow statements (annual)
    'earnings',              // Earnings estimates
    'earningsHistory',       // Earnings surprises
    'defaultKeyStatistics',  // Key financial ratios
    'financialData',         // Current quarter financial data
    'secFilings'            // SEC filings
  ]
});

console.log('Company:', result.assetProfile.companyName);
console.log('Sector:', result.assetProfile.sector);
console.log('Industry:', result.assetProfile.industry);
console.log('Website:', result.assetProfile.website);
console.log('Employees:', result.assetProfile.fullTimeEmployees);
console.log('Market Cap:', result.summaryDetail.marketCap);
console.log('P/E Ratio:', result.summaryDetail.trailingPE);
console.log('Dividend Yield:', result.summaryDetail.dividendYield);
console.log('52 Week High:', result.summaryDetail.fiftyTwoWeekHigh);
console.log('Target Price:', result.price.targetPrice);
```

### Example 7: Options Chain
```javascript
const result = await yf.options('AAPL', {
  expiry: '2025-03-21'  // Optional: specific expiration date
});

result.calls.forEach(option => {
  console.log(`Call ${option.strike}: $${option.lastPrice} (IV: ${option.impliedVolatility})`);
});
```

### Example 8: Stock Screener
```javascript
const result = await yf.screener('equity', {
  region: 'US',
  lang: 'en-US',
  size: 25,  // Number of results
  // Available fields: see https://github.com/gadicc/yahoo-finance2/blob/master/docs/screener.md
  fieldNames: ['symbol', 'name', 'price', 'marketCap', 'pegRatio']
});

result.quotes.forEach(stock => {
  console.log(`${stock.symbol}: ${stock.price} (MCap: ${stock.marketCap})`);
});
```

### Example 9: Trending Stocks
```javascript
const result = await yf.trendingSymbols('US');

result.quotes.forEach((quote, index) => {
  console.log(`${index + 1}. ${quote.symbol} - ${quote.name}`);
});
```

### Example 10: Insights (Analyst Data)
```javascript
const result = await yf.insights('AAPL');

result.reports.reports.forEach(report => {
  console.log(`${report.firm}: ${report.rating} (${report.action})`);
  console.log(`  Price Target: $${report.priceTarget}`);
  console.log(`  Time: ${report.reportsDate}`);
});
```

## 🌐 Symbol Format by Market

| Market | Format | Example |
|--------|--------|---------|
| Korea (KRX) | `{6-digit}.KS` | `005930.KS` |
| United States | Symbol | `AAPL` |
| Japan | `{code}.T` | `7203.T` (Toyota) |
| Hong Kong | `{code}.HK` | `0700.HK` (Tencent) |
| China Shanghai | `{code}.SS` | `601398.SS` |
| China Shenzhen | `{code}.SZ` | `000001.SZ` |
| London | `{code}.L` | `TSCO.L` |
| Germany | `{code}.DE` | `DAI.DE` |
| France | `{code}.PA` | `MC.PA` |
| Italy | `{code}.MI` | `ENI.MI` |
| Spain | `{code}.MC` | `SAN.MC` |
| Australia | `{code}.AX` | `BHP.AX` |
| India | `{code}.NS` (NSE) or `.BO` (BSE) | `RELIANCE.NS` |
| Crypto | `{SYMBOL}-USD` | `BTC-USD` |
| Toronto | `{code}.TO` | `SHOP.TO` |

## 📊 Response Data Structure

### Quote Response
```javascript
{
  symbol: "AAPL",
  regularMarketPrice: 178.72,
  regularMarketPreviousClose: 175.50,
  regularMarketChange: 3.22,
  regularMarketChangePercent: 1.835,
  currency: "USD",
  exchangeName: "NMS",
  marketState: "REGULAR",  // REGULAR, PRE, POST, CLOSED
  marketCap: 2789000000000,
  volume: 52000000,
  fiftyTwoWeekHigh: 199.62,
  fiftyTwoWeekLow: 124.17
}
```

## 🔧 Error Handling

**Always wrap API calls in try-catch:**

```javascript
try {
  const quote = await yf.quote('INVALID-SYMBOL');
} catch (error) {
  if (error.name === 'Failed to retrieve data') {
    console.error('Invalid symbol or delisted stock');
  } else {
    console.error('API error:', error.message);
  }
}
```

## ⚡ Performance Tips

1. **Batch requests**: Use arrays for multiple symbols
   ```javascript
   await yf.quote(['AAPL', 'TSLA', 'MSFT']);  // Better than 3 separate calls
   ```

2. **Cache results**: Yahoo doesn't have strict rate limits but be respectful

3. **Use appropriate intervals**: For historical data, use the largest interval that meets your needs

4. **Request only needed modules**: In quoteSummary, only request modules you need

## 🚫 Limitations

1. **Browser CORS**: Cannot run directly in browser due to CORS and cookie issues
   - Solution: Use server/edge functions, then pass data to frontend

2. **Historical data**: Historical downloads may require Yahoo Premium subscription (~$500/year)
   - Real-time quotes still work fine

3. **Delisted stocks**: All data removed when stock delisted (including historical)

4. **No official support**: Community-maintained, may break without notice

## 🔍 Finding Stock Symbols

1. **Yahoo Finance website**: https://finance.yahoo.com
2. **Search function**: Use the `search` module
   ```javascript
   await yf.search('company name');
   ```
3. **Yahoo Finance lookup**: https://finance.yahoo.com/lookup

## 📚 CLI Usage

```bash
# Install globally
bun add -g yahoo-finance2

# Search for stocks
yahoo-finance2 search Apple

# Get quote
yahoo-finance2 quote AAPL

# Get quote summary
yahoo-finance2 quoteSummary GOOGL

# With specific modules
yahoo-finance2 quoteSummary NVDA '{"modules":["assetProfile","secFilings"]}'
```

## 🎯 When to Use This Skill

✅ **Use when:**
- User asks for stock prices or market data
- User wants cryptocurrency values
- User needs company financial information
- User asks about investment research
- User mentions specific company names with stock context
- User needs historical price data
- User wants analyst recommendations or price targets
- User asks for stock screening/filtering

❌ **Don't use when:**
- User wants real-time news headlines (use news API)
- User needs technical analysis indicators (calculate from historical data)
- User wants to execute trades (not supported)
- User needs real-time streaming data (not available)

## 🐛 Troubleshooting

### "No data found" or 404
- Check symbol format for the market
- Verify stock is actively traded
- Search for the symbol first: `await yf.search('company')`

### Delayed or stale data
- Free API has delays (15-20 min for some markets)
- Real-time data requires paid Yahoo Premium subscription

### "Invalid Crumb" errors
- Yahoo changed their API (happens occasionally)
- Check for updates: `bun update yahoo-finance2`
- Check GitHub issues: https://github.com/gadicc/yahoo-finance2/issues

### Historical data not working
- May require Yahoo Premium subscription
- Try shorter date ranges
- Check if stock was delisted

## 📖 Reference & Resources

- **GitHub**: https://github.com/gadicc/yahoo-finance2
- **Official Docs**: https://github.com/gadicc/yahoo-finance2/blob/dev/docs/README.md
- **NPM**: https://www.npmjs.com/package/yahoo-finance2
- **Yahoo Finance**: https://finance.yahoo.com
- **Live Demo**: https://github.com/gadicc/yahoo-finance2#live-demo
- **Issues**: https://github.com/gadicc/yahoo-finance2/issues

## 🔄 Runtime Support

- ✅ Node.js (Current & LTS: v20, v22, v24)
- ✅ Bun v1+
- ✅ Deno v2+
- ✅ Cloudflare Workers (modern)
- ❌ Browser (use via server/edge functions)

## 💡 Tips

1. **Korean stocks**: Always use 6-digit code + `.KS` suffix
2. **Suppress notices**: Always use `suppressNotices: ['yahooSurvey']`
3. **TypeScript**: Full type support available with great autocomplete
4. **Validation**: Check `quote.regularMarketPrice` exists (invalid symbols may return empty objects)
5. **Market hours**: Data availability depends on market hours and timezone
