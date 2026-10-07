// // import { NextResponse } from "next/server";
// // import { getPropertiesTable } from "@/lib/catalyst";
// // import { mapProperty } from "@/lib/propertyMapper";

// // export const runtime = "nodejs";
// // export const dynamic = "force-dynamic";

// // const globalState = globalThis;

// // if (!globalState.__anarockPropertiesState) {
// //   globalState.__anarockPropertiesState = {
// //     data: null,
// //     timestamp: 0,
// //     fetchPromise: null,
// //   };
// // }

// // const state = globalState.__anarockPropertiesState;
// // const CACHE_TTL = Number(process.env.PROPERTIES_CACHE_TTL || "300") * 1000;
// // function normalize(value) {
// //   if (value === null || value === undefined) {
// //     return "";
// //   }
// //   return String(value).trim().toLowerCase().replace(/\s+/g, " ");
// // }
// // function normalizeMatch(value) {
// //   return normalize(value).replace(/[^a-z0-9]/g, "");
// // }
// // function parseNumber(value) {
// //   if (value === null || value === undefined || value === "") {
// //     return null;
// //   }
// //   if (typeof value === "number") {
// //     return Number.isFinite(value) ? value : null;
// //   }
// //   const cleaned = String(value)
// //     .replace(/[,₹$€£\s]/g, "")
// //     .trim();
// //   if (!cleaned) {
// //     return null;
// //   }
// //   const parsed = Number(cleaned);
// //   return Number.isFinite(parsed) ? parsed : null;
// // }
// // function getFirstValue(property, keys) {
// //   if (!property) {
// //     return null;
// //   }
// //   for (const key of keys) {
// //     const value = property[key];
// //     if (value !== undefined && value !== null && String(value).trim() !== "") {
// //       return value;
// //     }
// //   }
// //   return null;
// // }
// // async function fetchAllProperties() {
// //   try {
// //     console.log("[Properties] Getting Catalyst table...");
// //     const table = await getPropertiesTable();
// //     console.log("[Properties] Catalyst table obtained");
// //     const rows = [];
// //     let nextToken = null;
// //     while (true) {
// //       const options = { maxRows: 100 };
// //       if (nextToken) {
// //         options.nextToken = nextToken;
// //       }
// //       console.log("[Properties] Fetching Data Store page:", {
// //         maxRows: 100,
// //         hasNextToken: Boolean(nextToken),
// //       });
// //       const result = await table.getPagedRows(options);
// //       console.log("[Properties] Data Store response received");
// //       const pageRows = Array.isArray(result?.data) ? result.data : [];
// //       rows.push(...pageRows);
// //       const newNextToken = result?.next_token || result?.nextToken || null;
// //       const moreRecords =
// //         result?.more_records === true || result?.moreRecords === true;
// //       if (!moreRecords || !newNextToken) {
// //         break;
// //       }
// //       if (newNextToken === nextToken) {
// //         break;
// //       }
// //       nextToken = newNextToken;
// //     }
// //     console.log("[Properties] Total Catalyst rows:", rows.length);
// //     return rows
// //       .map((row) => {
// //         try {
// //           return mapProperty(row);
// //         } catch (error) {
// //           console.error("[Properties] Mapping error:", error);
// //           return null;
// //         }
// //       })
// //       .filter(Boolean);
// //   } catch (error) {
// //     console.error("========================================");
// //     console.error("[Properties] FETCH ALL FAILED");
// //     console.error("[Properties] RAW:", error);
// //     console.error("[Properties] TYPE:", typeof error);
// //     console.error("[Properties] MESSAGE:", error?.message);
// //     console.error("[Properties] CODE:", error?.code);
// //     console.error("[Properties] STATUS:", error?.status);
// //     console.error("[Properties] STACK:", error?.stack);
// //     console.error("========================================");
// //     throw error;
// //   }
// // }
// // function startRefresh() {
// //   if (state.fetchPromise) {
// //     return state.fetchPromise;
// //   }
// //   state.fetchPromise = fetchAllProperties()
// //     .then((properties) => {
// //       state.data = properties;
// //       state.timestamp = Date.now();
// //       console.log(`[Properties] Cached ${properties.length} properties`);
// //       return properties;
// //     })
// //     .catch((error) => {
// //       console.error("[Properties] Catalyst fetch failed:", error);
// //       throw error;
// //     })
// //     .finally(() => {
// //       state.fetchPromise = null;
// //     });
// //   return state.fetchPromise;
// // }

