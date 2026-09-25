// import crypto from "crypto";
// import { NextResponse } from "next/server"; import { NextResponse } from "next/server";
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// const ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
// const DEFAULT_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.in";
// const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
// const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
// const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
// const REQUEST_TIMEOUT_MS = 10_000;
// const MAX_BODY_SIZE = 50_000;
// const MAX_LENGTHS = Object.freeze({
//   firstName: 80,
//   lastName: 80,
//   email: 254,
//   phone: 30,
//   company: 150,
//   street: 250,
//   city: 100,
//   state: 100,
//   country: 100,
//   pincode: 20,
//   requirementCity: 100,
//   requirementType: 100,
// });
// const globalZohoState = globalThis.__ANAROCK_ZOHO_AUTH_STATE || {
//   tokenCache: {
//     accessToken: null,
//     expiresAt: 0,
//     apiDomain: DEFAULT_API_URL,
//   },

//   refreshPromise: null,

//   authFailureUntil: 0,
// };

// globalThis.__ANAROCK_ZOHO_AUTH_STATE = globalZohoState;

// let zohoTokenCache = globalZohoState.tokenCache;

// async function generateZohoAccessToken() {
//   if (
//     globalZohoState.authFailureUntil &&
//     Date.now() < globalZohoState.authFailureUntil
//   ) {
//     const waitSeconds = Math.ceil(
//       (globalZohoState.authFailureUntil - Date.now()) / 1000,
//     );

//     const error = new Error(
//       `Zoho authentication is temporarily rate limited. Please wait approximately ${waitSeconds} seconds.`,
//     );

//     error.code = "ZOHO_AUTH_RATE_LIMITED";

//     error.httpStatus = 429;

//     throw error;
//   }

//   if (globalZohoState.refreshPromise) {
//     return await globalZohoState.refreshPromise;
//   }

//   globalZohoState.refreshPromise = (async () => {
//     try {
//       if (!CLIENT_ID) {
//         throw new Error("ZOHO_CLIENT_ID is missing from .env.local");
//       }

//       if (!CLIENT_SECRET) {
//         throw new Error("ZOHO_CLIENT_SECRET is missing from .env.local");
//       }

//       if (!REFRESH_TOKEN) {
//         throw new Error("ZOHO_REFRESH_TOKEN is missing from .env.local");
//       }

//       console.log("[ZOHO AUTH] Generating fresh access token...");
//       const tokenUrl = `${ACCOUNTS_URL}/oauth/v2/token`;
//       const params = new URLSearchParams();
//       params.set("refresh_token", REFRESH_TOKEN.trim());
//       params.set("client_id", CLIENT_ID.trim());
//       params.set("client_secret", CLIENT_SECRET.trim());
//       params.set("grant_type", "refresh_token");
//       const response = await fetch(tokenUrl, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded", },
//         body: params.toString(),
//         cache: "no-store",
//       });
//       const responseText = await response.text();
//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch {
//         throw new Error(
//           `Zoho OAuth returned non-JSON response: ${responseText}`,
//         );
//       }
//       if (
//         response.status === 429 ||
//         String(data?.error || data?.error_description || "")
//           .toLowerCase()
//           .includes("too many requests")
//       ) {
//         globalZohoState.authFailureUntil = Date.now() + 5 * 60 * 1000;
//         const error = new Error(
//           data?.error_description ||
//           data?.error ||
//           "Zoho OAuth rate limit reached.",
//         );

//         error.code = "ZOHO_AUTH_RATE_LIMITED";
//         error.httpStatus = 429;
//         throw error;
//       }
//       if (!response.ok) {
//         throw new Error(
//           data?.error_description ||
//           data?.error ||
//           `Unable to generate Zoho access token. HTTP ${response.status}`,
//         );
//       }
//       if (!data?.access_token) {
//         throw new Error("Zoho did not return an access token.");
//       }
//       const accessToken = data.access_token;
//       const expiresInSeconds = Number(data.expires_in) || 3600;
//       const refreshAfterMilliseconds = Math.min(
//         59 * 60 * 1000,
//         Math.max(60, expiresInSeconds - 60) * 1000,
//       );
//       const apiDomain = String(data.api_domain || DEFAULT_API_URL).replace(
//         /\/$/,
//         "",
//       );

//       zohoTokenCache = {
//         accessToken,
//         expiresAt: Date.now() + refreshAfterMilliseconds,
//         apiDomain,
//       };
//       globalZohoState.tokenCache = zohoTokenCache;
//       globalZohoState.authFailureUntil = 0;
//       console.log("[ZOHO AUTH] Access token generated successfully.");
//       return zohoTokenCache;
//     } finally {
//       globalZohoState.refreshPromise = null;
//     }
//   })();

//   return await globalZohoState.refreshPromise;
// }

// async function getZohoAccessToken(forceRefresh = false) {
//   if (
//     !forceRefresh &&
//     globalZohoState.tokenCache?.accessToken &&
//     globalZohoState.tokenCache?.expiresAt > Date.now()
//   ) {
//     return globalZohoState.tokenCache;
//   }

//   return await generateZohoAccessToken();
// }

// function normalizeCityName(value) {
//   return String(value || "")
//     .trim()
//     .replace(/\s+/g, " ");
// }

// function isValidCityName(value) {
//   if (!value) return false;
//   return /^[\p{L}\p{N} .'-]{1,100}$/u.test(value);
// }

// async function findCityId(tokenInfo, cityName) {
//   const cleanCity = normalizeCityName(cityName);

//   if (!cleanCity || !isValidCityName(cleanCity)) {
//     return null;
//   }

//   const criteria = `(Name:equals:${cleanCity})`;

//   const url =
//     `${tokenInfo.apiDomain}/crm/v8/City/search` +
//     `?criteria=${encodeURIComponent(criteria)}` +
//     `&fields=id,Name`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,
//       "Content-Type": "application/json",
//     },
//     cache: "no-store",
//   });

//   if (response.status === 401) {
//     const error = new Error("Zoho access token expired while searching City.");

//     error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";

//     throw error;
//   }

//   const responseText = await response.text();

//   let data;

