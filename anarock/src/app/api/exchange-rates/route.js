import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_CURRENCIES = ["INR", "AED", "USD", "EUR", "SGD"];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const base = (searchParams.get("base") || "INR").toUpperCase();

    if (!ALLOWED_CURRENCIES.includes(base)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported base currency.",
        },
        {
          status: 400,
        },
      );
    }

    const quotes = ALLOWED_CURRENCIES.filter(
      (currency) => currency !== base,
    ).join(",");

    const url =
      "https://api.frankfurter.dev/v2/rates" +
      `?base=${encodeURIComponent(base)}` +
      `&quotes=${encodeURIComponent(quotes)}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const responseText = await response.text();

    let rows;

    try {
      rows = responseText ? JSON.parse(responseText) : [];
    } catch {
      throw new Error(`Invalid exchange-rate response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(
        rows?.message || `Exchange-rate provider returned ${response.status}.`,
      );
    }

    const rates = {
      [base]: 1,
    };

    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (row?.quote && Number.isFinite(Number(row.rate))) {
          rates[row.quote] = Number(row.rate);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        base,
        rates,
        fetchedAt: new Date().toISOString(),
        source: "Frankfurter",
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Exchange rate API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to fetch exchange rates.",
        rates: {},
      },
      {
        status: 502,
      },
    );
  }
}
