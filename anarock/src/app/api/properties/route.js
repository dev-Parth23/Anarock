
import { NextResponse } from "next/server";
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalize(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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
    .replace(/\s/g, "")
    .trim();

  if (!cleaned) return null;

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

function getFirstValue(property, keys) {
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


async function getAllProperties(request) {
  const table = getPropertiesTable(request);

  let rows = [];
  let nextToken = null;
  let page = 1;

  do {
    console.log(`Fetching page ${page}...`);

    const options = {
      maxRows: 100,
    };

    if (nextToken) {
      options.nextToken = nextToken;
      console.log("Using next token");
    }

    const result = await table.getPagedRows(options);

    console.log("Response keys:", Object.keys(result || {}));

    console.log(
      "Rows received:",
      Array.isArray(result?.data) ? result.data.length : "NO DATA ARRAY",
    );

    if (Array.isArray(result?.data)) {
      rows.push(...result.data);

      if (page === 1 && result.data.length > 0) {
        console.log(
          "FIRST RAW PROPERTY:",
          JSON.stringify(result.data[0], null, 2),
        );
      }
    }

    nextToken =
      result?.next_token ||
      result?.nextToken ||
      null;

    if (!result?.more_records) {
      break
    }

    page++;
  } while (nextToken);

  const properties = rows
    .map((row) => {
      try {
        return mapProperty(row);
      } catch (error) {
        console.error("PROPERTY MAPPING ERROR:", error);
        return null;
      }
    })
    .filter(Boolean);

  console.log("TOTAL RAW ROWS:", rows.length);
  console.log("TOTAL MAPPED PROPERTIES:", properties.length);

  return properties;
}

export async function GET(request) {
  try {
    const properties = await getAllProperties(request);

    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const micromarket = searchParams.get("micromarket") || "";
    const budget = searchParams.get("budget") || "";
    const area = searchParams.get("area") || "";

    let filtered = [...properties];

    console.log("--------------------------------------------------");
    console.log("PROPERTY FILTERS");
    console.log("City:", city);
    console.log("Type:", type);
    console.log("Micromarket:", micromarket);
    console.log("Budget:", budget);
    console.log("Area:", area);
    console.log("Initial properties:", filtered.length);
    console.log("--------------------------------------------------");

    if (city) {
      const normalizedCity = normalize(city);

      filtered = filtered.filter((property) => {
        const propertyCity = normalize(
          getFirstValue(property, [
            "city",
            "City",
            "cityName",
            "CityName",
          ]),
        );

        return propertyCity === normalizedCity;
      });

      console.log("After city filter:", filtered.length);
    }


    if (type && normalize(type) !== "ai") {
      const normalizedType = normalize(type);

      filtered = filtered.filter((property) => {
        const propertyType = normalize(
          getFirstValue(property, [
            "type",
            "Type",
            "propertyType",
            "PropertyType",
            "officeType",
            "OfficeType",
          ]),
        );

        return propertyType === normalizedType;
      });

      console.log("After type filter:", filtered.length);
    }


    if (micromarket) {

      const selectedMicromarkets = micromarket
        .split(",")
        .map((item) => normalize(item))
        .filter(Boolean);

      if (selectedMicromarkets.length > 0) {
        filtered = filtered.filter((property) => {
          const propertyMicromarket = normalize(
            getFirstValue(property, [
              "micromarket",
              "Micromarket",
              "microMarket",
              "MicroMarket",
              "micromarketName",
              "MicromarketName",
            ]),
          );

          return selectedMicromarkets.some((selected) =>
            propertyMicromarket.includes(selected),
          );
        });
      }

      console.log("After micromarket filter:", filtered.length);
    }

    if (budget !== "") {
      const maxBudget = parseNumber(budget);

      if (maxBudget !== null) {
        filtered = filtered.filter((property) => {

          const propertyBudget = parseNumber(
            getFirstValue(property, [
              "budget",
              "Budget",
              "price",
              "Price",
              "maxBudget",
              "MaxBudget",
              "monthlyCost",
              "MonthlyCost",
              "monthlyCostPerSeat",
              "MonthlyCostPerSeat",
              "cost",
              "Cost",
            ]),
          );


          if (propertyBudget === null) {
            return false;
          }

          return propertyBudget <= maxBudget;
        });

        console.log("After budget filter:", filtered.length);
      }
    }


    if (area !== "") {
      const minArea = parseNumber(area);

      if (minArea !== null) {
        filtered = filtered.filter((property) => {
          const propertyArea = parseNumber(
            getFirstValue(property, [
              "area",
              "Area",
              "superArea",
              "SuperArea",
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


          if (propertyArea === null) {
            return false;
          }

          return propertyArea >= minArea;
        });

        console.log("After area filter:", filtered.length);
      }
    }

    console.log("FINAL FILTERED PROPERTIES:", filtered.length);

    return NextResponse.json(
      {
        success: true,
        data: filtered,
        total: filtered.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const errorMessage =
      error?.message ||
      (typeof error === "string" ? error : String(error));

    console.error("ERROR NAME:", error?.name);
    console.error("ERROR MESSAGE:", errorMessage);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR STATUS:", error?.status);
    console.error("FULL ERROR:", error);
    console.error("STACK:", error?.stack);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch properties",
        errorName: error?.name || null,
        errorCode: error?.code || null,
        errorStatus: error?.status || null,
        stack:
          process.env.NODE_ENV === "development"
            ? error?.stack
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}