import { NextResponse } from "next/server";
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function getAllProperties(request) {
  const table = getPropertiesTable(request);
  let rows = [];
  let nextToken = null;
  let page = 1;

  do {
    console.log(`Fetching page ${page}...`);

    const options = {
      maxRows: 100,
    };

    if (nextToken) {
      options.nextToken = nextToken;
      console.log("Using next token");
    }

    const result = await table.getPagedRows(options);
    console.log("Response keys:", Object.keys(result || {}));

    console.log(
      "Rows received:",
      Array.isArray(result?.data) ? result.data.length : "NO DATA ARRAY",
    );

    if (Array.isArray(result?.data)) {
      rows.push(...result.data);
      if (page === 1 && result.data.length > 0) {
        console.log(JSON.stringify(result.data[0], null, 2));
      }
    }

    nextToken = result?.next_token || result?.nextToken || null;
    if (!result?.more_records) {
      break;
    }

    page++;
  } while (nextToken);

  const properties = rows
    .map((row) => {
      try {
        return mapProperty(row);
      } catch (error) {
        console.error("PROPERTY MAPPING ERROR:", error);

        return null;
      }
    })
    .filter(Boolean);

  console.log("TOTAL MAPPED PROPERTIES:", properties.length);

  return properties;
}

export async function GET(request) {
  try {
    const properties = await getAllProperties(request);
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const micromarket = searchParams.get("micromarket") || "";
    let filtered = [...properties];
    if (city) {
      filtered = filtered.filter(
        (property) =>
          String(property.city).toLowerCase() === city.toLowerCase(),
      );
    }
    if (type) {
      filtered = filtered.filter(
        (property) =>
          String(property.type).toLowerCase() === type.toLowerCase(),
      );
    }

    if (micromarket) {
      filtered = filtered.filter((property) =>
        String(property.micromarket)
          .toLowerCase()
          .includes(micromarket.toLowerCase()),
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: filtered,
        total: filtered.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const errorMessage =
      error?.message || (typeof error === "string" ? error : String(error));

    console.error("ERROR NAME:", error?.name);
    console.error("ERROR MESSAGE:", errorMessage);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR STATUS:", error?.status);
    console.error("FULL ERROR:", error);
    console.error("STACK:", error?.stack);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch properties",
        errorName: error?.name || null,
        errorCode: error?.code || null,
        errorStatus: error?.status || null,
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
