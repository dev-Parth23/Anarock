import { NextResponse } from "next/server";
import { getZohoAccessToken, zohoFetch } from "@/lib/zoho";
import { getOrFetchCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = Number(process.env.MICROMARKETS_CACHE_TTL || "21600") * 1000;

async function fetchAllMicromarkets() {
  const tokenInfo = await getZohoAccessToken();

  const url = `${tokenInfo.apiDomain}/crm/v8/Micromarkets?fields=id,Name,City`;

  const response = await zohoFetch(url, { method: "GET" });

  if (!response.ok) {
    console.error("[Micromarkets API] Zoho request failed:", {
      status: response.status,
    });

    throw new Error("MICROMARKET_UPSTREAM_FAILED");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("MICROMARKET_INVALID_UPSTREAM_RESPONSE");
  }

  const records = Array.isArray(data?.data) ? data.data : [];

  return records
    .map((record) => ({
      id: String(record?.id || "").trim(),
      name: String(record?.Name || "").trim(),
      city:
        typeof record?.City === "string"
          ? record.City.trim()
          : String(record?.City?.name || "").trim(),
    }))
    .filter((item) => item.id && item.name);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = String(searchParams.get("city") || "").trim();

    if (!city) {
      return NextResponse.json(
        {
          success: true,
          micromarkets: [],
          count: 0,
        },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    if (city.length > 100 || /[\r\n]/.test(city)) {
      return NextResponse.json(
        {
          success: false,
          micromarkets: [],
          message: "Invalid city.",
        },
        { status: 400 },
      );
    }

    const allMicromarkets = await getOrFetchCache(
      "zoho:micromarkets",
      fetchAllMicromarkets,
      CACHE_TTL,
      { staleWhileRevalidate: true },
    );

    const normalizedCity = city.toLowerCase();

    const micromarkets = allMicromarkets
      .filter((item) => item.city.toLowerCase() === normalizedCity)
      .map((item) => ({
        id: item.id,
        name: item.name,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        }),
      );

    return NextResponse.json(
      {
        success: true,
        micromarkets,
        count: micromarkets.length,
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
    console.error("[Micromarkets API] Failed:", {
      code: error?.message || "UNKNOWN_ERROR",
      status: error?.status || null,
    });

    return NextResponse.json(
      {
        success: false,
        micromarkets: [],
        message: "Unable to fetch micromarkets right now. Please try again.",
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
