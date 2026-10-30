// import { NextResponse } from "next/server";
// import { getAllProperties } from "@/lib/propertiesCache";
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";
// function normalize(value) {
//     return String(value ?? "")
//         .trim()
//         .toLowerCase()
//         .replace(/\s+/g, " ");
// }

// function normalizeMatch(value) {
//     return normalize(value)
//         .replace(/[_-]+/g, " ")
//         .replace(/[^\w\s/]/g, "")
//         .replace(/\s+/g, " ")
//         .trim();
// }

// function parseNumber(value) {
//     if (value === null || value === undefined || value === "") {
//         return null;
//     }
//     if (typeof value === "number") {
//         return Number.isFinite(value) ? value : null;
//     }
//     const cleaned = String(value)
//         .replace(/,/g, "")
//         .replace(/[₹$€£]/g, "")
//         .replace(/[^\d.-]/g, "");

//     if (!cleaned) {
//         return null;
//     }
//     const number = Number(cleaned);
//     return Number.isFinite(number) ? number : null;
// }

// function getFirstValue(property, fields) {
//     for (const field of fields) {
//         const value = property?.[field];
//         if (value !== undefined && value !== null && String(value).trim() !== "") {
//             return value;
//         }
//     }
//     return null;
// }


// function getPropertyId(property) {
//     return String(
//         property?.id ??
//         property?.rowId ??
//         property?.ROWID ??
//         property?.ID ??
//         property?.Id ??
//         property?.propertyId ??
//         property?.PropertyID ??
//         ""
//     ).trim();
// }

// function getPropertyType(property) {
//     return normalizeMatch(
//         getFirstValue(property, [
//             "officeType",
//             "OfficeType",
//             "office_type",
//             "type",
//             "Type",
//             "propertyType",
//             "PropertyType",
//             "Property_Type",
//         ])
//     ).replace(/[^a-z0-9]/g, "").replace(
//         "coworking",
//         "coworking"
//     );
// }

// function getPropertyCity(property) {
//     const city = getFirstValue(property, [
//         "city",
//         "City",
//         "cityName",
//         "CityName",
//         "City_Name",
//         "city_name",
//     ]);

//     const normalized = normalizeMatch(city);

//     const aliases = {
//         bangalore: "bengaluru",
//         gurgaon: "gurugram",
//         bombay: "mumbai",
//         calcutta: "kolkata",
//         madras: "chennai",
//         poona: "pune",
//     };

//     return aliases[normalized] || normalized;
// }

// function getPropertyMicromarket(property) {
//     return normalizeMatch(
//         getFirstValue(property, [
//             "micromarket",
//             "Micromarket",
//             "microMarket",
//             "MicroMarket",
//             "micromarketName",
//             "Micromarket_Name",
//             "MicromarketName",
//         ])
//     );
// }

// function getPropertyArea(property) {
//     return parseNumber(
//         getFirstValue(property, [
//             "areaSqft",
//             "offeredSuperArea",
//             "builtupArea",
//             "carpetArea",
//             "totalLeasableAreaAvailable",
//             "centerArea",
//             "floorPlate",
//             "totalDevelopmentSize",
//         ]),
//     );
// }

// function getPropertySeats(property) {
//     return parseNumber(getFirstValue(property, ["NoOfSeatsOffered"]));
// }

// function getPropertyPrice(property) {
//     const type = getPropertyType(property);
//     const managedOffice = type === "managedofficecoworking";
//     if (managedOffice) {
//         return parseNumber(getFirstValue(property, ["monthlyCostPerSeat"]));
//     }
//     return parseNumber(getFirstValue(property, ["quotedRent"]));
// }

// function parsePage(value) {
//     const parsed = Number(value);
//     if (!Number.isFinite(parsed) || parsed < 1) {
//         return 1;
//     }
//     return Math.floor(parsed);
// }

// function parsePageSize(value) {
//     const parsed = Number(value);

//     if (!Number.isFinite(parsed) || parsed < 1) {
//         return 30;
//     }

//     return Math.min(Math.floor(parsed), 50);
// }

