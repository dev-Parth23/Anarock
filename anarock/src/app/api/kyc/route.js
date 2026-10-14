import { NextResponse } from "next/server";
import { getKycTable } from "@/lib/catalyst";
import { getOrFetchCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = Number(process.env.KYC_CACHE_TTL || "21600") * 1000;

function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

async function fetchAllKycRows() {
  const table = await getKycTable();

  const rows = [];

  let nextToken = null;
  let page = 1;

  while (true) {
    const options = {
      maxRows: 100,
    };

    if (nextToken) {
      options.nextToken = nextToken;
    }

    const result = await table.getPagedRows(options);

    const pageRows = Array.isArray(result?.data) ? result.data : [];

    rows.push(...pageRows);

    const newNextToken = result?.next_token || result?.nextToken || null;

    const moreRecords =
      result?.more_records === true || result?.moreRecords === true;

    if (!moreRecords || !newNextToken) {
      break;
    }

    if (newNextToken === nextToken) {
      break;
    }

    nextToken = newNextToken;

    page += 1;

    if (page > 1000) {
      throw new Error("KYC pagination exceeded safety limit.");
    }
  }

  return rows;
}

function getLatestRow(rows) {
  if (!rows.length) {
    return null;
  }

  return [...rows].sort((a, b) => {
    const dateA = new Date(
      a?.MODIFIEDTIME || a?.modifiedtime || a?.ModifiedTime || 0,
    ).getTime();

    const dateB = new Date(
      b?.MODIFIEDTIME || b?.modifiedtime || b?.ModifiedTime || 0,
    ).getTime();

    return dateB - dateA;
  })[0];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const city = String(searchParams.get("city") || "").trim();

    const quarter = String(searchParams.get("quarter") || "").trim();

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: "City is required.",
        },
        {
          status: 400,
        },
      );
    }

    const rows = await getOrFetchCache(
      "catalyst:kyc:all",
      fetchAllKycRows,
      CACHE_TTL,
      {
        staleWhileRevalidate: true,
      },
    );

    const normalizedCity = normalize(city);

    const normalizedQuarter = normalize(quarter);

    let matchingRows = rows.filter(
      (row) => normalize(row?.CityName) === normalizedCity,
    );

    if (normalizedQuarter) {
      const quarterRows = matchingRows.filter(
        (row) => normalize(row?.QuarterYear) === normalizedQuarter,
      );

      if (quarterRows.length) {
        matchingRows = quarterRows;
      }
    }

    const latestRow = getLatestRow(matchingRows);

    return NextResponse.json(
      {
        success: true,
        data: latestRow,
        count: matchingRows.length,
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
    console.error("[KYC API] Failed:", {
      message: error?.message,
      status: error?.status,
    });

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch KYC data.",
      },
      {
        status: 502,
      },
    );
  }
}
