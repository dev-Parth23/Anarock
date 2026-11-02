import { NextResponse } from "next/server";
import { getZohoAccessToken, zohoFetch } from "@/lib/zoho";
import { getOrFetchCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = Number(process.env.CITIES_CACHE_TTL || "21600") * 1000;

async function fetchCities() {
  const tokenInfo = await getZohoAccessToken();

  const url = `${tokenInfo.apiDomain}/crm/v8/City?fields=id,Name,Active_on_Website`;

  const response = await zohoFetch(url, { method: "GET" });

  if (!response.ok) {
    console.error("[Cities API] Zoho request failed:", {
      status: response.status,
    });

    throw new Error("CITY_UPSTREAM_FAILED");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("CITY_INVALID_UPSTREAM_RESPONSE");
  }

  const records = Array.isArray(data?.data) ? data.data : [];

  const cities = records
    .filter(
      (record) =>
        record.Active_on_Website === true ||
        record.Active_on_Website === "true",
    )
    .map((record) => String(record.Name || "").trim())
    .filter(Boolean);

  return [...new Set(cities)].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export async function GET() {
  try {
    const cities = await getOrFetchCache(
      "zoho:cities:website-active",
      fetchCities,
      CACHE_TTL,
      { staleWhileRevalidate: true },
    );

    return NextResponse.json(
      {
        success: true,
        cities,
        count: cities.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=21600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("[Cities API] Failed:", {
      code: error?.message || "UNKNOWN_ERROR",
      status: error?.status || null,
    });

    return NextResponse.json(
      {
        success: false,
        cities: [],
        message: "Unable to fetch cities right now. Please try again.",
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
