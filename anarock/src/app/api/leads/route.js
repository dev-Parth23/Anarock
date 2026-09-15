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

  return { leadId: result?.details?.id || null, zohoResponse: data };
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

    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const contactDate = String(
      body?.contactDate || body?.futureContactDate || "",
    ).trim();
    const company = String(body?.company || "").trim();
    const city = String(body?.city || location?.city || "").trim();
    const state = String(body?.state || location?.state || "").trim();
    const country = String(body?.country || location?.country || "").trim();
    const street = String(
      body?.street || body?.area || location?.area || "",
    ).trim();
    const pincode = String(body?.pincode || location?.pincode || "").trim();

    if (!firstName && !lastName) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 },
      );
    }

    // Process Zoho CRM submission
    let tokenInfo = await getZohoAccessToken();

    const processLead = async (currentToken) => {
      const cityId = city ? await findCityId(currentToken, city) : null;
      const leadOwnerTeam = mapLocationToLeadOwnerTeam(city, state);

      const recordData = {
        First_Name: firstName || undefined,
        Last_Name: lastName || firstName || "Website Enquiry",
        Mobile: phone,
        Company: company || "Individual",
        Street: street || undefined,
        City: city || undefined,
        State: state || undefined,
        Country: country || undefined,
        Zip_Code: pincode || undefined,
        Lead_Source: body?.leadSource || "Listing Platform",
        Lead_Status: body?.leadStatus || "Not Contacted",
        Sublead_Source: body?.subLeadSource || "Request a Callback",
        Lead_Owner_Team: leadOwnerTeam,
      };

      if (contactDate) {
        recordData.Future_Contact_Date = contactDate;
      }

      if (email) {
        recordData.Email = email;
      }

      if (cityId) {
        recordData.Requirement_City = { id: cityId };
      }

      // Clean up undefined / empty properties
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
        "Posting record to Zoho CRM:",
        JSON.stringify(recordData, null, 2),
      );

      const result = await createLeadInCRM(currentToken, recordData);

      return {
        ...result,
        cityId,
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
          cityFound: Boolean(result.cityId),
          cityId: result.cityId || null,
          leadOwnerTeam: result.leadOwnerTeam,
        },
        { status: 200 },
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
            cityFound: Boolean(retryResult.cityId),
            cityId: retryResult.cityId || null,
            leadOwnerTeam: retryResult.leadOwnerTeam,
          },
          { status: 200 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[API] LEAD CREATION ERROR:", error?.message);
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
