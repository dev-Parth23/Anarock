import { NextResponse } from "next/server";
import { getPropertyById, getPropertiesCacheInfo } from "@/lib/propertiesCache";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request, context) {
  const requestStartedAt = Date.now();

  try {
    const params =
      context?.params instanceof Promise
        ? await context.params
        : context?.params;
    const id = String(params?.id ?? "").trim();
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Property ID is required",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
    const property = await getPropertyById(id);
    if (!property) {
      const cacheInfo = getPropertiesCacheInfo();
      console.warn("[Property Detail API] Property not found:", {
        id,
        cacheCount: cacheInfo.count,
        cachedAt: cacheInfo.cachedAt,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
          id,
        },
        {
          status: 404,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
    const cacheInfo = getPropertiesCacheInfo();
    const durationMs = Date.now() - requestStartedAt;
    console.log("[Property Detail API] Request completed:", {
      id,
      durationMs,
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
    console.error("[Property Detail API] RAW ERROR:", error);
    console.error("[Property Detail API] ERROR TYPE:", typeof error);
    console.error("[Property Detail API] ERROR MESSAGE:", error?.message);
    console.error("[Property Detail API] ERROR NAME:", error?.name);
    console.error("[Property Detail API] ERROR CODE:", error?.code);
    console.error("[Property Detail API] ERROR STATUS:", error?.status);
    console.error("[Property Detail API] ERROR STACK:", error?.stack);
    let errorMessage = "Failed to fetch property";
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      errorMessage =
        error.message ||
        error.error ||
        error.description ||
        error.detail ||
        error.reason ||
        (() => {
          try {
            return JSON.stringify(error);
          } catch {
            return "Unknown Catalyst error";
          }
        })();
    } else if (error !== null && error !== undefined) {
      errorMessage = String(error);
    }
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorName: error?.name || null,
        errorCode: error?.code || null,
        errorStatus: error?.status || null,
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