import { NextResponse } from "next/server";
import { getStatsTable } from "@/lib/catalyst";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* =========================================================
   HELPERS
========================================================= */

function toNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
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

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}


/* =========================================================
   FETCH LATEST STATS ROW
========================================================= */

async function getMarketStats(request) {
  const table = getStatsTable(request);

  if (!table) {
    throw new Error(
      "Stats Data Store table could not be initialized."
    );
  }

  console.log(
    "[Market Stats API] Reading Stats table..."
  );


  /* =======================================================
     IMPORTANT

     Use getAllRows() instead of getRows().
  ======================================================= */

  const response = await table.getAllRows();


  console.log(
    "[Market Stats API] Raw response:",
    response
  );


  /* =======================================================
     Normalize response

     Catalyst normally returns an array here.
  ======================================================= */

  const rows = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];


  console.log(
    "[Market Stats API] Rows found:",
    rows.length
  );


  /* =======================================================
     No data
  ======================================================= */

  if (rows.length === 0) {
    throw new Error(
      "Stats table does not contain any rows."
    );
  }


  /* =======================================================
     Get latest row using MODIFIEDTIME
  ======================================================= */

  const latestRow = [...rows].sort(
    (a, b) =>
      getModifiedTime(b) -
      getModifiedTime(a)
  )[0];


  console.log(
    "[Market Stats API] Latest row:",
    latestRow
  );


  /* =======================================================
     Convert Catalyst row into frontend structure
  ======================================================= */

  const stats = {
    totalStock: toNumber(
      latestRow?.TotalStock
    ),

    totalVacancy: toNumber(
      latestRow?.TotalVacancy
    ),

    totalAvailableSpace: toNumber(
      latestRow?.TotalAvailableSpace
    ),

    areaTransacted: toNumber(
      latestRow?.AreaTransacted
    ),

    updatedAt:
      latestRow?.MODIFIEDTIME ??
      latestRow?.modifiedtime ??
      null,
  };


  console.log(
    "[Market Stats API] Final stats:",
    stats
  );


  return stats;
}

export async function GET(request) {
  try {
    const stats = await getMarketStats(request);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "[Market Stats API] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to fetch market stats",
      },
      {
        status: 500,
      }
    );
  }
}