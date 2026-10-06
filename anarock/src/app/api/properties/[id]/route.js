import { NextResponse } from "next/server";

import { getPropertiesTable } from "@/lib/catalyst";

import { mapProperty } from "@/lib/propertyMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = Number(process.env.PROPERTY_DETAIL_CACHE_TTL || "600") * 1000;

const globalState = globalThis;

if (!globalState.__anarockPropertyDetailCache) {
  globalState.__anarockPropertyDetailCache = new Map();
}

const propertyCache = globalState.__anarockPropertyDetailCache;

function getRowId(row) {
  return String(
    row?.ROWID ??
    row?.rowId ??
    row?.RowID ??
    row?.rowID ??
    row?.id ??
    row?.ID ??
    "",
  ).trim();
}

async function findPropertyRow(table, requestedId) {
  const targetId = String(requestedId ?? "").trim();

  if (!targetId) {
    return null;
  }

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

    const rows = Array.isArray(result?.data) ? result.data : [];

    const matchedRow = rows.find((row) => getRowId(row) === targetId);

    if (matchedRow) {
      return matchedRow;
    }

    const newNextToken = result?.next_token || result?.nextToken || null;

    const moreRecords =
      result?.more_records === true || result?.moreRecords === true;

    if (!moreRecords || !newNextToken) {
      break;
    }

    if (newNextToken === nextToken) {
      console.warn(
        "[Property Detail API] Catalyst returned the same next token. Stopping pagination.",
      );

      break;
    }

    nextToken = newNextToken;

    page += 1;


    if (page > 1000) {
      throw new Error("Property pagination exceeded safety limit");
    }
  }

  return null;
}

async function getCachedProperty(id) {
  const now = Date.now();

  const cached = propertyCache.get(id);


  if (cached && cached.data && cached.expiresAt > now) {
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = (async () => {

    const table = await getPropertiesTable();

    const row = await findPropertyRow(table, id);

    if (!row) {
      return null;
    }

    return mapProperty(row);
  })();

  propertyCache.set(id, {
    data: cached?.data || null,

    expiresAt: cached?.expiresAt || 0,

    promise,
  });

  try {
    const property = await promise;

    propertyCache.set(id, {
      data: property,

      expiresAt: Date.now() + CACHE_TTL,

      promise: null,
    });

    return property;
  } catch (error) {
    /*
     * Don't leave a failed Promise
     * inside the cache.
     */
    propertyCache.delete(id);

    throw error;
  }
}

export async function GET(request, { params }) {
  try {
    const id = String(params?.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Property ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const property = await getCachedProperty(id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        data: property,

        property,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    const errorMessage =
      error?.message ||
      (typeof error === "string" ? error : "Failed to fetch property");

    console.error("[Property Detail API] GET failed:", {
      message: error?.message,

      name: error?.name,

      code: error?.code,

      status: error?.status,
    });

    return NextResponse.json(
      {
        success: false,

        error: errorMessage,
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