// // async function getAllProperties() {
// //   const now = Date.now();
// //   if (state.data && now - state.timestamp < CACHE_TTL) {
// //     return state.data;
// //   }
// //   if (state.data) {
// //     if (!state.fetchPromise) {
// //       startRefresh().catch(() => { });
// //     }
// //     return state.data;
// //   }
// //   return startRefresh();
// // }

// // function getPropertyType(property) {
// //   return normalizeMatch(
// //     getFirstValue(property, [
// //       "type",
// //       "Type",
// //       "propertyType",
// //       "PropertyType",
// //       "officeType",
// //       "OfficeType",
// //     ]),
// //   );
// // }

// // function getPropertyCity(property) {
// //   return normalizeMatch(
// //     getFirstValue(property, ["city", "City", "cityName", "CityName"]),
// //   );
// // }

// // function getPropertyMicromarket(property) {
// //   return normalizeMatch(
// //     getFirstValue(property, [
// //       "micromarket",
// //       "Micromarket",
// //       "microMarket",
// //       "MicroMarket",
// //       "micromarketName",
// //       "MicromarketName",
// //     ]),
// //   );
// // }

// // function getPropertyPrice(property) {
// //   const type = getPropertyType(property);
// //   const managedOffice = type === "managedofficecoworking";
// //   return parseNumber(
// //     getFirstValue(
// //       property,
// //       managedOffice
// //         ? [
// //           "monthlyCostPerSeat",
// //           "MonthlyCostPerSeat",
// //           "monthlyCostPerSeatInr",
// //           "MonthlyCostPerSeatInr",
// //           "pricePerSeat",
// //           "PricePerSeat",
// //           "costPerSeat",
// //           "CostPerSeat",
// //           "rentPerSeat",
// //           "RentPerSeat",
// //         ]
// //         : [
// //           "quotedRent",
// //           "QuotedRent",
// //           "monthlyRent",
// //           "MonthlyRent",
// //           "rent",
// //           "Rent",
// //           "monthlyCost",
// //           "MonthlyCost",
// //           "budget",
// //           "Budget",
// //           "price",
// //           "Price",
// //         ],
// //     ),
// //   );
// // }

// // function getPropertyArea(property) {
// //   return parseNumber(
// //     getFirstValue(property, [
// //       "areaSqft",
// //       "AreaSqft",
// //       "area",
// //       "Area",
// //       "superArea",
// //       "SuperArea",
// //       "superBuiltUpArea",
// //       "SuperBuiltUpArea",
// //       "carpetArea",
// //       "CarpetArea",
// //       "builtUpArea",
// //       "BuiltUpArea",
// //       "floorPlate",
// //       "FloorPlate",
// //       "Floor_Plate",
// //       "size",
// //       "Size",
// //     ]),
// //   );
// // }

// // function getPropertySeats(property) {
// //   return parseNumber(
// //     getFirstValue(property, [
// //       "seatsOffered",
// //       "SeatsOffered",
// //       "noofseatsoffered",
// //       "NoOfSeatsOffered",
// //       "NoofSeatsOffered",
// //       "noOfSeatsOffered",
// //       "seatsAvailable",
// //       "SeatsAvailable",
// //       "availableSeats",
// //       "AvailableSeats",
// //       "seatCapacity",
// //       "SeatCapacity",
// //       "totalSeats",
// //       "TotalSeats",
// //     ]),
// //   );
// // }

// // function getPropertyName(property) {
// //   return String(
// //     getFirstValue(property, [
// //       "propertyName",
// //       "PropertyName",
// //       "property_name",
// //       "Property_Name",
// //       "buildingName",
// //       "BuildingName",
// //       "projectName",
// //       "ProjectName",
// //       "name",
// //       "Name",
// //       "title",
// //       "Title",
// //     ]) || "",
// //   ).trim();
// // }