//   try {
//     data = responseText ? JSON.parse(responseText) : {};
//   } catch {
//     throw new Error(`Invalid response from Zoho City search: ${responseText}`);
//   }

//   if (response.status === 204 || !response.ok) {
//     return null;
//   }

//   const records = Array.isArray(data?.data) ? data.data : [];

//   const exactCity = records.find(
//     (record) =>
//       String(record?.Name || "")
//         .trim()
//         .toLowerCase() === cleanCity.toLowerCase(),
//   );

//   return exactCity?.id || null;
// }

// function validateLength(value, max, field) {
//   if (value.length > max) {
//     const error = new Error(`${field} is too long.`);
//     error.code = "VALIDATION_ERROR";
//     error.httpStatus = 400;
//     throw error;
//   }

//   return value;
// }

// function mapLocationToLeadOwnerTeam(city, state) {
//   const cityLower = String(city || "")
//     .trim()
//     .toLowerCase();
//   const stateLower = String(state || "")
//     .trim()
//     .toLowerCase();

//   if (cityLower.includes("bengaluru") || cityLower.includes("bangalore")) {
//     return "Bengaluru";
//   }
//   if (cityLower.includes("chennai")) {
//     return "Chennai";
//   }
//   if (cityLower.includes("hyderabad")) {
//     return "Hyderabad";
//   }
//   if (cityLower.includes("kolkata")) {
//     return "Kolkata";
//   }
//   if (cityLower.includes("pune")) {
//     return "Pune";
//   }
//   if (
//     cityLower.includes("mumbai") ||
//     cityLower.includes("ahmedabad") ||
//     cityLower.includes("surat") ||
//     cityLower.includes("jaipur") ||
//     stateLower.includes("maharashtra") ||
//     stateLower.includes("gujarat") ||
//     stateLower.includes("goa") ||
//     stateLower.includes("rajasthan")
//   ) {
//     return "West";
//   }
//   if (
//     cityLower.includes("agra") ||
//     cityLower.includes("delhi") ||
//     cityLower.includes("noida") ||
//     cityLower.includes("gurugram") ||
//     cityLower.includes("gurgaon") ||
//     cityLower.includes("chandigarh") ||
//     stateLower.includes("delhi") ||
//     stateLower.includes("haryana") ||
//     stateLower.includes("punjab") ||
//     stateLower.includes("uttar pradesh") ||
//     stateLower.includes("uttarakhand")
//   ) {
//     return "North";
//   }

//   return "Platform";
// }

// async function createLeadInCRM(tokenInfo, recordData) {
//   const url = `${tokenInfo.apiDomain}/crm/v8/Leads`;

//   const response = await fetch(url, {
//     method: "POST",

//     headers: {
//       Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,

//       "Content-Type": "application/json",
//     },

//     body: JSON.stringify({
//       data: [recordData],
//       trigger: ["workflow"],
//     }),

//     cache: "no-store",
//   });

//   const responseText = await response.text();

//   let data;

//   try {
//     data = responseText ? JSON.parse(responseText) : {};
//   } catch {
//     throw new Error(`Zoho CRM returned invalid JSON: ${responseText}`);
//   }

//   if (response.status === 401) {
//     const error = new Error("Zoho access token expired.");

//     error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";

//     throw error;
//   }

//   const zohoResult = data?.data?.[0];

//   const zohoCode = String(zohoResult?.code || data?.code || "")
//     .trim()
//     .toUpperCase();
//   const zohoMessage = String(zohoResult?.message || data?.message || "").trim();
//   const isDuplicate =
//     zohoCode === "DUPLICATE_DATA" ||
//     zohoCode === "DUPLICATE" ||
//     zohoMessage.toLowerCase().includes("duplicate") ||
//     (Array.isArray(zohoResult?.details?.errors) &&
//       zohoResult.details.errors.some(
//         (item) => String(item?.code || "").toUpperCase() === "DUPLICATE_DATA",
//       ));

//   if (isDuplicate) {
//     console.log("[ZOHO CRM] Duplicate lead detected.");

//     console.log(
//       "[ZOHO CRM] Duplicate response:",
//       JSON.stringify(data, null, 2),
//     );

//     const duplicateErrors = Array.isArray(zohoResult?.details?.errors)
//       ? zohoResult.details.errors
//       : [];

//     let existingLeadId = null;

//     for (const duplicateError of duplicateErrors) {
//       const code = String(duplicateError?.code || "")
//         .trim()
//         .toUpperCase();

//       if (code === "DUPLICATE_DATA") {
//         const duplicateRecordId = duplicateError?.details?.duplicate_record?.id;

//         if (duplicateRecordId) {
//           existingLeadId = String(duplicateRecordId);

//           break;
//         }
//       }
//     }

//     if (!existingLeadId) {
//       const duplicateDetails = zohoResult?.details || data?.details || {};

//       existingLeadId =
//         duplicateDetails?.duplicate_record?.id ||
//         duplicateDetails?.id ||
//         duplicateDetails?.record_id ||
//         duplicateDetails?.recordId ||
//         duplicateDetails?.module?.id ||
//         duplicateDetails?.module?.record_id ||
//         null;
//     }

//     if (!existingLeadId) {
//       console.error("[ZOHO CRM] Duplicate detected but existing Lead ID could not be found.",
//         JSON.stringify(data, null, 2),
//       );
//       const error = new Error(
//         "Duplicate lead detected, but the existing Lead could not be identified.",
//       );
//       error.code = "DUPLICATE_LEAD_ID_NOT_FOUND";
//       error.zohoResponse = data;
//       throw error;
//     }

//     console.log(`[ZOHO CRM] Existing Lead found: ${existingLeadId}`);

//     const updateData = {};

