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
  const rows = [];
  let nextToken = null;
  let page = 1;
  while (true) {
    console.log(`[Properties API] Fetching Catalyst page ${page}...`,);
    const options = { maxRows: 100, };
    if (nextToken) {
      options.nextToken = nextToken;
      console.log(`[Properties API] Using next token for page ${page}`,);
    }

    const result = await table.getPagedRows(options);

    const pageRows = Array.isArray(result?.data)
      ? result.data
      : [];

    console.log(
      `[Properties API] Page ${page} rows: ${pageRows.length}`,
    );

    rows.push(...pageRows);

    const newNextToken =
      result?.next_token ||
      result?.nextToken ||
      null;

    const moreRecords =
      result?.more_records === true ||
      result?.moreRecords === true;

    console.log(
      `[Properties API] Page ${page} more records:`,
      moreRecords,
    );

    console.log(
      `[Properties API] Page ${page} next token:`,
      Boolean(newNextToken),
    );

    /* -----------------------------------------------
       No more records
    ------------------------------------------------ */

    if (!moreRecords) {
      break;
    }

    /* -----------------------------------------------
       Safety: more records but no token
    ------------------------------------------------ */

    if (!newNextToken) {
      console.warn(
        "[Properties API] Catalyst reported more records but no next token was returned.",
      );

      break;
    }

    /* -----------------------------------------------
       Safety: prevent infinite loop
    ------------------------------------------------ */

    if (newNextToken === nextToken) {
      console.warn(
        "[Properties API] Catalyst returned the same next token. Stopping pagination.",
      );

      break;
    }

    nextToken = newNextToken;

    page += 1;
  }

  console.log(
    "==================================================",
  );

  console.log(
    "[Properties API] TOTAL RAW CATALYST ROWS:",
    rows.length,
  );

  console.log(
    "==================================================",
  );

  /* =====================================================
     MAP CATALYST ROWS
  ===================================================== */

  const properties = rows
    .map((row) => {
      try {
        return mapProperty(row);
      } catch (error) {
        console.error(
          "[Properties API] PROPERTY MAPPING ERROR:",
          error,
        );

        return null;
      }
    })
    .filter(Boolean);

  console.log(
    "[Properties API] TOTAL MAPPED PROPERTIES:",
    properties.length,
  );

  return properties;
}

/* =========================================================
   GET
========================================================= */

