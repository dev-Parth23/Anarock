// import { createRequire } from "module";
// process.env.X_ZOHO_CATALYST_ACCOUNTS_URL = "https://accounts.zoho.in";
// process.env.CATALYST_ACCOUNTS_URL = "https://accounts.zoho.in";
// process.env.ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";
// const require = createRequire(import.meta.url);
// const sdk = require("zcatalyst-sdk-node");
// export const PROPERTIES_TABLE_ID =
//   process.env.CATALYST_PROPERTIES_TABLE_ID || "53125000000038011";
// export const STATS_TABLE_ID = process.env.CATALYST_STATS_TABLE_ID || "Stats";
// export const KYC_TABLE_ID = process.env.CATALYST_KYC_TABLE_ID || "KYC";
// export const PROPERTY_IMAGES_BUCKET =
//   process.env.CATALYST_PROPERTY_IMAGES_BUCKET || "property-images";
// const APP_NAME = "anarock-next-server";
// const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;
// const MAX_AUTH_RETRIES = 1;
// const globalState = globalThis;
// if (!globalState.__anarockCatalyst) {
//   globalState.__anarockCatalyst = {
//     app: null,
//     appPromise: null,
//     accessToken: null,
//     accessTokenExpiresAt: 0,
//     accessTokenPromise: null,
//   };
// }
// const state = globalState.__anarockCatalyst;
// function required(name) {
//   const value = process.env[name];
//   if (!value || !String(value).trim()) {
//     throw new Error(`${name} is missing`);
//   }
//   return String(value).trim();
// }

// function getEnvironment() {
//   return String(process.env.CATALYST_ENVIRONMENT || "Production").trim();
// }
// function initializeApp() {
//   const projectId = required("CATALYST_PROJECT_ID");
//   const projectKey = required("CATALYST_PROJECT_KEY");
//   const environment = getEnvironment();
//   const clientId = required("CATALYST_CLIENT_ID");
//   const clientSecret = required("CATALYST_CLIENT_SECRET");
//   const refreshToken = required("CATALYST_REFRESH_TOKEN");
//   const credential = sdk.credential.refreshToken({
//     refresh_token: refreshToken,
//     client_id: clientId,
//     client_secret: clientSecret,
//   });

//   const request = {
//     project_id: projectId,
//     project_key: projectKey,
//     environment,
//     credential,
//   };
//   return sdk.initializeApp(request, APP_NAME);
// }

// function getExistingApp() {
//   try {
//     if (typeof sdk.app !== "function") {
//       return null;
//     }
//     return sdk.app(APP_NAME) || null;
//   } catch {
//     return null;
//   }
// }

// export async function getCatalystApp() {
//   if (state.app) {
//     return state.app;
//   }

//   if (state.appPromise) {
//     return state.appPromise;
//   }

//   state.appPromise = Promise.resolve()
//     .then(() => {
//       if (state.app) {
//         return state.app;
//       }
//       const existing = getExistingApp();
//       if (existing) {
//         state.app = existing;
//         return existing;
//       }

//       const app = initializeApp();
//       state.app = app;
//       return app;
//     })
//     .catch((error) => {
//       state.appPromise = null;
//       console.error(
//         "[Catalyst] Initialization failed:",
//         error?.message || error,
//       );

//       throw error;
//     })
//     .finally(() => {
//       state.appPromise = null;
//     });

//   return state.appPromise;
// }

// function clearAccessToken() {
//   state.accessToken = null;

//   state.accessTokenExpiresAt = 0;
// }

// function hasValidAccessToken() {
//   if (!state.accessToken) {
//     return false;
//   }

//   return state.accessTokenExpiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS;
// }

// async function refreshAccessToken() {
//   if (state.accessTokenPromise) {
//     return state.accessTokenPromise;
//   }
//   state.accessTokenPromise = (async () => {
//     const clientId = required("CATALYST_CLIENT_ID");
//     const clientSecret = required("CATALYST_CLIENT_SECRET");
//     const refreshToken = required("CATALYST_REFRESH_TOKEN");
//     const body = new URLSearchParams({
//       refresh_token: refreshToken,
//       client_id: clientId,
//       client_secret: clientSecret,
//       grant_type: "refresh_token",
//     });
//     const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Accept: "application/json",
//       },

