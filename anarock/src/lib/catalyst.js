import { createRequire } from "module";
const require = createRequire(import.meta.url);
export const PROPERTIES_TABLE_ID = process.env.CATALYST_PROPERTIES_TABLE_ID || "53125000000038011";
export const PROPERTY_IMAGES_BUCKET = "property-images";
const CATALYST_APP_NAME = "anarock-next-server";
const globalForCatalyst = globalThis;
if (!globalForCatalyst.__anarockCatalystState) {
  globalForCatalyst.__anarockCatalystState = {
    catalystSDK: null,
    localCatalystApp: null,
    localCatalystConfig: undefined,
  };
}

export function getKycTable(request) {
  console.log("Getting Data Store table: KYC");
  const app = getCatalystApp(request);
  return app.datastore().table("KYC");
}

export function getStatsTable(request) {
  console.log("Getting Data Store table: Stats");
  const app = getCatalystApp(request);
  return app.datastore().table("Stats");
}

const catalystState = globalForCatalyst.__anarockCatalystState;
function isPlaceholder(value) {
  return (!value || value === "your_zaid" || value === "your_project_key");
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is missing from .env.local`
    );
  }

  return value;
}

function getCatalystSDK() {
  if (!catalystState.catalystSDK) {
    process.env.X_ZOHO_CATALYST_ACCOUNTS_URL || process.env.CATALYST_ACCOUNTS_URL || process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
    process.env.X_ZOHO_CATALYST_CONSOLE_URL || process.env.CATALYST_PROJECT_DOMAIN?.startsWith("http") ? process.env.CATALYST_PROJECT_DOMAIN : "https://api.catalyst.zoho.in";
    catalystState.catalystSDK = require("zcatalyst-sdk-node");
  }
  return catalystState.catalystSDK;
}
function readLocalCatalystConfig() {
  if (catalystState.localCatalystConfig !== undefined) {
    return catalystState.localCatalystConfig;
  }
  const fs = require("fs");
  const path = require("path");
  const candidates = [path.join(process.cwd(), ".catalystrc"),
  path.join(process.cwd(), "..", ".catalystrc")];
  for (const filePath of candidates) {
    try {
      const contents = fs.readFileSync(filePath, "utf8");
      const catalystRc = JSON.parse(contents);
      const activeProjectIndex = catalystRc?.actives?.project ?? catalystRc?.defaults?.project;
      const project = catalystRc?.projects?.find((item) => Number(item.idx) === Number(activeProjectIndex)) || catalystRc?.projects?.[0];
      if (!project) {
        continue;
      }
      const activeEnvIndex = catalystRc?.actives?.env ?? catalystRc?.defaults?.env;
      const env = project?.env?.find(
        (item) => Number(item.idx) === Number(activeEnvIndex)) ||
        project?.env?.[0];
      catalystState.localCatalystConfig = {
        projectId: project.id,
        projectKey: project.domain?.id,
        projectDomain: project.domain?.name,
        environment: env?.name,
      };
      return catalystState.localCatalystConfig;
    } catch { }
  }
  catalystState.localCatalystConfig = null;
  return null;
}
function createCatalystApp() {
  const sdk = getCatalystSDK();
  const clientId = getRequiredEnv("CATALYST_CLIENT_ID");
  const clientSecret = getRequiredEnv("CATALYST_CLIENT_SECRET");
  const refreshToken = getRequiredEnv("CATALYST_REFRESH_TOKEN");
  const credential = sdk.credential.refreshToken({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const localConfig = readLocalCatalystConfig();
  const usingLocalProjectKey = isPlaceholder(process.env.CATALYST_PROJECT_KEY);
  const projectId = process.env.CATALYST_PROJECT_ID || localConfig?.projectId;
  const projectKey = usingLocalProjectKey ? localConfig?.projectKey : process.env.CATALYST_PROJECT_KEY;
  const environment = (usingLocalProjectKey ? localConfig?.environment : process.env.CATALYST_ENVIRONMENT) || process.env.CATALYST_ENVIRONMENT || "Development";
  const projectDomain = process.env.CATALYST_PROJECT_DOMAIN || localConfig?.projectDomain || "api.catalyst.zoho.in";
  if (!projectId) {
    throw new Error(
      "CATALYST_PROJECT_ID is missing from .env.local and could not be inferred from .catalystrc"
    );
  }

  if (!projectKey) {
    throw new Error(
      "CATALYST_PROJECT_KEY is missing from .env.local and could not be inferred from .catalystrc"
    );
  }

  console.log("Project ID:", projectId);
  console.log("Project Key:", `${String(projectKey).slice(0, 6)}...`);
  console.log("Project Domain:", projectDomain);
  console.log("Environment:", environment);
  console.log("Accounts URL:", process.env.X_ZOHO_CATALYST_ACCOUNTS_URL || process.env.CATALYST_ACCOUNTS_URL || "https://accounts.zoho.in");
  console.log("Refresh Token:", refreshToken ? "CONFIGURED" : "MISSING");
  return sdk.initializeApp(
    {
      project_id: projectId,
      project_key: projectKey,
      project_domain: projectDomain,
      environment,
      credential,
    },
    CATALYST_APP_NAME
  );
}

export function getCatalystApp(request) {
  void request;
  if (catalystState.localCatalystApp) {
    console.log("Using cached Catalyst app instance.");
    return catalystState.localCatalystApp;
  }
  console.log("Creating Catalyst app instance...");
  catalystState.localCatalystApp = createCatalystApp();
  console.log("Catalyst app initialized successfully.");
  return catalystState.localCatalystApp;
}

export function resetCatalystApp() {
  console.warn("Resetting Catalyst app instance.");
  catalystState.localCatalystApp = null;
}

export function getPropertiesTable(request) {
  console.log("Getting Data Store table:", PROPERTIES_TABLE_ID);
  const app = getCatalystApp(request);
  return app
    .datastore()
    .table(PROPERTIES_TABLE_ID);
}

export function getPropertyImagesBucket(request) {
  console.log("Getting Stratus bucket:", PROPERTY_IMAGES_BUCKET);
  const app = getCatalystApp(request);
  return app
    .stratus()
    .bucket(PROPERTY_IMAGES_BUCKET);
}

export async function debugStratus(request) {
  try {
    const app = getCatalystApp(request);
    const stratus = app.stratus();
    const buckets = await stratus.listBuckets();
    console.log("AVAILABLE BUCKETS:", JSON.stringify(buckets, null, 2));
    return buckets;
  } catch (error) {
    console.error("STRATUS DEBUG ERROR:", error);
    throw error;
  }
}