// // function prepareFilters({ city, type, micromarket, minBudget, area, seats }) {
// //     const normalizedCity = normalizeMatch(city);
// //     const normalizedType = normalize(type) !== "ai" ? normalizeMatch(type) : "";
// //     const requestedMicromarkets = micromarket
// //         .split(",")
// //         .map((item) => normalizeMatch(item))
// //         .filter(Boolean);
// //     const requestedMicromarket = requestedMicromarkets[0] || "";
// //     const requestedBudget = minBudget !== "" ? parseNumber(minBudget) : null;
// //     const requestedArea = area !== "" ? parseNumber(area) : null;
// //     const requestedSeats = seats !== "" ? parseNumber(seats) : null;

// //     return {
// //         normalizedCity,
// //         normalizedType,
// //         requestedMicromarkets,
// //         requestedMicromarket,
// //         requestedBudget,
// //         requestedArea,
// //         requestedSeats,
// //     };
// // }


// function normalizeOfficeType(value) {
//     const normalized = normalizeMatch(value)
//         .replace(/[^a-z0-9]/g, "");

//     if (
//         normalized.includes("cowork") ||
//         normalized.includes("managedoffice") ||
//         normalized.includes("flexoffice")
//     ) {
//         return "managedofficecoworking";
//     }

//     if (normalized.includes("conventional")) {
//         return "conventional";
//     }

//     return normalized;
// }

// function prepareFilters({
//     city,
//     type,
//     micromarket,
//     minBudget,
//     maxBudget,
//     area,
//     maxArea,
//     seats,
//     maxSeats,
// }) {
//     const normalizedCity = normalizeMatch(city);

//     const normalizedType =
//         normalizeOfficeType(type);

//     const requestedMicromarkets = micromarket
//         .split(",")
//         .map((item) => normalizeMatch(item))
//         .filter(Boolean);

//     return {
//         normalizedCity,
//         normalizedType,
//         requestedMicromarkets,
//         requestedMicromarket: requestedMicromarkets[0] || "",
//         requestedBudget: parseNumber(maxBudget) ?? parseNumber(minBudget),
//         requestedMinBudget: parseNumber(minBudget),
//         requestedMaxBudget: parseNumber(maxBudget),
//         requestedArea: parseNumber(area),
//         requestedMaxArea: parseNumber(maxArea),
//         requestedSeats: parseNumber(seats),
//         requestedMaxSeats: parseNumber(maxSeats),
//     };
// }



// function matchesFilters(property, filters) {
//     const {
//         normalizedCity,
//         normalizedType,
//         requestedMicromarkets,
//         requestedMinBudget,
//         requestedMaxBudget,
//         requestedArea,
//         requestedMaxArea,
//         requestedSeats,
//         requestedMaxSeats,
//     } = filters;

//     if (
//         normalizedCity &&
//         getPropertyCity(property) !== normalizedCity
//     ) {
//         return false;
//     }

//     if (
//         normalizedType &&
//         normalizeOfficeType(getPropertyType(property)) !==
//         normalizedType
//     ) {
//         return false;
//     }

//     if (requestedMicromarkets.length) {
//         const market = getPropertyMicromarket(property);

//         const matchesMarket = requestedMicromarkets.some(
//             (selected) =>
//                 market === selected ||
//                 market.includes(selected) ||
//                 selected.includes(market)
//         );

//         if (!matchesMarket) return false;
//     }

//     const price = getPropertyPrice(property);
//     const area = getPropertyArea(property);
//     const seats = getPropertySeats(property);

//     if (
//         requestedMinBudget !== null &&
//         (price === null || price < requestedMinBudget)
//     ) {
//         return false;
//     }

//     if (
//         requestedMaxBudget !== null &&
//         (price === null || price > requestedMaxBudget)
//     ) {
//         return false;
//     }

//     if (
//         requestedArea !== null &&
//         (area === null || area < requestedArea)
//     ) {
//         return false;
//     }

//     if (
//         requestedMaxArea !== null &&
//         (area === null || area > requestedMaxArea)
//     ) {
//         return false;
//     }

//     if (
//         requestedSeats !== null &&
//         (seats === null || seats < requestedSeats)
//     ) {
//         return false;
//     }

//     if (
//         requestedMaxSeats !== null &&
//         (seats === null || seats > requestedMaxSeats)
//     ) {
//         return false;
//     }

