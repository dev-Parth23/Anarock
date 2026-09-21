import { NextResponse } from "next/server";
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request, { params }) {
  try {
    const id = String(params.id);
    const table = getPropertiesTable(request);
    const row = await table.getRow(id);
    if (!row) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
        },
        {
          status: 404,
        },
      );
    }
    const property = mapProperty(row);
    return NextResponse.json(
      {
        success: true,
        data: property,
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
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch property",
      },
      {
        status: 500,
      },
    );
  }
}
