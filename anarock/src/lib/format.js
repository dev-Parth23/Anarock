import { CURRENCY_RATES, CURRENCY_SYMBOLS } from "./mockData";

function getRates(exchangeRates = {}) {
  return {
    INR: 1,
    ...CURRENCY_RATES,
    ...exchangeRates,
  };
}

export function convertCurrency(
  amount,
  fromCurrency = "INR",
  toCurrency = "INR",
  exchangeRates = {},
) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  if (fromCurrency === toCurrency) {
    return numericAmount;
  }

  const rates = getRates(exchangeRates);

  const fromRate = Number(rates[fromCurrency]) || 1;
  const toRate = Number(rates[toCurrency]) || 1;

  const amountInINR = numericAmount / fromRate;

  return amountInINR * toRate;
}

export function convertArea(amount, fromUnit = "sqft", toUnit = "sqft") {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  if (fromUnit === toUnit) {
    return numericAmount;
  }

  if (fromUnit === "sqft" && toUnit === "sqm") {
    return numericAmount / 10.7639;
  }

  if (fromUnit === "sqm" && toUnit === "sqft") {
    return numericAmount * 10.7639;
  }

  return numericAmount;
}

export function formatPrice(priceINR, currency = "INR", exchangeRates = {}) {
  const numericPrice = Number(priceINR);

  if (!Number.isFinite(numericPrice)) {
    return "-";
  }

  const convertedValue = convertCurrency(
    numericPrice,
    "INR",
    currency,
    exchangeRates,
  );

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (currency === "INR") {
    if (convertedValue >= 10000000) {
      return `${symbol}${(convertedValue / 10000000).toFixed(2)} Cr`;
    }

    if (convertedValue >= 100000) {
      return `${symbol}${(convertedValue / 100000).toFixed(2)} L`;
    }

    return `${symbol}${Math.round(convertedValue).toLocaleString("en-IN")}`;
  }

  if (Math.abs(convertedValue) >= 1000000) {
    return `${symbol}${(convertedValue / 1000000).toFixed(2)}M`;
  }

  if (Math.abs(convertedValue) >= 1000) {
    return `${symbol}${(convertedValue / 1000).toFixed(1)}K`;
  }

  return `${symbol}${Math.round(convertedValue).toLocaleString("en-US")}`;
}

export function formatArea(areaSqft, unit = "sqft") {
  const numericArea = Number(areaSqft);

  if (!Number.isFinite(numericArea)) {
    return "-";
  }

  const convertedArea = convertArea(numericArea, "sqft", unit);

  if (unit === "sqm") {
    return `${Math.round(convertedArea).toLocaleString("en-IN")} sq.m`;
  }

  return `${Math.round(convertedArea).toLocaleString("en-IN")} sq.ft`;
}
