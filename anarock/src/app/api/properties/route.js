// import { NextResponse } from "next/server";

// import {
//   getPropertyCandidates,
//   getPropertiesCacheInfo,
// } from "@/lib/propertiesCache";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";
// function parseNumber(value) {
//   if (
//     value === null ||
//     value === undefined ||
//     value === ""
//   ) {
//     return null;
//   }

//   if (typeof value === "number") {
//     return Number.isFinite(value)
//       ? value
//       : null;
//   }

//   const cleaned = String(value)
//     .replace(/[,₹$€£\s]/g, "")
//     .trim();

//   if (!cleaned) {
//     return null;
//   }

//   const parsed = Number(cleaned);

//   return Number.isFinite(parsed)
//     ? parsed
//     : null;
// }

// function getFirstValue(property, keys) {
//   if (!property) {
//     return null;
//   }

//   for (const key of keys) {
//     const value = property[key];

//     if (
//       value !== undefined &&
//       value !== null &&
//       String(value).trim() !== ""
//     ) {
//       return value;
//     }
//   }

//   return null;
// }

// function getPropertyType(property) {
//   return String(
//     getFirstValue(property, [
//       "type",
//       "Type",
//       "propertyType",
//       "PropertyType",
//       "officeType",
//       "OfficeType",
//     ]) || "",
//   )
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, "")
//     .replace(/[^a-z0-9]/g, "");
// }

// function getPropertyCity(property) {
//   return String(
//     getFirstValue(property, [
//       "city",
//       "City",
//       "cityName",
//       "CityName",
//     ]) || "",
//   )
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ");
// }

// function getPropertyMicromarket(property) {
//   return String(
//     getFirstValue(property, [
//       "micromarket",
//       "Micromarket",
//       "microMarket",
//       "MicroMarket",
//       "micromarketName",
//       "MicromarketName",
//     ]) || "",
//   )
//     .trim()
//     .toLowerCase()
//     .replace(/[_-]+/g, " ")
//     .replace(/[^\w\s/]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function getPropertyPrice(property) {
//   const type = getPropertyType(property);

//   const managedOffice =
//     type === "managedofficecoworking";

//   return parseNumber(
//     getFirstValue(
//       property,
//       managedOffice
//         ? [
//           "monthlyCostPerSeat",
//           "MonthlyCostPerSeat",
//           "monthlyCostPerSeatInr",
//           "MonthlyCostPerSeatInr",
//           "pricePerSeat",
//           "PricePerSeat",
//           "costPerSeat",
//           "CostPerSeat",
//           "rentPerSeat",
//           "RentPerSeat",
//         ]
//         : [
//           "quotedRent",
//           "QuotedRent",
//           "monthlyRent",
//           "MonthlyRent",
//           "rent",
//           "Rent",
//           "monthlyCost",
//           "MonthlyCost",
//           "price",
//           "Price",
//         ],
//     ),
//   );
// }

// function getPropertyArea(property) {
//   return parseNumber(
//     getFirstValue(property, [
//       "areaSqft",
//       "AreaSqft",
//       "area",
//       "Area",
//       "superArea",
//       "SuperArea",
//       "superBuiltUpArea",
//       "SuperBuiltUpArea",
//       "carpetArea",
//       "CarpetArea",
//       "builtUpArea",
//       "BuiltUpArea",
//       "floorPlate",
//       "FloorPlate",
//       "Floor_Plate",
//       "size",
//       "Size",
//     ]),
//   );
// }

// function getPropertySeats(property) {
//   return parseNumber(
//     getFirstValue(property, [
//       "seatsOffered",
//       "SeatsOffered",
//       "noofseatsoffered",
//       "NoOfSeatsOffered",
//       "NoofSeatsOffered",
//       "noOfSeatsOffered",
//       "seatsAvailable",
//       "SeatsAvailable",
//       "availableSeats",
//       "AvailableSeats",
//       "seatCapacity",
//       "SeatCapacity",
//       "totalSeats",
//       "TotalSeats",
//     ]),
//   );
// }