// // function getLegacyBudget(property) {
// //   return parseNumber(
// //     getFirstValue(property, [
// //       "budget",
// //       "Budget",
// //       "price",
// //       "Price",
// //       "monthlyCost",
// //       "MonthlyCost",
// //       "monthlyCostPerSeat",
// //       "MonthlyCostPerSeat",
// //       "cost",
// //       "Cost",
// //       "rent",
// //       "Rent",
// //     ]),
// //   );
// // }

// // function sortProperties(properties, sort) {
// //   const validSorts = new Set([
// //     "budget_asc",
// //     "budget_desc",
// //     "area_asc",
// //     "area_desc",
// //     "seats_asc",
// //     "seats_desc",
// //     "name_asc",
// //     "name_desc",
// //   ]);
// //   if (!validSorts.has(sort)) {
// //     return properties;
// //   }
// //   const direction = sort.endsWith("_desc") ? -1 : 1;
// //   const isNameSort = sort === "name_asc" || sort === "name_desc";
// //   const items = properties.map((property) => {
// //     let key = null;
// //     if (isNameSort) {
// //       key = getPropertyName(property);
// //     } else if (sort.startsWith("budget_")) {
// //       key = getPropertyPrice(property);
// //     } else if (sort.startsWith("area_")) {
// //       key = getPropertyArea(property);
// //     } else {
// //       key = getPropertySeats(property);
// //     }
// //     return {
// //       property,
// //       key,
// //       id: String(property?.id || property?.rowId || property?.ROWID || ""),
// //     };
// //   });
// //   items.sort((a, b) => {
// //     if (isNameSort) {
// //       const comparison = a.key.localeCompare(b.key, undefined, {
// //         sensitivity: "base",
// //         numeric: true,
// //       });
// //       if (comparison !== 0) {
// //         return comparison * direction;
// //       }
// //       return a.id.localeCompare(b.id, undefined, { numeric: true });
// //     }
// //     if (a.key === null && b.key === null) {
// //       return 0;
// //     }
// //     if (a.key === null) {
// //       return 1;
// //     }
// //     if (b.key === null) {
// //       return -1;
// //     }
// //     if (a.key === b.key) {
// //       return a.id.localeCompare(b.id, undefined, { numeric: true });
// //     }
// //     return (a.key - b.key) * direction;
// //   });
// //   return items.map((item) => item.property);
// // }