//       body: body.toString(),
//       cache: "no-store",
//     });

//     const text = await response.text();
//     let data;
//     try {
//       data = text ? JSON.parse(text) : {};
//     } catch {
//       data = {
//         raw: text,
//       };
//     }

//     if (!response.ok || !data?.access_token) {
//       console.error("[Catalyst Auth] OAuth refresh failed:", {
//         status: response.status,
//         statusText: response.statusText,
//         error: data?.error || data?.error_description || "unknown",
//       });
//       throw new Error(`Zoho OAuth refresh failed (${response.status})`);
//     }
//     const expiresIn = Math.max(60, Number(data.expires_in) || 3600);
//     state.accessToken = data.access_token;
//     state.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
//     return state.accessToken;
//   })()
//     .catch((error) => {
//       clearAccessToken();
//       throw error;
//     })
//     .finally(() => {
//       state.accessTokenPromise = null;
//     });
//   return state.accessTokenPromise;
// }

// async function getAccessToken() {
//   if (hasValidAccessToken()) {
//     return state.accessToken;
//   }
//   return refreshAccessToken();
// }

// export async function catalystFetch(url, options = {}, retryCount = 0) {
//   const accessToken = await getAccessToken();
//   const headers = {
//     ...(options.headers || {}),
//     Authorization: `Zoho-oauthtoken ${accessToken}`,
//     Environment: getEnvironment(),
//     Accept: "application/json",
//   };

//   const response = await fetch(url, {
//     ...options,
//     headers,
//     cache: "no-store",
//   });
//   if (response.status === 401 && retryCount < MAX_AUTH_RETRIES) {
//     clearAccessToken();
//     await refreshAccessToken();
//     return catalystFetch(url, options, retryCount + 1);
//   }
//   return response;
// }

// async function getDataStorePage(tableId, options = {}) {
//   const projectId = required("CATALYST_PROJECT_ID");
//   const maxRows = Math.min(Math.max(Number(options.maxRows || 100), 1), 100);
//   const params = new URLSearchParams();
//   params.set("max_rows", String(maxRows));
//   if (options.nextToken) {
//     params.set("next_token", String(options.nextToken));
//   }
//   const url =
//     `https://api.catalyst.zoho.in/baas/v1/project/` +
//     `${encodeURIComponent(projectId)}/table/` +
//     `${encodeURIComponent(tableId)}/row?` +
//     `${params.toString()}`;

//   const response = await catalystFetch(url, {
//     method: "GET",
//   });

//   const text = await response.text();

//   let data;

//   try {
//     data = text ? JSON.parse(text) : {};
//   } catch {
//     data = {
//       raw: text,
//     };
//   }

//   if (!response.ok) {
//     console.error("[Catalyst DataStore] Request failed:", {
//       status: response.status,

//       statusText: response.statusText,

//       tableId,
//     });

//     throw new Error(`Catalyst Data Store request failed (${response.status})`);
//   }

//   if (!data || typeof data !== "object") {
//     throw new Error("Invalid Catalyst Data Store response");
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

// function createDataStoreTable(tableId) {
//   return {
//     async getPagedRows(options = {}) {
//       return getDataStorePage(tableId, options);
//     },
//   };
// }

// export async function getPropertiesTable() {
//   return createDataStoreTable(PROPERTIES_TABLE_ID);
// }

// export async function getStatsTable() {
//   return createDataStoreTable(STATS_TABLE_ID);
// }

// export async function getKycTable() {
//   return createDataStoreTable(KYC_TABLE_ID);
// }

// export async function getPropertyImagesBucket() {
//   const app = await getCatalystApp();

//   return app.stratus().bucket(PROPERTY_IMAGES_BUCKET);
// }

// export function getCatalystAuthStatus() {
//   return {
//     hasAccessToken: Boolean(state.accessToken),

//     expiresAt: state.accessTokenExpiresAt
//       ? new Date(state.accessTokenExpiresAt).toISOString()
//       : null,

//     isValid: hasValidAccessToken(),

//     refreshInProgress: Boolean(state.accessTokenPromise),
//   };
// }