//     Object.entries(recordData || {}).forEach(([key, value]) => {
//       if (value === undefined || value === null) {
//         return;
//       }
//       if (typeof value === "string" && value.trim() === "") {
//         return;
//       }
//       updateData[key] = value;
//     });
//     delete updateData.id;
//     console.log("[ZOHO CRM] Updating existing Lead:", existingLeadId);
//     console.log("[ZOHO CRM] Update payload:", JSON.stringify(updateData, null, 2));
//     const updateUrl = `${tokenInfo.apiDomain}/crm/v8/Leads/${existingLeadId}`;
//     const updateResponse = await fetch(updateUrl, {
//       method: "PUT",
//       headers: {
//         Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         data: [updateData],
//         trigger: ["workflow"],
//       }),
//       cache: "no-store",
//     });
//     const updateResponseText = await updateResponse.text();
//     let updateDataResponse;
//     try {
//       updateDataResponse = updateResponseText
//         ? JSON.parse(updateResponseText)
//         : {};
//     } catch {
//       throw new Error(
//         `Zoho returned invalid JSON while updating the existing Lead: ${updateResponseText}`,
//       );
//     }
//     if (updateResponse.status === 401) {
//       const error = new Error(
//         "Zoho access token expired while updating duplicate Lead.",
//       );
//       error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";
//       throw error;
//     }
//     if (!updateResponse.ok) {
//       console.error(
//         "[ZOHO CRM] Existing Lead update failed:",
//         JSON.stringify(updateDataResponse, null, 2),
//       );
//       const updateResult = updateDataResponse?.data?.[0];
//       const updateMessage =
//         updateResult?.message ||
//         updateDataResponse?.message ||
//         "Unable to update existing Lead.";
//       const error = new Error(updateMessage);
//       error.code =
//         updateResult?.code ||
//         updateDataResponse?.code ||
//         "ZOHO_DUPLICATE_UPDATE_FAILED";
//       error.zohoResponse = updateDataResponse;
//       error.httpStatus = updateResponse.status;
//       throw error;
//     }
//     const updatedResult = updateDataResponse?.data?.[0];

//     if (!updatedResult || updatedResult.status !== "success") {
//       const error = new Error(
//         updatedResult?.message || "Existing Lead could not be updated.",
//       );
//       error.code = updatedResult?.code || "ZOHO_DUPLICATE_UPDATE_FAILED";
//       error.zohoResponse = updateDataResponse;
//       throw error;
//     }
//     console.log(
//       `[ZOHO CRM] Existing Lead ${existingLeadId} updated successfully.`,
//     );
//     return {
//       success: true,
//       duplicate: true,
//       priority: true,
//       leadId: existingLeadId,
//       zohoResponse: updateDataResponse,
//     };
//   }

//   if (!response.ok) {
//     console.error(
//       "[ZOHO CRM] Lead request failed:",
//       JSON.stringify(data, null, 2),
//     );
//     const detailedMessage = zohoMessage || "Zoho CRM rejected the lead.";
//     const error = new Error(detailedMessage);
//     error.code = zohoCode || "ZOHO_CRM_ERROR";
//     error.zohoResponse = data;
//     error.httpStatus = response.status;
//     throw error;
//   }

//   const result = data?.data?.[0];

//   if (!result || result.status !== "success") {
//     const error = new Error(
//       result?.message || "Lead was not created in Zoho CRM.",
//     );
//     error.code = result?.code || "ZOHO_LEAD_CREATION_FAILED";
//     error.zohoResponse = data;
//     throw error;
//   }

//   console.log("[ZOHO CRM] New Lead created successfully:", result?.details?.id);

//   return {
//     success: true,
//     duplicate: false,
//     priority: false,
//     leadId: result?.details?.id || null,
//     zohoResponse: data,
//   };
// }

// export async function POST(request) {
//   try {
//     const contentLength = Number(
//       request.headers.get("content-length") || 0
//     );

//     if (contentLength > MAX_BODY_SIZE) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Request is too large.",
//           requestId,
//         },
//         { status: 413 }
//       );
//     }
//     const contentType = request.headers.get("content-type") || "";

//     if (!contentType.toLowerCase().includes("application/json")) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid request format.",
//           requestId,
//         },
//         { status: 415 }
//       );
//     }
//     const body = await request.json();
//     console.info("[LEAD REQUEST]", { requestId, });
//     const location = body?.location || {};
//     let firstName = body?.firstName || "";
//     let lastName = body?.lastName || "";
//     if (!firstName && !lastName && body?.name) {
//       const fullName = String(body.name).trim().replace(/\s+/g, " ");
//       const nameParts = fullName.split(" ");
//       firstName = nameParts.shift() || "";
//       lastName = nameParts.join(" ") || "";
//     }

//     const rawEmail = String(body?.email || "").trim();

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const email = emailRegex.test(rawEmail) ? rawEmail : "";

//     const phone = String(body?.phone || "").trim();
//     const company = String(body?.company || "").trim();
//     const street = String(
//       body?.Street ||
//       body?.street ||
//       body?.area ||
//       location?.street ||
//       location?.area ||
//       "",
//     ).trim();

//     const addressCity = String(
//       body?.City || body?.city || body?.addressCity || location?.city || "",
//     ).trim();

//     const state = String(
//       body?.State ||
//       body?.state ||
//       body?.Province ||
//       body?.province ||
//       location?.state ||
//       location?.province ||
//       "",
//     ).trim();

//     const country = String(
//       body?.Country || body?.country || location?.country || "",
//     ).trim();

//     const pincode = String(
//       body?.Zip_Code ||
//       body?.Postal_Code ||
//       body?.PostalCode ||
//       body?.postalCode ||
//       body?.pincode ||
//       location?.postalCode ||
//       location?.pincode ||
//       "",
//     ).trim();

//     const rawRequirementCity = String(
//       body?.requirementCity || body?.Requirement_City || "",
//     ).trim();

//     const requirementCity =
//       rawRequirementCity === "__NONE__" ? "" : rawRequirementCity;

//     const requirementType = String(
//       body?.requirementType || body?.Requirement_Type || "",
//     ).trim();

//     if (!firstName && !lastName) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!phone) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Phone number is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     let tokenInfo = await getZohoAccessToken();

//     const processLead = async (currentToken) => {
//       let requirementCityId = null;

//       if (requirementCity) {
//         requirementCityId = await findCityId(currentToken, requirementCity);
//       }
//       const leadOwnerTeam = mapLocationToLeadOwnerTeam(addressCity, state);

