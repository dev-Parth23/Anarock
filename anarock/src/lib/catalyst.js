import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const PROPERTIES_TABLE_ID =
  process.env.CATALYST_PROPERTIES_TABLE_ID || "53125000000038011";
export const PROPERTY_IMAGES_BUCKET = "property-images";
const CATALYST_APP_NAME = "anarock-next-server";
const globalForCatalyst = globalThis;

if (!globalForCatalyst.__anarockCatalystState) {
  globalForCatalyst.__anarockCatalystState = {
    catalystSDK: null,
    localCatalystApp: null,
    localCatalystConfig: undefined,
    cachedAccessToken: null,
    accessTokenExpiresAt: 0,
    accessTokenPromise: null,
  };
}

const catalystState = globalForCatalyst.__anarockCatalystState;
const ACCESS_TOKEN_TTL = 59 * 60 * 1000;

function getHeaderValue(headers, name) {
  if (!headers) return "";

  if (typeof headers.get === "function") {
    return headers.get(name) || "";
  }

  return headers[name] || headers[name.toLowerCase()] || "";
}

function getPlainHeaders(request) {
  const source = request?.headers;

  if (!source) return {};

  if (typeof source.entries === "function") {
    return Object.fromEntries(source.entries());
  }

  return source;
}

function hasCatalystRuntimeHeaders(request) {
  const headers = request?.headers;

  return Boolean(
    getHeaderValue(headers, "x-zc-projectid") &&
    getHeaderValue(headers, "x-zc-project-key") &&
    getHeaderValue(headers, "x-zc-admin-cred-token"),
  );
}


export async function debugStratus(request) {
  try {
    const app = getCatalystApp(request);
    const stratus = app.stratus();

    console.log("====================================");
    console.log("STRATUS DEBUG");
    console.log("Bucket name:", PROPERTY_IMAGES_BUCKET);
    console.log("====================================");

    const buckets = await stratus.listBuckets();

    console.log("AVAILABLE BUCKETS:", JSON.stringify(buckets, null, 2));

    return buckets;
  } catch (error) {
    console.error("STRATUS DEBUG ERROR:", error);
    throw error;
  }
}
function getCatalystSDK() {
  if (!catalystState.catalystSDK) {
    process.env.X_ZOHO_CATALYST_ACCOUNTS_URL ||=
      process.env.CATALYST_ACCOUNTS_URL ||
      process.env.ZOHO_ACCOUNTS_URL ||
      "https://accounts.zoho.in";

    process.env.X_ZOHO_CATALYST_CONSOLE_URL ||=
      process.env.CATALYST_PROJECT_DOMAIN?.startsWith("http")
        ? process.env.CATALYST_PROJECT_DOMAIN
        : "https://api.catalyst.zoho.in";

    catalystState.catalystSDK = require("zcatalyst-sdk-node");
  }

  return catalystState.catalystSDK;
}


