import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalState = globalThis;

if (!globalState.__anarockPropertiesState) {
  globalState.__anarockPropertiesState = {
    data: null,
    timestamp: 0,
    fetchPromise: null,
  };
}

const state = globalState.__anarockPropertiesState;
const CACHE_TTL = Number(process.env.PROPERTIES_CACHE_TTL || "300") * 1000;
function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}
function normalizeMatch(value) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}
function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const cleaned = String(value)
    .replace(/[,₹$€£\s]/g, "")
    .trim();
  if (!cleaned) {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
function getFirstValue(property, keys) {
  if (!property) {
    return null;
  }
  for (const key of keys) {
    const value = property[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
}
async function fetchAllProperties() {
  try {
    console.log("[Properties] Getting Catalyst table...");
    const table = await getPropertiesTable();
    console.log("[Properties] Catalyst table obtained");
    const rows = [];
    let nextToken = null;
    while (true) {
      const options = { maxRows: 100 };
      if (nextToken) {
        options.nextToken = nextToken;
      }
      console.log("[Properties] Fetching Data Store page:", {
        maxRows: 100,
        hasNextToken: Boolean(nextToken),
      });
      const result = await table.getPagedRows(options);
      console.log("[Properties] Data Store response received");
      const pageRows = Array.isArray(result?.data) ? result.data : [];
      rows.push(...pageRows);
      const newNextToken = result?.next_token || result?.nextToken || null;
      const moreRecords =
        result?.more_records === true || result?.moreRecords === true;
      if (!moreRecords || !newNextToken) {
        break;
      }
      if (newNextToken === nextToken) {
        break;
      }
      nextToken = newNextToken;
    }
    console.log("[Properties] Total Catalyst rows:", rows.length);
    return rows
      .map((row) => {
        try {
          return mapProperty(row);
        } catch (error) {
          console.error("[Properties] Mapping error:", error);
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error("========================================");
    console.error("[Properties] FETCH ALL FAILED");
    console.error("[Properties] RAW:", error);
    console.error("[Properties] TYPE:", typeof error);
    console.error("[Properties] MESSAGE:", error?.message);
    console.error("[Properties] CODE:", error?.code);
    console.error("[Properties] STATUS:", error?.status);
    console.error("[Properties] STACK:", error?.stack);
    console.error("========================================");
    throw error;
  }
}
const getCachedProperties = unstable_cache(\n  fetchAllProperties,\n  ["anarock-properties-v1"],\n  { revalidate: Math.max(30, Number(process.env.PROPERTIES_CACHE_TTL || "300")) },\n);\n\nfunction startRefresh() {
  if (state.fetchPromise) {
    return state.fetchPromise;
  }
  state.fetchPromise = getCachedProperties()
    .then((properties) => {
      state.data = properties;
      state.timestamp = Date.now();
      console.log(`[Properties] Cached ${properties.length} properties`);
      return properties;
    })
    .catch((error) => {
      console.error("[Properties] Catalyst fetch failed:", error);
      throw error;
    })
    .finally(() => {
      state.fetchPromise = null;
    });
  return state.fetchPromise;
}

async function getAllProperties() {
  const now = Date.now();
  if (state.data && now - state.timestamp < CACHE_TTL) {
    return state.data;
  }
  if (state.data) {
    if (!state.fetchPromise) {
      startRefresh().catch(() => {});
    }
    return state.data;
  }
  return startRefresh();
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

function getPropertyPrice(property) {
  const type = getPropertyType(property);
  const managedOffice = type === "managedofficecoworking";
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
            "budget",
            "Budget",
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

function getLegacyBudget(property) {
  return parseNumber(
    getFirstValue(property, [
      "budget",
      "Budget",
      "price",
      "Price",
      "monthlyCost",
      "MonthlyCost",
      "monthlyCostPerSeat",
      "MonthlyCostPerSeat",
      "cost",
      "Cost",
      "rent",
      "Rent",
    ]),
  );
}

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
  const direction = sort.endsWith("_desc") ? -1 : 1;
  const isNameSort = sort === "name_asc" || sort === "name_desc";
  const items = properties.map((property) => {
    let key = null;
    if (isNameSort) {
      key = getPropertyName(property);
    } else if (sort.startsWith("budget_")) {
      key = getPropertyPrice(property);
    } else if (sort.startsWith("area_")) {
      key = getPropertyArea(property);
    } else {
      key = getPropertySeats(property);
    }
    return {
      property,
      key,
      id: String(property?.id || property?.rowId || property?.ROWID || ""),
    };
  });
  items.sort((a, b) => {
    if (isNameSort) {
      const comparison = a.key.localeCompare(b.key, undefined, {
        sensitivity: "base",
        numeric: true,
      });
      if (comparison !== 0) {
        return comparison * direction;
      }
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    }
    if (a.key === null && b.key === null) {
      return 0;
    }
    if (a.key === null) {
      return 1;
    }
    if (b.key === null) {
      return -1;
    }
    if (a.key === b.key) {
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    }
    return (a.key - b.key) * direction;
  });
  return items.map((item) => item.property);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const [
      properties,
      city,
      type,
      micromarket,
      minBudget,
      maxBudget,
      budget,
      area,
      seats,
      prompt,
      sort,
    ] = await Promise.all([
      getAllProperties(),
      Promise.resolve(searchParams.get("city") || ""),
      Promise.resolve(searchParams.get("type") || ""),
      Promise.resolve(searchParams.get("micromarket") || ""),
      Promise.resolve(searchParams.get("minBudget") || ""),
      Promise.resolve(searchParams.get("maxBudget") || ""),
      Promise.resolve(searchParams.get("budget") || ""),
      Promise.resolve(searchParams.get("area") || ""),
      Promise.resolve(searchParams.get("seats") || ""),
      Promise.resolve(searchParams.get("prompt") || ""),
      Promise.resolve(searchParams.get("sort") || ""),
    ]);
    let filtered = properties;
    if (city) {
      const normalizedCity = normalizeMatch(city);
      filtered = filtered.filter(
        (property) => getPropertyCity(property) === normalizedCity,
      );
    }
    if (type && normalize(type) !== "ai") {
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
    if (budget !== "" && minBudget === "" && maxBudget === "") {
      const maxBudgetValue = parseNumber(budget);
      if (maxBudgetValue !== null) {
        filtered = filtered.filter((property) => {
          const propertyBudget = getLegacyBudget(property);
          return propertyBudget !== null && propertyBudget <= maxBudgetValue;
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
    if (maxBudget !== "") {
      const maximum = parseNumber(maxBudget);
      if (maximum !== null && maximum >= 0) {
        filtered = filtered.filter((property) => {
          const propertyPrice = getPropertyPrice(property);
          return propertyPrice !== null && propertyPrice <= maximum;
        });
      }
    }
    if (area !== "") {
      const minArea = parseNumber(area);
      if (minArea !== null) {
        filtered = filtered.filter((property) => {
          const propertyArea = getPropertyArea(property);
          return propertyArea !== null && propertyArea >= minArea;
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
    if (prompt) {
      console.log("[Properties] AI prompt:", prompt);
    }
    filtered = sortProperties(filtered, sort);
    return NextResponse.json(
      {
        success: true,
        data: filtered,
        total: filtered.length,
        cachedAt: state.timestamp,
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("========================================");
    console.error("[Properties API] RAW ERROR:", error);
    console.error("[Properties API] ERROR TYPE:", typeof error);
    console.error(
      "[Properties API] ERROR JSON:",
      (() => {
        try {
          return JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        } catch {
          return "Unable to stringify error";
        }
      })(),
    );
    console.error("[Properties API] ERROR MESSAGE:", error?.message);
    console.error("[Properties API] ERROR NAME:", error?.name);
    console.error("[Properties API] ERROR CODE:", error?.code);
    console.error("[Properties API] ERROR STATUS:", error?.status);
    console.error("[Properties API] ERROR STACK:", error?.stack);
    console.error("========================================");
    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch properties right now.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