//       const recordData = {
//         First_Name: firstName || undefined,
//         Last_Name: lastName || firstName || "Website Enquiry",
//         Mobile: phone,
//         Company: company || "",
//         Street: street || undefined,
//         City: addressCity || undefined,
//         State: state || undefined,
//         Country: country || undefined,
//         Zip_Code: pincode || undefined,
//         Lead_Source: "Listing Platform",
//         Lead_Status: "Not Contacted",
//         Sublead_Source: "Request a Callback",
//         Lead_Owner_Team: leadOwnerTeam,
//         Requirement_Type: requirementType || undefined,
//       };
//       if (email) {
//         recordData.Email = email;
//       }
//       if (requirementCityId) {
//         recordData.Requirement_City = {
//           id: requirementCityId,
//         };
//       }
//       Object.keys(recordData).forEach((key) => {
//         if (
//           recordData[key] === undefined ||
//           recordData[key] === null ||
//           recordData[key] === ""
//         ) {
//           delete recordData[key];
//         }
//       });

//       console.log(
//         "Posting record to Zoho CRM:",
//         JSON.stringify(recordData, null, 2),
//       );
//       const result = await createLeadInCRM(currentToken, recordData);
//       return {
//         ...result,
//         requirementCityId,
//         requirementCity,
//         requirementType,
//         leadOwnerTeam,
//       };
//     };

//     try {
//       const retryResult = await processLead(tokenInfo);
//       const isPriorityLead = Boolean(retryResult?.priority);
//       return NextResponse.json(
//         {
//           success: true,
//           duplicate: Boolean(retryResult?.duplicate),
//           priority: isPriorityLead,
//           message: isPriorityLead
//             ? "Your enquiry has been received and put on priority."
//             : "Lead created successfully.",
//           leadId: retryResult.leadId,
//           requirementCityFound: Boolean(retryResult.requirementCityId),
//           requirementCityId: retryResult.requirementCityId || null,
//           requirementCity: retryResult.requirementCity || "",
//           requirementType: retryResult.requirementType || "",
//           leadOwnerTeam: retryResult.leadOwnerTeam,
//         },
//         {
//           status: 200,
//         },
//       );
//     } catch (error) {
//       if (error?.code === "ZOHO_ACCESS_TOKEN_EXPIRED") {
//         console.warn("[ZOHO AUTH] Access token expired. Refreshing once...");
//         tokenInfo = await getZohoAccessToken(true);
//         const retryResult = await processLead(tokenInfo);
//         const isPriorityLead = Boolean(retryResult?.priority);
//         return NextResponse.json(
//           {
//             success: true,
//             duplicate: Boolean(retryResult?.duplicate),
//             priority: isPriorityLead,
//             message: isPriorityLead
//               ? "Your enquiry has been received and put on priority."
//               : "Lead created successfully.",
//             leadId: retryResult.leadId,
//             requirementCityFound: Boolean(retryResult.requirementCityId),
//             requirementCityId: retryResult.requirementCityId || null,
//             requirementCity: retryResult.requirementCity || "",
//             requirementType: retryResult.requirementType || "",
//             leadOwnerTeam: retryResult.leadOwnerTeam,
//           },
//           {
//             status: 200,
//           },
//         );
//       }
//       throw error;
//     }
//   } catch (error) {
//     console.error("[API] LEAD CREATION ERROR:", error?.message);

//     if (error?.code === "ZOHO_AUTH_RATE_LIMITED") {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Zoho authentication is temporarily rate limited. Please try again after a few minutes.",
//           errorCode: "ZOHO_AUTH_RATE_LIMITED",
//         },
//         {
//           status: 429,
//         },
//       );
//     }
//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.message || "Something went wrong while creating the lead.",
//         errorCode: error?.code || null,
//         zohoResponse: error?.zohoResponse || null,
//       },
//       {
//         status:
//           error?.httpStatus &&
//             Number(error.httpStatus) >= 400 &&
//             Number(error.httpStatus) < 600
//             ? Number(error.httpStatus)
//             : 500,
//       },
//     );
//   }
// }

import crypto from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACCOUNTS_URL =
  process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";

const DEFAULT_API_URL =
  process.env.ZOHO_API_URL || "https://www.zohoapis.in";

const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

const REQUEST_TIMEOUT_MS = 10_000;
const CITY_CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_BODY_SIZE = 50_000;

const MAX_LENGTHS = Object.freeze({
  firstName: 80,
  lastName: 80,
  email: 254,
  phone: 30,
  company: 150,
  street: 250,
  city: 100,
  state: 100,
  country: 100,
  pincode: 20,
  requirementCity: 100,
  requirementType: 100,
});

const globalZohoState =
  globalThis.__ANAROCK_ZOHO_AUTH_STATE || {
    tokenCache: {
      accessToken: null,
      expiresAt: 0,
      apiDomain: DEFAULT_API_URL,
    },

    refreshPromise: null,

    authFailureUntil: 0,

    cityCache: null,
    cityCacheExpiresAt: 0,
    cityCachePromise: null,
  };

globalThis.__ANAROCK_ZOHO_AUTH_STATE = globalZohoState;

let zohoTokenCache = globalZohoState.tokenCache;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ");
}

function validateLength(value, max, field) {
  if (String(value || "").length > max) {
    const error = new Error(`${field} is too long.`);
    error.code = "VALIDATION_ERROR";
    error.httpStatus = 400;
    throw error;
  }

  return value;
}

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/[^\d+]/g, "");
}

