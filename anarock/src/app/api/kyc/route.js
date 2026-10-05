import { NextResponse } from "next/server";
import { getKycTable } from "@/lib/catalyst";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function normalize(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}
async function getAllKycRows(request) {
    const table = await getKycTable(request);
    const rows = [];
    let nextToken = null;
    let page = 1;
    while (true) {
        console.log(`[KYC API] Fetching Catalyst page ${page}...`);
        const options = { maxRows: 100 };
        if (nextToken) {
            options.nextToken = nextToken;
            console.log(`[KYC API] Using next token for page ${page}`);
        }
        const result = await table.getPagedRows(options);
        const pageRows = Array.isArray(result?.data) ? result.data : [];
        console.log(`[KYC API] Page ${page} rows: ${pageRows.length}`);
        rows.push(...pageRows);
        const newNextToken = result?.next_token || result?.nextToken || null;
        const moreRecords = result?.more_records === true || result?.moreRecords === true;
        console.log(`[KYC API] Page ${page} more records:`, moreRecords);
        console.log(`[KYC API] Page ${page} next token:`, Boolean(newNextToken));
        if (!moreRecords) {
            break;
        }
        if (!newNextToken) {
            console.warn(
                "[KYC API] More records reported but no next token returned.",
            );
            break;
        }
        if (newNextToken === nextToken) {
            console.warn("[KYC API] Same next token returned. Stopping pagination.");
            break;
        }
        nextToken = newNextToken;
        page += 1;
    }
    console.log(`[KYC API] Total KYC rows: ${rows.length}`);
    return rows;
}
function getLatestRow(rows) {
    if (!rows.length) {
        return null;
    }
    return [...rows].sort((a, b) => {
        const dateA = new Date(a?.MODIFIEDTIME || a?.modifiedtime || a?.ModifiedTime || 0,).getTime();
        const dateB = new Date(b?.MODIFIEDTIME || b?.modifiedtime || b?.ModifiedTime || 0,).getTime();
        return dateB - dateA;
    })[0];
}
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get("city") || "";
        const quarter = searchParams.get("quarter") || "";
        if (!city) {
            return NextResponse.json(
                {
                    success: false,
                    error: "City is required.",
                },
                {
                    status: 400,
                },
            );
        }
        const rows = await getAllKycRows(request);
        const normalizedCity = normalize(city);
        const normalizedQuarter = normalize(quarter);
        let matchingRows = rows.filter((row) => {
            return normalize(row?.CityName) === normalizedCity;
        });
        if (normalizedQuarter) {
            const quarterRows = matchingRows.filter((row) => {
                return normalize(row?.QuarterYear) === normalizedQuarter;
            });
            if (quarterRows.length > 0) {
                matchingRows = quarterRows;
            }
        }
        const kyc = getLatestRow(matchingRows);
        if (!kyc) {
            return NextResponse.json(
                {
                    success: false,
                    error: `No KYC data found for ${city}.`,
                },
                {
                    status: 404,
                },
            );
        }
        return NextResponse.json(
            {
                success: true,
                data: kyc,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error("[KYC API] ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Failed to fetch KYC data.",
            },
            {
                status: 500,
            },
        );
    }
}