// // export async function GET(request) {
// //   try {
// //     const { searchParams } = new URL(request.url);
// //     const [
// //       properties,
// //       city,
// //       type,
// //       micromarket,
// //       minBudget,
// //       budget,
// //       area,
// //       seats,
// //       prompt,
// //       sort,
// //     ] = await Promise.all([
// //       getAllProperties(),
// //       Promise.resolve(searchParams.get("city") || ""),
// //       Promise.resolve(searchParams.get("type") || ""),
// //       Promise.resolve(searchParams.get("micromarket") || ""),
// //       Promise.resolve(searchParams.get("minBudget") || ""),
// //       Promise.resolve(searchParams.get("budget") || ""),
// //       Promise.resolve(searchParams.get("area") || ""),
// //       Promise.resolve(searchParams.get("seats") || ""),
// //       Promise.resolve(searchParams.get("prompt") || ""),
// //       Promise.resolve(searchParams.get("sort") || ""),
// //     ]);
// //     let filtered = properties;
// //     if (city) {
// //       const normalizedCity = normalizeMatch(city);
// //       filtered = filtered.filter(
// //         (property) => getPropertyCity(property) === normalizedCity,
// //       );
// //     }
// //     if (type && normalize(type) !== "ai") {
// //       const normalizedType = normalizeMatch(type);
// //       filtered = filtered.filter(
// //         (property) => getPropertyType(property) === normalizedType,
// //       );
// //     }
// //     if (micromarket) {
// //       const selectedMicromarkets = micromarket
// //         .split(",")
// //         .map((item) => normalizeMatch(item))
// //         .filter(Boolean);
// //       if (selectedMicromarkets.length) {
// //         filtered = filtered.filter((property) => {
// //           const propertyMicromarket = getPropertyMicromarket(property);
// //           return selectedMicromarkets.some(
// //             (selected) =>
// //               propertyMicromarket === selected ||
// //               propertyMicromarket.includes(selected),
// //           );
// //         });
// //       }
// //     }
// //     if (budget !== "" && minBudget === "" && maxBudget === "") {
// //       const maxBudgetValue = parseNumber(budget);
// //       if (maxBudgetValue !== null) {
// //         filtered = filtered.filter((property) => {
// //           const propertyBudget = getLegacyBudget(property);
// //           return propertyBudget !== null && propertyBudget <= maxBudgetValue;
// //         });
// //       }
// //     }
// //     if (minBudget !== "") {
// //       const minimum = parseNumber(minBudget);
// //       if (minimum !== null && minimum >= 0) {
// //         filtered = filtered.filter((property) => {
// //           const propertyPrice = getPropertyPrice(property);
// //           return propertyPrice !== null && propertyPrice >= minimum;
// //         });
// //       }
// //     }
// //     if (maxBudget !== "") {
// //       const maximum = parseNumber(maxBudget);
// //       if (maximum !== null && maximum >= 0) {
// //         filtered = filtered.filter((property) => {
// //           const propertyPrice = getPropertyPrice(property);
// //           return propertyPrice !== null && propertyPrice <= maximum;
// //         });
// //       }
// //     }
// //     if (area !== "") {
// //       const minArea = parseNumber(area);
// //       if (minArea !== null) {
// //         filtered = filtered.filter((property) => {
// //           const propertyArea = getPropertyArea(property);
// //           return propertyArea !== null && propertyArea >= minArea;
// //         });
// //       }
// //     }
// //     if (seats !== "") {
// //       const requiredSeats = parseNumber(seats);
// //       if (requiredSeats !== null && requiredSeats >= 0) {
// //         filtered = filtered.filter((property) => {
// //           const seatsOffered = getPropertySeats(property);
// //           return seatsOffered !== null && seatsOffered >= requiredSeats;
// //         });
// //       }
// //     }
// //     if (prompt) {
// //       console.log("[Properties] AI prompt:", prompt);
// //     }
// //     filtered = sortProperties(filtered, sort);
// //     return NextResponse.json(
// //       {
// //         success: true,
// //         data: filtered,
// //         total: filtered.length,
// //         cachedAt: state.timestamp,
// //       },
// //       { headers: { "Cache-Control": "no-store" } },
// //     );
// //   } catch (error) {
// //     console.error("========================================");
// //     console.error("[Properties API] RAW ERROR:", error);
// //     console.error("[Properties API] ERROR TYPE:", typeof error);
// //     console.error(
// //       "[Properties API] ERROR JSON:",
// //       (() => {
// //         try {
// //           return JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
// //         } catch {
// //           return "Unable to stringify error";
// //         }
// //       })(),
// //     );
// //     console.error("[Properties API] ERROR MESSAGE:", error?.message);
// //     console.error("[Properties API] ERROR NAME:", error?.name);
// //     console.error("[Properties API] ERROR CODE:", error?.code);
// //     console.error("[Properties API] ERROR STATUS:", error?.status);
// //     console.error("[Properties API] ERROR STACK:", error?.stack);
// //     console.error("========================================");
// //     let errorMessage = "Failed to fetch properties";
// //     if (typeof error === "string") {
// //       errorMessage = error;
// //     } else if (error && typeof error === "object") {
// //       errorMessage =
// //         error.message ||
// //         error.error ||
// //         error.description ||
// //         error.detail ||
// //         error.reason ||
// //         (() => {
// //           try {
// //             return JSON.stringify(error);
// //           } catch {
// //             return "Unknown Catalyst error";
// //           }
// //         })();
// //     } else if (error != null) {
// //       errorMessage = String(error);
// //     }
// //     return NextResponse.json(
// //       {
// //         success: false,
// //         error: errorMessage,
// //         errorName: error?.name || null,
// //         errorCode: error?.code || null,
// //         errorStatus: error?.status || null,
// //       },
// //       { status: 500 },
// //     );
// //   }
// // }


// import { NextResponse } from "next/server";

// import {
//   getPropertyCandidates,
//   getAllProperties,
//   getPropertiesCacheInfo,
// } from "@/lib/propertiesCache";

// export const runtime = "nodejs";

// // Keep the route dynamic.
// // Actual property data is cached by propertiesCache.js.
// export const dynamic = "force-dynamic";

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// function normalize(value) {
//   if (
//     value === null ||
//     value === undefined
//   ) {
//     return "";
//   }

