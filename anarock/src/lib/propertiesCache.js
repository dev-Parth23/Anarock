/**
 * propertiesCache.js
 *
 * Central in-memory cache for all properties.
 *
 * Architecture:
 *
 * Browser
 *    ↓
 * /api/properties
 *    ↓
 * propertiesCache
 *    ↓
 * Catalyst DataStore ONLY when cache is cold/stale
 *
 * Important:
 * - Cache is shared by all requests handled by the same Node process.
 * - Concurrent cold requests share ONE Catalyst fetch.
 * - Stale data is served immediately while one background refresh runs.
 * - Property detail lookup is O(1) through byId.
 * - City/type/micromarket indexes reduce filtering work.
 *
 * This is intentionally platform-neutral and does not depend on Vercel APIs.
 */

import { getPropertiesTable } from "@/lib/catalyst";
import { mapProperty } from "@/lib/propertyMapper";

// ---------------------------------------------------------------------------
// Global singleton
// ---------------------------------------------------------------------------

const g = globalThis;

if (!g.__anarockPropertiesCache) {
  g.__anarockPropertiesCache = {
    data: null,
    timestamp: 0,
    fetchPromise: null,

    // O(1) property lookup
    byId: new Map(),

    // Search indexes
    indexes: {
      city: new Map(),
      type: new Map(),
      micromarket: new Map(),
    },

    // Cache statistics
    lastRefreshError: null,
    lastRefreshErrorAt: 0,
  };
}

const state = g.__anarockPropertiesCache;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const parsedTtl = Number(
  process.env.PROPERTIES_CACHE_TTL || "300"
);

const CACHE_TTL =
  Number.isFinite(parsedTtl) && parsedTtl > 0
    ? parsedTtl * 1000
    : 300 * 1000;

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function normalize(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeMatch(value) {
  return normalize(value).replace(
    /[^a-z0-9]/g,
    ""
  );
}

// ---------------------------------------------------------------------------
// Property field helpers
// ---------------------------------------------------------------------------

function getFirstValue(property, keys) {
  if (!property) {
    return null;
  }

  for (const key of keys) {
    const value = property[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
}

function getPropertyId(property) {
  return String(
    property?.id ??
    property?.rowId ??
    property?.ROWID ??
    ""
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
    ])
  );
}

function getPropertyCity(property) {
  return normalizeMatch(
    getFirstValue(property, [
      "city",
      "City",
      "cityName",
      "CityName",
    ])
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
    ])
  );
}

// ---------------------------------------------------------------------------
// Catalyst fetch
// ---------------------------------------------------------------------------

async function fetchAllFromCatalyst() {
  console.log(
    "[PropertiesCache] Starting Catalyst refresh..."
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

    const result =
      await table.getPagedRows(options);

    const page =
      Array.isArray(result?.data)
        ? result.data
        : [];

    rows.push(...page);

    const newToken =
      result?.next_token ||
      result?.nextToken ||
      null;

    const moreRecords =
      result?.more_records === true ||
      result?.moreRecords === true;

    if (
      !moreRecords ||
      !newToken ||
      newToken === nextToken
    ) {
      break;
    }

    nextToken = newToken;
  }

  console.log(
    `[PropertiesCache] Catalyst returned ${rows.length} rows.`
  );

  const properties = [];

  for (const row of rows) {
    try {
      const property = mapProperty(row);

      if (property) {
        properties.push(property);
      }
    } catch (error) {
      console.error(
        "[PropertiesCache] Property mapping failed:",
        error?.message || error
      );
    }
  }

  return properties;
}

// ---------------------------------------------------------------------------
// Index helpers
// ---------------------------------------------------------------------------

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

    // O(1) lookup
    byId.set(id, property);

    // Search indexes
    addToIndex(
      city,
      getPropertyCity(property),
      id
    );

    addToIndex(
      type,
      getPropertyType(property),
      id
    );

    addToIndex(
      micromarket,
      getPropertyMicromarket(property),
      id
    );
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

// ---------------------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------------------