function isValidPhone(value) {
  return /^\+?[1-9]\d{7,14}$/.test(value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function normalizeCityName(value) {
  return normalizeText(value);
}

function isValidCityName(value) {
  if (!value) return false;

  return /^[\p{L}\p{N} .'-]{1,100}$/u.test(value);
}

function safePositiveNumber(
  value,
  {
    min = 0,
    max = 100000000,
  } = {},
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  if (parsed < min || parsed > max) {
    return undefined;
  }

  return parsed;
}

/* -------------------------------------------------------------------------- */
/* Best-effort per-instance protection                                        */
/* -------------------------------------------------------------------------- */

const localRateLimitState =
  globalThis.__ANAROCK_LEADS_RATE_LIMIT || new Map();

globalThis.__ANAROCK_LEADS_RATE_LIMIT =
  localRateLimitState;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function getClientIdentifier(request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim()
      .slice(0, 100);
  }

  const realIp =
    request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim().slice(0, 100);
  }

  return "unknown";
}

function checkRateLimit(request) {
  const identifier = getClientIdentifier(request);
  const now = Date.now();

  const existing =
    localRateLimitState.get(identifier);

  if (
    !existing ||
    now - existing.windowStart >=
    RATE_LIMIT_WINDOW_MS
  ) {
    localRateLimitState.set(identifier, {
      count: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      retryAfter: 60,
    };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.max(
      1,
      Math.ceil(
        (RATE_LIMIT_WINDOW_MS -
          (now - existing.windowStart)) /
        1000,
      ),
    );

    return {
      allowed: false,
      retryAfter,
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfter: 60,
  };
}

/* -------------------------------------------------------------------------- */
/* Zoho Authentication                                                        */
/* -------------------------------------------------------------------------- */

async function generateZohoAccessToken() {
  if (
    globalZohoState.authFailureUntil &&
    Date.now() <
    globalZohoState.authFailureUntil
  ) {
    const waitSeconds = Math.ceil(
      (globalZohoState.authFailureUntil -
        Date.now()) /
      1000,
    );

    const error = new Error(
      `Zoho authentication is temporarily rate limited. Please wait approximately ${waitSeconds} seconds.`,
    );

    error.code =
      "ZOHO_AUTH_RATE_LIMITED";

    error.httpStatus = 429;

    throw error;
  }

  if (globalZohoState.refreshPromise) {
    return await globalZohoState.refreshPromise;
  }

  globalZohoState.refreshPromise =
    (async () => {
      try {
        if (!CLIENT_ID) {
          throw new Error(
            "ZOHO_CLIENT_ID is missing from .env.local",
          );
        }

        if (!CLIENT_SECRET) {
          throw new Error(
            "ZOHO_CLIENT_SECRET is missing from .env.local",
          );
        }

        if (!REFRESH_TOKEN) {
          throw new Error(
            "ZOHO_REFRESH_TOKEN is missing from .env.local",
          );
        }

        const tokenUrl =
          `${ACCOUNTS_URL}/oauth/v2/token`;

        const params = new URLSearchParams();

        params.set(
          "refresh_token",
          REFRESH_TOKEN.trim(),
        );

        params.set(
          "client_id",
          CLIENT_ID.trim(),
        );

        params.set(
          "client_secret",
          CLIENT_SECRET.trim(),
        );

        params.set(
          "grant_type",
          "refresh_token",
        );

        const response = await fetch(
          tokenUrl,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: params.toString(),

            cache: "no-store",

            signal:
              AbortSignal.timeout(
                REQUEST_TIMEOUT_MS,
              ),
          },
        );

        const responseText =
          await response.text();

        let data;

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            "Zoho OAuth returned an invalid response.",
          );
        }

        if (
          response.status === 429 ||
          String(
            data?.error ||
            data?.error_description ||
            "",
          )
            .toLowerCase()
            .includes("too many requests")
        ) {
          globalZohoState.authFailureUntil =
            Date.now() +
            5 * 60 * 1000;

          const error = new Error(
            "Zoho OAuth rate limit reached.",
          );

          error.code =
            "ZOHO_AUTH_RATE_LIMITED";

          error.httpStatus = 429;

          throw error;
        }

        if (!response.ok) {
          const error = new Error(
            "Unable to authenticate with Zoho CRM.",
          );

          error.code =
            "ZOHO_AUTH_FAILED";

          error.httpStatus =
            response.status >= 400 &&
              response.status < 600
              ? response.status
              : 500;

          throw error;
        }

        if (!data?.access_token) {
          throw new Error(
            "Zoho did not return an access token.",
          );
        }

        const accessToken =
          data.access_token;

        const expiresInSeconds =
          Number(data.expires_in) ||
          3600;

        const refreshAfterMilliseconds =
          Math.min(
            59 * 60 * 1000,
            Math.max(
              60,
              expiresInSeconds - 60,
            ) * 1000,
          );

        const apiDomain = String(
          data.api_domain ||
          DEFAULT_API_URL,
        ).replace(/\/$/, "");

        zohoTokenCache = {
          accessToken,
          expiresAt:
            Date.now() +
            refreshAfterMilliseconds,
          apiDomain,
        };

        globalZohoState.tokenCache =
          zohoTokenCache;

        globalZohoState.authFailureUntil = 0;

        return zohoTokenCache;
      } finally {
        globalZohoState.refreshPromise =
          null;
      }
    })();

  return await globalZohoState.refreshPromise;
}

async function getZohoAccessToken(
  forceRefresh = false,
) {
  if (
    !forceRefresh &&
    globalZohoState.tokenCache
      ?.accessToken &&
    globalZohoState.tokenCache
      ?.expiresAt > Date.now()
  ) {
    return globalZohoState.tokenCache;
  }

  return await generateZohoAccessToken();
}

/* -------------------------------------------------------------------------- */
/* City Directory                                                             */
/* -------------------------------------------------------------------------- */

async function loadCityDirectory(
  tokenInfo,
) {
  const cityMap = new Map();

  const perPage = 200;

  for (
    let page = 1;
    page <= 10;
    page += 1
  ) {
    const params = new URLSearchParams();

    params.set(
      "fields",
      "id,Name",
    );

    params.set(
      "per_page",
      String(perPage),
    );

    params.set(
      "page",
      String(page),
    );

    const url =
      `${tokenInfo.apiDomain}/crm/v8/City` +
      `?${params.toString()}`;

    const response = await fetch(
      url,
      {
        method: "GET",

        headers: {
          Authorization:
            `Zoho-oauthtoken ${tokenInfo.accessToken}`,

          "Content-Type":
            "application/json",
        },

        cache: "no-store",

        signal:
          AbortSignal.timeout(8000),
      },
    );

    if (response.status === 401) {
      const error = new Error(
        "Zoho access token expired.",
      );

      error.code =
        "ZOHO_ACCESS_TOKEN_EXPIRED";

      throw error;
    }

    if (!response.ok) {
      return cityMap;
    }

    const responseText =
      await response.text();

    let data;

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      return cityMap;
    }

    const records = Array.isArray(
      data?.data,
    )
      ? data.data
      : [];

    for (const record of records) {
      const id = record?.id;

      const name = normalizeCityName(
        record?.Name,
      );

      if (!id || !name) {
        continue;
      }

      cityMap.set(
        name.toLowerCase(),
        String(id),
      );
    }

    if (
      records.length < perPage
    ) {
      break;
    }
  }

  return cityMap;
}

