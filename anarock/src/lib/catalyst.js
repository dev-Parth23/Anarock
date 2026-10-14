import "server-only";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
export const projectId = process.env.PROJECT_ID || "53125000000013053";
export const PROPERTIES_TABLE_ID = process.env.PROPERTIES_TABLE_ID || "53125000000038011";
export const STATS_TABLE_ID = process.env.STATS_TABLE_ID || "Stats";
export const KYC_TABLE_ID = process.env.KYC_TABLE_ID || "KYC";
export const PROPERTY_IMAGES_BUCKET = process.env.PROPERTY_IMAGES_BUCKET || "property-images";
const DEFAULT_CATALYST_API_URL = "https://api.catalyst.zoho.in";
const DEFAULT_ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;
const MAX_AUTH_RETRIES = 1;
const DEFAULT_TIMEOUT_MS = 15_000;
const globalState = globalThis;
if (!globalState.__anarockCatalyst) {
  globalState.__anarockCatalyst = {
    accessToken: null,
    accessTokenExpiresAt: 0,
    accessTokenPromise: null,
    catalystApp: null,
    catalystSdk: null,
  };
}

const state = globalState.__anarockCatalyst;
function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`${name} is missing`);
  }
  return String(value).trim();
}

function getCatalystApiUrl() {
  return (process.env.CATALYST_API_URL || DEFAULT_CATALYST_API_URL)
    .trim()
    .replace(/\/+$/, "");
}

function getZohoAccountsUrl() {
  return (process.env.ZOHO_ACCOUNTS_URL || DEFAULT_ZOHO_ACCOUNTS_URL)
    .trim()
    .replace(/\/+$/, "");
}

function getEnvironment() {
  return String(process.env.ENVIRONMENT || "Production" || "Development").trim();
}

function getRequestTimeout() {
  return Number(process.env.CATALYST_REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
}

function clearAccessToken() {
  state.accessToken = null;
  state.accessTokenExpiresAt = 0;
}

function hasValidAccessToken() {
  return Boolean(
    state.accessToken &&
    state.accessTokenExpiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS,
  );
}

/*
|--------------------------------------------------------------------------
| Catalyst OAuth
|--------------------------------------------------------------------------
|
| The Next.js server now refreshes the Catalyst OAuth token directly.
|
| There is NO anarock_backend dependency.
|
*/

async function refreshCatalystAccessToken() {
  if (state.accessTokenPromise) {
    return state.accessTokenPromise;
  }

  state.accessTokenPromise = (async () => {
    const clientId = required("CLIENT_ID");
    const clientSecret = required("CLIENT_SECRET");
    const refreshToken = required("REFRESH_TOKEN");

    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    });

    let response;

    try {
      response = await fetch(`${getZohoAccountsUrl()}/oauth/v2/token`, {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",

          Accept: "application/json",
        },

        body: body.toString(),

        cache: "no-store",
      });
    } catch (error) {
      console.error(
        "[Catalyst Auth] OAuth request failed:",
        error?.message || error,
      );

      throw new Error("Unable to connect to Zoho OAuth service");
    }

    const responseText = await response.text();

    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("Zoho OAuth returned an invalid response");
    }

    if (!response.ok || !data?.access_token) {
      const error = new Error(
        data?.error_description ||
        data?.error ||
        `Catalyst OAuth refresh failed (${response.status})`,
      );

      error.status = response.status;

      error.code = data?.error || "CATALYST_OAUTH_REFRESH_FAILED";

      throw error;
    }

    /*
     * Zoho normally returns expires_in in seconds.
     *
     * Keep at least 60 seconds and maintain a
     * safety buffer before actual expiration.
     */

    const expiresInSeconds = Math.max(60, Number(data.expires_in) || 3600);

    state.accessToken = data.access_token;

    state.accessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;

    console.log("[Catalyst Auth] Access token refreshed.", {
      expiresInSeconds,
      expiresAt: new Date(state.accessTokenExpiresAt).toISOString(),
    });

    return state.accessToken;
  })()
    .catch((error) => {
      clearAccessToken();

      console.error(
        "[Catalyst Auth] Token refresh failed:",
        error?.message || error,
      );

      throw error;
    })
    .finally(() => {
      state.accessTokenPromise = null;
    });

  return state.accessTokenPromise;
}

