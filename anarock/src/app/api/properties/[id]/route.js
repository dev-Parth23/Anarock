import { NextResponse } from "next/server";
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!targetId) return null;
  let nextToken = null;
  let page = 1;
  while (true) {
    const options = { maxRows: 100 };
    if (nextToken) {
      options.nextToken = nextToken;
    }
    console.log(
      `[Property Detail API] Fetching Catalyst page ${page} for ROWID ${targetId}...`,
    );
    const result = await table.getPagedRows(options);
    const rows = Array.isArray(result?.data) ? result.data : [];
    const matchedRow = rows.find((row) => getRowId(row) === targetId);
    if (matchedRow) {
      console.log(
        `[Property Detail API] Found property ${targetId} on page ${page}.`,
      );
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
  }
  return null;
}

export async function GET(request, { params }) {
  try {
    const id = String(params?.id ?? "").trim();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Property ID is required" },
        { status: 400 },
      );
    }
    const row = await findPropertyRow(table, id);
    if (!row) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 },
      );
    }
    const property = mapProperty(row);
    return NextResponse.json(
      { success: true, data: property },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const errorMessage =
      error?.message || (typeof error === "string" ? error : String(error));
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage || "Failed to fetch property" },
      { status: 500 },
    );
  }
}