export async function GET(request) {
  try {
    const properties = await getAllProperties(request);

    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const micromarket = searchParams.get("micromarket") || "";
    const minBudget = searchParams.get("minBudget") || "";
    const maxBudget = searchParams.get("maxBudget") || "";
    const budget = searchParams.get("budget") || "";
    const area = searchParams.get("area") || "";
    const seats = searchParams.get("seats") || "";
    const prompt = searchParams.get("prompt") || "";
    const sort = searchParams.get("sort") || "";
    let filtered = [...properties];
    console.log("[Properties API] FILTER REQUEST",);
    console.log("City:", city,);
    console.log("Type:", type,);
    console.log("Micromarket:", micromarket,);
    console.log("Min Budget:", minBudget,);
    console.log("Max Budget:", maxBudget,);
    console.log("Legacy Budget:", budget,);
    console.log("Area:", area,);
    console.log("Seats:", seats,);
    console.log("Prompt:", prompt,);
    console.log("Initial properties:", filtered.length,);


    /* =====================================================
       CITY
    ===================================================== */

    if (city) {
      const normalizedCity =
        normalize(city);

      filtered = filtered.filter(
        (property) => {
          const propertyCity =
            normalize(
              getFirstValue(property, [
                "city",
                "City",
                "cityName",
                "CityName",
              ]),
            );

          return (
            propertyCity ===
            normalizedCity
          );
        },
      );

      console.log(
        "[Properties API] After city filter:",
        filtered.length,
      );
    }

    /* =====================================================
       PROPERTY TYPE
    ===================================================== */

    if (
      type &&
      normalize(type) !== "ai"
    ) {
      const normalizedType =
        normalize(type);

      filtered = filtered.filter(
        (property) => {
          const propertyType =
            normalize(
              getFirstValue(property, [
                "type",
                "Type",
                "propertyType",
                "PropertyType",
                "officeType",
                "OfficeType",
              ]),
            );

          return (
            propertyType ===
            normalizedType
          );
        },
      );

      console.log(
        "[Properties API] After type filter:",
        filtered.length,
      );
    }

    /* =====================================================
       MICROMARKET
    ===================================================== */

    if (micromarket) {
      const selectedMicromarkets =
        micromarket
          .split(",")
          .map((item) =>
            normalize(item),
          )
          .filter(Boolean);

      if (
        selectedMicromarkets.length > 0
      ) {
        filtered = filtered.filter(
          (property) => {
            const propertyMicromarket =
              normalize(
                getFirstValue(property, [
                  "micromarket",
                  "Micromarket",
                  "microMarket",
                  "MicroMarket",
                  "micromarketName",
                  "MicromarketName",
                ]),
              );

            return selectedMicromarkets.some(
              (selected) =>
                propertyMicromarket ===
                selected ||
                propertyMicromarket.includes(
                  selected,
                ),
            );
          },
        );
      }

      console.log(
        "[Properties API] After micromarket filter:",
        filtered.length,
      );
    }

    /* =====================================================
       LEGACY BUDGET
       ?budget=50000
    ===================================================== */

    if (
      budget !== "" &&
      minBudget === "" &&
      maxBudget === ""
    ) {
      const maxBudgetValue =
        parseNumber(budget);

      if (
        maxBudgetValue !== null
      ) {
        filtered = filtered.filter(
          (property) => {
            const propertyBudget =
              parseNumber(
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
                  "rent",
                  "Rent",
                ]),
              );

            return (
              propertyBudget !== null &&
              propertyBudget <=
              maxBudgetValue
            );
          },
        );
      }

      console.log(
        "[Properties API] After legacy budget filter:",
        filtered.length,
      );
    }

    /* =====================================================
       MIN BUDGET
    ===================================================== */

    if (minBudget !== "") {
      const minimum =
        parseNumber(minBudget);

      if (minimum !== null) {
        filtered = filtered.filter(
          (property) => {
            const propertyBudget =
              parseNumber(
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
                  "rent",
                  "Rent",
                  "quotedRent",
                  "QuotedRent",
                  "monthlyRent",
                  "MonthlyRent",
                ]),
              );

            if (
              propertyBudget === null
            ) {
              return false;
            }

            return (
              propertyBudget >=
              minimum
            );
          },
        );
      }

      console.log(
        "[Properties API] After min budget filter:",
        filtered.length,
      );
    }

    /* =====================================================
       MAX BUDGET
    ===================================================== */

    if (maxBudget !== "") {
      const maximum =
        parseNumber(maxBudget);

      if (maximum !== null) {
        filtered = filtered.filter(
          (property) => {
            const propertyBudget =
              parseNumber(
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
                  "rent",
                  "Rent",
                  "quotedRent",
                  "QuotedRent",
                  "monthlyRent",
                  "MonthlyRent",
                ]),
              );

            if (
              propertyBudget === null
            ) {
              return false;
            }

            return (
              propertyBudget <=
              maximum
            );
          },
        );
      }

      console.log(
        "[Properties API] After max budget filter:",
        filtered.length,
      );
    }

    /* =====================================================
       AREA
       Minimum area in sqft
    ===================================================== */

    if (area !== "") {
      const minArea =
        parseNumber(area);

      if (minArea !== null) {
        filtered = filtered.filter(
          (property) => {
            const propertyArea =
              parseNumber(
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
                ]),
              );

            if (
              propertyArea === null
            ) {
              return false;
            }

            return (
              propertyArea >=
              minArea
            );
          },
        );
      }

      console.log(
        "[Properties API] After area filter:",
        filtered.length,
      );
    }

    /* =====================================================
       SEATS
       Minimum seats required
    ===================================================== */

    if (seats !== "") {
      const requiredSeats =
        parseNumber(seats);

      if (
        requiredSeats !== null
      ) {
        filtered = filtered.filter(
          (property) => {
            const availableSeats =
              parseNumber(
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

            if (
              availableSeats === null
            ) {
              return false;
            }

            return (
              availableSeats >=
              requiredSeats
            );
          },
        );
      }

      console.log(
        "[Properties API] After seats filter:",
        filtered.length,
      );
    }

    /* =====================================================
       AI PROMPT
       The prompt is logged/preserved here.
       Existing AI ranking/search logic can use it
       without affecting normal pagination.
    ===================================================== */

    if (prompt) {
      console.log(
        "[Properties API] AI prompt received:",
        prompt,
      );
    }

    /* =====================================================
   SORT
   Sorting is applied AFTER all filters and BEFORE the
   response is returned to the client.
===================================================== */

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

    const getSortNumber = (property, keys) => {
      return parseNumber(
        getFirstValue(property, keys),
      );
    };

    /* -----------------------------------------------------
       BUDGET
       Conventional:
       monthly rent / quoted rent
    
       Managed Office / Co-working:
       monthly cost per seat
    ----------------------------------------------------- */

    const getBudgetValue = (property) => {
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

      const isManagedOffice =
        propertyType === "managed office/co-working";

      if (isManagedOffice) {
        const seatBudget = getSortNumber(
          property,
          [
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
          ],
        );

        if (seatBudget !== null) {
          return seatBudget;
        }
      }

      return getSortNumber(
        property,
        [
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
        ],
      );
    };

    /* -----------------------------------------------------
       AREA
    ----------------------------------------------------- */

    const getSortArea = (property) => {
      return getSortNumber(
        property,
        [
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
        ],
      );
    };

    /* -----------------------------------------------------
       SEATS
    ----------------------------------------------------- */

    const getSortSeats = (property) => {
      return getSortNumber(
        property,
        [
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
        ],
      );
    };

    /* -----------------------------------------------------
       PROPERTY NAME
    ----------------------------------------------------- */

    const getSortName = (property) => {
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
    };

    /* -----------------------------------------------------
       APPLY SORT
    ----------------------------------------------------- */

    if (SORT_VALUES.has(sort)) {
      const direction =
        sort.endsWith("_desc")
          ? -1
          : 1;

      filtered.sort((a, b) => {
        /* -----------------------------------------------
           A-Z / Z-A
        ----------------------------------------------- */

        if (
          sort === "name_asc" ||
          sort === "name_desc"
        ) {
          const nameA = getSortName(a);
          const nameB = getSortName(b);

          const comparison =
            nameA.localeCompare(
              nameB,
              undefined,
              {
                sensitivity: "base",
                numeric: true,
              },
            );

          if (comparison !== 0) {
            return comparison * direction;
          }

          return String(
            a?.id ||
            a?.rowId ||
            a?.ROWID ||
            "",
          ).localeCompare(
            String(
              b?.id ||
              b?.rowId ||
              b?.ROWID ||
              "",
            ),
            undefined,
            {
              numeric: true,
            },
          );
        }

        /* -----------------------------------------------
           NUMERIC SORTS
        ----------------------------------------------- */

        let getValue;

        if (sort.startsWith("budget_")) {
          getValue = getBudgetValue;
        } else if (sort.startsWith("area_")) {
          getValue = getSortArea;
        } else {
          getValue = getSortSeats;
        }

        const valueA = getValue(a);
        const valueB = getValue(b);

        /*
          Properties without a value always stay at
          the bottom of the list.
        */

        if (
          valueA === null &&
          valueB === null
        ) {
          return 0;
        }

        if (valueA === null) {
          return 1;
        }

        if (valueB === null) {
          return -1;
        }

        if (valueA === valueB) {
          return String(
            a?.id ||
            a?.rowId ||
            a?.ROWID ||
            "",
          ).localeCompare(
            String(
              b?.id ||
              b?.rowId ||
              b?.ROWID ||
              "",
            ),
            undefined,
            {
              numeric: true,
            },
          );
        }

        return (
          valueA - valueB
        ) * direction;
      });
    }
    /* =====================================================
       FINAL RESULT
    ===================================================== */

    console.log(
      "==================================================",
    );

    console.log(
      "[Properties API] FINAL FILTERED PROPERTIES:",
      filtered.length,
    );

    console.log(
      "==================================================",
    );

    return NextResponse.json(
      {
        success: true,
        data: filtered,
        total: filtered.length,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    const errorMessage =
      error?.message ||
      (typeof error === "string"
        ? error
        : String(error));

    console.error(
      "[Properties API] ERROR NAME:",
      error?.name,
    );

    console.error(
      "[Properties API] ERROR MESSAGE:",
      errorMessage,
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
      "[Properties API] FULL ERROR:",
      error,
    );

    console.error(
      "[Properties API] STACK:",
      error?.stack,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          errorMessage ||
          "Failed to fetch properties",
        errorName:
          error?.name || null,
        errorCode:
          error?.code || null,
        errorStatus:
          error?.status || null,
        stack:
          process.env.NODE_ENV ===
            "development"
            ? error?.stack
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}