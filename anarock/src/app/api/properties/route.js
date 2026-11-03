import { NextResponse } from "next/server";
import {
  getPropertyCandidates,
  getPropertiesByIds,
  getPropertiesCacheInfo,
} from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 50;
const MAX_TARGET_IDS = 10;

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeMatch(value) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .replace(/[,₹$€£\s]/g, "")
    .trim();
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function firstValue(property, keys) {
  for (const key of keys) {
    const value = property?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return null;
}

function propertyId(property) {
  return String(property?.id ?? "").trim();
}

function propertyType(property) {
  return normalizeMatch(firstValue(property, ["officeType"]));
}

function propertyCity(property) {
  return normalizeMatch(firstValue(property, ["city"]));
}

function propertyMicromarket(property) {
  return normalize(firstValue(property, ["micromarket"]))
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function propertyName(property) {
  return String(firstValue(property, ["name"]) || "").trim();
}
function propertyPrice(property) {
  const type = propertyType(property);
  const managedOffice =
    type.includes("managedoffice") || type.includes("coworking");
  const keys = managedOffice ? ["monthlyCostPerSeat"] : ["quotedRent"];
  return parseNumber(firstValue(property, keys));
}

function propertyArea(property) {
  return parseNumber(firstValue(property, ["totalLeasableAreaAvailable"]));
}
function propertySeats(property) {
  return parseNumber(firstValue(property, ["NoOfSeatsOffered"]));
}

function parsePositiveInteger(value, fallback, maximum = Infinity) {
  const parsed = Number(value);
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), maximum);
}

function sortProperties(properties, sort) {
  const allowedSorts = new Set([
    "budget_asc",
    "budget_desc",
    "area_asc",
    "area_desc",
    "seats_asc",
    "seats_desc",
    "name_asc",
    "name_desc",
  ]);

  if (!allowedSorts.has(sort)) {
    return properties;
  }

  const descending = sort.endsWith("_desc");
  const isNameSort = sort.startsWith("name_");
  function sortValue(property) {
    if (isNameSort) return propertyName(property);
    if (sort.startsWith("budget_")) {
      return propertyPrice(property);
    }
    if (sort.startsWith("area_")) {
      return propertyArea(property);
    }
    return propertySeats(property);
  }

  return [...properties].sort((a, b) => {
    const aValue = sortValue(a);
    const bValue = sortValue(b);
    if (!isNameSort) {
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
    }
    let comparison;
    if (isNameSort) {
      comparison = String(aValue).localeCompare(String(bValue), undefined, {
        sensitivity: "base",
        numeric: true,
      });
    } else {
      comparison = aValue - bValue;
    }

    if (comparison !== 0) {
      return descending ? -comparison : comparison;
    }

    return propertyId(a).localeCompare(propertyId(b), undefined, {
      numeric: true,
    });
  });
}

function matchesMicromarkets(property, selectedMarkets) {
  if (!selectedMarkets.length) return true;
  const market = propertyMicromarket(property);
  if (!market) return false;
  return selectedMarkets.some(
    (selected) => market === selected || market.includes(selected),
  );
}

function cacheResponseHeaders(cacheInfo, count, total, noStore = false) {
  return {
    "Cache-Control": noStore
      ? "no-store"
      : "public, s-maxage=30, stale-while-revalidate=60",
    "X-Properties-Count": String(count),
    "X-Properties-Total": String(total),
    "X-Properties-Cache": cacheInfo.isFresh
      ? "fresh"
      : cacheInfo.isStale
        ? "stale"
        : "cold",
  };
}

