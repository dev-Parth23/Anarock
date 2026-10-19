
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CURRENCIES = ["INR", "AED", "USD", "EUR", "SGD"];
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_KEY = "__anarockInrExchangeRates";

function getCache() {
  if (!globalThis[CACHE_KEY]) {
    globalThis[CACHE_KEY] = {
      rates: null,
      rateDates: {},
      fetchedAt: 0,
      fetchPromise: null,
    };
  }

  return globalThis[CACHE_KEY];
}

async function fetchExchangeRates() {
  const quotes = ALLOWED_CURRENCIES
    .filter((currency) => currency !== "INR")
    .join(",");

  const url =
    "https://api.frankfurter.dev/v2/rates" +
    `?base=INR&quotes=${encodeURIComponent(quotes)}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const responseText = await response.text();
  console.log(response);
  let rows;

  try {
    rows = responseText ? JSON.parse(responseText) : [];
  } catch {
    throw new Error("Frankfurter returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      rows?.message ||
      `Frankfurter returned HTTP ${response.status}.`
    );
  }

  if (!Array.isArray(rows)) {
    throw new Error("Invalid exchange-rate data.");
  }

  const rates = { INR: 1 };
  const rateDates = {};

  for (const row of rows) {
    if (
      row?.base === "INR" &&
      ALLOWED_CURRENCIES.includes(row.quote) &&
      Number.isFinite(Number(row.rate)) &&
      Number(row.rate) > 0
    ) {
      rates[row.quote] = Number(row.rate);
      rateDates[row.quote] = row.date;
    }
  }

  const missingCurrencies = ALLOWED_CURRENCIES.filter(
    (currency) =>
      currency !== "INR" &&
      !Number.isFinite(rates[currency])
  );

  if (missingCurrencies.length > 0) {
    throw new Error(
      `Missing rates for: ${missingCurrencies.join(", ")}`
    );
  }

  return {
    rates,
    rateDates,
    fetchedAt: Date.now(),
  };
}

export async function GET() {
  const cache = getCache();

  try {
    // Reuse rates for one hour within this server instance.
    if (
      cache.rates &&
      Date.now() - cache.fetchedAt < CACHE_TTL
    ) {
      return NextResponse.json({
        success: true,
        base: "INR",
        rates: cache.rates,
        rateDates: cache.rateDates,
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
        source: "Frankfurter",
        cached: true,
      });
    }

    // Reuse an in-progress request to prevent duplicate fetches.
    if (!cache.fetchPromise) {
      cache.fetchPromise = fetchExchangeRates()
        .then((result) => {
          cache.rates = result.rates;
          cache.rateDates = result.rateDates;
          cache.fetchedAt = result.fetchedAt;

          return result;
        })
        .finally(() => {
          cache.fetchPromise = null;
        });
    }

    const result = await cache.fetchPromise;

    return NextResponse.json({
      success: true,
      base: "INR",
      rates: result.rates,
      rateDates: result.rateDates,
      fetchedAt: new Date(result.fetchedAt).toISOString(),
      source: "Frankfurter",
      cached: false,
    });
  } catch (error) {
    console.error("Exchange rate API error:", error);
    if (cache.rates) {
      return NextResponse.json({
        success: true,
        base: "INR",
        rates: cache.rates,
        rateDates: cache.rateDates,
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
        source: "Frankfurter",
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        base: "INR",
        message: "Unable to fetch exchange rates.",
        rates: { INR: 1 },
      },
      { status: 502 }
    );
  }
}