//   return String(value)
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ");
// }

// function normalizeMatch(value) {
//   return normalize(value).replace(
//     /[^a-z0-9]/g,
//     ""
//   );
// }

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
//     .replace(
//       /[,₹$€£\s]/g,
//       ""
//     )
//     .trim();

//   if (!cleaned) {
//     return null;
//   }

//   const parsed =
//     Number(cleaned);

//   return Number.isFinite(parsed)
//     ? parsed
//     : null;
// }

// function getFirstValue(
//   property,
//   keys
// ) {
//   if (!property) {
//     return null;
//   }

//   for (const key of keys) {
//     const value =
//       property[key];

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

// // ---------------------------------------------------------------------------
// // Property fields
// // ---------------------------------------------------------------------------

// function getPropertyType(
//   property
// ) {
//   return normalizeMatch(
//     getFirstValue(property, [
//       "type",
//       "Type",
//       "propertyType",
//       "PropertyType",
//       "officeType",
//       "OfficeType",
//     ])
//   );
// }

// function getPropertyPrice(
//   property
// ) {
//   const type =
//     getPropertyType(property);

//   const managedOffice =
//     type ===
//     "managedofficecoworking";

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
//         ]
//     )
//   );
// }

// function getPropertyArea(
//   property
// ) {
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
//     ])
//   );
// }

// function getPropertySeats(
//   property
// ) {
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
//     ])
//   );
// }

// function getPropertyName(
//   property
// ) {
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
//     ]) || ""
//   ).trim();
// }

// function getPropertyId(
//   property
// ) {
//   return String(
//     property?.id ??
//     property?.rowId ??
//     property?.ROWID ??
//     ""
//   );
// }

// // ---------------------------------------------------------------------------
// // Sorting
// // ---------------------------------------------------------------------------

// function sortProperties(
//   properties,
//   sort
// ) {
//   const validSorts =
//     new Set([
//       "budget_asc",
//       "budget_desc",
//       "area_asc",
//       "area_desc",
//       "seats_asc",
//       "seats_desc",
//       "name_asc",
//       "name_desc",
//     ]);

//   if (!validSorts.has(sort)) {
//     return properties;
//   }

//   const isNameSort =
//     sort === "name_asc" ||
//     sort === "name_desc";

//   const direction =
//     sort.endsWith("_desc")
//       ? -1
//       : 1;

//   const items =
//     properties.map(
//       (property) => {
//         let key = null;

//         if (isNameSort) {
//           key =
//             getPropertyName(
//               property
//             );
//         } else if (
//           sort.startsWith(
//             "budget_"
//           )
//         ) {
//           key =
//             getPropertyPrice(
//               property
//             );
//         } else if (
//           sort.startsWith(
//             "area_"
//           )
//         ) {
//           key =
//             getPropertyArea(
//               property
//             );
//         } else {
//           key =
//             getPropertySeats(
//               property
//             );
//         }

//         return {
//           property,
//           key,
//           id: getPropertyId(
//             property
//           ),
//         };
//       }
//     );

//   items.sort(
//     (a, b) => {
//       if (isNameSort) {
//         const comparison =
//           a.key.localeCompare(
//             b.key,
//             undefined,
//             {
//               sensitivity:
//                 "base",
//               numeric: true,
//             }
//           );

//         if (comparison !== 0) {
//           return (
//             comparison *
//             direction
//           );
//         }

//         return a.id.localeCompare(
//           b.id,
//           undefined,
//           {
//             numeric: true,
//           }
//         );
//       }

//       if (
//         a.key === null &&
//         b.key === null
//       ) {
//         return 0;
//       }

//       if (a.key === null) {
//         return 1;
//       }

//       if (b.key === null) {
//         return -1;
//       }

//       if (a.key === b.key) {
//         return a.id.localeCompare(
//           b.id,
//           undefined,
//           {
//             numeric: true,
//           }
//         );
//       }

//       return (
//         (a.key - b.key) *
//         direction
//       );
//     }
//   );

//   return items.map(
//     (item) =>
//       item.property
//   );
// }

// // ---------------------------------------------------------------------------
// // Pagination
// // ---------------------------------------------------------------------------

