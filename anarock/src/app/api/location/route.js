import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

const CACHE_TTL = 24 * 60 * 60 * 1000;
const MIN_REQUEST_INTERVAL = 1200;
const MAX_CACHE_ENTRIES = 1000;
const MAX_BODY_SIZE = 2048;

const locationCache = globalThis.__anarockLocationCache || new Map();

const locationInFlight = globalThis.__anarockLocationInFlight || new Map();

const locationRequestState = globalThis.__anarockLocationRequestState || {
  lastRequestAt: 0,
  queue: Promise.resolve(),
};

globalThis.__anarockLocationCache = locationCache;
globalThis.__anarockLocationInFlight = locationInFlight;
globalThis.__anarockLocationRequestState = locationRequestState;

function jsonError(message, status) {
  return NextResponse.json(
    {
      success: false,
      location: null,
      message,
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

async function readLimitedJson(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > MAX_BODY_SIZE) {
    const error = new Error("BODY_TOO_LARGE");
    error.status = 413;
    throw error;
  }

  if (!request.body) {
    const error = new Error("INVALID_JSON");
    error.status = 400;
    throw error;
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_BODY_SIZE) {
        await reader.cancel();

        const error = new Error("BODY_TOO_LARGE");
        error.status = 413;
        throw error;
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(combined));
  } catch {
    const error = new Error("INVALID_JSON");
    error.status = 400;
    throw error;
  }
}

function normalizeCoordinates(latitude, longitude) {
  return {
    latitude: Math.round(latitude * 10000) / 10000,
    longitude: Math.round(longitude * 10000) / 10000,
  };
}

function setLocationCache(key, location) {
  if (locationCache.has(key)) {
    locationCache.delete(key);
  }

  locationCache.set(key, {
    timestamp: Date.now(),
    location,
  });

  while (locationCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = locationCache.keys().next().value;

    if (oldestKey === undefined) break;

    locationCache.delete(oldestKey);
  }
}

async function runNominatimInSequence(task) {
  const previous = locationRequestState.queue;

  let release;

  locationRequestState.queue = new Promise((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    const elapsed = Date.now() - locationRequestState.lastRequestAt;

    const waitTime = MIN_REQUEST_INTERVAL - elapsed;

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    locationRequestState.lastRequestAt = Date.now();

    return await task();
  } finally {
    release();
  }
}

async function reverseGeocodeNominatim(latitude, longitude) {
  const { latitude: normalizedLatitude, longitude: normalizedLongitude } =
    normalizeCoordinates(latitude, longitude);

  const cacheKey = `${normalizedLatitude},${normalizedLongitude}`;

  const cached = locationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    locationCache.delete(cacheKey);
    locationCache.set(cacheKey, cached);

    return cached.location;
  }

  if (locationInFlight.has(cacheKey)) {
    return locationInFlight.get(cacheKey);
  }

  const lookupPromise = runNominatimInSequence(async () => {
    const url = new URL(NOMINATIM_URL);

    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "User-Agent":
            "ANAROCK-Commercial-Property-Platform/1.0 (+https://www.anarock.com)",
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      if (response.status === 429) {
        const error = new Error("NOMINATIM_RATE_LIMIT");
        error.code = "NOMINATIM_RATE_LIMIT";
        error.retryAfter = response.headers.get("retry-after") || null;
        throw error;
      }

      if (!response.ok) {
        const error = new Error("NOMINATIM_UPSTREAM_FAILED");
        error.code = "NOMINATIM_UPSTREAM_FAILED";
        throw error;
      }

      let data;

      try {
        data = await response.json();
      } catch {
        const error = new Error("NOMINATIM_INVALID_RESPONSE");
        error.code = "NOMINATIM_INVALID_RESPONSE";
        throw error;
      }

      if (!data?.address) {
        const error = new Error("NOMINATIM_ADDRESS_NOT_FOUND");
        error.code = "NOMINATIM_ADDRESS_NOT_FOUND";
        throw error;
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

      setLocationCache(cacheKey, location);

      return location;
    } finally {
      clearTimeout(timeout);
    }
  });

  locationInFlight.set(cacheKey, lookupPromise);

  try {
    return await lookupPromise;
  } finally {
    locationInFlight.delete(cacheKey);
  }
}

export async function POST(request) {
  let body;

  try {
    body = await readLimitedJson(request);
  } catch (error) {
    if (error?.status === 413) {
      return jsonError("Request body is too large.", 413);
    }

    return jsonError("Invalid JSON request body.", 400);
  }

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
    return jsonError("Valid latitude and longitude are required.", 400);
  }

  try {
    const location = await reverseGeocodeNominatim(latitude, longitude);

    return NextResponse.json(
      {
        success: true,
        provider: "nominatim",
        location: {
          latitude,
          longitude,
          ...location,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[LOCATION] Reverse geocoding failed:", {
      code: error?.code || "LOCATION_UNAVAILABLE",
      status: error?.status || null,
    });

    const isRateLimited = error?.code === "NOMINATIM_RATE_LIMIT";

    return NextResponse.json(
      {
        success: false,
        location: null,
        message: isRateLimited
          ? "Location service is temporarily rate limited."
          : "Unable to determine your location.",
        code: isRateLimited ? "NOMINATIM_RATE_LIMIT" : "LOCATION_UNAVAILABLE",
      },
      {
        status: isRateLimited ? 503 : 502,
        headers: {
          "Cache-Control": "no-store",
          ...(isRateLimited && error?.retryAfter
            ? { "Retry-After": error.retryAfter }
            : {}),
        },
      },
    );
  }
}