// function getPropertyName(property) {
//   return String(
//     getFirstValue(property, [
//       "propertyName",
//       "PropertyName",
//       "property_name",
//       "Property_Name",
//       "buildingName",
//       "BuildingName",
//       "projectName",
//       "ProjectName",
//       "name",
//       "Name",
//       "title",
//       "Title",
//     ]) || "",
//   ).trim();
// }

// function getPropertyId(property) {
//   return String(
//     property?.id ??
//     property?.rowId ??
//     property?.ROWID ??
//     property?.ID ??
//     "",
//   ).trim();
// }

// function sortProperties(properties, sort) {
//   const validSorts = new Set([
//     "budget_asc",
//     "budget_desc",
//     "area_asc",
//     "area_desc",
//     "seats_asc",
//     "seats_desc",
//     "name_asc",
//     "name_desc",
//   ]);

//   if (!validSorts.has(sort)) {
//     return properties;
//   }

//   const direction =
//     sort.endsWith("_desc")
//       ? -1
//       : 1;

//   const isNameSort =
//     sort === "name_asc" ||
//     sort === "name_desc";

//   const items = properties.map(
//     (property) => {
//       let key = null;

//       if (isNameSort) {
//         key = getPropertyName(property);
//       } else if (
//         sort.startsWith("budget_")
//       ) {
//         key = getPropertyPrice(property);
//       } else if (
//         sort.startsWith("area_")
//       ) {
//         key = getPropertyArea(property);
//       } else {
//         key = getPropertySeats(property);
//       }

//       return {
//         property,
//         key,
//         id: getPropertyId(property),
//       };
//     },
//   );

//   items.sort((a, b) => {
//     if (isNameSort) {
//       const comparison =
//         a.key.localeCompare(
//           b.key,
//           undefined,
//           {
//             sensitivity: "base",
//             numeric: true,
//           },
//         );

//       if (comparison !== 0) {
//         return comparison * direction;
//       }

//       return a.id.localeCompare(
//         b.id,
//         undefined,
//         {
//           numeric: true,
//         },
//       );
//     }

//     if (
//       a.key === null &&
//       b.key === null
//     ) {
//       return 0;
//     }

//     if (a.key === null) {
//       return 1;
//     }

//     if (b.key === null) {
//       return -1;
//     }

//     if (a.key === b.key) {
//       return a.id.localeCompare(
//         b.id,
//         undefined,
//         {
//           numeric: true,
//         },
//       );
//     }

//     return (
//       (a.key - b.key) *
//       direction
//     );
//   });

//   return items.map(
//     (item) => item.property,
//   );
// }


// function parsePage(value) {
//   const parsed = Number(value);

//   if (
//     !Number.isFinite(parsed) ||
//     parsed < 1
//   ) {
//     return 1;
//   }

//   return Math.floor(parsed);
// }

// function parsePageSize(value) {
//   const parsed = Number(value);

//   if (
//     !Number.isFinite(parsed) ||
//     parsed < 1
//   ) {
//     return 30;
//   }

//   return Math.min(
//     Math.floor(parsed),
//     50,
//   );
// }

// function matchesMicromarket(
//   property,
//   selectedMicromarkets,
// ) {
//   if (!selectedMicromarkets.length) {
//     return true;
//   }

//   const propertyMicromarket =
//     getPropertyMicromarket(property);

//   return selectedMicromarkets.some(
//     (selected) =>
//       propertyMicromarket === selected ||
//       propertyMicromarket.includes(selected),
//   );
// }

// export async function GET(request) {
//   const requestStartedAt = Date.now();

