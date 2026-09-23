import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const MIN_REQUEST_INTERVAL = 1200;
const locationCache = globalThis.__anarockLocationCache || new Map();
const locationRequestState = globalThis.__anarockLocationRequestState || {
  lastRequestAt: 0,
};
globalThis.__anarockLocationCache = locationCache;
globalThis.__anarockLocationRequestState = locationRequestState;

function normalizeCoordinates(latitude, longitude) {
  return {
    latitude: Math.round(latitude * 10000) / 10000,

    longitude: Math.round(longitude * 10000) / 10000,
  };
}

async function waitForRateLimit() {
  const now = Date.now();

  const elapsed = now - locationRequestState.lastRequestAt;
  const waitTime = MIN_REQUEST_INTERVAL - elapsed;
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  locationRequestState.lastRequestAt = Date.now();
}

async function reverseGeocodeNominatim(latitude, longitude) {
  const { latitude: normalizedLatitude, longitude: normalizedLongitude } =
    normalizeCoordinates(latitude, longitude);
  const cacheKey = `${normalizedLatitude},${normalizedLongitude}`;
  const cached = locationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("[LOCATION] Cache hit:", cacheKey);

    return cached.location;
  }
  await waitForRateLimit();
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "ANAROCK-Commercial-Property-Platform/1.0 (+https://www.anarock.com)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    const responseText = await response.text();
    if (response.status === 429) {
      console.warn("[LOCATION] Nominatim rate limited.");
      const retryAfter = response.headers.get("retry-after");
      const error = new Error("Nominatim rate limit reached.");
      error.code = "NOMINATIM_RATE_LIMIT";
      error.retryAfter = retryAfter || null;
      throw error;
    }
    if (!response.ok) {
      throw new Error(
        `Nominatim request failed with status ${response.status}`,
      );
    }
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Nominatim returned invalid JSON.");
    }

    if (!data?.address) {
      throw new Error("Nominatim returned no address.");
    }
    const address = data.address;
    const location = {
      city:
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        address.city_district ||
        "",

      area:
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.quarter ||
        address.city_district ||
        "",
      pincode: address.postcode || "",
      state: address.state || address.state_district || "",
      country: address.country || "",
      displayName: data.display_name || "",
    };
    locationCache.set(cacheKey, { timestamp: Date.now(), location });
    return location;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid latitude and longitude are required.",
        },
        {
          status: 400,
        },
      );
    }
    try {
      const location = await reverseGeocodeNominatim(latitude, longitude);
      return NextResponse.json({
        success: true,
        provider: "nominatim",
        location: {
          latitude,
          longitude,
          ...location,
        },
      });
    } catch (error) {
      console.error(
        "[LOCATION] Reverse geocoding failed:",
        error?.message || error,
      );
      return NextResponse.json({
        success: false,
        location: null,
        message:
          error?.code === "NOMINATIM_RATE_LIMIT"
            ? "Location service is temporarily rate limited."
            : "Unable to determine your location.",
        code: error?.code || "LOCATION_UNAVAILABLE",
      });
    }
  } catch (error) {
    console.error("[LOCATION] API error:", error);
    return NextResponse.json(
      {
        success: false,
        location: null,
        message: "Location service failed.",
        code: "LOCATION_API_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}