function startRefresh() {
  if (state.fetchPromise) {
    return state.fetchPromise;
  }

  state.fetchPromise =
    fetchAllFromCatalyst()
      .then((properties) => {
        const built =
          buildIndexes(properties);

        state.data = properties;

        state.byId =
          built.byId;

        state.indexes =
          built.indexes;

        state.timestamp =
          Date.now();

        state.lastRefreshError =
          null;

        state.lastRefreshErrorAt =
          0;

        console.log(
          `[PropertiesCache] Cached ${properties.length} properties.`
        );

        return properties;
      })
      .catch((error) => {
        state.lastRefreshError =
          error?.message ||
          String(error);

        state.lastRefreshErrorAt =
          Date.now();

        console.error(
          "[PropertiesCache] Refresh failed:",
          error?.message || error
        );

        throw error;
      })
      .finally(() => {
        state.fetchPromise = null;
      });

  return state.fetchPromise;
}

// ---------------------------------------------------------------------------
// Public: all properties
// ---------------------------------------------------------------------------

export async function getAllProperties() {
  const now = Date.now();

  // Fresh
  if (
    state.data &&
    now - state.timestamp < CACHE_TTL
  ) {
    return state.data;
  }

  // Stale-while-revalidate
  if (state.data) {
    if (!state.fetchPromise) {
      startRefresh().catch(() => { });
    }

    return state.data;
  }

  // Cold start
  return startRefresh();
}

// ---------------------------------------------------------------------------
// Public: O(1) property lookup
// ---------------------------------------------------------------------------

export async function getPropertyById(id) {
  const targetId =
    String(id ?? "").trim();

  if (!targetId) {
    return null;
  }

  await getAllProperties();

  return (
    state.byId.get(targetId) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Public: candidate filtering
//
// Used by /api/properties.
//
// Instead of:
//
//   4000 properties
//      ↓
//   city filter
//      ↓
//   type filter
//      ↓
//   micromarket filter
//
// we use indexes:
//
//   city → matching IDs
//   type → matching IDs
//   micromarket → matching IDs
//
// and only send the smallest candidate set to the API route.
// ---------------------------------------------------------------------------

export async function getPropertyCandidates({
  city = "",
  type = "",
  micromarkets = [],
} = {}) {
  const properties =
    await getAllProperties();

  if (
    !city &&
    !type &&
    (!Array.isArray(micromarkets) ||
      micromarkets.length === 0)
  ) {
    return properties;
  }

  const candidateSets = [];

  // City
  if (city) {
    const set =
      state.indexes.city.get(
        normalizeMatch(city)
      );

    if (!set) {
      return [];
    }

    candidateSets.push(set);
  }

  // Type
  if (type) {
    const set =
      state.indexes.type.get(
        normalizeMatch(type)
      );

    if (!set) {
      return [];
    }

    candidateSets.push(set);
  }

  // Micromarkets are OR-ed together
  if (
    Array.isArray(micromarkets) &&
    micromarkets.length > 0
  ) {
    const micromarketIds =
      new Set();

    for (const market of micromarkets) {
      const set =
        state.indexes.micromarket.get(
          normalizeMatch(market)
        );

      if (!set) {
        continue;
      }

      for (const id of set) {
        micromarketIds.add(id);
      }
    }

    if (micromarketIds.size === 0) {
      return [];
    }

    candidateSets.push(
      micromarketIds
    );
  }

  // Start with the smallest set.
  candidateSets.sort(
    (a, b) => a.size - b.size
  );

  const base =
    candidateSets[0];

  const result = [];

  for (const id of base) {
    let matchesAll = true;

    for (
      let index = 1;
      index < candidateSets.length;
      index++
    ) {
      if (
        !candidateSets[index].has(id)
      ) {
        matchesAll = false;
        break;
      }
    }

    if (matchesAll) {
      const property =
        state.byId.get(id);

      if (property) {
        result.push(property);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export function getPropertiesCacheInfo() {
  const now = Date.now();

  const isStale =
    state.data !== null &&
    now - state.timestamp >=
    CACHE_TTL;

  return {
    count:
      state.data?.length ?? 0,

    cachedAt:
      state.timestamp
        ? new Date(
          state.timestamp
        ).toISOString()
        : null,

    isFresh:
      state.data !== null &&
      !isStale,

    isStale,

    refreshInProgress:
      Boolean(
        state.fetchPromise
      ),

    lastRefreshError:
      state.lastRefreshError,

    lastRefreshErrorAt:
      state.lastRefreshErrorAt
        ? new Date(
          state.lastRefreshErrorAt
        ).toISOString()
        : null,

    ttlSeconds:
      CACHE_TTL / 1000,

    indexes: {
      cities:
        state.indexes.city.size,

      types:
        state.indexes.type.size,

      micromarkets:
        state.indexes.micromarket.size,
    },
  };
}