//   try {
//     const { searchParams } = new URL(request.url);
//     const city = searchParams.get("city") || "";
//     const type = searchParams.get("type") || "";
//     const micromarket = searchParams.get("micromarket") || "";
//     const minBudget = searchParams.get("minBudget") || "";
//     const area = searchParams.get("area") || "";
//     const seats = searchParams.get("seats") || "";
//     const prompt = searchParams.get("prompt") || "";
//     const sort = searchParams.get("sort") || "";
//     searchParams.get("sort") || "";
//     const hasExplicitPagination = searchParams.has("page") || searchParams.has("pageSize");
//     const page = parsePage(searchParams.get("page"));
//     const pageSize = parsePageSize(searchParams.get("pageSize"));
//     const indexedType = type && type.trim().toLowerCase() !== "ai" ? type : "";
//     const selectedMicromarkets = micromarket.split(",").map((item) => item.trim()).filter(Boolean);
//     let filtered = await getPropertyCandidates({
//       city, type: indexedType, micromarkets: [],
//     });

//     if (selectedMicromarkets.length) {
//       const normalizedMicromarkets = selectedMicromarkets
//         .map((item) =>
//           item
//             .toLowerCase()
//             .replace(
//               /[_-]+/g,
//               " ",
//             )
//             .replace(
//               /[^\w\s/]/g,
//               "",
//             )
//             .replace(
//               /\s+/g,
//               " ",
//             )
//             .trim(),
//         )
//         .filter(Boolean);

//       filtered = filtered.filter(
//         (property) => matchesMicromarket(property, normalizedMicromarkets,),
//       );
//     }
//     if (minBudget !== "") {
//       const minimum = parseNumber(minBudget);
//       if (minimum !== null && minimum >= 0) {
//         filtered = filtered.filter(
//           (property) => {
//             const propertyPrice = getPropertyPrice(property);
//             return (propertyPrice !== null && propertyPrice >= minimum);
//           },
//         );
//       }
//     }

//     if (area !== "") {
//       const minArea = parseNumber(area);
//       if (minArea !== null && minArea >= 0) {
//         filtered = filtered.filter(
//           (property) => {
//             const propertyArea = getPropertyArea(property);
//             return (propertyArea !== null && propertyArea >=
//               minArea
//             );
//           },
//         );
//       }
//     }

//     if (seats !== "") {
//       const requiredSeats = parseNumber(seats);
//       if (requiredSeats !== null && requiredSeats >= 0) {
//         filtered = filtered.filter(
//           (property) => {
//             const seatsOffered = getPropertySeats(property,);
//             return (seatsOffered !== null && seatsOffered >= requiredSeats);
//           },
//         );
//       }
//     }
//     if (prompt) {
//       console.log("[Properties] AI prompt:", prompt);
//     }

//     filtered = sortProperties(filtered, sort,);
//     const total = filtered.length;
//     let responseData = filtered;
//     let totalPages = 1;
//     if (hasExplicitPagination) {
//       const start = (page - 1) * pageSize;
//       const end = start + pageSize;
//       responseData = filtered.slice(start, end,);
//       totalPages = total > 0 ? Math.ceil(total / pageSize,) : 0;
//     }

//     const cacheInfo = getPropertiesCacheInfo();
//     const durationMs = Date.now() - requestStartedAt;

