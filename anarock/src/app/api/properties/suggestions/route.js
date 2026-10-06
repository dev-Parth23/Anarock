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
    return normalizeMatch(
        getFirstValue(property, [
            "type",
            "Type",
            "propertyType",
            "PropertyType",
            "officeType",
            "OfficeType",
        ]),
    );
}

function getPropertyCity(property) {
    return normalizeMatch(
        getFirstValue(property, ["city", "City", "cityName", "CityName"]),
    );
}

function getPropertyMicromarket(property) {
    return normalizeMatch(
        getFirstValue(property, [
            "micromarket",
            "Micromarket",
            "microMarket",
            "MicroMarket",
            "micromarketName",
            "MicromarketName",
        ]),
    );
}

function getPropertyArea(property) {
    return parseNumber(
        getFirstValue(property, [
            "areaSqft",
            "AreaSqft",
            "area",
            "Area",
            "superArea",
            "SuperArea",
            "superBuiltUpArea",
            "SuperBuiltUpArea",
            "carpetArea",
            "CarpetArea",
            "builtUpArea",
            "BuiltUpArea",
            "floorPlate",
            "FloorPlate",
            "Floor_Plate",
            "size",
            "Size",
        ]),
    );
}

function getPropertySeats(property) {
    return parseNumber(
        getFirstValue(property, [
            "seatsOffered",
            "SeatsOffered",
            "noofseatsoffered",
            "NoOfSeatsOffered",
            "NoofSeatsOffered",
            "noOfSeatsOffered",
            "seatsAvailable",
            "SeatsAvailable",
            "availableSeats",
            "AvailableSeats",
            "seatCapacity",
            "SeatCapacity",
            "totalSeats",
            "TotalSeats",
        ]),
    );
}

function getPropertyPrice(property) {
    const type = getPropertyType(property);

    const managedOffice = type === "managedofficecoworking";

    if (managedOffice) {
        return parseNumber(
            getFirstValue(property, [
                "monthlyCostPerSeat",
                "MonthlyCostPerSeat",
                "monthlyCostPerSeatInr",
                "MonthlyCostPerSeatInr",
                "pricePerSeat",
                "PricePerSeat",
                "costPerSeat",
                "CostPerSeat",
                "rentPerSeat",
                "RentPerSeat",
            ]),
        );
    }

    return parseNumber(
        getFirstValue(property, [
            "quotedRent",
            "QuotedRent",
            "monthlyRent",
            "MonthlyRent",
            "rent",
            "Rent",
            "monthlyCost",
            "MonthlyCost",
            "budget",
            "Budget",
            "price",
            "Price",
        ]),
    );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

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
function getFilteredProperties(
    properties,
    { city, type, micromarket, minBudget, area, seats },
) {
    let filtered = properties;
    if (city) {
        const normalizedCity = normalizeMatch(city);

        filtered = filtered.filter(
            (property) => getPropertyCity(property) === normalizedCity,
        );
    } if (type && normalize(type) !== "ai") {
        const normalizedType = normalizeMatch(type);

        filtered = filtered.filter(
            (property) => getPropertyType(property) === normalizedType,
        );
    }
    if (micromarket) {
        const selectedMicromarkets = micromarket
            .split(",")
            .map((item) => normalizeMatch(item))
            .filter(Boolean);

        if (selectedMicromarkets.length) {
            filtered = filtered.filter((property) => {
                const propertyMicromarket = getPropertyMicromarket(property);

                return selectedMicromarkets.some(
                    (selected) =>
                        propertyMicromarket === selected ||
                        propertyMicromarket.includes(selected),
                );
            });
        }
    }
    if (minBudget !== "") {
        const minimum = parseNumber(minBudget);

        if (minimum !== null && minimum >= 0) {
            filtered = filtered.filter((property) => {
                const propertyPrice = getPropertyPrice(property);

                return propertyPrice !== null && propertyPrice >= minimum;
            });
        }
    }
    if (area !== "") {
        const minimumArea = parseNumber(area);

        if (minimumArea !== null && minimumArea >= 0) {
            filtered = filtered.filter((property) => {
                const propertyArea = getPropertyArea(property);

                return propertyArea !== null && propertyArea >= minimumArea;
            });
        }
    }

    if (seats !== "") {
        const requiredSeats = parseNumber(seats);

        if (requiredSeats !== null && requiredSeats >= 0) {
            filtered = filtered.filter((property) => {
                const seatsOffered = getPropertySeats(property);

                return seatsOffered !== null && seatsOffered >= requiredSeats;
            });
        }
    }

    return filtered;
}

function scoreSuggestion(
    property,
    {
        requestedCity,
        requestedMicromarket,
        requestedType,
        requestedBudget,
        requestedArea,
        requestedSeats,
    },
) {
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
        const minBudget = searchParams.get("minBudget") || ""
        const area = searchParams.get("area") || "";
        const seats = searchParams.get("seats") || "";
        const page = parsePage(searchParams.get("page"));
        const pageSize = parsePageSize(searchParams.get("pageSize"));
        const properties = await getAllProperties();
        const filteredProperties = getFilteredProperties(properties, {
            city,
            type,
            micromarket,
            minBudget,
            area,
            seats,
        });
        const filteredPropertyIds = new Set();

        for (const property of filteredProperties) {
            const id = getPropertyId(property);

            if (id) {
                filteredPropertyIds.add(id);
            }
        }
        const suggestionCandidates = [];

        for (const property of properties) {
            const id = getPropertyId(property);
            if (!id) {
                continue;
            }
            if (filteredPropertyIds.has(id)) {
                continue;
            }

            suggestionCandidates.push(property);
        }
        const requestedCity = normalizeMatch(city);
        const requestedType = normalizeMatch(type);
        const requestedMicromarkets = micromarket
            .split(",")
            .map((item) => normalizeMatch(item))
            .filter(Boolean);
        const requestedMicromarket = requestedMicromarkets[0] || "";
        const requestedBudget = minBudget !== "" ? parseNumber(minBudget) : null;
        const requestedArea = area !== "" ? parseNumber(area) : null;
        const requestedSeats = seats !== "" ? parseNumber(seats) : null;
        const scored = suggestionCandidates.map((property) => {
            const score = scoreSuggestion(property, {
                requestedCity,
                requestedMicromarket,
                requestedType,
                requestedBudget,
                requestedArea,
                requestedSeats,
            });

            return {
                property,
                id: getPropertyId(property),
                ...score,
            };
        });
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

                filteredResultCount: filteredProperties.length,
                suggestionPoolCount: suggestionCandidates.length,
                cachedAt: Date.now(),
                processingTime: Date.now() - requestStartedAt,
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
                    "X-Suggestions-Total": String(total),
                    "X-Filtered-Result-Count": String(filteredProperties.length),
                    "X-Suggestions-Has-More": String(hasMore),
                },
            },
        );
    } catch (error) {
        console.error("========================================");

        console.error("[Suggestions API] ERROR:", error);

        console.error("[Suggestions API] MESSAGE:", error?.message);

        console.error("[Suggestions API] STACK:", error?.stack);

        console.error("========================================");

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
