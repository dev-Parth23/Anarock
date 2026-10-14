import { NextResponse } from "next/server";

import {
  getPropertyCandidates,
  getPropertiesCacheInfo,
} from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function parseNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const cleaned = String(value)
    .replace(/[,₹$€£\s]/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function getFirstValue(property, keys) {
  if (!property) {
    return null;
  }

  for (const key of keys) {
    const value = property[key];

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

function getPropertyType(property) {
  return String(
    getFirstValue(property, [
      "type",
      "Type",
      "propertyType",
      "PropertyType",
      "officeType",
      "OfficeType",
    ]) || "",
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getPropertyCity(property) {
  return String(
    getFirstValue(property, [
      "city",
      "City",
      "cityName",
      "CityName",
    ]) || "",
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getPropertyMicromarket(property) {
  return String(
    getFirstValue(property, [
      "micromarket",
      "Micromarket",
      "microMarket",
      "MicroMarket",
      "micromarketName",
      "MicromarketName",
    ]) || "",
  )
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPropertyPrice(property) {
  const type = getPropertyType(property);

  const managedOffice =
    type === "managedofficecoworking";

  return parseNumber(
    getFirstValue(
      property,
      managedOffice
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
        ],
    ),
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

function getPropertyName(property) {
  return String(
    getFirstValue(property, [
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

function getPropertyId(property) {
  return String(
    property?.id ??
    property?.rowId ??
    property?.ROWID ??
    property?.ID ??
    "",
  ).trim();
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

function sortProperties(properties, sort) {
  const validSorts = new Set([
    "budget_asc",
    "budget_desc",
    "area_asc",
    "area_desc",
    "seats_asc",
    "seats_desc",
    "name_asc",
    "name_desc",
  ]);

  if (!validSorts.has(sort)) {
    return properties;
  }

  const direction =
    sort.endsWith("_desc")
      ? -1
      : 1;

  const isNameSort =
    sort === "name_asc" ||
    sort === "name_desc";

  const items = properties.map(
    (property) => {
      let key = null;

      if (isNameSort) {
        key = getPropertyName(property);
      } else if (
        sort.startsWith("budget_")
      ) {
        key = getPropertyPrice(property);
      } else if (
        sort.startsWith("area_")
      ) {
        key = getPropertyArea(property);
      } else {
        key = getPropertySeats(property);
      }

      return {
        property,
        key,
        id: getPropertyId(property),
      };
    },
  );

  items.sort((a, b) => {
    /* -------------------------------------------------------------- */
    /* Name sort                                                       */
    /* -------------------------------------------------------------- */

    if (isNameSort) {
      const comparison =
        a.key.localeCompare(
          b.key,
          undefined,
          {
            sensitivity: "base",
            numeric: true,
          },
        );

      if (comparison !== 0) {
        return comparison * direction;
      }

      return a.id.localeCompare(
        b.id,
        undefined,
        {
          numeric: true,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* Numeric sort                                                    */
    /* -------------------------------------------------------------- */

    if (
      a.key === null &&
      b.key === null
    ) {
      return 0;
    }

    if (a.key === null) {
      return 1;
    }

    if (b.key === null) {
      return -1;
    }

    if (a.key === b.key) {
      return a.id.localeCompare(
        b.id,
        undefined,
        {
          numeric: true,
        },
      );
    }

    return (
      (a.key - b.key) *
      direction
    );
  });

  return items.map(
    (item) => item.property,
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

function parsePage(value) {
  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return 1;
  }

  return Math.floor(parsed);
}

function parsePageSize(value) {
  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return 30;
  }

  return Math.min(
    Math.floor(parsed),
    50,
  );
}

/* -------------------------------------------------------------------------- */
/* Micromarket matching                                                       */
/* -------------------------------------------------------------------------- */

function matchesMicromarket(
  property,
  selectedMicromarkets,
) {
  if (!selectedMicromarkets.length) {
    return true;
  }

  const propertyMicromarket =
    getPropertyMicromarket(property);

  return selectedMicromarkets.some(
    (selected) =>
      propertyMicromarket === selected ||
      propertyMicromarket.includes(selected),
  );
}

/* -------------------------------------------------------------------------- */
/* GET /api/properties                                                        */
/* -------------------------------------------------------------------------- */

export async function GET(request) {
  const requestStartedAt = Date.now();

  try {
    const { searchParams } =
      new URL(request.url);

    /* ------------------------------------------------------------------ */
    /* Query parameters                                                   */
    /* ------------------------------------------------------------------ */

    const city =
      searchParams.get("city") || "";

    const type =
      searchParams.get("type") || "";

    const micromarket =
      searchParams.get("micromarket") || "";

    /*
     * Only minimum budget is supported.
     *
     * maxBudget and budget are intentionally
     * not used.
     */
    const minBudget =
      searchParams.get("minBudget") || "";

    const area =
      searchParams.get("area") || "";

    const seats =
      searchParams.get("seats") || "";

    const prompt =
      searchParams.get("prompt") || "";

    const sort =
      searchParams.get("sort") || "";

    /* ------------------------------------------------------------------ */
    /* Pagination                                                         */
    /* ------------------------------------------------------------------ */

    const hasExplicitPagination =
      searchParams.has("page") ||
      searchParams.has("pageSize");

    const page =
      parsePage(
        searchParams.get("page"),
      );

    const pageSize =
      parsePageSize(
        searchParams.get("pageSize"),
      );

    /* ------------------------------------------------------------------ */
    /* Prepare indexed filters                                            */
    /* ------------------------------------------------------------------ */

    /*
     * "ai" means AI search rather than an actual
     * property type.
     */
    const indexedType =
      type &&
        type.trim().toLowerCase() !== "ai"
        ? type
        : "";

    /*
     * Keep the original micromarket values for
     * compatibility with the existing frontend.
     */
    const selectedMicromarkets =
      micromarket
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    /* ------------------------------------------------------------------ */
    /* Indexed candidate lookup                                           */
    /* ------------------------------------------------------------------ */

    /*
     * IMPORTANT:
     *
     * This does NOT fetch Catalyst data directly.
     *
     * getPropertyCandidates() works against the
     * central in-memory properties cache.
     *
     * Therefore a normal request does:
     *
     * Browser
     *   ↓
     * /api/properties
     *   ↓
     * propertiesCache
     *   ↓
     * indexed candidates
     *
     * Catalyst is only involved when the central
     * cache itself needs to refresh.
     */
    let filtered =
      await getPropertyCandidates({
        city,
        type: indexedType,
        /*
         * Do not pass micromarkets to the index.
         *
         * The API supports partial micromarket
         * matching, while the index is exact.
         *
         * We therefore perform the compatible
         * micromarket filter below.
         */
        micromarkets: [],
      });

    /* ------------------------------------------------------------------ */
    /* Micromarket                                                        */
    /* ------------------------------------------------------------------ */

    if (
      selectedMicromarkets.length
    ) {
      const normalizedMicromarkets =
        selectedMicromarkets
          .map((item) =>
            item
              .toLowerCase()
              .replace(
                /[_-]+/g,
                " ",
              )
              .replace(
                /[^\w\s/]/g,
                "",
              )
              .replace(
                /\s+/g,
                " ",
              )
              .trim(),
          )
          .filter(Boolean);

      filtered =
        filtered.filter(
          (property) =>
            matchesMicromarket(
              property,
              normalizedMicromarkets,
            ),
        );
    }

    /* ------------------------------------------------------------------ */
    /* Minimum budget                                                     */
    /* ------------------------------------------------------------------ */

    if (minBudget !== "") {
      const minimum =
        parseNumber(minBudget);

      if (
        minimum !== null &&
        minimum >= 0
      ) {
        filtered =
          filtered.filter(
            (property) => {
              const propertyPrice =
                getPropertyPrice(
                  property,
                );

              return (
                propertyPrice !==
                null &&
                propertyPrice >=
                minimum
              );
            },
          );
      }
    }

    /* ------------------------------------------------------------------ */
    /* Area                                                               */
    /* ------------------------------------------------------------------ */

    if (area !== "") {
      const minArea =
        parseNumber(area);

      if (
        minArea !== null &&
        minArea >= 0
      ) {
        filtered =
          filtered.filter(
            (property) => {
              const propertyArea =
                getPropertyArea(
                  property,
                );

              return (
                propertyArea !==
                null &&
                propertyArea >=
                minArea
              );
            },
          );
      }
    }

    /* ------------------------------------------------------------------ */
    /* Seats                                                              */
    /* ------------------------------------------------------------------ */

    if (seats !== "") {
      const requiredSeats =
        parseNumber(seats);

      if (
        requiredSeats !== null &&
        requiredSeats >= 0
      ) {
        filtered =
          filtered.filter(
            (property) => {
              const seatsOffered =
                getPropertySeats(
                  property,
                );

              return (
                seatsOffered !==
                null &&
                seatsOffered >=
                requiredSeats
              );
            },
          );
      }
    }

    /* ------------------------------------------------------------------ */
    /* AI prompt                                                          */
    /* ------------------------------------------------------------------ */

    /*
     * Prompt is currently logged only.
     *
     * This preserves the existing behavior.
     * It does not change property filtering.
     */
    if (prompt) {
      console.log(
        "[Properties] AI prompt:",
        prompt,
      );
    }

    /* ------------------------------------------------------------------ */
    /* Sorting                                                            */
    /* ------------------------------------------------------------------ */

    filtered =
      sortProperties(
        filtered,
        sort,
      );

    /* ------------------------------------------------------------------ */
    /* Pagination                                                         */
    /* ------------------------------------------------------------------ */

    const total =
      filtered.length;

    let responseData =
      filtered;

    let totalPages = 1;

    if (hasExplicitPagination) {
      const start =
        (page - 1) *
        pageSize;

      const end =
        start + pageSize;

      responseData =
        filtered.slice(
          start,
          end,
        );

      totalPages =
        total > 0
          ? Math.ceil(
            total /
            pageSize,
          )
          : 0;
    }

    /* ------------------------------------------------------------------ */
    /* Cache diagnostics                                                  */
    /* ------------------------------------------------------------------ */

    const cacheInfo =
      getPropertiesCacheInfo();

    const durationMs =
      Date.now() -
      requestStartedAt;

    console.log(
      "[Properties API] Request completed:",
      {
        durationMs,

        city:
          city || null,

        type:
          type || null,

        micromarket:
          micromarket || null,

        total,

        returned:
          responseData.length,

        page:
          hasExplicitPagination
            ? page
            : null,

        pageSize:
          hasExplicitPagination
            ? pageSize
            : null,

        cacheCount:
          cacheInfo.count,

        cacheFresh:
          cacheInfo.isFresh,

        cacheStale:
          cacheInfo.isStale,

        refreshInProgress:
          cacheInfo.refreshInProgress,
      },
    );

    /* ------------------------------------------------------------------ */
    /* Response                                                           */
    /* ------------------------------------------------------------------ */

    return NextResponse.json(
      {
        success: true,

        data:
          responseData,

        /*
         * Total matching properties BEFORE
         * pagination.
         */
        total,

        page:
          hasExplicitPagination
            ? page
            : 1,

        pageSize:
          hasExplicitPagination
            ? pageSize
            : total,

        totalPages:
          hasExplicitPagination
            ? totalPages
            : 1,

        hasMore:
          hasExplicitPagination
            ? page <
            totalPages
            : false,

        cachedAt:
          cacheInfo.cachedAt,

        cache: {
          count:
            cacheInfo.count,

          isFresh:
            cacheInfo.isFresh,

          isStale:
            cacheInfo.isStale,

          refreshInProgress:
            cacheInfo.refreshInProgress,
        },
      },
      {
        headers: {
          /*
           * Keep CDN/browser caching short.
           *
           * The server-side properties cache
           * remains the primary source of truth.
           */
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=60",

          "X-Properties-Count":
            String(
              responseData.length,
            ),

          "X-Properties-Total":
            String(total),

          "X-Properties-Cache":
            cacheInfo.isFresh
              ? "fresh"
              : cacheInfo.isStale
                ? "stale"
                : "cold",
        },
      },
    );
  } catch (error) {
    /* ------------------------------------------------------------------ */
    /* Error logging                                                      */
    /* ------------------------------------------------------------------ */

    console.error(
      "========================================",
    );

    console.error(
      "[Properties API] REQUEST FAILED",
    );

    console.error(
      "[Properties API] RAW ERROR:",
      error,
    );

    console.error(
      "[Properties API] ERROR TYPE:",
      typeof error,
    );

    console.error(
      "[Properties API] ERROR MESSAGE:",
      error?.message,
    );

    console.error(
      "[Properties API] ERROR NAME:",
      error?.name,
    );

    console.error(
      "[Properties API] ERROR CODE:",
      error?.code,
    );

    console.error(
      "[Properties API] ERROR STATUS:",
      error?.status,
    );

    console.error(
      "[Properties API] ERROR STACK:",
      error?.stack,
    );

    console.error(
      "========================================",
    );

    /* ------------------------------------------------------------------ */
    /* Error message                                                      */
    /* ------------------------------------------------------------------ */

    let errorMessage =
      "Failed to fetch properties";

    if (
      typeof error === "string"
    ) {
      errorMessage = error;
    } else if (
      error &&
      typeof error === "object"
    ) {
      errorMessage =
        error.message ||
        error.error ||
        error.description ||
        error.detail ||
        error.reason ||
        (() => {
          try {
            return JSON.stringify(
              error,
            );
          } catch {
            return "Unknown Catalyst error";
          }
        })();
    } else if (
      error !== null &&
      error !== undefined
    ) {
      errorMessage =
        String(error);
    }

    return NextResponse.json(
      {
        success: false,

        error:
          errorMessage,

        errorName:
          error?.name ||
          null,

        errorCode:
          error?.code ||
          null,

        errorStatus:
          error?.status ||
          null,
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}