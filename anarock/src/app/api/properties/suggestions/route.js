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

function normalizeOfficeType(value) {
    const normalized = normalizeMatch(value).replace(/[^a-z0-9]/g, "");

    if (
        normalized.includes("cowork") ||
        normalized.includes("managedoffice") ||
        normalized.includes("flexoffice")
    ) {
        return "managedofficecoworking";
    }

    if (normalized.includes("conventional")) {
        return "conventional";
    }

    return normalized;
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

    if (!cleaned) return null;

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

function getPropertyId(property, index) {
    return String(property?.id ?? `property-${index}`).trim();
}
function getPropertyCity(property) {
    const city = normalizeMatch(getFirstValue(property, ["city"]));

    const aliases = {
        bangalore: "bengaluru",
        gurgaon: "gurugram",
        bombay: "mumbai",
        calcutta: "kolkata",
        madras: "chennai",
        poona: "pune",
    };

    return aliases[city] || city;
}

function getPropertyType(property) {
    return normalizeOfficeType(getFirstValue(property, ["officeType"]));
}

function getPropertyMicromarket(property) {
    return normalizeMatch(getFirstValue(property, ["micromarket"]));
}

function getPropertyArea(property) {
    return parseNumber(getFirstValue(property, ["totalLeasableAreaAvailable"]));
}

function getPropertySeats(property) {
    return parseNumber(getFirstValue(property, ["NoOfSeatsOffered"]));
}

function getPropertyPrice(property) {
    const type = getPropertyType(property);

    if (type === "managedofficecoworking") {
        return parseNumber(getFirstValue(property, ["monthlyCostPerSeat"]));
    }

    return parseNumber(getFirstValue(property, ["quotedRent"]));
}

function getCoordinates(property) {
    console.log("PARTH");
    console.log(property);
    const lat = parseNumber(
        getFirstValue(property, [
            "Latitude",
            "latitude",
            "Lat",
            "lat",
            "Latitude__s",
        ]),
    );

    const lng = parseNumber(
        getFirstValue(property, [
            "Longitude",
            "longitude",
            "Lng",
            "lng",
            "Long",
            "long",
            "Longitude__s",
        ]),
    );

    if (
        lat === null ||
        lng === null ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180 ||
        (lat === 0 && lng === 0)
    ) {
        return null;
    }

    return { lat, lng };
}

function getDistanceKm(pointA, pointB) {
    if (!pointA || !pointB) {
        return Number.POSITIVE_INFINITY;
    }

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const earthRadius = 6371;

    const lat1 = toRadians(pointA.lat);
    const lat2 = toRadians(pointB.lat);

    const deltaLat = toRadians(pointB.lat - pointA.lat);
    const deltaLng = toRadians(pointB.lng - pointA.lng);

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

    return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function prepareFilters({
    city,
    type,
    micromarket,
    minBudget,
    maxBudget,
    area,
    maxArea,
    seats,
    maxSeats,
}) {
    const requestedMicromarkets = micromarket
        .split(",")
        .map(normalizeMatch)
        .filter(Boolean);

    return {
        normalizedCity: normalizeMatch(city),
        normalizedType: normalizeOfficeType(type),
        requestedMicromarkets,
        requestedBudget: parseNumber(maxBudget) ?? parseNumber(minBudget),
        requestedMinBudget: parseNumber(minBudget),
        requestedMaxBudget: parseNumber(maxBudget),
        requestedArea: parseNumber(area),
        requestedMaxArea: parseNumber(maxArea),
        requestedSeats: parseNumber(seats),
        requestedMaxSeats: parseNumber(maxSeats),
    };
}

function getRelativeDistance(actual, target) {
    if (actual === null || target === null || target <= 0) {
        return Number.POSITIVE_INFINITY;
    }

    return Math.abs(actual - target) / target;
}

function isSameMicromarket(propertyMarket, requestedMarkets) {
    if (!propertyMarket || !requestedMarkets.length) {
        return false;
    }

    return requestedMarkets.some(
        (selected) =>
            propertyMarket === selected ||
            propertyMarket.includes(selected) ||
            selected.includes(propertyMarket),
    );
}

function getBudgetDistance(price, filters) {
    if (price === null) {
        return Number.POSITIVE_INFINITY;
    }

    const { requestedMinBudget, requestedMaxBudget } = filters;

    if (requestedMinBudget !== null && price < requestedMinBudget) {
        return requestedMinBudget - price;
    }

    if (requestedMaxBudget !== null && price > requestedMaxBudget) {
        return price - requestedMaxBudget;
    }

    if (filters.requestedBudget !== null) {
        return Math.abs(price - filters.requestedBudget);
    }

    return 0;
}

function getAreaDistance(area, filters) {
    if (area === null) {
        return Number.POSITIVE_INFINITY;
    }

    if (filters.requestedArea !== null && area < filters.requestedArea) {
        return filters.requestedArea - area;
    }

    if (filters.requestedMaxArea !== null && area > filters.requestedMaxArea) {
        return area - filters.requestedMaxArea;
    }

    if (filters.requestedArea !== null) {
        return Math.abs(area - filters.requestedArea);
    }

    return 0;
}

function getSeatDistance(seats, filters) {
    if (filters.requestedSeats === null && filters.requestedMaxSeats === null) {
        return 0;
    }

    if (seats === null) {
        return Number.POSITIVE_INFINITY;
    }

    if (filters.requestedSeats !== null && seats < filters.requestedSeats) {
        return filters.requestedSeats - seats;
    }

    if (filters.requestedMaxSeats !== null && seats > filters.requestedMaxSeats) {
        return seats - filters.requestedMaxSeats;
    }

    return 0;
}

/* ------------------------------------------
   SUGGESTION SCORING
------------------------------------------ */

function scoreSuggestion(property, filters, referenceCoordinates) {
    const propertyCity = getPropertyCity(property);
    const propertyType = getPropertyType(property);
    const propertyMarket = getPropertyMicromarket(property);
    const propertyArea = getPropertyArea(property);
    const propertyPrice = getPropertyPrice(property);
    const propertySeats = getPropertySeats(property);
    const propertyCoordinates = getCoordinates(property);
    const sameCity = Boolean(filters.normalizedCity && propertyCity === filters.normalizedCity,);
    const sameType = Boolean(filters.normalizedType && propertyType === filters.normalizedType,);
    const sameMicromarket = isSameMicromarket(propertyMarket, filters.requestedMicromarkets,);
    const distanceKm = getDistanceKm(referenceCoordinates, propertyCoordinates);
    const areaDistance = getAreaDistance(propertyArea, filters);
    const budgetDistance = getBudgetDistance(propertyPrice, filters);
    const seatDistance = getSeatDistance(propertySeats, filters);
    return {
        sameCity,
        sameMicromarket,
        sameType,
        distanceKm,
        areaDistance,
        budgetDistance,
        seatDistance,
        propertyCity,
    };
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
export async function GET(request) {
    const requestStartedAt = Date.now();
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get("city") || "";
        const type = searchParams.get("type") || "";
        const micromarket = searchParams.get("micromarket") || "";
        const minBudget = searchParams.get("minBudget") || "";
        const maxBudget = searchParams.get("maxBudget") || "";
        const area = searchParams.get("area") || "";
        const maxArea = searchParams.get("maxArea") || "";
        const seats = searchParams.get("seats") || "";
        const maxSeats = searchParams.get("maxSeats") || "";
        const page = parsePage(searchParams.get("page"));
        const pageSize = parsePageSize(searchParams.get("pageSize"));
        const excludeIds = new Set(
            (searchParams.get("exclude") || "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
        );
        const properties = await getAllProperties();
        const filters = prepareFilters({
            city,
            type,
            micromarket,
            minBudget,
            maxBudget,
            area,
            maxArea,
            seats,
            maxSeats,
        });
        const cityProperties = properties.filter(
            (property) => getPropertyCity(property) === filters.normalizedCity,
        );
        const cityCoordinates = cityProperties.map(getCoordinates).filter(Boolean);
        let referenceCoordinates = null;
        if (cityCoordinates.length > 0) {
            referenceCoordinates = {
                lat:
                    cityCoordinates.reduce((sum, point) => sum + point.lat, 0) /
                    cityCoordinates.length,

                lng:
                    cityCoordinates.reduce((sum, point) => sum + point.lng, 0) /
                    cityCoordinates.length,
            };
        }
        const requestedLat = parseNumber(searchParams.get("referenceLat"));
        const requestedLng = parseNumber(searchParams.get("referenceLng"));
        if (
            requestedLat !== null &&
            requestedLng !== null &&
            requestedLat >= -90 &&
            requestedLat <= 90 &&
            requestedLng >= -180 &&
            requestedLng <= 180
        ) {
            referenceCoordinates = {
                lat: requestedLat,
                lng: requestedLng,
            };
        }
        const suggestionCandidates = [];
        for (let index = 0; index < properties.length; index++) {
            const property = properties[index];
            if (!property || typeof property !== "object") {
                continue;
            }
            const id = getPropertyId(property, index);
            if (excludeIds.has(id)) {
                continue;
            }
            suggestionCandidates.push({
                property,
                id,
            });
        }
        const scored = suggestionCandidates.map(({ property, id }) => ({
            property,
            id,
            ...scoreSuggestion(property, filters, referenceCoordinates),
        }));
        scored.sort((a, b) => {
            if (a.sameCity !== b.sameCity) {
                return Number(b.sameCity) - Number(a.sameCity);
            }
            if (a.sameMicromarket !== b.sameMicromarket) {
                return Number(b.sameMicromarket) - Number(a.sameMicromarket);
            }
            if (a.distanceKm !== b.distanceKm) {
                return a.distanceKm - b.distanceKm;
            }
            if (a.sameType !== b.sameType) {
                return Number(b.sameType) - Number(a.sameType);
            }
            if (a.areaDistance !== b.areaDistance) {
                return a.areaDistance - b.areaDistance;
            }
            if (a.budgetDistance !== b.budgetDistance) {
                return a.budgetDistance - b.budgetDistance;
            }
            if (a.seatDistance !== b.seatDistance) {
                return a.seatDistance - b.seatDistance;
            }
            return a.id.localeCompare(b.id, undefined, {
                numeric: true,
                sensitivity: "base",
            });
        });
        const total = scored.length;
        const totalPages = Math.ceil(total / pageSize);
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
                filteredResultCount: 0,
                suggestionPoolCount: total,
                referenceCoordinates,
                cachedAt: Date.now(),
                processingTime: Date.now() - requestStartedAt,
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
                    "X-Suggestions-Total": String(total),
                    "X-Suggestions-Has-More": String(hasMore),
                    "X-Suggestions-Mode": "relevance-ranking",
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