//     console.log("[Properties API] Request completed:",
//       {
//         durationMs,
//         city: city || null,
//         type: type || null,
//         micromarket: micromarket || null,
//         total,
//         returned: responseData.length,
//         page: hasExplicitPagination ? page : null,
//         pageSize: hasExplicitPagination ? pageSize : null,
//         cacheCount: cacheInfo.count,
//         cacheFresh: cacheInfo.isFresh,
//         cacheStale: cacheInfo.isStale,
//         refreshInProgress: cacheInfo.refreshInProgress,
//       },
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         data: responseData,
//         total,
//         page: hasExplicitPagination ? page : 1,
//         pageSize: hasExplicitPagination ? pageSize : total,
//         totalPages: hasExplicitPagination ? totalPages : 1,
//         hasMore: hasExplicitPagination ? page < totalPages : false,
//         cachedAt: cacheInfo.cachedAt,
//         cache: {
//           count: cacheInfo.count,
//           isFresh: cacheInfo.isFresh,
//           isStale: cacheInfo.isStale,
//           refreshInProgress: cacheInfo.refreshInProgress,
//         },
//       },
//       {
//         headers: {
//           "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
//           "X-Properties-Count": String(responseData.length,),
//           "X-Properties-Total": String(total),
//           "X-Properties-Cache": cacheInfo.isFresh
//             ? "fresh"
//             : cacheInfo.isStale
//               ? "stale"
//               : "cold",
//         },
//       },
//     );
//   } catch (error) {
//     console.error("[Properties API] RAW ERROR:",
//       error,
//     );

//     console.error(
//       "[Properties API] ERROR TYPE:",
//       typeof error,
//     );

//     console.error(
//       "[Properties API] ERROR MESSAGE:",
//       error?.message,
//     );

//     console.error(
//       "[Properties API] ERROR NAME:",
//       error?.name,
//     );
//     let errorMessage = "Failed to fetch properties";

//     if (typeof error === "string") {
//       errorMessage = error;
//     } else if (error && typeof error === "object") {
//       errorMessage = error.message || error.error || error.description ||
//         error.detail || error.reason || (() => {
//           try {
//             return JSON.stringify(error);
//           } catch {
//             return "Unknown Catalyst error";
//           }
//         })();
//     } else if (
//       error !== null &&
//       error !== undefined
//     ) {
//       errorMessage = String(error);
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         error: errorMessage,
//         errorName: error?.name || null,
//         errorCode: error?.code || null,
//         errorStatus: error?.status || null,
//       },
//       {
//         status: 500,
//         headers: {
//           "Cache-Control":
//             "no-store",
//         },
//       },
//     );
//   }
// }




import { NextResponse } from "next/server";

import {
  getPropertyCandidates,
  getPropertiesByIds,
  getPropertiesCacheInfo,
} from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 50;
const MAX_TARGET_IDS = 10;

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeMatch(value) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function parseNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .replace(/[,₹$€£\s]/g, "")
    .trim();

  if (!cleaned) return null;

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

