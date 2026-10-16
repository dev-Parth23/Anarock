import { NextResponse } from "next/server";
import { getZohoAccessToken, zohoFetch } from "@/lib/zoho";
import { getOrFetchCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = Number(process.env.CITIES_CACHE_TTL || "21600") * 1000;

async function fetchCities() {
  const tokenInfo = await getZohoAccessToken();

  const url =
    `${tokenInfo.apiDomain}/crm/v8/City?fields=id,Name,Active_on_Website`;

  const response = await zohoFetch(url, { method: "GET" });
  console.log(response);
  const data = await response.json();

  console.log("[Cities API] HTTP status:", response.status);
  console.log("[Cities API] Zoho response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to fetch cities from Zoho CRM."
    );
  }

  const records = Array.isArray(data?.data) ? data.data : [];

  console.log("[Cities API] Total records returned:", records.length);

  console.log(
    "[Cities API] Active field values:",
    records.map((record) => ({
      name: record.Name,
      active: record.Active_on_Website,
      type: typeof record.Active_on_Website,
    }))
  );

  const cities = records
    .filter(
      (record) =>
        record.Active_on_Website === true ||
        record.Active_on_Website === "true"
    )
    .map((record) => String(record.Name || "").trim())
    .filter(Boolean);

  return [...new Set(cities)].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}
export async function GET() {
  try {
    const cities = await getOrFetchCache(
      "zoho:cities:website-active",
      fetchCities,
      CACHE_TTL,
      { staleWhileRevalidate: true }
    );

    console.log(cities);
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
      }
    );
  } catch (error) {
    console.error("[Cities API] Failed:", {
      message: error?.message,
      status: error?.status,
    });

    return NextResponse.json(
      {
        success: false,
        cities: [],
        message: error?.message || "Unable to fetch cities.",
      },
      { status: 502 }
    );
  }
}