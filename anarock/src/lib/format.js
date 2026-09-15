import { CURRENCY_RATES, CURRENCY_SYMBOLS } from './mockData';

export function formatPrice(priceINR, currency = 'INR') {
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  const value = priceINR * rate;
  if (currency === 'INR') {
    if (value >= 10000000) return `${symbol}${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${symbol}${(value / 100000).toFixed(2)} L`;
    return `${symbol}${value.toLocaleString('en-IN')}`;
  }
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(1)}K`;
  return `${symbol}${Math.round(value).toLocaleString()}`;
}

export function formatArea(sqft, unit = 'sqft') {
  if (unit === 'sqm') return `${Math.round(sqft / 10.764).toLocaleString()} sq.m`;
  return `${sqft.toLocaleString()} sq.ft`;
}