//     return true;
// }


// function scoreSuggestion(property, filters) {
//     const {
//         normalizedCity: requestedCity,
//         requestedMicromarket,
//         normalizedType: requestedType,
//         requestedBudget,
//         requestedArea,
//         requestedSeats,
//     } = filters;
//     const propertyCity = getPropertyCity(property);
//     const propertyMicromarket = getPropertyMicromarket(property);
//     const propertyType = getPropertyType(property);
//     const propertyPrice = getPropertyPrice(property);
//     const propertyArea = getPropertyArea(property);
//     const propertySeats = getPropertySeats(property);
//     const sameCity = Boolean(requestedCity && propertyCity === requestedCity);
//     const sameMicromarket = Boolean(
//         requestedMicromarket &&
//         propertyMicromarket &&
//         (propertyMicromarket === requestedMicromarket ||
//             propertyMicromarket.includes(requestedMicromarket) ||
//             requestedMicromarket.includes(propertyMicromarket)),
//     );
//     const sameType = Boolean(requestedType && normalizeOfficeType(propertyType) === normalizeOfficeType(requestedType));
//     let budgetMatch = 1;
//     let budgetDistance = Number.MAX_SAFE_INTEGER;

//     if (requestedBudget !== null && propertyPrice !== null) {
//         if (propertyPrice <= requestedBudget) {
//             budgetMatch = 0;
//             budgetDistance = requestedBudget - propertyPrice;
//         } else {
//             budgetMatch = 1;
//             budgetDistance = propertyPrice - requestedBudget;
//         }
//     } else {
//         budgetMatch = 0;
//         budgetDistance = 0;
//     }
//     let capacityMatch = 1;
//     let capacityDistance = Number.MAX_SAFE_INTEGER;

//     if (requestedSeats !== null) {
//         if (propertySeats !== null) {
//             if (propertySeats >= requestedSeats) {
//                 capacityMatch = 0;
//                 capacityDistance = propertySeats - requestedSeats;
//             } else {
//                 capacityMatch = 1;
//                 capacityDistance = requestedSeats - propertySeats;
//             }
//         }
//     } else if (requestedArea !== null) {
//         if (propertyArea !== null) {
//             if (propertyArea >= requestedArea) {
//                 capacityMatch = 0;
//                 capacityDistance = propertyArea - requestedArea;
//             } else {
//                 capacityMatch = 1;
//                 capacityDistance = requestedArea - propertyArea;
//             }
//         }
//     } else {
//         capacityMatch = 0;
//         capacityDistance = 0;
//     }

//     const priorityScore =
//         (sameCity ? 0 : 1) * 100000000 +
//         (sameType ? 0 : 1) * 10000000 +
//         (sameMicromarket ? 0 : 1) * 1000000 +
//         capacityMatch * 100000 +
//         budgetMatch * 10000;

//     return {
//         priorityScore,
//         budgetDistance,
//         capacityDistance,
//     };
// }

// export async function GET(request) {
//     const requestStartedAt = Date.now();
//     try {
//         const { searchParams } = new URL(request.url);
//         const city = searchParams.get("city") || "";
//         const type = searchParams.get("type") || "";
//         const micromarket = searchParams.get("micromarket") || "";
//         const minBudget = searchParams.get("minBudget") || "";
//         const area = searchParams.get("area") || "";
//         const seats = searchParams.get("seats") || "";
//         const page = parsePage(searchParams.get("page"));
//         const pageSize = parsePageSize(searchParams.get("pageSize"));
//         const maxBudget = searchParams.get("maxBudget") || "";
//         const maxArea = searchParams.get("maxArea") || "";
//         const maxSeats = searchParams.get("maxSeats") || "";

//         const excludeIds = new Set(
//             (searchParams.get("exclude") || "")
//                 .split(",")
//                 .map((id) => id.trim())
//                 .filter(Boolean)
//         );