function firstValue(property, keys) {
  for (const key of keys) {
    const value = property?.[key];

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

function propertyId(property) {
  return String(
    property?.id ??
    property?.rowId ??
    property?.ROWID ??
    property?.ID ??
    "",
  ).trim();
}

function propertyType(property) {
  return normalizeMatch(
    firstValue(property, [
      "type",
      "Type",
      "propertyType",
      "PropertyType",
      "officeType",
      "OfficeType",
    ]),
  );
}

function propertyCity(property) {
  return normalizeMatch(
    firstValue(property, [
      "city",
      "City",
      "cityName",
      "CityName",
    ]),
  );
}

function propertyMicromarket(property) {
  return normalize(
    firstValue(property, [
      "micromarket",
      "Micromarket",
      "microMarket",
      "MicroMarket",
      "micromarketName",
      "MicromarketName",
    ]),
  )
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function propertyName(property) {
  return String(
    firstValue(property, [
      "propertyName",
      "PropertyName",
      "property_name",
      "Property_Name",
      "buildingName",
      "BuildingName",
      "projectName",
      "ProjectName",
      "name",
      "Name",
      "title",
      "Title",
    ]) || "",
  ).trim();
}

function propertyPrice(property) {
  const type = propertyType(property);

  const managedOffice =
    type.includes("managedoffice") ||
    type.includes("coworking");

  const keys = managedOffice
    ? [
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
    ]
    : [
      "quotedRent",
      "QuotedRent",
      "monthlyRent",
      "MonthlyRent",
      "rent",
      "Rent",
      "monthlyCost",
      "MonthlyCost",
      "price",
      "Price",
    ];

  return parseNumber(firstValue(property, keys));
}

function propertyArea(property) {
  return parseNumber(
    firstValue(property, [
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

function propertySeats(property) {
  return parseNumber(
    firstValue(property, [
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

function parsePositiveInteger(value, fallback, maximum = Infinity) {
  const parsed = Number(value);

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), maximum);
}

function sortProperties(properties, sort) {
  const allowedSorts = new Set([
    "budget_asc",
    "budget_desc",
    "area_asc",
    "area_desc",
    "seats_asc",
    "seats_desc",
    "name_asc",
    "name_desc",
  ]);

  if (!allowedSorts.has(sort)) {
    return properties;
  }

  const descending = sort.endsWith("_desc");
  const isNameSort = sort.startsWith("name_");

  function sortValue(property) {
    if (isNameSort) return propertyName(property);

    if (sort.startsWith("budget_")) {
      return propertyPrice(property);
    }

    if (sort.startsWith("area_")) {
      return propertyArea(property);
    }

    return propertySeats(property);
  }

  return [...properties].sort((a, b) => {
    const aValue = sortValue(a);
    const bValue = sortValue(b);

    // Keep properties without numeric values at the end.
    if (!isNameSort) {
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
    }

    let comparison;

    if (isNameSort) {
      comparison = String(aValue).localeCompare(
        String(bValue),
        undefined,
        {
          sensitivity: "base",
          numeric: true,
        },
      );
    } else {
      comparison = aValue - bValue;
    }

    if (comparison !== 0) {
      return descending ? -comparison : comparison;
    }

    return propertyId(a).localeCompare(propertyId(b), undefined, {
      numeric: true,
    });
  });
}

function matchesMicromarkets(property, selectedMarkets) {
  if (!selectedMarkets.length) return true;

  const market = propertyMicromarket(property);

  if (!market) return false;

  return selectedMarkets.some(
    (selected) =>
      market === selected ||
      market.includes(selected),
  );
}

function cacheResponseHeaders(cacheInfo, count, total, noStore = false) {
  return {
    "Cache-Control": noStore
      ? "no-store"
      : "public, s-maxage=30, stale-while-revalidate=60",

    "X-Properties-Count": String(count),
    "X-Properties-Total": String(total),

    "X-Properties-Cache": cacheInfo.isFresh
      ? "fresh"
      : cacheInfo.isStale
        ? "stale"
        : "cold",
  };
}

export async function GET(request) {
  const startedAt = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const micromarket = searchParams.get("micromarket") || "";
    const minBudget = searchParams.get("minBudget") || "";
    const area = searchParams.get("area") || "";
    const seats = searchParams.get("seats") || "";
    const sort = searchParams.get("sort") || "";
    const prompt = searchParams.get("prompt") || "";

    /*
     * A "limit" parameter now activates pagination too.
     */
    const hasPagination =
      searchParams.has("page") ||
      searchParams.has("pageSize") ||
      searchParams.has("limit");

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
    );

    const pageSize = parsePositiveInteger(
      searchParams.get("pageSize") ??
      searchParams.get("limit"),
      30,
      MAX_PAGE_SIZE,
    );

    /*
     * Targeted lookup for shortlist, comparison, and enquiry flows.
     * Limit the number of requested IDs to protect the endpoint.
     */
    const requestedIds = [
      ...new Set(
        (searchParams.get("ids") || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ].slice(0, MAX_TARGET_IDS);

    if (requestedIds.length > 0) {
      const data = await getPropertiesByIds(requestedIds);
      const cacheInfo = getPropertiesCacheInfo();

      return NextResponse.json(
        {
          success: true,
          data,
          total: data.length,
          page: 1,
          pageSize: data.length,
          totalPages: data.length ? 1 : 0,
          hasMore: false,
          cachedAt: cacheInfo.cachedAt,
          cache: {
            count: cacheInfo.count,
            isFresh: cacheInfo.isFresh,
            isStale: cacheInfo.isStale,
            refreshInProgress: cacheInfo.refreshInProgress,
          },
        },
        {
          headers: cacheResponseHeaders(
            cacheInfo,
            data.length,
            data.length,
            true,
          ),
        },
      );
    }

    /*
     * "ai" is a search mode, not a property type.
     * AI ranking must be implemented separately if required.
     */
    const indexedType =
      type && normalize(type) !== "ai" ? type : "";

    const selectedMarkets = [
      ...new Set(
        micromarket
          .split(",")
          .map((value) =>
            value
              .toLowerCase()
              .replace(/[_-]+/g, " ")
              .replace(/[^\w\s/]/g, "")
              .replace(/\s+/g, " ")
              .trim(),
          )
          .filter(Boolean),
      ),
    ];

    /*
     * Retrieve candidates from the in-memory cache and its indexes.
     * The cache helper handles loading and refreshing the source data.
     */
    let filtered = await getPropertyCandidates({
      city,
      type: indexedType,
      micromarkets: [],
    });

    if (selectedMarkets.length) {
      filtered = filtered.filter((property) =>
        matchesMicromarkets(property, selectedMarkets),
      );
    }

    /*
     * Minimum price filter.
     */
    if (minBudget !== "") {
      const minimum = parseNumber(minBudget);

      if (minimum !== null && minimum >= 0) {
        filtered = filtered.filter((property) => {
          const price = propertyPrice(property);

          return price !== null && price >= minimum;
        });
      }
    }

    /*
     * Minimum area filter.
     */
    if (area !== "") {
      const minimumArea = parseNumber(area);

      if (minimumArea !== null && minimumArea >= 0) {
        filtered = filtered.filter((property) => {
          const value = propertyArea(property);

          return value !== null && value >= minimumArea;
        });
      }
    }

    /*
     * Minimum seat count filter.
     */
    if (seats !== "") {
      const minimumSeats = parseNumber(seats);

      if (minimumSeats !== null && minimumSeats >= 0) {
        filtered = filtered.filter((property) => {
          const value = propertySeats(property);

          return value !== null && value >= minimumSeats;
        });
      }
    }

    /*
     * The prompt is not sent to an AI model here.
     * Avoid logging potentially sensitive free-text search input.
     */
    void prompt;

    filtered = sortProperties(filtered, sort);

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);

    const responseData = hasPagination
      ? filtered.slice((page - 1) * pageSize, page * pageSize)
      : filtered;

    const cacheInfo = getPropertiesCacheInfo();
    const durationMs = Date.now() - startedAt;

    console.info("[Properties API]", {
      durationMs,
      city: city || null,
      type: type || null,
      total,
      returned: responseData.length,
      page: hasPagination ? page : null,
      pageSize: hasPagination ? pageSize : null,
      cacheCount: cacheInfo.count,
      cacheFresh: cacheInfo.isFresh,
      cacheStale: cacheInfo.isStale,
      refreshInProgress: cacheInfo.refreshInProgress,
    });

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        total,
        page: hasPagination ? page : 1,
        pageSize: hasPagination ? pageSize : total,
        totalPages: hasPagination ? totalPages : total ? 1 : 0,
        hasMore: hasPagination && page < totalPages,
        cachedAt: cacheInfo.cachedAt,
        cache: {
          count: cacheInfo.count,
          isFresh: cacheInfo.isFresh,
          isStale: cacheInfo.isStale,
          refreshInProgress: cacheInfo.refreshInProgress,
        },
      },
      {
        headers: cacheResponseHeaders(
          cacheInfo,
          responseData.length,
          total,
        ),
      },
    );
  } catch (error) {
    console.error("[Properties API] Request failed:", {
      message: error?.message || String(error),
      name: error?.name || null,
      code: error?.code || null,
      status: error?.status || null,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message || String(error)
            : undefined,
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