/*
|--------------------------------------------------------------------------
| Get Catalyst access token
|--------------------------------------------------------------------------
*/

async function getAccessToken(forceRefresh = false) {
  if (!forceRefresh && hasValidAccessToken()) {
    return state.accessToken;
  }

  return refreshCatalystAccessToken();
}

/*
|--------------------------------------------------------------------------
| Timeout helper
|--------------------------------------------------------------------------
*/

function getTimeoutSignal(existingSignal, timeoutMs) {
  if (existingSignal) {
    return existingSignal;
  }

  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(timeoutMs);
  }

  return undefined;
}
export async function catalystFetch(url, options = {}, retryCount = 0) {
  const accessToken = await getAccessToken(retryCount > 0);

  const headers = {
    ...(options.headers || {}),

    Authorization: `Zoho-oauthtoken ${accessToken}`,

    Environment: getEnvironment(),

    Accept: "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
    signal: getTimeoutSignal(options.signal, getRequestTimeout()),
    cache: "no-store",
  });
  if (response.status === 401 && retryCount < MAX_AUTH_RETRIES) {
    console.warn(
      "[Catalyst Auth] Received 401. Refreshing token and retrying.",
    );

    clearAccessToken();

    await getAccessToken(true);

    return catalystFetch(url, options, retryCount + 1);
  }

  return response;
}
// async function getDataStorePage(tableId, options = {}) {
//   const projectId = required("PROJECT_ID");
//   const maxRows = Math.min(Math.max(Number(options.maxRows || 100), 1), 100);
//   const params = new URLSearchParams();
//   params.set("max_rows", String(maxRows));
//   if (options.nextToken) {
//     params.set("next_token", String(options.nextToken));
//   }

//   const url =
//     `${getCatalystApiUrl()}` +
//     `/baas/v1/project/` +
//     `${encodeURIComponent(projectId)}` +
//     `/table/` +
//     `${encodeURIComponent(tableId)}` +
//     `/row?` +
//     `${params.toString()}`;

//   const response = await catalystFetch(url, {
//     method: "GET",
//   });

//   const responseText = await response.text();

//   let data = {};

//   try {
//     data = responseText ? JSON.parse(responseText) : {};
//   } catch {
//     data = {
//       raw: responseText,
//     };
//   }

//   if (!response.ok) {
//     console.error("[Catalyst DataStore] Request failed:", {
//       status: response.status,
//       statusText: response.statusText,
//       tableId,
//     });

//     throw new Error(`Catalyst DataStore request failed (${response.status})`);
//   }

//   if (!data || typeof data !== "object") {
//     throw new Error("Invalid Catalyst DataStore response");
//   }