// function parsePage(value) {
//   const parsed =
//     Number(value);

//   if (
//     !Number.isFinite(parsed) ||
//     parsed < 1
//   ) {
//     return 1;
//   }

//   return Math.floor(parsed);
// }

// function parsePageSize(value) {
//   const parsed =
//     Number(value);

//   if (
//     !Number.isFinite(parsed) ||
//     parsed < 1
//   ) {
//     return 30;
//   }

//   // Prevent clients from requesting huge payloads.
//   return Math.min(
//     Math.floor(parsed),
//     50
//   );
// }

// // ---------------------------------------------------------------------------
// // GET /api/properties
// // ---------------------------------------------------------------------------

// export async function GET(
//   request
// ) {
//   const startedAt =
//     Date.now();

//   try {
//     const {
//       searchParams,
//     } = new URL(
//       request.url
//     );

//     // -----------------------------------------------------------------------
//     // Query
//     // -----------------------------------------------------------------------

//     const city =
//       searchParams.get(
//         "city"
//       ) || "";

//     const type =
//       searchParams.get(
//         "type"
//       ) || "";

//     const micromarket =
//       searchParams.get(
//         "micromarket"
//       ) || "";

//     const minBudget =
//       searchParams.get(
//         "minBudget"
//       ) || "";

//     const area =
//       searchParams.get(
//         "area"
//       ) || "";

//     const seats =
//       searchParams.get(
//         "seats"
//       ) || "";

//     const prompt =
//       searchParams.get(
//         "prompt"
//       ) || "";

//     const sort =
//       searchParams.get(
//         "sort"
//       ) || "";

//     const page =
//       parsePage(
//         searchParams.get(
//           "page"
//         )
//       );

//     const pageSize =
//       parsePageSize(
//         searchParams.get(
//           "pageSize"
//         )
//       );

//     // Always paginate the API.
//     //
//     // This is important for production:
//     // the browser should NEVER receive 4,000 properties
//     // for a normal properties page request.
//     // -----------------------------------------------------------------------

//     // -----------------------------------------------------------------------
//     // Candidate selection
//     // -----------------------------------------------------------------------

//     let filtered;

//     const selectedMicromarkets =
//       micromarket
//         .split(",")
//         .map((item) =>
//           normalizeMatch(item)
//         )
//         .filter(Boolean);

//     /*
//      * Indexed candidate retrieval.
//      *
//      * If city/type/micromarket are supplied,
//      * propertiesCache.js narrows the candidate set
//      * before we perform expensive numeric filters.
//      *
//      * If none are supplied, this returns the cached
//      * property array.
//      */
//     filtered =
//       await getPropertyCandidates({
//         city:
//           city || "",
//         type:
//           type &&
//             normalize(type) !==
//             "ai"
//             ? type
//             : "",
//         micromarkets:
//           selectedMicromarkets,
//       });

//     // -----------------------------------------------------------------------
//     // Minimum budget
//     // -----------------------------------------------------------------------

//     if (minBudget !== "") {
//       const minimum =
//         parseNumber(
//           minBudget
//         );

//       if (
//         minimum !== null &&
//         minimum >= 0
//       ) {
//         filtered =
//           filtered.filter(
//             (property) => {
//               const price =
//                 getPropertyPrice(
//                   property
//                 );

//               return (
//                 price !== null &&
//                 price >= minimum
//               );
//             }
//           );
//       }
//     }

//     // -----------------------------------------------------------------------
//     // Minimum area
//     // -----------------------------------------------------------------------

//     if (area !== "") {
//       const minimumArea =
//         parseNumber(area);

//       if (
//         minimumArea !== null &&
//         minimumArea >= 0
//       ) {
//         filtered =
//           filtered.filter(
//             (property) => {
//               const propertyArea =
//                 getPropertyArea(
//                   property
//                 );

//               return (
//                 propertyArea !==
//                 null &&
//                 propertyArea >=
//                 minimumArea
//               );
//             }
//           );
//       }
//     }

//     // -----------------------------------------------------------------------
//     // Minimum seats
//     // -----------------------------------------------------------------------

//     if (seats !== "") {
//       const requiredSeats =
//         parseNumber(seats);

