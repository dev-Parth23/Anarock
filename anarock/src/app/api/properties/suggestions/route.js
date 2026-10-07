import { NextResponse } from "next/server";
import { getAllProperties } from "@/lib/propertiesCache";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function normalizeMatch(value) {
    return normalize(value)
        .replace(/[_-]+/g, " ")
        .replace(/[^\w\s/]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseNumber(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    const cleaned = String(value)
        .replace(/,/g, "")
        .replace(/[₹$€£]/g, "")
        .replace(/[^\d.-]/g, "");

    if (!cleaned) {
        return null;
    }
    const number = Number(cleaned);
    return Number.isFinite(number) ? number : null;
}

function getFirstValue(property, fields) {
    for (const field of fields) {
        const value = property?.[field];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return value;
        }
    }
    return null;
}

function getPropertyId(property) {
    return String(
        property?.id ?? property?.rowId ?? property?.ROWID ?? property?.ID ?? "",
    ).trim();
}

function getPropertyType(property) {
    return normalizeMatch(getFirstValue(property, ["officeType"]));
}

function getPropertyCity(property) {
    return normalizeMatch(getFirstValue(property, ["city"]));
}

function getPropertyMicromarket(property) {
    return normalizeMatch(getFirstValue(property, ["micromarket"]));
    console.log("PARTHHHHHHHHHHHHHHHHHHHH", property);
}

function getPropertyArea(property) {
    return parseNumber(
        getFirstValue(property, [
            "areaSqft",
            "offeredSuperArea",
            "builtupArea",
            "carpetArea",
            "totalLeasableAreaAvailable",
            "centerArea",
            "floorPlate",
            "totalDevelopmentSize",
        ]),
    );
}

function getPropertySeats(property) {
    return parseNumber(getFirstValue(property, ["NoOfSeatsOffered"]));
}

function getPropertyPrice(property) {
    const type = getPropertyType(property);
    const managedOffice = type === "managedofficecoworking";
    if (managedOffice) {
        return parseNumber(getFirstValue(property, ["monthlyCostPerSeat"]));
    }
    return parseNumber(getFirstValue(property, ["quotedRent"]));
}

function parsePage(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return 1;
    }
    return Math.floor(parsed);
}

function parsePageSize(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return 30;
    }

    return Math.min(Math.floor(parsed), 50);
}

function prepareFilters({ city, type, micromarket, minBudget, area, seats }) {
    const normalizedCity = normalizeMatch(city);
    const normalizedType = normalize(type) !== "ai" ? normalizeMatch(type) : "";
    const requestedMicromarkets = micromarket
        .split(",")
        .map((item) => normalizeMatch(item))
        .filter(Boolean);
    const requestedMicromarket = requestedMicromarkets[0] || "";
    const requestedBudget = minBudget !== "" ? parseNumber(minBudget) : null;
    const requestedArea = area !== "" ? parseNumber(area) : null;
    const requestedSeats = seats !== "" ? parseNumber(seats) : null;

    return {
        normalizedCity,
        normalizedType,
        requestedMicromarkets,
        requestedMicromarket,
        requestedBudget,
        requestedArea,
        requestedSeats,
    };
}

function matchesFilters(property, filters) {
    const {
        normalizedCity,
        normalizedType,
        requestedMicromarkets,
        requestedBudget,
        requestedArea,
        requestedSeats,
    } = filters;

    if (normalizedCity && getPropertyCity(property) !== normalizedCity) {
        return false;
    }
    if (normalizedType && getPropertyType(property) !== normalizedType) {
        return false;
    }
    if (requestedMicromarkets.length) {
        const propertyMicromarket = getPropertyMicromarket(property);

        const matchesMicromarket = requestedMicromarkets.some(
            (selected) =>
                propertyMicromarket === selected ||
                propertyMicromarket.includes(selected),
        );
        if (!matchesMicromarket) {
            return false;
        }
    }
    if (requestedBudget !== null) {
        const propertyPrice = getPropertyPrice(property);

        if (propertyPrice === null || propertyPrice < requestedBudget) {
            return false;
        }
    }
    if (requestedArea !== null) {
        const propertyArea = getPropertyArea(property);
        if (propertyArea === null || propertyArea < requestedArea) {
            return false;
        }
    }
    if (requestedSeats !== null) {
        const propertySeats = getPropertySeats(property);
        if (propertySeats === null || propertySeats < requestedSeats) {
            return false;
        }
    }

    return true;
}

