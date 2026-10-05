import { NextResponse } from "next/server";
import { getStatsTable } from "@/lib/catalyst";
import { getOrFetchCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = Number(process.env.MARKET_STATS_CACHE_TTL || "3600") * 1000;

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

async function fetchMarketStats() {
  const table = await getStatsTable();

  if (!table) {
    throw new Error("Stats Data Store table could not be initialized.");
  }

  if (typeof table.getPagedRows !== "function") {
    throw new Error("Stats Data Store table does not support pagination.");
  }

  const rows = [];

  let nextToken = null;
  let pageCount = 0;

  while (true) {
    pageCount += 1;
    if (pageCount > 100) {
      throw new Error("Stats pagination exceeded safety limit.");
    }

    const response = await table.getPagedRows({
      maxRows: 100,
      ...(nextToken ? { nextToken } : {}),
    });

    const pageRows = Array.isArray(response?.data) ? response.data : [];

    rows.push(...pageRows);

    const moreRecords =
      response?.more_records === true || response?.moreRecords === true;

    const newNextToken = response?.next_token || response?.nextToken || null;

    if (!moreRecords || !newNextToken) {
      break;
    }
    if (newNextToken === nextToken) {
      throw new Error("Stats pagination returned the same next token.");
    }

    nextToken = newNextToken;
  }

  if (!rows.length) {
    return {
      totalStock: null,
      totalVacancy: null,
      totalAvailableSpace: null,
      areaTransacted: null,
      updatedAt: null,
    };
  }
  let latestRow = rows[0];

  for (let index = 1; index < rows.length; index += 1) {
    const currentRow = rows[index];

    if (getModifiedTime(currentRow) > getModifiedTime(latestRow)) {
      latestRow = currentRow;
    }
  }

  return {
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
}

export async function GET() {
  try {
    const stats = await getOrFetchCache(
      "catalyst:market-stats",
      fetchMarketStats,
      CACHE_TTL,
      {
        staleWhileRevalidate: true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        data: stats,
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
    console.error("[Market Stats API] Failed:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch market stats",
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
