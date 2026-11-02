
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getPropertyById,
  getPropertiesCacheInfo,
} from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
  const requestId = randomUUID();
  const requestStartedAt = Date.now();

  try {
    const params =
      context?.params instanceof Promise
        ? await context.params
        : context?.params;

    const id = String(params?.id ?? "").trim();

    if (!id || id.length > 100 || /[\r\n]/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid property ID is required.",
        },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const property = await getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
          id,
        },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const cacheInfo = getPropertiesCacheInfo();

    console.info("[Property Detail API]", {
      requestId,
      durationMs: Date.now() - requestStartedAt,
      cacheCount: cacheInfo.count,
      cacheFresh: cacheInfo.isFresh,
      cacheStale: cacheInfo.isStale,
      refreshInProgress: cacheInfo.refreshInProgress,
    });

    return NextResponse.json(
      {
        success: true,
        data: property,
        property,
        cachedAt: cacheInfo.cachedAt,
        cache: {
          count: cacheInfo.count,
          isFresh: cacheInfo.isFresh,
          isStale: cacheInfo.isStale,
          refreshInProgress: cacheInfo.refreshInProgress,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Property-Cache": cacheInfo.isFresh
            ? "fresh"
            : cacheInfo.isStale
              ? "stale"
              : "cold",
        },
      },
    );
  } catch (error) {
    console.error("[Property Detail API] Failed:", {
      requestId,
      name: error?.name || "Error",
      code: error?.code || null,
      status: error?.status || null,
      message: error?.message || "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property. Please try again.",
        requestId,
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