//         const properties = await getAllProperties();
//         const filters = prepareFilters({
//             city,
//             type,
//             micromarket,
//             minBudget,
//             maxBudget,
//             area,
//             maxArea,
//             seats,
//             maxSeats,
//         });
//         const filteredPropertyIds = new Set();
//         const suggestionCandidates = [];
//         for (const property of properties) {
//             const id = getPropertyId(property);
//             if (!id || excludeIds.has(id)) {
//                 continue;
//             }
//             if (matchesFilters(property, filters)) {
//                 filteredPropertyIds.add(id);
//                 continue;
//             }
//             suggestionCandidates.push(property);
//         }
//         const scored = new Array(suggestionCandidates.length);
//         let scoredCount = 0;
//         for (let index = 0; index < suggestionCandidates.length; index++) {
//             const property = suggestionCandidates[index];
//             const id = getPropertyId(property);
//             if (filteredPropertyIds.has(id)) {
//                 continue;
//             }
//             const score = scoreSuggestion(property, filters);
//             scored[scoredCount++] = {
//                 property,
//                 id,
//                 ...score,
//             };
//         }
//         scored.length = scoredCount;
//         scored.sort((a, b) => {
//             if (a.priorityScore !== b.priorityScore) {
//                 return a.priorityScore - b.priorityScore;
//             }

//             if (a.budgetDistance !== b.budgetDistance) {
//                 return a.budgetDistance - b.budgetDistance;
//             }
//             if (a.capacityDistance !== b.capacityDistance) {
//                 return a.capacityDistance - b.capacityDistance;
//             }
//             return a.id.localeCompare(b.id, undefined, {
//                 numeric: true,
//                 sensitivity: "base",
//             });
//         });
//         const total = scored.length;
//         const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
//         const start = (page - 1) * pageSize;
//         const end = start + pageSize;
//         const responseData = scored.slice(start, end).map((item) => item.property);
//         const hasMore = page < totalPages;
//         return NextResponse.json(
//             {
//                 success: true,
//                 data: responseData,
//                 total,
//                 page,
//                 pageSize,
//                 totalPages,
//                 hasMore,
//                 filteredResultCount: filteredPropertyIds.size,
//                 suggestionPoolCount: suggestionCandidates.length,
//                 cachedAt: Date.now(),
//                 processingTime: Date.now() - requestStartedAt,
//             },
//             {
//                 headers: {
//                     "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
//                     "X-Suggestions-Total": String(total),
//                     "X-Filtered-Result-Count": String(filteredPropertyIds.size),
//                     "X-Suggestions-Has-More": String(hasMore),
//                 },
//             },
//         );
//     } catch (error) {
//         console.error("[Suggestions API] ERROR:", error);
//         console.error("[Suggestions API] MESSAGE:", error?.message);
//         return NextResponse.json(
//             {
//                 success: false,
//                 data: [],
//                 total: 0,
//                 page: 1,
//                 pageSize: 30,
//                 totalPages: 0,
//                 hasMore: false,
//                 filteredResultCount: 0,
//                 suggestionPoolCount: 0,
//                 error: error?.message || "Failed to fetch suggested properties",
//             },
//             {
//                 status: 500,
//                 headers: {
//                     "Cache-Control": "no-store",
//                 },
//             },
//         );
//     }
// }



import { NextResponse } from "next/server";
import { getAllProperties } from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------
   NORMALIZATION
------------------------------------------ */

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

/* ------------------------------------------
   VALUE HELPERS
------------------------------------------ */

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

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return null;
}

function getPropertyId(property, index) {
    return String(
        property?.id ??
        property?.rowId ??
        property?.ROWID ??
        property?.ID ??
        property?.Id ??
        property?.propertyId ??
        property?.PropertyID ??
        `property-${index}`
    ).trim();
}

/* ------------------------------------------
   PROPERTY ATTRIBUTES
------------------------------------------ */

function getPropertyCity(property) {
    const city = normalizeMatch(
        getFirstValue(property, [
            "city",
            "City",
            "cityName",
            "CityName",
            "City_Name",
            "city_name",
        ])
    );

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
    return normalizeOfficeType(
        getFirstValue(property, [
            "officeType",
            "OfficeType",
            "office_type",
            "type",
            "Type",
            "propertyType",
            "PropertyType",
            "Property_Type",
        ])
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
            "Micromarket_Name",
            "MicromarketName",
        ])
    );
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
        ])
    );
}

