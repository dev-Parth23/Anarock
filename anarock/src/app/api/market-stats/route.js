import { NextResponse } from "next/server";
import { getStatsTable } from "@/lib/catalyst";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CACHE_TTL = Number(process.env.MARKET_STATS_CACHE_TTL || 3600) * 1000;
const globalForMarketStats = globalThis;
if (!globalForMarketStats.__anarockMarketStatsCache) {
  globalForMarketStats.__anarockMarketStatsCache = {
    data: null,
    expiresAt: 0,
    fetchPromise: null,
  };
}
const marketStatsCache = globalForMarketStats.__anarockMarketStatsCache;
function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getModifiedTime(row) {
  const value =
    row?.MODIFIEDTIME ??
    row?.modifiedtime ??
    row?.ModifiedTime ??
    row?.modifiedTime;
  if (!value) {
    return 0;
  }
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}
async function fetchMarketStatsFromCatalyst() {
  const table = await getStatsTable();
  if (!table) {
    throw new Error("Stats Data Store table could not be initialized.");
  }
  if (typeof table.getPagedRows !== "function") {
    throw new Error("Stats Data Store table is invalid.");
  }
  console.log("[Market Stats] Fetching data from Catalyst...");
  const rows = [];
  let nextToken = undefined;
  let moreRecords = true;
  while (moreRecords) {
    const response = await table.getPagedRows({
      maxRows: 100,
      ...(nextToken ? { nextToken } : {}),
    });
    const pageRows = Array.isArray(response?.data) ? response.data : [];
    rows.push(...pageRows);
    moreRecords = Boolean(response?.more_records);
    nextToken = response?.next_token || response?.nextToken || null;
    if (moreRecords && !nextToken) {
      console.warn(
        "[Market Stats] more_records=true but no next_token was returned.",
      );
      break;
    }
  }
  console.log("[Market Stats] Rows fetched:", rows.length);
  if (rows.length === 0) {
    throw new Error("Stats table does not contain any rows.");
  }
  /*  * ========================================================  * FIND LATEST ROW  * ========================================================  */
  const latestRow = rows.reduce((latest, current) => {
    if (!latest) {
      return current;
    }
    return getModifiedTime(current) > getModifiedTime(latest)
      ? current
      : latest;
  }, null);
  if (!latestRow) {
    throw new Error("Unable to determine latest Stats row.");
  }
  console.log("[Market Stats] Latest row selected.");
  const stats = {
    totalStock: toNumber(latestRow?.TotalStock),
    totalVacancy: toNumber(latestRow?.TotalVacancy),
    totalAvailableSpace: toNumber(latestRow?.TotalAvailableSpace),
    areaTransacted: toNumber(latestRow?.AreaTransacted),
    updatedAt:
      latestRow?.MODIFIEDTIME ??
      latestRow?.modifiedtime ??
      latestRow?.ModifiedTime ??
      latestRow?.modifiedTime ??
      null,
  };
  console.log("[Market Stats] Catalyst fetch completed.", stats);
  return stats;
}

async function getMarketStats() {
  const now = Date.now();
  if (marketStatsCache.data && marketStatsCache.expiresAt > now) {
    console.log("[Market Stats] Cache HIT");
    return marketStatsCache.data;
  }
  if (marketStatsCache.fetchPromise) {
    console.log("[Market Stats] Waiting for existing fetch...");
    return marketStatsCache.fetchPromise;
  }
  console.log("[Market Stats] Cache MISS - fetching Catalyst...");
  marketStatsCache.fetchPromise = fetchMarketStatsFromCatalyst()
    .then((stats) => {
      marketStatsCache.data = stats;
      marketStatsCache.expiresAt = Date.now() + CACHE_TTL;
      console.log("[Market Stats] Cache updated.", {
        ttlSeconds: CACHE_TTL / 1000,
        expiresAt: new Date(marketStatsCache.expiresAt).toISOString(),
      });
      return stats;
    })
    .catch((error) => {
      console.error("[Market Stats] Catalyst fetch failed:", error);
      throw error;
    })
    .finally(() => {
      marketStatsCache.fetchPromise = null;
    });
  return marketStatsCache.fetchPromise;
}
export async function GET() {
  try {
    const stats = await getMarketStats();
    return NextResponse.json(
      { success: true, data: stats },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("[Market Stats API] ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch market stats",
      },
      { status: 500 },
    );
  }
}
