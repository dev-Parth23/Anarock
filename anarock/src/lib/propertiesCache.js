import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

const g = globalThis;

if (!g.__anarockPropertiesCache) {
  g.__anarockPropertiesCache = {
    data: null,
    timestamp: 0,
    fetchPromise: null,
    byId: new Map(),
    indexes: {
      city: new Map(),
      type: new Map(),
      micromarket: new Map(),
    },
    lastRefreshError: null,
    lastRefreshErrorAt: 0,
  };
}

const state = g.__anarockPropertiesCache;
const parsedTtl = Number(process.env.PROPERTIES_CACHE_TTL || "300");
const CACHE_TTL = Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl * 1000 : 300 * 1000;

function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeMatch(value) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function getFirstValue(property, keys) {
  if (!property) {
    return null;
  }

  for (const key of keys) {
    const value = property[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return null;
}

function getPropertyId(property) {
  return String(
    property?.id ?? property?.rowId ?? property?.ROWID ?? "",
  ).trim();
}

function getPropertyType(property) {
  return normalizeMatch(
    getFirstValue(property, [
      "type",
      "Type",
      "propertyType",
      "PropertyType",
      "officeType",
      "OfficeType",
    ]),
  );
}

function getPropertyCity(property) {
  return normalizeMatch(
    getFirstValue(property, ["city", "City", "cityName", "CityName"]),
  );
}

function getPropertyMicromarket(property) {
  return normalizeMatch(
    getFirstValue(property, [
      "micromarket",
      "Micromarket",
      "microMarket",
      "MicroMarket",
      "micromarketName",
      "MicromarketName",
    ]),
  );
}
async function fetchAllFromCatalyst() {
  console.log("[PropertiesCache] Starting Catalyst refresh...");
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
    const moreRecords = result?.more_records === true || result?.moreRecords === true;
    if (!moreRecords || !newToken || newToken === nextToken) {
      break;
    }
    nextToken = newToken;
  }

  console.log(`[PropertiesCache] Catalyst returned ${rows.length} rows.`);
  const properties = [];
  for (const row of rows) {
    try {
      const property = mapProperty(row);
      if (!property) {
        continue;
      }
      const propertyId = getPropertyId(property);
      if (!propertyId) {
        continue;
      } properties.push(property);
    } catch (error) {
      console.error(
        "[PropertiesCache] Property mapping failed:",
        error?.message || error,
      );
    }
  }
  return properties;
}

function addToIndex(index, value, propertyId) {
  if (!value || !propertyId) {
    return;
  }
  let bucket = index.get(value);
  if (!bucket) {
    bucket = new Set();
    index.set(value, bucket);
  }
  bucket.add(propertyId);
}

function buildIndexes(properties) {
  const byId = new Map();
  const city = new Map();
  const type = new Map();
  const micromarket = new Map();
  for (const property of properties) {
    const id = getPropertyId(property);
    if (!id) {
      continue;
    }
    byId.set(id, property);
    addToIndex(city, getPropertyCity(property), id);
    addToIndex(type, getPropertyType(property), id);
    addToIndex(micromarket, getPropertyMicromarket(property), id);
  }
  return {
    byId,
    indexes: {
      city,
      type,
      micromarket,
    },
  };
}
function startRefresh() {
  if (state.fetchPromise) {
    return state.fetchPromise;
  }

  state.fetchPromise = fetchAllFromCatalyst()
    .then((properties) => {
      const built = buildIndexes(properties);
      state.data = properties;

      state.byId = built.byId;

      state.indexes = built.indexes;

      state.timestamp = Date.now();

      state.lastRefreshError = null;

      state.lastRefreshErrorAt = 0;

      console.log(`[PropertiesCache] Cached ${properties.length} properties.`);

      return properties;
    })
    .catch((error) => {
      state.lastRefreshError = error?.message || String(error);

      state.lastRefreshErrorAt = Date.now();

      console.error(
        "[PropertiesCache] Refresh failed:",
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
  if (state.data && now - state.timestamp < CACHE_TTL) {
    return state.data;
  }
  if (state.data) {
    if (!state.fetchPromise) {
      startRefresh().catch(() => { });
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

export async function getPropertyCandidates({
  city = "",
  type = "",
  micromarkets = [],
} = {}) {
  const properties = await getAllProperties();

  const normalizedCity = normalizeMatch(city);

  const normalizedType = normalizeMatch(type);

  const normalizedMicromarkets = Array.isArray(micromarkets)
    ? micromarkets.map(normalizeMatch).filter(Boolean)
    : [];
  if (
    !normalizedCity &&
    !normalizedType &&
    normalizedMicromarkets.length === 0
  ) {
    return properties;
  }

  const candidateSets = [];
  if (normalizedCity) {
    const set = state.indexes.city.get(normalizedCity);

    if (!set) {
      return [];
    }

    candidateSets.push(set);
  }
  if (normalizedType) {
    const set = state.indexes.type.get(normalizedType);

    if (!set) {
      return [];
    }

    candidateSets.push(set);
  }

  if (normalizedMicromarkets.length > 0) {
    const micromarketIds = new Set();

    for (const market of normalizedMicromarkets) {
      const exactSet = state.indexes.micromarket.get(market);

      if (!exactSet) {
        continue;
      }

      for (const id of exactSet) {
        micromarketIds.add(id);
      }
    }

    if (micromarketIds.size === 0) {
      for (const [indexedMarket, ids] of state.indexes.micromarket) {
        const matchesRequestedMarket = normalizedMicromarkets.some(
          (requestedMarket) =>
            indexedMarket.includes(requestedMarket) ||
            requestedMarket.includes(indexedMarket),
        );

        if (!matchesRequestedMarket) {
          continue;
        }

        for (const id of ids) {
          micromarketIds.add(id);
        }
      }
    }

    if (micromarketIds.size === 0) {
      return [];
    }

    candidateSets.push(micromarketIds);
  }

  candidateSets.sort((a, b) => a.size - b.size);

  const base = candidateSets[0];

  const result = [];

  for (const id of base) {
    let matchesAll = true;

    for (let index = 1; index < candidateSets.length; index++) {
      if (!candidateSets[index].has(id)) {
        matchesAll = false;
        break;
      }
    }

    if (!matchesAll) {
      continue;
    }

    const property = state.byId.get(id);

    if (property) {
      result.push(property);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export function getPropertiesCacheInfo() {
  const now = Date.now();

  const isStale = state.data !== null && now - state.timestamp >= CACHE_TTL;

  return {
    count: state.data?.length ?? 0,

    cachedAt: state.timestamp ? new Date(state.timestamp).toISOString() : null,

    isFresh: state.data !== null && !isStale,

    isStale,

    refreshInProgress: Boolean(state.fetchPromise),

    lastRefreshError: state.lastRefreshError,

    lastRefreshErrorAt: state.lastRefreshErrorAt
      ? new Date(state.lastRefreshErrorAt).toISOString()
      : null,

    ttlSeconds: CACHE_TTL / 1000,

    indexes: {
      cities: state.indexes.city.size,

      types: state.indexes.type.size,

      micromarkets: state.indexes.micromarket.size,
    },
  };
}
