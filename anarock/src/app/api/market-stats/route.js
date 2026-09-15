import { NextResponse } from "next/server";
async function getMarketStats() {
  return {
    totalStock: 850_000_000,
    totalVacancy: 145_000_000,
    totalAvailableSpace: 98_000_000,
    areaTransacted: 42_000_000,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const stats = await getMarketStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch market stats" },
      { status: 500 },
    );
  }
}