function getPropertySeats(property) {
    return parseNumber(
        getFirstValue(property, [
            "NoOfSeatsOffered",
            "noOfSeatsOffered",
            "seatsOffered",
        ])
    );
}

function getPropertyPrice(property) {
    const type = getPropertyType(property);

    if (type === "managedofficecoworking") {
        return parseNumber(
            getFirstValue(property, [
                "monthlyCostPerSeat",
                "MonthlyCostPerSeat",
            ])
        );
    }

    return parseNumber(
        getFirstValue(property, [
            "quotedRent",
            "QuotedRent",
        ])
    );
}

/* ------------------------------------------
   GEOLOCATION
------------------------------------------ */

function getCoordinates(property) {
    const lat = parseNumber(
        getFirstValue(property, [
            "Latitude",
            "latitude",
            "Lat",
            "lat",
            "Latitude__s",
        ])
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
        ])
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
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) ** 2;

    return (
        2 *
        earthRadius *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
}

/* ------------------------------------------
   FILTER PREPARATION
------------------------------------------ */

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

        requestedBudget:
            parseNumber(maxBudget) ??
            parseNumber(minBudget),

        requestedMinBudget: parseNumber(minBudget),
        requestedMaxBudget: parseNumber(maxBudget),

        requestedArea: parseNumber(area),
        requestedMaxArea: parseNumber(maxArea),

        requestedSeats: parseNumber(seats),
        requestedMaxSeats: parseNumber(maxSeats),
    };
}

/* ------------------------------------------
   RELEVANCE HELPERS
------------------------------------------ */

function getRelativeDistance(actual, target) {
    if (
        actual === null ||
        target === null ||
        target <= 0
    ) {
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
            selected.includes(propertyMarket)
    );
}