async function getCityDirectory(
  tokenInfo,
) {
  if (
    globalZohoState.cityCache &&
    globalZohoState.cityCacheExpiresAt >
    Date.now()
  ) {
    return globalZohoState.cityCache;
  }

  if (
    globalZohoState.cityCachePromise
  ) {
    return await globalZohoState
      .cityCachePromise;
  }

  globalZohoState.cityCachePromise =
    (async () => {
      try {
        const cityMap =
          await loadCityDirectory(
            tokenInfo,
          );

        globalZohoState.cityCache =
          cityMap;

        globalZohoState.cityCacheExpiresAt =
          Date.now() +
          CITY_CACHE_TTL_MS;

        return cityMap;
      } finally {
        globalZohoState.cityCachePromise =
          null;
      }
    })();

  return await globalZohoState
    .cityCachePromise;
}

async function findCityId(
  tokenInfo,
  cityName,
) {
  const cleanCity =
    normalizeCityName(cityName);

  if (
    !cleanCity ||
    !isValidCityName(cleanCity)
  ) {
    return null;
  }

  const cityDirectory =
    await getCityDirectory(
      tokenInfo,
    );

  return (
    cityDirectory.get(
      cleanCity.toLowerCase(),
    ) || null
  );
}

/* -------------------------------------------------------------------------- */
/* Lead Owner Mapping                                                         */
/* -------------------------------------------------------------------------- */

function mapLocationToLeadOwnerTeam(
  city,
  state,
) {
  const cityLower =
    String(city || "")
      .trim()
      .toLowerCase();

  const stateLower =
    String(state || "")
      .trim()
      .toLowerCase();

  if (
    cityLower.includes("bengaluru") ||
    cityLower.includes("bangalore")
  ) {
    return "Bengaluru";
  }

  if (cityLower.includes("chennai")) {
    return "Chennai";
  }

  if (cityLower.includes("hyderabad")) {
    return "Hyderabad";
  }

  if (cityLower.includes("kolkata")) {
    return "Kolkata";
  }

  if (cityLower.includes("pune")) {
    return "Pune";
  }

  if (
    cityLower.includes("mumbai") ||
    cityLower.includes("ahmedabad") ||
    cityLower.includes("surat") ||
    cityLower.includes("jaipur") ||
    stateLower.includes("maharashtra") ||
    stateLower.includes("gujarat") ||
    stateLower.includes("goa") ||
    stateLower.includes("rajasthan")
  ) {
    return "West";
  }

  if (
    cityLower.includes("agra") ||
    cityLower.includes("delhi") ||
    cityLower.includes("noida") ||
    cityLower.includes("gurugram") ||
    cityLower.includes("gurgaon") ||
    cityLower.includes("chandigarh") ||
    stateLower.includes("delhi") ||
    stateLower.includes("haryana") ||
    stateLower.includes("punjab") ||
    stateLower.includes("uttar pradesh") ||
    stateLower.includes("uttarakhand")
  ) {
    return "North";
  }

  return "Platform";
}

/* -------------------------------------------------------------------------- */
/* CRM Lead Creation                                                          */
/* -------------------------------------------------------------------------- */