// export function resetCatalystApp() {
//   state.app = null;
//   state.appPromise = null;
//   clearAccessToken();
//   state.accessTokenPromise = null;
// }

import "server-only";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

/*
|--------------------------------------------------------------------------
| Catalyst configuration
|--------------------------------------------------------------------------
*/

export const PROPERTIES_TABLE_ID =
  process.env.CATALYST_PROPERTIES_TABLE_ID || "53125000000038011";

export const STATS_TABLE_ID = process.env.CATALYST_STATS_TABLE_ID || "Stats";

export const KYC_TABLE_ID = process.env.CATALYST_KYC_TABLE_ID || "KYC";

export const PROPERTY_IMAGES_BUCKET =
  process.env.CATALYST_PROPERTY_IMAGES_BUCKET || "property-images";

/*
|--------------------------------------------------------------------------
| Catalyst API configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_CATALYST_API_URL = "https://api.catalyst.zoho.in";

const DEFAULT_ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";

const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;

const MAX_AUTH_RETRIES = 1;

const DEFAULT_TIMEOUT_MS = 15_000;

/*
|--------------------------------------------------------------------------
| Process-level state
|--------------------------------------------------------------------------
|
| The Catalyst access token is cached only inside the
| current Next.js server process.
|
| It is NEVER exposed to the browser.
|
*/

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

/*
|--------------------------------------------------------------------------
| Environment helpers
|--------------------------------------------------------------------------
*/

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
  return String(process.env.CATALYST_ENVIRONMENT || "Production").trim();
}

function getRequestTimeout() {
  return Number(process.env.CATALYST_REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
}

/*
|--------------------------------------------------------------------------
| Token state
|--------------------------------------------------------------------------
*/

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
  /*
   * If multiple requests arrive while the token is expired,
   * they all wait for the same refresh promise.
   *
   * This prevents 50/100 simultaneous requests from creating
   * 50/100 OAuth refresh requests.
   */

  if (state.accessTokenPromise) {
    return state.accessTokenPromise;
  }

  state.accessTokenPromise = (async () => {
    const clientId = required("CATALYST_CLIENT_ID");

    const clientSecret = required("CATALYST_CLIENT_SECRET");

    const refreshToken = required("CATALYST_REFRESH_TOKEN");

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

/*
|--------------------------------------------------------------------------
| Catalyst HTTP wrapper
|--------------------------------------------------------------------------
|
| All Catalyst DataStore REST requests should use this function.
|
*/

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

  /*
   * If Catalyst rejects the token:
   *
   * 1. Clear the cached token.
   * 2. Refresh it.
   * 3. Retry exactly once.
   */

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
async function getDataStorePage(tableId, options = {}) {
  const projectId = required("CATALYST_PROJECT_ID");
  const maxRows = Math.min(Math.max(Number(options.maxRows || 100), 1), 100);
  const params = new URLSearchParams();
  params.set("max_rows", String(maxRows));
  if (options.nextToken) {
    params.set("next_token", String(options.nextToken));
  }

  const url =
    `${getCatalystApiUrl()}` +
    `/baas/v1/project/` +
    `${encodeURIComponent(projectId)}` +
    `/table/` +
    `${encodeURIComponent(tableId)}` +
    `/row?` +
    `${params.toString()}`;

  const response = await catalystFetch(url, {
    method: "GET",
  });

  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {
      raw: responseText,
    };
  }

  if (!response.ok) {
    console.error("[Catalyst DataStore] Request failed:", {
      status: response.status,
      statusText: response.statusText,
      tableId,
    });

    throw new Error(`Catalyst DataStore request failed (${response.status})`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid Catalyst DataStore response");
  }

  return {
    data: Array.isArray(data.data) ? data.data : [],
    next_token: data.next_token || data.nextToken || null,
    more_records: Boolean(
      data.more_records ??
      data.moreRecords ??
      data.next_token ??
      data.nextToken,
    ),
  };
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
  const projectId = required("CATALYST_PROJECT_ID");
  const projectKey = required("CATALYST_PROJECT_KEY");
  const clientId = required("CATALYST_CLIENT_ID");
  const clientSecret = required("CATALYST_CLIENT_SECRET");
  const refreshToken = required("CATALYST_REFRESH_TOKEN");
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
