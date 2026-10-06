
import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

const g = globalThis;

if (!g.__anarockPropertiesCache) {
  g.__anarockPropertiesCache = {
    data: null,
    timestamp: 0,
    fetchPromise: null,
    byId: new Map(),
  };
}

const state = g.__anarockPropertiesCache;
const configuredTtlSeconds = Number(process.env.PROPERTIES_CACHE_TTL || "300");
const CACHE_TTL_SECONDS =
  Number.isFinite(configuredTtlSeconds) && configuredTtlSeconds > 0
    ? configuredTtlSeconds
    : 300;

const CACHE_TTL = CACHE_TTL_SECONDS * 1_000;
async function fetchAllFromCatalyst() {
  console.log(
    `[PropertiesCache] Cold/refresh fetch started. TTL=${CACHE_TTL_SECONDS}s`,
  );
  const table = await getPropertiesTable();
  const rows = [];
  let nextToken = null;
  while (true) {
    const options = {
      maxRows: 100,
    };

    if (nextToken) {
      options.nextToken = nextToken;
    }
    const result = await table.getPagedRows(options);
    const page = Array.isArray(result?.data) ? result.data : [];
    rows.push(...page);
    const newToken = result?.next_token || result?.nextToken || null;
    const more = result?.more_records === true || result?.moreRecords === true;
    if (!more || !newToken || newToken === nextToken) {
      break;
    }
    nextToken = newToken;
  }
  console.log(
    `[PropertiesCache] Fetched ${rows.length} raw rows from Catalyst.`,
  );
  const properties = rows
    .map((row) => {
      try {
        return mapProperty(row);
      } catch (error) {
        console.error(
          "[PropertiesCache] Failed to map property row:",
          error?.message || error,
        );

        return null;
      }
    })
    .filter(Boolean);
  if (
    properties.length === 0 &&
    rows.length === 0 &&
    state.data &&
    state.data.length > 0
  ) {
    throw new Error(
      "Catalyst returned an empty property dataset while a non-empty cache already exists.",
    );
  }

  return properties;
}

function buildIndex(properties) {
  const map = new Map();
  for (const property of properties) {
    const id = String(property?.id ?? "").trim();
    const rowId = String(property?.rowId ?? "").trim();
    if (id) {
      map.set(id, property);
    }
    if (rowId && rowId !== id) {
      map.set(rowId, property);
    }
  }

  return map;
}

function startRefresh() {
  if (state.fetchPromise) {
    return state.fetchPromise;
  }

  state.fetchPromise = fetchAllFromCatalyst()
    .then((properties) => {
      const nextData = Array.isArray(properties) ? properties : [];
      const nextIndex = buildIndex(nextData);
      state.data = nextData;
      state.byId = nextIndex;
      state.timestamp = Date.now();

      console.log(`[PropertiesCache] Cached ${nextData.length} properties.`);

      return nextData;
    })
    .catch((error) => {
      console.error("[PropertiesCache] Fetch/refresh failed:",
        error?.message || error,
      );

      throw error;
    })
    .finally(() => {
      state.fetchPromise = null;
    });

  return state.fetchPromise;
}
export async function getAllProperties() {
  const now = Date.now();
  const hasData = Array.isArray(state.data);
  const age = hasData && state.timestamp ? now - state.timestamp : Infinity;
  const isFresh = hasData && state.timestamp > 0 && age < CACHE_TTL;
  if (isFresh) {
    return state.data;
  }

  if (hasData) {
    if (!state.fetchPromise) {
      startRefresh().catch(() => {
      });
    }

    return state.data;
  }
  return startRefresh();
}

export async function getPropertyById(id) {
  const targetId = String(id ?? "").trim();

  if (!targetId) {
    return null;
  }
  await getAllProperties();
  return state.byId.get(targetId) ?? null;
}

export function getPropertiesCacheInfo() {
  const now = Date.now();
  const hasData = Array.isArray(state.data);
  const age = hasData && state.timestamp ? now - state.timestamp : null;
  return {
    count: state.data?.length ?? 0,
    cachedAt: state.timestamp ? new Date(state.timestamp).toISOString() : null,
    ageMs: age,
    ttlMs: CACHE_TTL,
    ttlSeconds: CACHE_TTL_SECONDS,
    isFresh: hasData && state.timestamp > 0 && age < CACHE_TTL,
    isStale: hasData && state.timestamp > 0 && age >= CACHE_TTL,
    refreshInProgress: Boolean(state.fetchPromise),
  };
}