export async function GET(request) {
  const startedAt = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const micromarket = searchParams.get("micromarket") || "";
    const minBudget = searchParams.get("minBudget") || "";
    const area = searchParams.get("area") || "";
    const seats = searchParams.get("seats") || "";
    const sort = searchParams.get("sort") || "";
    const prompt = searchParams.get("prompt") || "";
    const hasPagination =
      searchParams.has("page") ||
      searchParams.has("pageSize") ||
      searchParams.has("limit");
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const pageSize = parsePositiveInteger(
      searchParams.get("pageSize") ?? searchParams.get("limit"),
      30,
      MAX_PAGE_SIZE,
    );
    const requestedIds = [
      ...new Set(
        (searchParams.get("ids") || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ].slice(0, MAX_TARGET_IDS);
    if (requestedIds.length > 0) {
      const data = await getPropertiesByIds(requestedIds);
      const cacheInfo = getPropertiesCacheInfo();
      return NextResponse.json(
        {
          success: true,
          data,
          total: data.length,
          page: 1,
          pageSize: data.length,
          totalPages: data.length ? 1 : 0,
          hasMore: false,
          cachedAt: cacheInfo.cachedAt,
          cache: {
            count: cacheInfo.count,
            isFresh: cacheInfo.isFresh,
            isStale: cacheInfo.isStale,
            refreshInProgress: cacheInfo.refreshInProgress,
          },
        },
        {
          headers: cacheResponseHeaders(
            cacheInfo,
            data.length,
            data.length,
            true,
          ),
        },
      );
    }

    const indexedType = type && normalize(type) !== "ai" ? type : "";
    const selectedMarkets = [
      ...new Set(
        micromarket
          .split(",")
          .map((value) =>
            value
              .toLowerCase()
              .replace(/[_-]+/g, " ")
              .replace(/[^\w\s/]/g, "")
              .replace(/\s+/g, " ")
              .trim(),
          )
          .filter(Boolean),
      ),
    ];
    let filtered = await getPropertyCandidates({
      city,
      type: indexedType,
      micromarkets: [],
    });

    if (selectedMarkets.length) {
      filtered = filtered.filter((property) =>
        matchesMicromarkets(property, selectedMarkets),
      );
    }

    if (minBudget !== "") {
      const minimum = parseNumber(minBudget);

      if (minimum !== null && minimum >= 0) {
        filtered = filtered.filter((property) => {
          const price = propertyPrice(property);

          return price !== null && price >= minimum;
        });
      }
    }

    if (area !== "") {
      const minimumArea = parseNumber(area);

      if (minimumArea !== null && minimumArea >= 0) {
        filtered = filtered.filter((property) => {
          const value = propertyArea(property);

          return value !== null && value >= minimumArea;
        });
      }
    }

    if (seats !== "") {
      const minimumSeats = parseNumber(seats);

      if (minimumSeats !== null && minimumSeats >= 0) {
        filtered = filtered.filter((property) => {
          const value = propertySeats(property);

          return value !== null && value >= minimumSeats;
        });
      }
    }

    void prompt;

    filtered = sortProperties(filtered, sort);

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);

    const responseData = hasPagination
      ? filtered.slice((page - 1) * pageSize, page * pageSize)
      : filtered;

    const cacheInfo = getPropertiesCacheInfo();
    const durationMs = Date.now() - startedAt;

    console.info("[Properties API]", {
      durationMs,
      city: city || null,
      type: type || null,
      total,
      returned: responseData.length,
      page: hasPagination ? page : null,
      pageSize: hasPagination ? pageSize : null,
      cacheCount: cacheInfo.count,
      cacheFresh: cacheInfo.isFresh,
      cacheStale: cacheInfo.isStale,
      refreshInProgress: cacheInfo.refreshInProgress,
    });

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        total,
        page: hasPagination ? page : 1,
        pageSize: hasPagination ? pageSize : total,
        totalPages: hasPagination ? totalPages : total ? 1 : 0,
        hasMore: hasPagination && page < totalPages,
        cachedAt: cacheInfo.cachedAt,
        cache: {
          count: cacheInfo.count,
          isFresh: cacheInfo.isFresh,
          isStale: cacheInfo.isStale,
          refreshInProgress: cacheInfo.refreshInProgress,
        },
      },
      {
        headers: cacheResponseHeaders(cacheInfo, responseData.length, total),
      },
    );
  } catch (error) {
    console.error("[Properties API] Request failed:", {
      message: error?.message || String(error),
      name: error?.name || null,
      code: error?.code || null,
      status: error?.status || null,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message || String(error)
            : undefined,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