function isPlaceholder(value) {
  return !value || value === "your_zaid" || value === "your_project_key";
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing from .env.local`);
  }

  return value;
}

function readLocalCatalystConfig() {
  if (catalystState.localCatalystConfig !== undefined) {
    return catalystState.localCatalystConfig;
  }

  const fs = require("fs");
  const path = require("path");

  const candidates = [
    path.join(process.cwd(), ".catalystrc"),

    path.join(process.cwd(), "..", ".catalystrc"),
  ];

  for (const filePath of candidates) {
    try {
      const contents = fs.readFileSync(filePath, "utf8");

      const catalystRc = JSON.parse(contents);

      const activeProjectIndex =
        catalystRc?.actives?.project || catalystRc?.defaults?.project;

      const project =
        catalystRc?.projects?.find(
          (item) => Number(item.idx) === Number(activeProjectIndex),
        ) || catalystRc?.projects?.[0];

      if (!project) {
        continue;
      }

      const activeEnvIndex =
        catalystRc?.actives?.env || catalystRc?.defaults?.env;

      const env =
        project?.env?.find(
          (item) => Number(item.idx) === Number(activeEnvIndex),
        ) || project?.env?.[0];

      catalystState.localCatalystConfig = {
        projectId: project.id,

        projectKey: project.domain?.id,

        projectDomain: project.domain?.name,

        environment: env?.name,
      };

      return catalystState.localCatalystConfig;
    } catch {
      // Try the next candidate path.
    }
  }

  catalystState.localCatalystConfig = null;

  return catalystState.localCatalystConfig;
}

export async function getZohoAccessToken() {
  const now = Date.now();
  if (
    catalystState.cachedAccessToken &&
    catalystState.accessTokenExpiresAt &&
    now < catalystState.accessTokenExpiresAt
  ) {
    console.log("Using cached Zoho access token.");

    return catalystState.cachedAccessToken;
  }
  if (catalystState.accessTokenPromise) {
    console.log(
      "Access token generation already in progress. Waiting for existing request...",
    );

    return catalystState.accessTokenPromise;
  }
  catalystState.accessTokenPromise = (async () => {
    try {
      console.log("Generating new Zoho access token...");
      const clientId = getRequiredEnv("CATALYST_CLIENT_ID");
      const clientSecret = getRequiredEnv("CATALYST_CLIENT_SECRET");
      const refreshToken = getRequiredEnv("CATALYST_REFRESH_TOKEN");
      const accountsUrl =
        process.env.CATALYST_ACCOUNTS_URL ||
        process.env.ZOHO_ACCOUNTS_URL ||
        "https://accounts.zoho.in";
      const tokenUrl = `${accountsUrl}/oauth/v2/token`;
      const body = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
      });
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      const data = await response.json();
      if (!response.ok || !data?.access_token) {
        throw new Error(
          `Failed to generate Zoho access token: ${data?.error || JSON.stringify(data)
          }`,
        );
      }

      catalystState.cachedAccessToken = data.access_token;
      catalystState.accessTokenExpiresAt = Date.now() + ACCESS_TOKEN_TTL;
      console.log("New Zoho access token generated.");
      console.log("Zoho access token cached for 59 minutes.");
      return catalystState.cachedAccessToken;
    } finally {
      catalystState.accessTokenPromise = null;
    }
  })();

  return catalystState.accessTokenPromise;
}

function getLocalCatalystApp() {
  if (catalystState.localCatalystApp) {
    console.log("Using cached Catalyst app instance.");

    return catalystState.localCatalystApp;
  }
  const sdk = getCatalystSDK();
  const credential = sdk.credential.refreshToken({
    client_id: getRequiredEnv("CATALYST_CLIENT_ID"),
    client_secret: getRequiredEnv("CATALYST_CLIENT_SECRET"),
    refresh_token: getRequiredEnv("CATALYST_REFRESH_TOKEN"),
  });
  const localConfig = readLocalCatalystConfig();
  const usingLocalProjectKey = isPlaceholder(process.env.CATALYST_PROJECT_KEY);
  const projectId = process.env.CATALYST_PROJECT_ID || localConfig?.projectId;
  const projectKey = usingLocalProjectKey
    ? localConfig?.projectKey
    : process.env.CATALYST_PROJECT_KEY;
  const environment =
    (usingLocalProjectKey
      ? localConfig?.environment
      : process.env.CATALYST_ENVIRONMENT) ||
    process.env.CATALYST_ENVIRONMENT ||
    "Development";
  if (!projectId) {
    throw new Error(
      "CATALYST_PROJECT_ID is missing from .env.local and could not be inferred from .catalystrc",
    );
  }


  if (!projectKey) {
    throw new Error(
      "CATALYST_PROJECT_KEY is missing from .env.local and could not be inferred from .catalystrc",
    );
  }
  console.log("Creating Catalyst app instance...");

  catalystState.localCatalystApp = sdk.initializeApp(
    {
      project_id: projectId,

      project_key: projectKey,

      project_domain:
        process.env.CATALYST_PROJECT_DOMAIN ||
        localConfig?.projectDomain ||
        "api.catalyst.zoho.in",

      environment,

      credential,
    },

    CATALYST_APP_NAME,
  );

  console.log("Catalyst app initialized successfully.");

  return catalystState.localCatalystApp;
}

export function getCatalystApp(request) {
  console.log("Initializing Catalyst SDK...");
  const sdk = getCatalystSDK();
  if (hasCatalystRuntimeHeaders(request)) {
    return sdk.initialize({
      headers: getPlainHeaders(request),
    });
  }
  return getLocalCatalystApp();
}

export function getPropertiesTable(request) {
  console.log("Getting Data Store table:", PROPERTIES_TABLE_ID);

  const app = getCatalystApp(request);

  return app.datastore().table(PROPERTIES_TABLE_ID);
}

export function getPropertyImagesBucket(request) {
  console.log("Getting Stratus bucket:", PROPERTY_IMAGES_BUCKET);

  const app = getCatalystApp(request);

  return app.stratus().bucket(PROPERTY_IMAGES_BUCKET);
}