//   return {
//     data: Array.isArray(data.data) ? data.data : [],
//     next_token: data.next_token || data.nextToken || null,
//     more_records: Boolean(
//       data.more_records ??
//       data.moreRecords ??
//       data.next_token ??
//       data.nextToken,
//     ),
//   };
// }

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getDataStorePage(tableId, options = {}) {
  const maxRows = Math.min(
    Math.max(Number(options.maxRows || 100), 1),
    100,
  );

  const params = new URLSearchParams();
  params.set("max_rows", String(maxRows));

  if (options.nextToken) {
    params.set("next_token", String(options.nextToken));
  }

  const url =
    `${getCatalystApiUrl()}/baas/v1/project/` +
    `${encodeURIComponent(projectId)}/table/` +
    `${encodeURIComponent(tableId)}/row?${params.toString()}`;

  const maxAttempts = 4;
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await catalystFetch(url, { method: "GET" });
      const responseText = await response.text();

      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { raw: responseText };
      }

      const bodyMessage =
        data?.message ||
        data?.error_description ||
        data?.error ||
        data?.description ||
        "";

      // Some upstream failures can arrive in an HTTP 200 response.
      const rateLimited =
        response.status === 429 ||
        /too many requests|rate.?limit|requests continuously/i.test(
          `${bodyMessage} ${data?.raw || ""}`,
        );

      if (response.ok && !rateLimited) {
        if (!Array.isArray(data?.data)) {
          console.error("[Catalyst DataStore] Unexpected response:", {
            status: response.status,
            tableId,
            responseKeys:
              data && typeof data === "object"
                ? Object.keys(data)
                : [],
            message: bodyMessage || "Missing data array",
          });

          throw new Error(
            `Unexpected Catalyst DataStore response for table ${tableId}`,
          );
        }

        return {
          data: data.data,
          next_token: data.next_token || data.nextToken || null,
          more_records: Boolean(
            data.more_records ??
            data.moreRecords ??
            data.next_token ??
            data.nextToken,
          ),
        };
      }

      const error = new Error(
        bodyMessage ||
        `Catalyst DataStore request failed (${response.status})`,
      );

      error.status = response.status;
      error.code = rateLimited ? "CATALYST_RATE_LIMITED" : "CATALYST_REQUEST_FAILED";

      console.error("[Catalyst DataStore] Request failed:", {
        status: response.status,
        statusText: response.statusText,
        tableId,
        attempt: attempt + 1,
        rateLimited,
        message: error.message,
      });

      lastError = error;

      if (!rateLimited || attempt === maxAttempts - 1) {
        throw error;
      }

      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, 15000)
          : 1000 * 2 ** attempt;

      await delay(waitMs);
    } catch (error) {
      lastError = error;

      if (
        error?.code !== "CATALYST_RATE_LIMITED" ||
        attempt === maxAttempts - 1
      ) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Catalyst DataStore request failed");
}


function createDataStoreTable(tableId) {
  return {
    async getPagedRows(options = {}) {
      return getDataStorePage(tableId, options);
    },
  };
}

export async function getPropertiesTable() {
  return createDataStoreTable(PROPERTIES_TABLE_ID);
}

export async function getStatsTable() {
  return createDataStoreTable(STATS_TABLE_ID);
}

export async function getKycTable() {
  return createDataStoreTable(KYC_TABLE_ID);
}

function getCatalystSdk() {
  if (!state.catalystSdk) {
    state.catalystSdk = require("zcatalyst-sdk-node");
  }
  return state.catalystSdk;
}

async function getCatalystApp() {
  if (state.catalystApp) {
    return state.catalystApp;
  }
  const projectId = required("PROJECT_ID");
  const projectKey = required("PROJECT_KEY");
  const clientId = required("CLIENT_ID");
  const clientSecret = required("CLIENT_SECRET");
  const refreshToken = required("REFRESH_TOKEN");
  const catalystSdk = getCatalystSdk();
  const credential = catalystSdk.credential.refreshToken({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  state.catalystApp = catalystSdk.initializeApp(
    {
      project_id: projectId,
      project_key: projectKey,
      environment: getEnvironment(),
      credential,
    },
    "anarock-next-server",
  );

  return state.catalystApp;
}

export async function getPropertyImagesBucket() {
  const app = await getCatalystApp();
  return app.stratus().bucket(PROPERTY_IMAGES_BUCKET);
}

export function getCatalystAuthStatus() {
  return {
    hasAccessToken: Boolean(state.accessToken),
    expiresAt: state.accessTokenExpiresAt
      ? new Date(state.accessTokenExpiresAt).toISOString()
      : null,
    isValid: hasValidAccessToken(),
    refreshInProgress: Boolean(state.accessTokenPromise),
    apiUrl: getCatalystApiUrl(),
    environment: getEnvironment(),
  };
}

export function resetCatalystApp() {
  clearAccessToken();
  state.accessTokenPromise = null;
  state.catalystApp = null;
}