function scoreSuggestion(property, filters) {
    const {
        normalizedCity: requestedCity,
        requestedMicromarket,
        normalizedType: requestedType,
        requestedBudget,
        requestedArea,
        requestedSeats,
    } = filters;
    const propertyCity = getPropertyCity(property);
    const propertyMicromarket = getPropertyMicromarket(property);
    const propertyType = getPropertyType(property);
    const propertyPrice = getPropertyPrice(property);
    const propertyArea = getPropertyArea(property);
    const propertySeats = getPropertySeats(property);
    const sameCity = Boolean(requestedCity && propertyCity === requestedCity);
    const sameMicromarket = Boolean(
        requestedMicromarket &&
        propertyMicromarket &&
        (propertyMicromarket === requestedMicromarket ||
            propertyMicromarket.includes(requestedMicromarket) ||
            requestedMicromarket.includes(propertyMicromarket)),
    );
    const sameType = Boolean(requestedType && propertyType === requestedType);
    let budgetMatch = 1;
    let budgetDistance = Number.MAX_SAFE_INTEGER;

    if (requestedBudget !== null && propertyPrice !== null) {
        if (propertyPrice <= requestedBudget) {
            budgetMatch = 0;
            budgetDistance = requestedBudget - propertyPrice;
        } else {
            budgetMatch = 1;
            budgetDistance = propertyPrice - requestedBudget;
        }
    } else {
        budgetMatch = 0;
        budgetDistance = 0;
    }
    let capacityMatch = 1;
    let capacityDistance = Number.MAX_SAFE_INTEGER;

    if (requestedSeats !== null) {
        if (propertySeats !== null) {
            if (propertySeats >= requestedSeats) {
                capacityMatch = 0;
                capacityDistance = propertySeats - requestedSeats;
            } else {
                capacityMatch = 1;
                capacityDistance = requestedSeats - propertySeats;
            }
        }
    } else if (requestedArea !== null) {
        if (propertyArea !== null) {
            if (propertyArea >= requestedArea) {
                capacityMatch = 0;
                capacityDistance = propertyArea - requestedArea;
            } else {
                capacityMatch = 1;
                capacityDistance = requestedArea - propertyArea;
            }
        }
    } else {
        capacityMatch = 0;
        capacityDistance = 0;
    }
    const priorityScore =
        (sameCity ? 0 : 1) * 100000000 +
        (sameMicromarket ? 0 : 1) * 10000000 +
        (sameType ? 0 : 1) * 1000000 +
        budgetMatch * 100000 +
        capacityMatch * 10000;

    return {
        priorityScore,
        budgetDistance,
        capacityDistance,
    };
}

export async function GET(request) {
    const requestStartedAt = Date.now();
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get("city") || "";
        const type = searchParams.get("type") || "";
        const micromarket = searchParams.get("micromarket") || "";
        const minBudget = searchParams.get("minBudget") || "";
        const area = searchParams.get("area") || "";
        const seats = searchParams.get("seats") || "";
        const page = parsePage(searchParams.get("page"));
        const pageSize = parsePageSize(searchParams.get("pageSize"));
        const properties = await getAllProperties();
        const filters = prepareFilters({
            city,
            type,
            micromarket,
            minBudget,
            area,
            seats,
        });
        const filteredPropertyIds = new Set();
        const suggestionCandidates = [];
        for (const property of properties) {
            if (matchesFilters(property, filters)) {
                const id = getPropertyId(property);
                if (id) {
                    filteredPropertyIds.add(id);
                }
                continue;
            }
            const id = getPropertyId(property);
            if (!id) {
                continue;
            }
            suggestionCandidates.push(property);
        }
        const scored = new Array(suggestionCandidates.length);
        let scoredCount = 0;
        for (let index = 0; index < suggestionCandidates.length; index++) {
            const property = suggestionCandidates[index];
            const id = getPropertyId(property);
            if (filteredPropertyIds.has(id)) {
                continue;
            }
            const score = scoreSuggestion(property, filters);
            scored[scoredCount++] = {
                property,
                id,
                ...score,
            };
        }
        scored.length = scoredCount;
        scored.sort((a, b) => {
            if (a.priorityScore !== b.priorityScore) {
                return a.priorityScore - b.priorityScore;
            }

            if (a.budgetDistance !== b.budgetDistance) {
                return a.budgetDistance - b.budgetDistance;
            }
            if (a.capacityDistance !== b.capacityDistance) {
                return a.capacityDistance - b.capacityDistance;
            }
            return a.id.localeCompare(b.id, undefined, {
                numeric: true,
                sensitivity: "base",
            });
        });
        const total = scored.length;
        const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const responseData = scored.slice(start, end).map((item) => item.property);
        const hasMore = page < totalPages;
        return NextResponse.json(
            {
                success: true,
                data: responseData,
                total,
                page,
                pageSize,
                totalPages,
                hasMore,
                filteredResultCount: filteredPropertyIds.size,
                suggestionPoolCount: suggestionCandidates.length,
                cachedAt: Date.now(),
                processingTime: Date.now() - requestStartedAt,
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
                    "X-Suggestions-Total": String(total),
                    "X-Filtered-Result-Count": String(filteredPropertyIds.size),
                    "X-Suggestions-Has-More": String(hasMore),
                },
            },
        );
    } catch (error) {
        console.error("[Suggestions API] ERROR:", error);
        console.error("[Suggestions API] MESSAGE:", error?.message);
        return NextResponse.json(
            {
                success: false,
                data: [],
                total: 0,
                page: 1,
                pageSize: 30,
                totalPages: 0,
                hasMore: false,
                filteredResultCount: 0,
                suggestionPoolCount: 0,
                error: error?.message || "Failed to fetch suggested properties",
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