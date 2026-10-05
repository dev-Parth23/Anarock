const globalState = globalThis;

const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;
const MAX_AUTH_RETRIES = 1;
const DEFAULT_TIMEOUT_MS = 15_000;

if (!globalState.__anarockZoho) {
  globalState.__anarockZoho = {
    accessToken: null,
    accessTokenExpiresAt: 0,
    apiDomain: null,
    refreshPromise: null,
  };
}

const state = globalState.__anarockZoho;

function required(name) {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`${name} is missing`);
  }

  return String(value).trim();
}

function getAccountsUrl() {
  return (process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in").replace(
    /\/+$/,
    "",
  );
}

function getDefaultApiUrl() {
  return (process.env.ZOHO_API_URL || "https://www.zohoapis.in").replace(
    /\/+$/,
    "",
  );
}

function clearAccessToken() {
  state.accessToken = null;
  state.accessTokenExpiresAt = 0;
  state.apiDomain = null;
}

function hasValidAccessToken() {
  return Boolean(
    state.accessToken &&
    state.accessTokenExpiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS,
  );
}

async function refreshZohoAccessToken() {
  /*
   * IMPORTANT:
   * If multiple requests arrive at the same time while
   * the token is expired, they all wait for this SAME promise.
   *
   * This prevents 100 simultaneous OAuth refresh requests.
   */
  if (state.refreshPromise) {
    return state.refreshPromise;
  }

  state.refreshPromise = (async () => {
    const clientId = required("ZOHO_CLIENT_ID");
    const clientSecret = required("ZOHO_CLIENT_SECRET");
    const refreshToken = required("ZOHO_REFRESH_TOKEN");

    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    });

    const response = await fetch(`${getAccountsUrl()}/oauth/v2/token`, {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",

        Accept: "application/json",
      },

      body: body.toString(),

      cache: "no-store",
    });

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Zoho OAuth returned an invalid response");
    }

    if (!response.ok || !data?.access_token) {
      const error = new Error(
        data?.error_description ||
          data?.error ||
          `Zoho OAuth refresh failed (${response.status})`,
      );

      error.status = response.status;

      error.code = data?.error || "ZOHO_OAUTH_REFRESH_FAILED";

      throw error;
    }

    const expiresInSeconds = Math.max(60, Number(data.expires_in) || 3600);

    state.accessToken = data.access_token;

    state.accessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;

    state.apiDomain = String(data.api_domain || getDefaultApiUrl()).replace(
      /\/+$/,
      "",
    );

    return {
      accessToken: state.accessToken,

      expiresAt: state.accessTokenExpiresAt,

      apiDomain: state.apiDomain,
    };
  })()
    .catch((error) => {
      clearAccessToken();
      throw error;
    })
    .finally(() => {
      state.refreshPromise = null;
    });

  return state.refreshPromise;
}

export async function getZohoAccessToken(forceRefresh = false) {
  if (!forceRefresh && hasValidAccessToken()) {
    return {
      accessToken: state.accessToken,

      expiresAt: state.accessTokenExpiresAt,

      apiDomain: state.apiDomain || getDefaultApiUrl(),
    };
  }

  return refreshZohoAccessToken();
}

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

export async function zohoFetch(url, options = {}, retryCount = 0) {
  const tokenInfo = await getZohoAccessToken();

  const headers = {
    ...(options.headers || {}),

    Authorization: `Zoho-oauthtoken ${tokenInfo.accessToken}`,

    Accept: "application/json",
  };

  const response = await fetch(url, {
    ...options,

    headers,

    signal: getTimeoutSignal(
      options.signal,

      Number(process.env.ZOHO_REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    ),

    cache: "no-store",
  });

  /*
   * If Zoho says the token is invalid:
   *
   * 1. Clear only the token we actually used.
   * 2. Refresh.
   * 3. Retry exactly once.
   */
  if (response.status === 401 && retryCount < MAX_AUTH_RETRIES) {
    if (state.accessToken === tokenInfo.accessToken) {
      clearAccessToken();
    }

    await getZohoAccessToken(true);

    return zohoFetch(url, options, retryCount + 1);
  }

  return response;
}

export function getZohoAuthStatus() {
  return {
    hasAccessToken: Boolean(state.accessToken),

    expiresAt: state.accessTokenExpiresAt
      ? new Date(state.accessTokenExpiresAt).toISOString()
      : null,

    isValid: hasValidAccessToken(),

    refreshInProgress: Boolean(state.refreshPromise),

    apiDomain: state.apiDomain || getDefaultApiUrl(),
  };
}

export function resetZohoAuth() {
  clearAccessToken();
  state.refreshPromise = null;
}
