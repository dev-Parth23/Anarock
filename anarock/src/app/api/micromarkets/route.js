import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
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
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`Zoho OAuth returned invalid response: ${responseText}`);
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
    accessToken: data.access_token,
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

async function fetchMicromarkets(tokenInfo, city) {
  const moduleName = "Micromarkets";

  const fields = "id,Name,City";

  const url =
    `${tokenInfo.apiDomain}/crm/v8/${moduleName}` +
    `?fields=${encodeURIComponent(fields)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const responseText = await response.text();

  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `Invalid response from Zoho Micromarket module: ${responseText}`,
    );
  }

  if (response.status === 401) {
    const error = new Error("Zoho access token expired.");
    error.code = "ZOHO_ACCESS_TOKEN_EXPIRED";
    throw error;
  }

  if (!response.ok) {
    throw new Error(
      data?.data?.[0]?.message ||
      data?.message ||
      `Unable to fetch micromarkets from Zoho CRM. HTTP ${response.status}`,
    );
  }

  const records = Array.isArray(data?.data) ? data.data : [];

  const citySearch = String(city || "")
    .trim()
    .toLowerCase();
  const filtered = records.filter((record) => {
    if (!citySearch) return true;

    const recordCity = record?.City;

    if (typeof recordCity === "string") {
      return recordCity.trim().toLowerCase() === citySearch;
    }

    if (recordCity?.name) {
      return String(recordCity.name).trim().toLowerCase() === citySearch;
    }

    return false;
  });

  return filtered
    .map((record) => ({
      id: record?.id || "",
      name: record?.Name || "",
    }))
    .filter((item) => item.id && item.name);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const city = String(searchParams.get("city") || "").trim();

    if (!city) {
      return NextResponse.json({
        success: true,
        micromarkets: [],
      });
    }

    let tokenInfo = await getZohoAccessToken();

    try {
      const micromarkets = await fetchMicromarkets(tokenInfo, city);

      return NextResponse.json({
        success: true,
        micromarkets,
      });
    } catch (error) {
      if (error?.code !== "ZOHO_ACCESS_TOKEN_EXPIRED") {
        throw error;
      }

      tokenInfo = await getZohoAccessToken(true);

      const micromarkets = await fetchMicromarkets(tokenInfo, city);

      return NextResponse.json({
        success: true,
        micromarkets,
      });
    }
  } catch (error) {
    console.error("Micromarkets API error:", error);

    return NextResponse.json(
      {
        success: false,
        micromarkets: [],
        message: error?.message || "Unable to fetch micromarkets.",
      },
      {
        status: 500,
      },
    );
  }
}
