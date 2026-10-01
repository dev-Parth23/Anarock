import { NextResponse } from "next/server";
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let propertiesCache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 60 * 1000;

function normalize(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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

  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFirstValue(property, keys) {
  if (!property) return null;
  for (let i = 0; i < keys.length; i++) {
    const value = property[keys[i]];
    if (value !== undefined && value !== null) {
      const str = String(value).trim();
      if (str !== "") return value;
    }
  }

  return null;
}

async function getAllProperties(request) {
  const now = Date.now();
  if (propertiesCache.data && now - propertiesCache.timestamp < CACHE_TTL) {
    console.log("[Properties API] Serving properties from server cache...");
    return propertiesCache.data;
  }

  const table = getPropertiesTable(request);
  const rows = [];
  let nextToken = null;
  let page = 1;

  while (true) {
    console.log(`[Properties API] Fetching Catalyst page ${page}...`);
    const options = { maxRows: 100 };
    if (nextToken) {
      options.nextToken = nextToken;
      console.log(`[Properties API] Using next token for page ${page}`);
    }

    const result = await table.getPagedRows(options);
    const pageRows = Array.isArray(result?.data) ? result.data : [];

    console.log(`[Properties API] Page ${page} rows: ${pageRows.length}`);
    rows.push(...pageRows);

    const newNextToken =
      result?.next_token || result?.nextToken || null;
    const moreRecords =
      result?.more_records === true || result?.moreRecords === true;

    console.log(`[Properties API] Page ${page} more records:`, moreRecords);
    console.log(
      `[Properties API] Page ${page} next token:`,
      Boolean(newNextToken)
    );

    if (!moreRecords) break;

    if (!newNextToken) {
      console.warn(
        "[Properties API] Catalyst reported more records but no next token was returned."
      );
      break;
    }

    if (newNextToken === nextToken) {
      console.warn(
        "[Properties API] Catalyst returned the same next token. Stopping pagination."
      );
      break;
    }

    nextToken = newNextToken;
    page += 1;
  }

  console.log("==================================================");
  console.log("[Properties API] TOTAL RAW CATALYST ROWS:", rows.length);
  console.log("==================================================");

  const properties = rows
    .map((row) => {
      try {
        return mapProperty(row);
      } catch (error) {
        console.error("[Properties API] PROPERTY MAPPING ERROR:", error);
        return null;
      }
    })
    .filter(Boolean);

  console.log("[Properties API] TOTAL MAPPED PROPERTIES:", properties.length);

  propertiesCache = {
    data: properties,
    timestamp: now,
  };

  return properties;
}

/* =========================================================
   GET ROUTE HANDLER
========================================================= */

export async function GET(request) {
  try {
    const properties = await getAllProperties(request);
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const micromarket = searchParams.get("micromarket") || "";
    const minBudget = searchParams.get("minBudget") || "";
    // const maxBudget = searchParams.get("maxBudget") || "";
    const budget = searchParams.get("budget") || "";
    const area = searchParams.get("area") || "";
    const seats = searchParams.get("seats") || "";
    const prompt = searchParams.get("prompt") || "";
    const sort = searchParams.get("sort") || "";

    let filtered = [...properties];

    console.log("[Properties API] FILTER REQUEST");
    console.log("City:", city);
    console.log("Type:", type);
    console.log("Micromarket:", micromarket);
    console.log("Min Budget:", minBudget);
    console.log("Legacy Budget:", budget);
    console.log("Area:", area);
    console.log("Seats:", seats);
    console.log("Prompt:", prompt);
    console.log("Initial properties:", filtered.length);

    if (city) {
      const normalizedCity = normalizeMatch(city);

      filtered = filtered.filter((property) => {
        const propertyCity = normalizeMatch(
          getFirstValue(property, [
            "city",
            "City",
            "cityName",
            "CityName",
          ])
        );

        return propertyCity === normalizedCity;
      });

      console.log(
        "[Properties API] After city filter:",
        filtered.length
      );
    }
    if (type && normalize(type) !== "ai") {
      const normalizedType = normalizeMatch(type);

      filtered = filtered.filter((property) => {
        const propertyType = normalizeMatch(
          getFirstValue(property, [
            "type",
            "Type",
            "propertyType",
            "PropertyType",
            "officeType",
            "OfficeType",
          ])
        );

        return propertyType === normalizedType;
      });

      console.log(
        "[Properties API] After type filter:",
        filtered.length
      );
    }

    /* --- MICROMARKET --- */
    if (micromarket) {
      const selectedMicromarkets = micromarket
        .split(",")
        .map((item) => normalizeMatch(item))
        .filter(Boolean);

      if (selectedMicromarkets.length > 0) {
        filtered = filtered.filter((property) => {
          const propertyMicromarket = normalizeMatch(
            getFirstValue(property, [
              "micromarket",
              "Micromarket",
              "microMarket",
              "MicroMarket",
              "micromarketName",
              "MicromarketName",
            ])
          );

          return selectedMicromarkets.some(
            (selected) =>
              propertyMicromarket === selected ||
              propertyMicromarket.includes(selected)
          );
        });
      }

      console.log(
        "[Properties API] After micromarket filter:",
        filtered.length
      );
    }

    /* --- LEGACY BUDGET --- */
    if (budget !== "" && minBudget === "" && maxBudget === "") {
      const maxBudgetValue = parseNumber(budget);
      if (maxBudgetValue !== null) {
        filtered = filtered.filter((property) => {
          const propertyBudget = parseNumber(
            getFirstValue(property, [
              "budget",
              "Budget",
              "price",
              "Price",
              // "maxBudget",
              // "MaxBudget",
              "monthlyCost",
              "MonthlyCost",
              "monthlyCostPerSeat",
              "MonthlyCostPerSeat",
              "cost",
              "Cost",
              "rent",
              "Rent",
            ])
          );
          return propertyBudget !== null;
        });
      }
      console.log("[Properties API] After legacy budget filter:", filtered.length);
    }

    /* --- MIN PRICE --- */
    if (minBudget !== "") {
      const minimum = parseNumber(minBudget);

      if (minimum !== null && minimum >= 0) {
        filtered = filtered.filter((property) => {
          const propertyType = normalizeMatch(
            getFirstValue(property, [
              "type",
              "Type",
              "propertyType",
              "PropertyType",
              "officeType",
              "OfficeType",
            ])
          );

          const isManagedOffice =
            propertyType === "managedofficecoworking";

          const propertyPrice = parseNumber(
            getFirstValue(
              property,
              isManagedOffice
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
                ]
            )
          );

          return (
            propertyPrice !== null &&
            propertyPrice >= minimum
          );
        });
      }

      console.log(
        "[Properties API] After min price filter:",
        filtered.length
      );
    }


    /* --- AREA --- */
    if (area !== "") {
      const minArea = parseNumber(area);
      if (minArea !== null) {
        filtered = filtered.filter((property) => {
          const propertyArea = parseNumber(
            getFirstValue(property, [
              "area",
              "Area",
              "areaSqft",
              "AreaSqft",
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
            ])
          );
          return propertyArea !== null && propertyArea >= minArea;
        });
      }
      console.log("[Properties API] After area filter:", filtered.length);
    }

    /* --- SEATS --- */
    if (seats !== "") {
      const requiredSeats = parseNumber(seats);
      if (requiredSeats !== null && requiredSeats >= 0) {
        filtered = filtered.filter((property) => {

          const seatsOffered = parseNumber(
            getFirstValue(property, [
              "seatsOffered",
              "SeatsOffered",
              "noofseatsoffered",
              "NoOfSeatsOffered",
              "NoofSeatsOffered",
              "noOfSeatsOffered",
            ])
          );
          // const availableSeats = parseNumber(
          //   getFirstValue(property, [
          //     "seatsOffered",
          //     "SeatsOffered",
          //     "noofseatsoffered",
          //     "NoOfSeatsOffered",
          //     "NoofSeatsOffered",
          //     "noOfSeatsOffered",
          //     "seatsAvailable",
          //     "SeatsAvailable",
          //     "availableSeats",
          //     "AvailableSeats",
          //     "seatCapacity",
          //     "SeatCapacity",
          //     "totalSeats",
          //     "TotalSeats",
          //   ])
          // );
          return seatsOffered !== null && seatsOffered >= requiredSeats;
        });
      }
      console.log("[Properties API] After seats filter:", filtered.length);
    }

    if (prompt) {
      console.log("[Properties API] AI prompt received:", prompt);
    }

    const SORT_VALUES = new Set([
      "budget_asc",
      "budget_desc",
      "area_asc",
      "area_desc",
      "seats_asc",
      "seats_desc",
      "name_asc",
      "name_desc",
    ]);

    const getSortNumber = (property, keys) =>
      parseNumber(getFirstValue(property, keys));

    const getBudgetValue = (property) => {
      const propertyType = normalize(
        getFirstValue(property, [
          "type",
          "Type",
          "propertyType",
          "PropertyType",
          "officeType",
          "OfficeType",
        ])
      );

      if (propertyType === "managed office/co-working") {
        const seatBudget = getSortNumber(property, [
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
        ]);
        if (seatBudget !== null) return seatBudget;
      }

      return getSortNumber(property, [
        "budget",
        "Budget",
        "price",
        "Price",
        "monthlyCost",
        "MonthlyCost",
        "rent",
        "Rent",
        "quotedRent",
        "QuotedRent",
        "monthlyRent",
        "MonthlyRent",
        "maxBudget",
        "MaxBudget",
      ]);
    };

    const getSortArea = (property) =>
      getSortNumber(property, [
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
      ]);

    const getSortSeats = (property) =>
      getSortNumber(property, [
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
      ]);

    const getSortName = (property) =>
      String(
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
        ]) || ""
      ).trim();

    if (SORT_VALUES.has(sort)) {
      const direction = sort.endsWith("_desc") ? -1 : 1;
      const isNameSort = sort === "name_asc" || sort === "name_desc";

      const itemsWithKeys = filtered.map((p) => {
        let key;
        if (isNameSort) key = getSortName(p);
        else if (sort.startsWith("budget_")) key = getBudgetValue(p);
        else if (sort.startsWith("area_")) key = getSortArea(p);
        else key = getSortSeats(p);

        const id = String(p?.id || p?.rowId || p?.ROWID || "");
        return { property: p, key, id };
      });

      itemsWithKeys.sort((a, b) => {
        if (isNameSort) {
          const comparison = a.key.localeCompare(b.key, undefined, {
            sensitivity: "base",
            numeric: true,
          });
          if (comparison !== 0) return comparison * direction;
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }

        if (a.key === null && b.key === null) return 0;
        if (a.key === null) return 1;
        if (b.key === null) return -1;

        if (a.key === b.key) {
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }

        return (a.key - b.key) * direction;
      });

      filtered = itemsWithKeys.map((item) => item.property);
    }

    console.log("==================================================");
    console.log("[Properties API] FINAL FILTERED PROPERTIES:", filtered.length);
    console.log("==================================================");

    return NextResponse.json(
      { success: true, data: filtered, total: filtered.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const errorMessage =
      error?.message || (typeof error === "string" ? error : String(error));

    console.error("[Properties API] ERROR NAME:", error?.name);
    console.error("[Properties API] ERROR MESSAGE:", errorMessage);
    console.error("[Properties API] ERROR CODE:", error?.code);
    console.error("[Properties API] ERROR STATUS:", error?.status);
    console.error("[Properties API] FULL ERROR:", error);
    console.error("[Properties API] STACK:", error?.stack);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch properties",
        errorName: error?.name || null,
        errorCode: error?.code || null,
        errorStatus: error?.status || null,
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}