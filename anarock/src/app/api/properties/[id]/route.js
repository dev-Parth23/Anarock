// import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
// import { getPropertiesTable } from "@/lib/catalyst";
// import { mapProperty } from "@/lib/propertyMapper";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// function getRowId(row) {
//   return String(
//     row?.ROWID ??
//       row?.rowId ??
//       row?.RowID ??
//       row?.rowID ??
//       row?.id ??
//       row?.ID ??
//       "",
//   ).trim();
// }

// const getCachedPropertyRows = unstable_cache(
  async () => {
    const table = await getPropertiesTable();
    const rows = [];
    let nextToken = null;
    let page = 0;
    while (page < 1000) {
      const options = { maxRows: 100 };
      if (nextToken) options.nextToken = nextToken;
      const result = await table.getPagedRows(options);
      const pageRows = Array.isArray(result?.data) ? result.data : [];
      rows.push(...pageRows);
      const newNextToken = result?.next_token || result?.nextToken || null;
      const moreRecords = result?.more_records === true || result?.moreRecords === true;
      if (!moreRecords || !newNextToken || newNextToken === nextToken) break;
      nextToken = newNextToken;
      page += 1;
    }
    return rows;
  },
  ["anarock-property-rows-v1"],
  { revalidate: Math.max(60, Number(process.env.PROPERTIES_CACHE_TTL || "300")) },
);

async function findPropertyRow(requestedId) {
  const targetId = String(requestedId ?? "").trim();
  if (!targetId) return null;
  const rows = await getCachedPropertyRows();
  return rows.find((row) => getRowId(row) === targetId) || null;
}

async function getCachedProperty(id) {
  const now = Date.now();

  const cached = propertyCache.get(id);

  /*
   * Fresh cache.
   */
  if (cached && cached.data && cached.expiresAt > now) {
    return cached.data;
  }

  /*
   * If another request is already
   * fetching this exact property,
   * reuse that Promise.
   */
  if (cached?.promise) {
    return cached.promise;
  }

  const promise = (async () => {
    /*
     * THIS is the missing line
     * in your current code.
     */
    const row = await findPropertyRow(id);

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
          /*
           * Browser should not independently
           * cache this API response.
           *
           * Our server-side cache handles it.
           */
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
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

        error: "Unable to fetch property right now.",
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
