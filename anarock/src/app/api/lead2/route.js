import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const ACCOUNTS_URL =
  process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";

const DEFAULT_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.in";

const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

let zohoTokenCache = {
  accessToken: null,
  expiresAt: 0,
  apiDomain: DEFAULT_API_URL,
};

async function generateZohoAccessToken() {
  if (!CLIENT_ID) {
    throw new Error("ZOHO_CLIENT_ID is missing from .env.local");
  }

  if (!CLIENT_SECRET) {
    throw new Error("ZOHO_CLIENT_SECRET is missing from .env.local");
  }

  if (!REFRESH_TOKEN) {
    throw new Error("ZOHO_REFRESH_TOKEN is missing from .env.local");
  }

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
    throw new Error(`Zoho OAuth returned non-JSON response: ${responseText}`);
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

  return zohoTokenCache;
}

async function getZohoAccessToken(forceRefresh = false) {
  if (
    !forceRefresh &&
    zohoTokenCache.accessToken &&
    zohoTokenCache.expiresAt > Date.now()
  ) {
    return zohoTokenCache;
  }

  return await generateZohoAccessToken();
}

function normalizeCityName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function isValidCityName(value) {
  if (!value) return false;
  return /^[\p{L}\p{N} .'-]{1,100}$/u.test(value);
}


async function findCityId(tokenInfo, cityName) {
  const cleanCity = normalizeCityName(cityName);

  if (!cleanCity || !isValidCityName(cleanCity)) {
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
    const error = new Error(
      "Zoho access token expired while searching City.",
    );

    error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";

    throw error;
  }

  const responseText = await response.text();

  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `Invalid response from Zoho City search: ${responseText}`,
    );
  }

  if (response.status === 204 || !response.ok) {
    return null;
  }

  const records = Array.isArray(data?.data)
    ? data.data
    : [];

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

  if (!response.ok) {
    const zohoResult = data?.data?.[0];
    const detailedMessage =
      zohoResult?.message || data?.message || "Zoho CRM rejected the lead.";
    const error = new Error(detailedMessage);
    error.code = zohoResult?.code || data?.code || "ZOHO_CRM_ERROR";
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

  return {
    leadId: result?.details?.id || null,
    zohoResponse: data,
  };
}
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("[LEAD2] Incoming Payload:", JSON.stringify(body, null, 2));
    let firstName = String(body?.firstName || "").trim();
    let lastName = String(body?.lastName || "").trim();
    if (!firstName && !lastName && body?.name) {
      const fullName = String(body.name).trim().replace(/\s+/g, " ");
      const nameParts = fullName.split(" ");
      firstName = nameParts.shift() || "";
      lastName = nameParts.join(" ") || "";
    }
    const email = String(body?.email || "").trim();
    const fullPhone = String(
      body?.fullPhone || `${body?.countryDialCode || ""}${body?.phone || ""}`,
    ).trim();
    const company = String(body?.company || "").trim();
    const requirementDetails = String(
      body?.requirementDetails ||
      body?.Requirement_Details ||
      body?.message ||
      body?.description ||
      "",
    ).trim();
    const location = body?.location || {};
    const street = String(
      body?.Street || body?.street || location?.street || location?.area || "",
    ).trim();

    const addressCity = String(
      body?.City || body?.addressCity || location?.city || "",
    ).trim();

    const province = String(
      body?.Province ||
      body?.province ||
      body?.state ||
      location?.province ||
      location?.state ||
      "",
    ).trim();

    const country = String(
      body?.Country || body?.country || location?.country || "",
    ).trim();

    const postalCode = String(
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

    if (!fullPhone) {
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
      const requirementCityId = requirementCity
        ? await findCityId(currentToken, requirementCity)
        : null;
      const leadOwnerTeam = mapLocationToLeadOwnerTeam(addressCity, province);
      const recordData = {
        First_Name: firstName || undefined,
        Last_Name: lastName || firstName || "Website Enquiry",
        Mobile: fullPhone,
        Company: company || "Individual",
        Lead_Source: body?.leadSource || "Listing Platform",
        Lead_Status: body?.leadStatus || "Not Contacted",
        Sublead_Source: body?.subLeadSource || "Post a Requirement",
        Lead_Owner_Team: leadOwnerTeam,
        Requirement_Details: requirementDetails || undefined,
        Requirement_Type: requirementType || undefined,
        Street: street || undefined,
        City: addressCity || undefined,
        State: province || undefined,
        Country: country || undefined,
        Zip_Code: postalCode || undefined,
        ...(requirementType === "Managed Office/Co-working"
          ? {
            Requirement_Seats:
              body?.Requirement_Seats !== undefined
                ? Number(body.Requirement_Seats)
                : undefined,

            Requirement_Seat_Price:
              body?.Requirement_Seat_Price !== undefined
                ? Number(body.Requirement_Seat_Price)
                : undefined,
          }
          : {
            Requirement_Area:
              body?.Requirement_Area !== undefined
                ? Number(body.Requirement_Area)
                : undefined,

            Requirement_Rent:
              body?.Requirement_Rent !== undefined
                ? Number(body.Requirement_Rent)
                : undefined,
          }),
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

      console.log(
        "[LEAD2] Posting record to Zoho CRM:",
        JSON.stringify(recordData, null, 2),
      );

      const result = await createLeadInCRM(currentToken, recordData);

      return {
        ...result,

        requirementCityId,

        leadOwnerTeam,
      };
    };
    try {
      const result = await processLead(tokenInfo);

      return NextResponse.json(
        {
          success: true,
          message: "Lead created successfully.",
          leadId: result.leadId,
          cityFound: Boolean(result.requirementCityId),
          cityId: result.requirementCityId || null,
          leadOwnerTeam: result.leadOwnerTeam,
        },
        {
          status: 200,
        },
      );
    } catch (error) {
      if (error?.code === "ZOHO_ACCESS_TOKEN_EXPIRED") {
        tokenInfo = await getZohoAccessToken(true);
        const retryResult = await processLead(tokenInfo);
        return NextResponse.json(
          {
            success: true,
            message: "Lead created successfully.",
            leadId: retryResult.leadId,
            cityFound: Boolean(retryResult.requirementCityId),
            cityId: retryResult.requirementCityId || null,
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
    console.error("[LEAD2] LEAD CREATION ERROR:", error?.message);
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