//       if (
//         requiredSeats !== null &&
//         requiredSeats >= 0
//       ) {
//         filtered =
//           filtered.filter(
//             (property) => {
//               const availableSeats =
//                 getPropertySeats(
//                   property
//                 );

//               return (
//                 availableSeats !==
//                 null &&
//                 availableSeats >=
//                 requiredSeats
//               );
//             }
//           );
//       }
//     }

//     // -----------------------------------------------------------------------
//     // AI prompt
//     //
//     // Keep existing behavior.
//     // Actual AI ranking can be added separately.
//     // -----------------------------------------------------------------------

//     if (prompt) {
//       console.log(
//         "[Properties] AI prompt received."
//       );
//     }

//     // -----------------------------------------------------------------------
//     // Sort BEFORE pagination
//     // -----------------------------------------------------------------------

//     filtered =
//       sortProperties(
//         filtered,
//         sort
//       );

//     // -----------------------------------------------------------------------
//     // Total BEFORE pagination
//     // -----------------------------------------------------------------------

//     const total =
//       filtered.length;

//     const totalPages =
//       Math.max(
//         1,
//         Math.ceil(
//           total / pageSize
//         )
//       );

//     // If a client requests a page beyond
//     // the available range, return an empty
//     // page rather than returning incorrect data.
//     const start =
//       (page - 1) *
//       pageSize;

//     const end =
//       start + pageSize;

//     const responseData =
//       filtered.slice(
//         start,
//         end
//       );

//     // -----------------------------------------------------------------------
//     // Cache info
//     // -----------------------------------------------------------------------

//     const cacheInfo =
//       getPropertiesCacheInfo();

//     const durationMs =
//       Date.now() -
//       startedAt;

//     console.log(
//       "[Properties API]",
//       {
//         durationMs,
//         city,
//         type,
//         micromarketCount:
//           selectedMicromarkets.length,
//         total,
//         returned:
//           responseData.length,
//         page,
//         pageSize,
//         totalPages,
//         cacheCount:
//           cacheInfo.count,
//         cacheFresh:
//           cacheInfo.isFresh,
//         cacheStale:
//           cacheInfo.isStale,
//         refreshInProgress:
//           cacheInfo.refreshInProgress,
//       }
//     );

//     // -----------------------------------------------------------------------
//     // Response
//     // -----------------------------------------------------------------------

//     return NextResponse.json(
//       {
//         success: true,

//         data:
//           responseData,

//         total,

//         page,

//         pageSize,

//         totalPages,

//         hasMore:
//           page < totalPages,

//         cachedAt:
//           cacheInfo.cachedAt,

//         cache: {
//           count:
//             cacheInfo.count,

//           isFresh:
//             cacheInfo.isFresh,

//           isStale:
//             cacheInfo.isStale,

//           refreshInProgress:
//             cacheInfo.refreshInProgress,
//         },
//       },
//       {
//         headers: {
//           /*
//            * Platform-neutral cache headers.
//            *
//            * They can be respected by a reverse proxy/CDN,
//            * but the application does NOT depend on them.
//            */
//           "Cache-Control":
//             "public, max-age=0, s-maxage=30, stale-while-revalidate=60",

//           "X-Properties-Count":
//             String(
//               responseData.length
//             ),

//           "X-Properties-Total":
//             String(total),

//           "X-Properties-Cache":
//             cacheInfo.isFresh
//               ? "fresh"
//               : cacheInfo.isStale
//                 ? "stale"
//                 : "cold",
//         },
//       }
//     );
//   } catch (error) {
//     console.error(
//       "[Properties API] Request failed:",
//       error?.message ||
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,

//         error:
//           error?.message ||
//           "Failed to fetch properties",

//         errorName:
//           error?.name ||
//           null,

//         errorCode:
//           error?.code ||
//           null,

//         errorStatus:
//           error?.status ||
//           null,
//       },
//       {
//         status: 500,

//         headers: {
//           "Cache-Control":
//             "no-store",
//         },
//       }
//     );
//   }
// }
import { NextResponse } from "next/server";

import {
  getPropertyCandidates,
  getPropertiesCacheInfo,
} from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* Utility helpers                                                            */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Property field helpers                                                     */
/* -------------------------------------------------------------------------- */

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