function getBudgetDistance(price, filters) {
    if (price === null) {
        return Number.POSITIVE_INFINITY;
    }

    const { requestedMinBudget, requestedMaxBudget } = filters;

    if (
        requestedMinBudget !== null &&
        price < requestedMinBudget
    ) {
        return requestedMinBudget - price;
    }

    if (
        requestedMaxBudget !== null &&
        price > requestedMaxBudget
    ) {
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

    if (
        filters.requestedArea !== null &&
        area < filters.requestedArea
    ) {
        return filters.requestedArea - area;
    }

    if (
        filters.requestedMaxArea !== null &&
        area > filters.requestedMaxArea
    ) {
        return area - filters.requestedMaxArea;
    }

    if (filters.requestedArea !== null) {
        return Math.abs(area - filters.requestedArea);
    }

    return 0;
}

function getSeatDistance(seats, filters) {
    if (filters.requestedSeats === null &&
        filters.requestedMaxSeats === null) {
        return 0;
    }

    if (seats === null) {
        return Number.POSITIVE_INFINITY;
    }

    if (
        filters.requestedSeats !== null &&
        seats < filters.requestedSeats
    ) {
        return filters.requestedSeats - seats;
    }

    if (
        filters.requestedMaxSeats !== null &&
        seats > filters.requestedMaxSeats
    ) {
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

    const sameCity = Boolean(
        filters.normalizedCity &&
        propertyCity === filters.normalizedCity
    );

    const sameType = Boolean(
        filters.normalizedType &&
        propertyType === filters.normalizedType
    );

    const sameMicromarket = isSameMicromarket(
        propertyMarket,
        filters.requestedMicromarkets
    );

    const distanceKm = getDistanceKm(
        referenceCoordinates,
        propertyCoordinates
    );

    const areaDistance = getAreaDistance(
        propertyArea,
        filters
    );

    const budgetDistance = getBudgetDistance(
        propertyPrice,
        filters
    );

    const seatDistance = getSeatDistance(
        propertySeats,
        filters
    );

    /*
      Ranking order:

      1. Same city
      2. Same micromarket
      3. Nearby geographical location
      4. Same property type
      5. Area suitability
      6. Budget suitability
      7. Seat suitability

      Missing coordinates never remove a property.
    */

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

/* ------------------------------------------
   PAGINATION
------------------------------------------ */

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

/* ------------------------------------------
   MAIN API
------------------------------------------ */

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
                .filter(Boolean)
        );

        /* GET ALL CACHED PROPERTIES */

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

        /*
          REFERENCE LOCATION

          Use the coordinates of properties in the selected city
          as a reference point when the user has not supplied
          an explicit reference coordinate.

          This is an approximate city-level reference, not the
          user's live location.
        */

        const cityProperties = properties.filter(
            (property) =>
                getPropertyCity(property) === filters.normalizedCity
        );

        const cityCoordinates = cityProperties
            .map(getCoordinates)
            .filter(Boolean);

        let referenceCoordinates = null;

        if (cityCoordinates.length > 0) {
            referenceCoordinates = {
                lat:
                    cityCoordinates.reduce(
                        (sum, point) => sum + point.lat,
                        0
                    ) / cityCoordinates.length,

                lng:
                    cityCoordinates.reduce(
                        (sum, point) => sum + point.lng,
                        0
                    ) / cityCoordinates.length,
            };
        }

        /*
          OPTIONAL EXPLICIT REFERENCE COORDINATES

          If frontend later supplies referenceLat/referenceLng,
          those take priority over the calculated city reference.
        */

        const requestedLat = parseNumber(
            searchParams.get("referenceLat")
        );

        const requestedLng = parseNumber(
            searchParams.get("referenceLng")
        );

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

        /* ----------------------------------
           INCLUDE ALL ELIGIBLE PROPERTIES
        ---------------------------------- */

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

        /*
          IMPORTANT:

          No city filter.
          No type filter.
          No micromarket filter.
          No budget filter.
          No area filter.

          Every eligible property is scored.
        */

        /* ----------------------------------
           SCORE ALL PROPERTIES
        ---------------------------------- */

        const scored = suggestionCandidates.map(
            ({ property, id }) => ({
                property,
                id,
                ...scoreSuggestion(
                    property,
                    filters,
                    referenceCoordinates
                ),
            })
        );

        /* ----------------------------------
           SORT BY RELEVANCE
        ---------------------------------- */

        scored.sort((a, b) => {

            // 1. Same city always comes first.
            if (a.sameCity !== b.sameCity) {
                return Number(b.sameCity) - Number(a.sameCity);
            }

            // 2. Same micromarket gets higher priority.
            if (a.sameMicromarket !== b.sameMicromarket) {
                return Number(b.sameMicromarket) -
                    Number(a.sameMicromarket);
            }

            // 3. Nearby properties rank higher.
            if (a.distanceKm !== b.distanceKm) {
                return a.distanceKm - b.distanceKm;
            }

            // 4. Same property type.
            if (a.sameType !== b.sameType) {
                return Number(b.sameType) - Number(a.sameType);
            }

            // 5. Area suitability.
            if (a.areaDistance !== b.areaDistance) {
                return a.areaDistance - b.areaDistance;
            }

            // 6. Budget / rent suitability.
            if (a.budgetDistance !== b.budgetDistance) {
                return a.budgetDistance - b.budgetDistance;
            }

            // 7. Seat suitability.
            if (a.seatDistance !== b.seatDistance) {
                return a.seatDistance - b.seatDistance;
            }

            // 8. Stable ordering.
            return a.id.localeCompare(
                b.id,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base",
                }
            );
        });

        /* ----------------------------------
           PAGINATION
        ---------------------------------- */

        const total = scored.length;

        const totalPages = Math.ceil(total / pageSize);

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const responseData = scored
            .slice(start, end)
            .map((item) => item.property);

        const hasMore = page < totalPages;

        /* ----------------------------------
           RESPONSE
        ---------------------------------- */

        return NextResponse.json(
            {
                success: true,

                data: responseData,

                total,
                page,
                pageSize,
                totalPages,
                hasMore,

                // All eligible properties are included.
                filteredResultCount: 0,
                suggestionPoolCount: total,

                referenceCoordinates,

                cachedAt: Date.now(),

                processingTime:
                    Date.now() - requestStartedAt,
            },
            {
                headers: {
                    "Cache-Control":
                        "public, s-maxage=30, stale-while-revalidate=60",

                    "X-Suggestions-Total": String(total),

                    "X-Suggestions-Has-More": String(hasMore),

                    "X-Suggestions-Mode": "relevance-ranking",
                },
            }
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
                error:
                    error?.message ||
                    "Failed to fetch suggested properties",
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
