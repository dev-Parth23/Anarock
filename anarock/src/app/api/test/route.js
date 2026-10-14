import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
    const requestStartedAt = Date.now();
    let cacheInfo = { isFresh: false, isStale: false };

    try {
        const params = context?.params instanceof Promise
            ? await context.params
            : context?.params;

        return NextResponse.json(
            {
                success: true,
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

        const errorMessage = error?.message || "Internal Server Error";

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