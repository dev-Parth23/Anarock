import { createRequire } from "module";
process.env.X_ZOHO_CATALYST_ACCOUNTS_URL = "https://accounts.zoho.in";
process.env.CATALYST_ACCOUNTS_URL = "https://accounts.zoho.in";
process.env.ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";
const require = createRequire(import.meta.url);
const sdk = require("zcatalyst-sdk-node");

export const PROPERTIES_TABLE_ID =
  process.env.CATALYST_PROPERTIES_TABLE_ID || "53125000000038011";
export const STATS_TABLE_ID = process.env.CATALYST_STATS_TABLE_ID || "Stats";
export const KYC_TABLE_ID = process.env.CATALYST_KYC_TABLE_ID || "KYC";
export const PROPERTY_IMAGES_BUCKET =
  process.env.CATALYST_PROPERTY_IMAGES_BUCKET || "property-images";
const APP_NAME = "anarock-next-server";
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;
const MAX_AUTH_RETRIES = 1;
const globalState = globalThis;
if (!globalState.__anarockCatalyst) {
  globalState.__anarockCatalyst = {
    app: null,
    appPromise: null,
    accessToken: null,
    accessTokenExpiresAt: 0,
    accessTokenPromise: null,
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

function getEnvironment() {
  return String(process.env.CATALYST_ENVIRONMENT || "Production").trim();
}
function initializeApp() {
  const projectId = required("CATALYST_PROJECT_ID");
  const projectKey = required("CATALYST_PROJECT_KEY");
  const environment = getEnvironment();
  const clientId = required("CATALYST_CLIENT_ID");
  const clientSecret = required("CATALYST_CLIENT_SECRET");
  const refreshToken = required("CATALYST_REFRESH_TOKEN");

  const credential = sdk.credential.refreshToken({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const request = {
    project_id: projectId,
    project_key: projectKey,
    environment,
    credential,
  };

  return sdk.initializeApp(request, APP_NAME);
}

function getExistingApp() {
  try {
    if (typeof sdk.app !== "function") {
      return null;
    }

    return sdk.app(APP_NAME) || null;
  } catch {
    return null;
  }
}

export async function getCatalystApp() {
  if (state.app) {
    return state.app;
  }

  if (state.appPromise) {
    return state.appPromise;
  }

  state.appPromise = Promise.resolve()
    .then(() => {
      if (state.app) {
        return state.app;
      }
      const existing = getExistingApp();
      if (existing) {
        state.app = existing;
        return existing;
      }
      const app = initializeApp();
      state.app = app;
      return app;
    })
    .catch((error) => {
      state.appPromise = null;
      console.error("[Catalyst] Initialization failed:", error);
      throw error;
    })
    .finally(() => {
      state.appPromise = null;
    });

  return state.appPromise;
}

function clearAccessToken() {
  state.accessToken = null;
  state.accessTokenExpiresAt = 0;
}

function hasValidAccessToken() {
  if (!state.accessToken) {
    return false;
  }
  return state.accessTokenExpiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS;
}

async function refreshAccessToken() {
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
    const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!response.ok || !data?.access_token) {
      console.error("[Catalyst Auth] OAuth refresh failed:", {
        status: response.status,
        statusText: response.statusText,
        response: data,
      });
      throw new Error(`Zoho OAuth refresh failed (${response.status})`);
    }
    const expiresIn = Number(data.expires_in || 3600);
    state.accessToken = data.access_token;
    state.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
    console.log("[Catalyst Auth] Access token refreshed successfully.", {
      expiresIn,
      expiresAt: new Date(state.accessTokenExpiresAt).toISOString(),
    });

    return state.accessToken;
  })()
    .catch((error) => {
      clearAccessToken();
      throw error;
    })
    .finally(() => {
      state.accessTokenPromise = null;
    });
  return state.accessTokenPromise;
}

async function getAccessToken() {
  if (hasValidAccessToken()) {
    return state.accessToken;
  }

  return refreshAccessToken();
}
async function catalystFetch(url, options = {}, retryCount = 0) {
  const accessToken = await getAccessToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    Environment: getEnvironment(),
    Accept: "application/json",
  };
  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (response.status === 401 && retryCount < MAX_AUTH_RETRIES) {
    console.warn(
      "[Catalyst Auth] Received 401. Refreshing token and retrying request...",
    );
    clearAccessToken();
    await refreshAccessToken();
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
    `https://api.catalyst.zoho.in/baas/v1/project/` +
    `${encodeURIComponent(projectId)}/table/` +
    `${encodeURIComponent(tableId)}/row?` +
    `${params.toString()}`;

  console.log("[Catalyst DataStore] Request:", {
    tableId,
    maxRows,
    hasNextToken: Boolean(options.nextToken),
  });
  const response = await catalystFetch(url, {
    method: "GET",
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    console.error("[Catalyst DataStore] Request failed:", {
      status: response.status,
      statusText: response.statusText,
      tableId,
      response: data,
    });

    throw new Error(
      `Catalyst Data Store request failed (${response.status}): ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`,
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid Catalyst Data Store response");
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
  };
}
export function resetCatalystApp() {
  state.app = null;
  state.appPromise = null;
  clearAccessToken();
  state.accessTokenPromise = null;
}
