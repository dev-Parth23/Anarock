import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACCOUNTS_URL =
  process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
const DEFAULT_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.in";
const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

const globalZohoState = globalThis.__ANAROCK_ZOHO_AUTH_STATE || {
  tokenCache: {
    accessToken: null,
    expiresAt: 0,
    apiDomain: DEFAULT_API_URL,
  },

  refreshPromise: null,

  authFailureUntil: 0,
};

globalThis.__ANAROCK_ZOHO_AUTH_STATE = globalZohoState;

let zohoTokenCache = globalZohoState.tokenCache;

async function generateZohoAccessToken() {
  if (
    globalZohoState.authFailureUntil &&
    Date.now() < globalZohoState.authFailureUntil
  ) {
    const waitSeconds = Math.ceil(
      (globalZohoState.authFailureUntil - Date.now()) / 1000,
    );

    const error = new Error(
      `Zoho authentication is temporarily rate limited. Please wait approximately ${waitSeconds} seconds.`,
    );

    error.code = "ZOHO_AUTH_RATE_LIMITED";

    error.httpStatus = 429;

    throw error;
  }

  if (globalZohoState.refreshPromise) {
    return await globalZohoState.refreshPromise;
  }

  globalZohoState.refreshPromise = (async () => {
    try {
      if (!CLIENT_ID) {
        throw new Error("ZOHO_CLIENT_ID is missing from .env.local");
      }

      if (!CLIENT_SECRET) {
        throw new Error("ZOHO_CLIENT_SECRET is missing from .env.local");
      }

      if (!REFRESH_TOKEN) {
        throw new Error("ZOHO_REFRESH_TOKEN is missing from .env.local");
      }

      console.log("[ZOHO AUTH] Generating fresh access token...");

      const tokenUrl = `${ACCOUNTS_URL}/oauth/v2/token`;

      const params = new URLSearchParams();

      params.set("refresh_token", REFRESH_TOKEN.trim());

      params.set("client_id", CLIENT_ID.trim());

      params.set("client_secret", CLIENT_SECRET.trim());

      params.set("grant_type", "refresh_token");

      const response = await fetch(tokenUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body: params.toString(),

        cache: "no-store",
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Zoho OAuth returned non-JSON response: ${responseText}`,
        );
      }

      /* =====================================================
           HANDLE ZOHO RATE LIMIT
        ===================================================== */

      if (
        response.status === 429 ||
        String(data?.error || data?.error_description || "")
          .toLowerCase()
          .includes("too many requests")
      ) {
        globalZohoState.authFailureUntil = Date.now() + 5 * 60 * 1000;

        const error = new Error(
          data?.error_description ||
          data?.error ||
          "Zoho OAuth rate limit reached.",
        );

        error.code = "ZOHO_AUTH_RATE_LIMITED";

        error.httpStatus = 429;

        throw error;
      }

      if (!response.ok) {
        throw new Error(
          data?.error_description ||
          data?.error ||
          `Unable to generate Zoho access token. HTTP ${response.status}`,
        );
      }

      if (!data?.access_token) {
        throw new Error("Zoho did not return an access token.");
      }

      const accessToken = data.access_token;

      const expiresInSeconds = Number(data.expires_in) || 3600;

      const refreshAfterMilliseconds = Math.min(
        59 * 60 * 1000,
        Math.max(60, expiresInSeconds - 60) * 1000,
      );

      const apiDomain = String(data.api_domain || DEFAULT_API_URL).replace(
        /\/$/,
        "",
      );

      zohoTokenCache = {
        accessToken,
        expiresAt: Date.now() + refreshAfterMilliseconds,
        apiDomain,
      };
      globalZohoState.tokenCache = zohoTokenCache;
      globalZohoState.authFailureUntil = 0;
      console.log("[ZOHO AUTH] Access token generated successfully.");
      return zohoTokenCache;
    } finally {
      globalZohoState.refreshPromise = null;
    }
  })();

  return await globalZohoState.refreshPromise;
}

async function getZohoAccessToken(forceRefresh = false) {
  if (
    !forceRefresh &&
    globalZohoState.tokenCache?.accessToken &&
    globalZohoState.tokenCache?.expiresAt > Date.now()
  ) {
    return globalZohoState.tokenCache;
  }

  return await generateZohoAccessToken();
}
async function findCityId(tokenInfo, cityName) {
  if (!cityName) {
    return null;
  }

  const cleanCity = String(cityName).trim();
  if (!cleanCity) {
    return null;
  }

  const criteria = `(Name:equals:${cleanCity})`;
  const url =
    `${tokenInfo.apiDomain}/crm/v8/City/search` +
    `?criteria=${encodeURIComponent(criteria)}` +
    `&fields=id,Name`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    const error = new Error("Zoho access token expired while searching City.");
    error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";
    throw error;
  }

  const responseText = await response.text();
  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`Invalid response from Zoho City search: ${responseText}`);
  }

  if (response.status === 204 || !response.ok) {
    return null;
  }

  const records = Array.isArray(data?.data) ? data.data : [];
  const exactCity = records.find(
    (record) =>
      String(record?.Name || "")
        .trim()
        .toLowerCase() === cleanCity.toLowerCase(),
  );

  return exactCity?.id || null;
}

function mapLocationToLeadOwnerTeam(city, state) {
  const cityLower = String(city || "")
    .trim()
    .toLowerCase();
  const stateLower = String(state || "")
    .trim()
    .toLowerCase();

  if (cityLower.includes("bengaluru") || cityLower.includes("bangalore")) {
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

async function createLeadInCRM(tokenInfo, recordData) {
  const url = `${tokenInfo.apiDomain}/crm/v8/Leads`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      data: [recordData],
      trigger: ["workflow"],
    }),

    cache: "no-store",
  });

  const responseText = await response.text();

  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`Zoho CRM returned invalid JSON: ${responseText}`);
  }

  if (response.status === 401) {
    const error = new Error("Zoho access token expired.");

    error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";

    throw error;
  }

  const zohoResult = data?.data?.[0];

  const zohoCode = String(zohoResult?.code || data?.code || "")
    .trim()
    .toUpperCase();
  const zohoMessage = String(zohoResult?.message || data?.message || "").trim();
  const isDuplicate =
    zohoCode === "DUPLICATE_DATA" ||
    zohoCode === "DUPLICATE" ||
    zohoMessage.toLowerCase().includes("duplicate") ||
    (Array.isArray(zohoResult?.details?.errors) &&
      zohoResult.details.errors.some(
        (item) => String(item?.code || "").toUpperCase() === "DUPLICATE_DATA",
      ));

  if (isDuplicate) {
    console.log("[ZOHO CRM] Duplicate lead detected.");

    console.log(
      "[ZOHO CRM] Duplicate response:",
      JSON.stringify(data, null, 2),
    );

    const duplicateErrors = Array.isArray(zohoResult?.details?.errors)
      ? zohoResult.details.errors
      : [];

    let existingLeadId = null;

    for (const duplicateError of duplicateErrors) {
      const code = String(duplicateError?.code || "")
        .trim()
        .toUpperCase();

      if (code === "DUPLICATE_DATA") {
        const duplicateRecordId = duplicateError?.details?.duplicate_record?.id;

        if (duplicateRecordId) {
          existingLeadId = String(duplicateRecordId);

          break;
        }
      }
    }

    if (!existingLeadId) {
      const duplicateDetails = zohoResult?.details || data?.details || {};

      existingLeadId =
        duplicateDetails?.duplicate_record?.id ||
        duplicateDetails?.id ||
        duplicateDetails?.record_id ||
        duplicateDetails?.recordId ||
        duplicateDetails?.module?.id ||
        duplicateDetails?.module?.record_id ||
        null;
    }

    if (!existingLeadId) {
      console.error(
        "[ZOHO CRM] Duplicate detected but existing Lead ID could not be found.",
        JSON.stringify(data, null, 2),
      );

      const error = new Error(
        "Duplicate lead detected, but the existing Lead could not be identified.",
      );

      error.code = "DUPLICATE_LEAD_ID_NOT_FOUND";

      error.zohoResponse = data;

      throw error;
    }

    console.log(`[ZOHO CRM] Existing Lead found: ${existingLeadId}`);

    const updateData = {};

    Object.entries(recordData || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (typeof value === "string" && value.trim() === "") {
        return;
      }

      updateData[key] = value;
    });

    delete updateData.id;

    console.log("[ZOHO CRM] Updating existing Lead:", existingLeadId);

    console.log(
      "[ZOHO CRM] Update payload:",
      JSON.stringify(updateData, null, 2),
    );

    const updateUrl = `${tokenInfo.apiDomain}/crm/v8/Leads/${existingLeadId}`;

    const updateResponse = await fetch(updateUrl, {
      method: "PUT",

      headers: {
        Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,

        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        data: [updateData],

        trigger: ["workflow"],
      }),

      cache: "no-store",
    });

    const updateResponseText = await updateResponse.text();

    let updateDataResponse;

    try {
      updateDataResponse = updateResponseText
        ? JSON.parse(updateResponseText)
        : {};
    } catch {
      throw new Error(
        `Zoho returned invalid JSON while updating the existing Lead: ${updateResponseText}`,
      );
    }

    if (updateResponse.status === 401) {
      const error = new Error(
        "Zoho access token expired while updating duplicate Lead.",
      );

      error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";

      throw error;
    }

    if (!updateResponse.ok) {
      console.error(
        "[ZOHO CRM] Existing Lead update failed:",
        JSON.stringify(updateDataResponse, null, 2),
      );

      const updateResult = updateDataResponse?.data?.[0];

      const updateMessage =
        updateResult?.message ||
        updateDataResponse?.message ||
        "Unable to update existing Lead.";

      const error = new Error(updateMessage);

      error.code =
        updateResult?.code ||
        updateDataResponse?.code ||
        "ZOHO_DUPLICATE_UPDATE_FAILED";

      error.zohoResponse = updateDataResponse;

      error.httpStatus = updateResponse.status;

      throw error;
    }

    const updatedResult = updateDataResponse?.data?.[0];

    if (!updatedResult || updatedResult.status !== "success") {
      const error = new Error(
        updatedResult?.message || "Existing Lead could not be updated.",
      );

      error.code = updatedResult?.code || "ZOHO_DUPLICATE_UPDATE_FAILED";

      error.zohoResponse = updateDataResponse;

      throw error;
    }

    console.log(
      `[ZOHO CRM] Existing Lead ${existingLeadId} updated successfully.`,
    );

    return {
      success: true,

      duplicate: true,

      priority: true,

      leadId: existingLeadId,

      zohoResponse: updateDataResponse,
    };
  }

  if (!response.ok) {
    console.error(
      "[ZOHO CRM] Lead request failed:",
      JSON.stringify(data, null, 2),
    );

    const detailedMessage = zohoMessage || "Zoho CRM rejected the lead.";

    const error = new Error(detailedMessage);

    error.code = zohoCode || "ZOHO_CRM_ERROR";

    error.zohoResponse = data;

    error.httpStatus = response.status;

    throw error;
  }

  const result = data?.data?.[0];

  if (!result || result.status !== "success") {
    const error = new Error(
      result?.message || "Lead was not created in Zoho CRM.",
    );

    error.code = result?.code || "ZOHO_LEAD_CREATION_FAILED";

    error.zohoResponse = data;

    throw error;
  }

  console.log("[ZOHO CRM] New Lead created successfully:", result?.details?.id);

  return {
    success: true,

    duplicate: false,

    priority: false,

    leadId: result?.details?.id || null,

    zohoResponse: data,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Incoming Payload:", JSON.stringify(body, null, 2));

    const location = body?.location || {};

    let firstName = body?.firstName || "";

    let lastName = body?.lastName || "";

    if (!firstName && !lastName && body?.name) {
      const fullName = String(body.name).trim().replace(/\s+/g, " ");

      const nameParts = fullName.split(" ");

      firstName = nameParts.shift() || "";

      lastName = nameParts.join(" ") || "";
    }

    const rawEmail = String(body?.email || "").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = emailRegex.test(rawEmail) ? rawEmail : "";

    const phone = String(body?.phone || "").trim();

    const company = String(body?.company || "").trim();

    const street = String(
      body?.Street ||
      body?.street ||
      body?.area ||
      location?.street ||
      location?.area ||
      "",
    ).trim();

    const addressCity = String(
      body?.City || body?.city || body?.addressCity || location?.city || "",
    ).trim();

    const state = String(
      body?.State ||
      body?.state ||
      body?.Province ||
      body?.province ||
      location?.state ||
      location?.province ||
      "",
    ).trim();

    const country = String(
      body?.Country || body?.country || location?.country || "",
    ).trim();

    const pincode = String(
      body?.Zip_Code ||
      body?.Postal_Code ||
      body?.PostalCode ||
      body?.postalCode ||
      body?.pincode ||
      location?.postalCode ||
      location?.pincode ||
      "",
    ).trim();

    const rawRequirementCity = String(
      body?.requirementCity || body?.Requirement_City || "",
    ).trim();

    const requirementCity =
      rawRequirementCity === "__NONE__" ? "" : rawRequirementCity;


    const requirementType = String(
      body?.requirementType || body?.Requirement_Type || "",
    ).trim();



    if (!firstName && !lastName) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
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
          message: "Phone number is required.",
        },
        {
          status: 400,
        },
      );
    }


    let tokenInfo = await getZohoAccessToken();


    const processLead = async (currentToken) => {
      let requirementCityId = null;

      if (requirementCity) {
        requirementCityId = await findCityId(currentToken, requirementCity);
      }
      const leadOwnerTeam = mapLocationToLeadOwnerTeam(addressCity, state);

      const recordData = {
        First_Name: firstName || undefined,
        Last_Name: lastName || firstName || "Website Enquiry",
        Mobile: phone,
        Company: company || "",
        Street: street || undefined,
        City: addressCity || undefined,
        State: state || undefined,
        Country: country || undefined,
        Zip_Code: pincode || undefined,
        Lead_Source: "Listing Platform",
        Lead_Status: "Not Contacted",
        Sublead_Source: "Request a Callback",
        Lead_Owner_Team: leadOwnerTeam,
        Requirement_Type: requirementType || undefined,
      };
      if (email) {
        recordData.Email = email;
      }
      if (requirementCityId) {
        recordData.Requirement_City = {
          id: requirementCityId,
        };
      }
      Object.keys(recordData).forEach((key) => {
        if (
          recordData[key] === undefined ||
          recordData[key] === null ||
          recordData[key] === ""
        ) {
          delete recordData[key];
        }
      });

      console.log("Posting record to Zoho CRM:", JSON.stringify(recordData, null, 2));
      const result = await createLeadInCRM(currentToken, recordData);
      return {
        ...result,
        requirementCityId,
        requirementCity,
        requirementType,
        leadOwnerTeam,
      };
    };

    try {
      const retryResult = await processLead(tokenInfo);
      const isPriorityLead = Boolean(retryResult?.priority);
      return NextResponse.json(
        {
          success: true,
          duplicate: Boolean(retryResult?.duplicate),
          priority: isPriorityLead,
          message: isPriorityLead
            ? "Your enquiry has been received and put on priority."
            : "Lead created successfully.",
          leadId: retryResult.leadId,
          requirementCityFound: Boolean(retryResult.requirementCityId),
          requirementCityId: retryResult.requirementCityId || null,
          requirementCity: retryResult.requirementCity || "",
          requirementType: retryResult.requirementType || "",
          leadOwnerTeam: retryResult.leadOwnerTeam,
        },
        {
          status: 200,
        },
      );
    } catch (error) {
      if (error?.code === "ZOHO_ACCESS_TOKEN_EXPIRED") {
        console.warn("[ZOHO AUTH] Access token expired. Refreshing once...");
        tokenInfo = await getZohoAccessToken(true);
        const retryResult = await processLead(tokenInfo);
        const isPriorityLead = Boolean(retryResult?.priority);
        return NextResponse.json(
          {
            success: true,
            duplicate: Boolean(retryResult?.duplicate),
            priority: isPriorityLead,
            message: isPriorityLead
              ? "Your enquiry has been received and put on priority."
              : "Lead created successfully.",
            leadId: retryResult.leadId,
            requirementCityFound: Boolean(retryResult.requirementCityId),
            requirementCityId: retryResult.requirementCityId || null,
            requirementCity: retryResult.requirementCity || "",
            requirementType: retryResult.requirementType || "",
            leadOwnerTeam: retryResult.leadOwnerTeam,
          },
          {
            status: 200,
          },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[API] LEAD CREATION ERROR:", error?.message);

    if (error?.code === "ZOHO_AUTH_RATE_LIMITED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Zoho authentication is temporarily rate limited. Please try again after a few minutes.",
          errorCode: "ZOHO_AUTH_RATE_LIMITED",
        },
        {
          status: 429,
        },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Something went wrong while creating the lead.",
        errorCode: error?.code || null,
        zohoResponse: error?.zohoResponse || null,
      },
      {
        status:
          error?.httpStatus &&
            Number(error.httpStatus) >= 400 &&
            Number(error.httpStatus) < 600
            ? Number(error.httpStatus)
            : 500,
      },
    );
  }
}