async function createLeadInCRM(
  tokenInfo,
  recordData,
) {
  const url =
    `${tokenInfo.apiDomain}/crm/v8/Leads`;

  const response = await fetch(
    url,
    {
      method: "POST",

      headers: {
        Authorization:
          `Zoho-oauthtoken ${tokenInfo.accessToken}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        data: [recordData],
        trigger: ["workflow"],
      }),

      cache: "no-store",

      signal:
        AbortSignal.timeout(
          REQUEST_TIMEOUT_MS,
        ),
    },
  );

  const responseText =
    await response.text();

  let data;

  try {
    data = responseText
      ? JSON.parse(responseText)
      : {};
  } catch {
    const error = new Error(
      "Zoho CRM returned an invalid response.",
    );

    error.code =
      "ZOHO_INVALID_RESPONSE";

    error.httpStatus = 502;

    throw error;
  }

  if (response.status === 401) {
    const error = new Error(
      "Zoho access token expired.",
    );

    error.code =
      "ZOHO_ACCESS_TOKEN_EXPIRED";

    throw error;
  }

  const zohoResult =
    data?.data?.[0];

  const zohoCode = String(
    zohoResult?.code ||
    data?.code ||
    "",
  )
    .trim()
    .toUpperCase();

  const zohoMessage = String(
    zohoResult?.message ||
    data?.message ||
    "",
  )
    .trim();

  const isDuplicate =
    zohoCode === "DUPLICATE_DATA" ||
    zohoCode === "DUPLICATE" ||
    zohoMessage
      .toLowerCase()
      .includes("duplicate") ||
    (Array.isArray(
      zohoResult?.details?.errors,
    ) &&
      zohoResult.details.errors.some(
        (item) =>
          String(
            item?.code || "",
          ).toUpperCase() ===
          "DUPLICATE_DATA",
      ));

  if (isDuplicate) {
    const duplicateErrors =
      Array.isArray(
        zohoResult?.details?.errors,
      )
        ? zohoResult.details.errors
        : [];

    let existingLeadId = null;

    for (const duplicateError of duplicateErrors) {
      const code = String(
        duplicateError?.code || "",
      )
        .trim()
        .toUpperCase();

      if (
        code === "DUPLICATE_DATA"
      ) {
        const duplicateRecordId =
          duplicateError?.details
            ?.duplicate_record?.id;

        if (duplicateRecordId) {
          existingLeadId = String(
            duplicateRecordId,
          );

          break;
        }
      }
    }

    if (!existingLeadId) {
      const duplicateDetails =
        zohoResult?.details ||
        data?.details ||
        {};

      existingLeadId =
        duplicateDetails
          ?.duplicate_record?.id ||
        duplicateDetails?.id ||
        duplicateDetails?.record_id ||
        duplicateDetails?.recordId ||
        duplicateDetails?.module?.id ||
        duplicateDetails
          ?.module?.record_id ||
        null;
    }

    if (!existingLeadId) {
      const error = new Error(
        "Duplicate lead detected, but the existing Lead could not be identified.",
      );

      error.code =
        "DUPLICATE_LEAD_ID_NOT_FOUND";

      error.httpStatus = 409;

      throw error;
    }

    const updateData = {};

    Object.entries(
      recordData || {},
    ).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null
      ) {
        return;
      }

      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return;
      }

      updateData[key] = value;
    });

    delete updateData.id;

    const updateUrl =
      `${tokenInfo.apiDomain}/crm/v8/Leads/${encodeURIComponent(
        existingLeadId,
      )}`;

    const updateResponse =
      await fetch(
        updateUrl,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Zoho-oauthtoken ${tokenInfo.accessToken}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            data: [updateData],
            trigger: ["workflow"],
          }),

          cache: "no-store",

          signal:
            AbortSignal.timeout(
              REQUEST_TIMEOUT_MS,
            ),
        },
      );

    const updateResponseText =
      await updateResponse.text();

    let updateDataResponse;

    try {
      updateDataResponse =
        updateResponseText
          ? JSON.parse(
            updateResponseText,
          )
          : {};
    } catch {
      const error = new Error(
        "Zoho returned an invalid response while updating the existing Lead.",
      );

      error.code =
        "ZOHO_INVALID_RESPONSE";

      error.httpStatus = 502;

      throw error;
    }

    if (
      updateResponse.status === 401
    ) {
      const error = new Error(
        "Zoho access token expired while updating duplicate Lead.",
      );

      error.code =
        "ZOHO_ACCESS_TOKEN_EXPIRED";

      throw error;
    }

    if (!updateResponse.ok) {
      const updateResult =
        updateDataResponse?.data?.[0];

      const error = new Error(
        updateResult?.message ||
        "Unable to update the existing Lead.",
      );

      error.code =
        updateResult?.code ||
        updateDataResponse?.code ||
        "ZOHO_DUPLICATE_UPDATE_FAILED";

      error.httpStatus =
        updateResponse.status;

      throw error;
    }

    const updatedResult =
      updateDataResponse?.data?.[0];

    if (
      !updatedResult ||
      updatedResult.status !==
      "success"
    ) {
      const error = new Error(
        "Existing Lead could not be updated.",
      );

      error.code =
        updatedResult?.code ||
        "ZOHO_DUPLICATE_UPDATE_FAILED";

      error.httpStatus = 502;

      throw error;
    }

    return {
      success: true,
      duplicate: true,
      priority: true,
      leadId: existingLeadId,
    };
  }

  if (!response.ok) {
    const error = new Error(
      "Zoho CRM rejected the lead.",
    );

    error.code =
      zohoCode || "ZOHO_CRM_ERROR";

    error.httpStatus =
      response.status >= 400 &&
        response.status < 600
        ? response.status
        : 502;

    throw error;
  }

  const result =
    data?.data?.[0];

  if (
    !result ||
    result.status !== "success"
  ) {
    const error = new Error(
      "Lead was not created in Zoho CRM.",
    );

    error.code =
      result?.code ||
      "ZOHO_LEAD_CREATION_FAILED";

    error.httpStatus = 502;

    throw error;
  }

  return {
    success: true,
    duplicate: false,
    priority: false,
    leadId:
      result?.details?.id ||
      null,
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export async function POST(
  request,
) {
  const requestId =
    createRequestId();

  try {
    const rateLimit =
      checkRateLimit(request);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many requests. Please try again shortly.",
          requestId,
        },
        {
          status: 429,
          headers: {
            "Retry-After":
              String(
                rateLimit.retryAfter,
              ),
          },
        },
      );
    }

    const contentLength = Number(
      request.headers.get(
        "content-length",
      ) || 0,
    );

    if (
      contentLength > MAX_BODY_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Request is too large.",
          requestId,
        },
        {
          status: 413,
        },
      );
    }

    const contentType =
      request.headers.get(
        "content-type",
      ) || "";

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request format.",
          requestId,
        },
        {
          status: 415,
        },
      );
    }

    const body =
      await request.json();

    // Honeypot for basic bots.
    if (body?.website) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Lead created successfully.",
        },
        {
          status: 200,
        },
      );
    }

    const location =
      body?.location || {};

    let firstName = normalizeText(
      body?.firstName,
    );

    let lastName = normalizeText(
      body?.lastName,
    );

    if (
      !firstName &&
      !lastName &&
      body?.name
    ) {
      const fullName =
        normalizeText(body.name);

      const nameParts =
        fullName.split(" ");

      firstName =
        nameParts.shift() || "";

      lastName =
        nameParts.join(" ") || "";
    }

    const rawEmail =
      normalizeText(body?.email);

    if (
      rawEmail &&
      !isValidEmail(rawEmail)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
          requestId,
        },
        {
          status: 400,
        },
      );
    }

    const email =
      rawEmail.toLowerCase();

    const rawPhone =
      normalizeText(body?.phone);

    const phone =
      normalizePhone(rawPhone);

    const company =
      normalizeText(body?.company);

    const street = normalizeText(
      body?.Street ||
      body?.street ||
      body?.area ||
      location?.street ||
      location?.area ||
      "",
    );

    const addressCity =
      normalizeText(
        body?.City ||
        body?.city ||
        body?.addressCity ||
        location?.city ||
        "",
      );

    const state =
      normalizeText(
        body?.State ||
        body?.state ||
        body?.Province ||
        body?.province ||
        location?.state ||
        location?.province ||
        "",
      );

    const country =
      normalizeText(
        body?.Country ||
        body?.country ||
        location?.country ||
        "",
      );

    const pincode =
      normalizeText(
        body?.Zip_Code ||
        body?.Postal_Code ||
        body?.PostalCode ||
        body?.postalCode ||
        body?.pincode ||
        location?.postalCode ||
        location?.pincode ||
        "",
      );

    const rawRequirementCity =
      normalizeText(
        body?.requirementCity ||
        body?.Requirement_City ||
        "",
      );

    const requirementCity =
      rawRequirementCity ===
        "__NONE__"
        ? ""
        : rawRequirementCity;

    const requirementType =
      normalizeText(
        body?.requirementType ||
        body?.Requirement_Type ||
        "",
      );

    validateLength(
      firstName,
      MAX_LENGTHS.firstName,
      "First name",
    );

    validateLength(
      lastName,
      MAX_LENGTHS.lastName,
      "Last name",
    );

    validateLength(
      email,
      MAX_LENGTHS.email,
      "Email",
    );

    validateLength(
      phone,
      MAX_LENGTHS.phone,
      "Phone",
    );

    validateLength(
      company,
      MAX_LENGTHS.company,
      "Company",
    );

    validateLength(
      street,
      MAX_LENGTHS.street,
      "Address",
    );

    validateLength(
      addressCity,
      MAX_LENGTHS.city,
      "City",
    );

    validateLength(
      state,
      MAX_LENGTHS.state,
      "State",
    );

    validateLength(
      country,
      MAX_LENGTHS.country,
      "Country",
    );

    validateLength(
      pincode,
      MAX_LENGTHS.pincode,
      "Pincode",
    );

    validateLength(
      requirementCity,
      MAX_LENGTHS.requirementCity,
      "Requirement city",
    );

    validateLength(
      requirementType,
      MAX_LENGTHS.requirementType,
      "Requirement type",
    );

    if (
      !firstName &&
      !lastName
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name is required.",
          requestId,
        },
        {
          status: 400,
        },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone number is required.",
          requestId,
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid phone number.",
          requestId,
        },
        {
          status: 400,
        },
      );
    }

    let tokenInfo =
      await getZohoAccessToken();

    const processLead =
      async (currentToken) => {
        let requirementCityId =
          null;

        if (requirementCity) {
          requirementCityId =
            await findCityId(
              currentToken,
              requirementCity,
            );
        }

        const leadOwnerTeam =
          mapLocationToLeadOwnerTeam(
            addressCity,
            state,
          );

        const recordData = {
          First_Name:
            firstName || undefined,

          Last_Name:
            lastName ||
            firstName ||
            "Website Enquiry",

          Mobile: phone,

          Company:
            company || "",

          Street:
            street || undefined,

          City:
            addressCity || undefined,

          State:
            state || undefined,

          Country:
            country || undefined,

          Zip_Code:
            pincode || undefined,

          Lead_Source:
            "Listing Platform",

          Lead_Status:
            "Not Contacted",

          Sublead_Source:
            "Request a Callback",

          Lead_Owner_Team:
            leadOwnerTeam,

          Requirement_Type:
            requirementType ||
            undefined,
        };

        if (email) {
          recordData.Email =
            email;
        }

        if (requirementCityId) {
          recordData.Requirement_City =
          {
            id: requirementCityId,
          };
        }

        Object.keys(
          recordData,
        ).forEach((key) => {
          if (
            recordData[key] ===
            undefined ||
            recordData[key] ===
            null ||
            recordData[key] ===
            ""
          ) {
            delete recordData[key];
          }
        });

        const result =
          await createLeadInCRM(
            currentToken,
            recordData,
          );

        return {
          ...result,
          requirementCityId,
          requirementCity,
          requirementType,
          leadOwnerTeam,
        };
      };

    try {
      const retryResult =
        await processLead(
          tokenInfo,
        );

      const isPriorityLead =
        Boolean(
          retryResult?.priority,
        );

      return NextResponse.json(
        {
          success: true,

          duplicate: Boolean(
            retryResult?.duplicate,
          ),

          priority:
            isPriorityLead,

          message:
            isPriorityLead
              ? "Your enquiry has been received and put on priority."
              : "Lead created successfully.",

          leadId:
            retryResult.leadId,

          requirementCityFound:
            Boolean(
              retryResult.requirementCityId,
            ),

          requirementCityId:
            retryResult.requirementCityId ||
            null,

          requirementCity:
            retryResult.requirementCity ||
            "",

          requirementType:
            retryResult.requirementType ||
            "",

          leadOwnerTeam:
            retryResult.leadOwnerTeam,

          requestId,
        },
        {
          status: 200,
        },
      );
    } catch (error) {
      if (
        error?.code ===
        "ZOHO_ACCESS_TOKEN_EXPIRED"
      ) {
        tokenInfo =
          await getZohoAccessToken(
            true,
          );

        const retryResult =
          await processLead(
            tokenInfo,
          );

        const isPriorityLead =
          Boolean(
            retryResult?.priority,
          );

        return NextResponse.json(
          {
            success: true,

            duplicate: Boolean(
              retryResult?.duplicate,
            ),

            priority:
              isPriorityLead,

            message:
              isPriorityLead
                ? "Your enquiry has been received and put on priority."
                : "Lead created successfully.",

            leadId:
              retryResult.leadId,

            requirementCityFound:
              Boolean(
                retryResult.requirementCityId,
              ),

            requirementCityId:
              retryResult.requirementCityId ||
              null,

            requirementCity:
              retryResult.requirementCity ||
              "",

            requirementType:
              retryResult.requirementType ||
              "",

            leadOwnerTeam:
              retryResult.leadOwnerTeam,

            requestId,
          },
          {
            status: 200,
          },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error(
      "[API] LEAD CREATION ERROR",
      {
        requestId,
        code:
          error?.code ||
          "UNKNOWN_ERROR",
        status:
          error?.httpStatus ||
          500,
      },
    );

    if (
      error?.code ===
      "ZOHO_AUTH_RATE_LIMITED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Zoho authentication is temporarily rate limited. Please try again after a few minutes.",
          errorCode:
            "ZOHO_AUTH_RATE_LIMITED",
          requestId,
        },
        {
          status: 429,
        },
      );
    }

    if (
      error?.code ===
      "VALIDATION_ERROR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Invalid request.",
          errorCode:
            "VALIDATION_ERROR",
          requestId,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while creating the lead. Please try again.",
        errorCode:
          "REQUEST_FAILED",
        requestId,
      },
      {
        status:
          error?.httpStatus &&
            Number(error.httpStatus) >=
            400 &&
            Number(error.httpStatus) < 600
            ? Number(
              error.httpStatus,
            )
            : 500,
      },
    );
  }
}