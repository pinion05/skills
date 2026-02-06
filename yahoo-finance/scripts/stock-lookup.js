#!/usr/bin/env bun
/**
 * Yahoo Finance Stock Lookup Script
 * Usage: bun stock-lookup.js <symbol>
 * Example: bun stock-lookup.js 005930.KS
 */

import yahooFinance from 'yahoo-finance2';

const yf = new yahooFinance({ suppressNotices: ['yahooSurvey'] });

async function getStockQuote(symbol) {
  try {
    const quote = await yf.quote(symbol);

    console.log('\n📊 Stock Quote\n');
    console.log(`Symbol:     ${quote.symbol}`);
    console.log(`Price:      ${quote.regularMarketPrice?.toLocaleString()}`);
    console.log(`Change:     ${quote.regularMarketChange?.toFixed(2)} (${quote.regularMarketChangePercent?.toFixed(2)}%)`);
    console.log(`Prev Close: ${quote.regularMarketPreviousClose?.toLocaleString()}`);
    console.log(`Day High:   ${quote.regularMarketDayHigh?.toLocaleString()}`);
    console.log(`Day Low:    ${quote.regularMarketDayLow?.toLocaleString()}`);
    console.log(`Volume:     ${quote.regularMarketVolume?.toLocaleString()}`);

    if (quote.marketCap) {
      const marketCap = quote.marketCap >= 1e12
        ? `$${(quote.marketCap / 1e12).toFixed(2)}T`
        : quote.marketCap >= 1e9
        ? `$${(quote.marketCap / 1e9).toFixed(2)}B`
        : `$${(quote.marketCap / 1e6).toFixed(2)}M`;
      console.log(`Market Cap: ${marketCap}`);
    }

    console.log('');
    return quote;

  } catch (error) {
    console.error(`❌ Error fetching quote for ${symbol}:`, error.message);
    process.exit(1);
  }
}

// Get symbol from command line
const symbol = process.argv[2];

if (!symbol) {
  console.log('Usage: bun stock-lookup.js <symbol>');
  console.log('');
  console.log('Examples:');
  console.log('  bun stock-lookup.js AAPL');
  console.log('  bun stock-lookup.js 005930.KS');
  console.log('  bun stock-lookup.js BTC-USD');
  process.exit(1);
}

getStockQuote(symbol);
