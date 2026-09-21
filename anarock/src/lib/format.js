const CURRENCY_RATES = {
  INR: 1,
  USD: 0.0118,
  EUR: 0.0108,
  GBP: 0.0093,
  AED: 0.0433,
  SGD: 0.0152,
};

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ ",
  SGD: "S$",
};


function getRates(exchangeRates = {}) {
  return {
    ...CURRENCY_RATES,
    ...exchangeRates,
    INR: 1,
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

  const from = String(fromCurrency).toUpperCase();
  const to = String(toCurrency).toUpperCase();

  if (from === to) {
    return numericAmount;
  }

  const rates = getRates(exchangeRates);

  const fromRate = Number(rates[from]) || 1;
  const toRate = Number(rates[to]) || 1;

  const amountInINR = numericAmount / fromRate;

  return amountInINR * toRate;
}
export function convertArea(
  amount,
  fromUnit = "sqft",
  toUnit = "sqft",
) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  const from = String(fromUnit).toLowerCase();
  const to = String(toUnit).toLowerCase();

  if (from === to) {
    return numericAmount;
  }

  if (from === "sqft" && to === "sqm") {
    return numericAmount * 0.09290304;
  }

  if (from === "sqm" && to === "sqft") {
    return numericAmount / 0.09290304;
  }

  return numericAmount;
}


export function formatPrice(
  priceINR,
  currency = "INR",
  exchangeRates = {},
) {
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

  const normalizedCurrency = String(currency).toUpperCase();

  const symbol =
    CURRENCY_SYMBOLS[normalizedCurrency] || normalizedCurrency;

  if (normalizedCurrency === "INR") {
    if (convertedValue >= 10000000) {
      return `${symbol}${(convertedValue / 10000000).toFixed(2)} Cr`;
    }

    if (convertedValue >= 100000) {
      return `${symbol}${(convertedValue / 100000).toFixed(2)} L`;
    }

    return `${symbol}${Math.round(convertedValue).toLocaleString(
      "en-IN",
    )}`;
  }

  if (Math.abs(convertedValue) >= 1000000) {
    return `${symbol}${(convertedValue / 1000000).toFixed(2)}M`;
  }

  if (Math.abs(convertedValue) >= 1000) {
    return `${symbol}${(convertedValue / 1000).toFixed(1)}K`;
  }

  return `${symbol}${Math.round(convertedValue).toLocaleString(
    "en-US",
  )}`;
}


export function formatArea(areaSqft, unit = "sqft") {
  const numericArea = Number(areaSqft);

  if (!Number.isFinite(numericArea)) {
    return "-";
  }

  const convertedArea = convertArea(
    numericArea,
    "sqft",
    unit,
  );

  if (unit === "sqm") {
    return `${Math.round(convertedArea).toLocaleString(
      "en-IN",
    )} sq.m`;
  }

  return `${Math.round(convertedArea).toLocaleString(
    "en-IN",
  )} sq.ft`;
}