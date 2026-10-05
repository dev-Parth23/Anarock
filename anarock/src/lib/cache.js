const globalState = globalThis;
const MAX_CACHE_ENTRIES = 100;

if (!globalState.__anarockMemoryCache) {
  globalState.__anarockMemoryCache = new Map();
}
const cache = globalState.__anarockMemoryCache;

function evictIfNeeded() {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey === undefined) break;
    cache.delete(firstKey);
  }
}

export async function getOrFetchCache(key, fetcher, ttlMs, options = {}) {
  const now = Date.now();
  const existing = cache.get(key);

  if (existing?.data !== undefined && existing.expiresAt > now) return existing.data;

  if (existing?.data !== undefined && options.staleWhileRevalidate !== false) {
    if (!existing.promise) {
      existing.promise = Promise.resolve()
        .then(fetcher)
        .then((data) => {
          cache.delete(key);
          cache.set(key, { data, expiresAt: Date.now() + ttlMs, promise: null });
          evictIfNeeded();
          return data;
        })
        .catch((error) => {
          const current = cache.get(key);
          if (current) current.promise = null;
          console.error("[MemoryCache] Background refresh failed for " + key + ":", error?.message || error);
          return current?.data;
        });
    }
    return existing.data;
  }

  if (existing?.promise) return existing.promise;

  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      cache.delete(key);
      cache.set(key, { data, expiresAt: Date.now() + ttlMs, promise: null });
      evictIfNeeded();
      return data;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { data: existing?.data, expiresAt: existing?.expiresAt || 0, promise });
  evictIfNeeded();
  return promise;
}

export function clearMemoryCache(key) {
  if (key) cache.delete(key);
  else cache.clear();
}

export function getMemoryCacheInfo() {
  return Array.from(cache.entries()).map(([key, value]) => ({
    key,
    hasData: value?.data !== undefined,
    expiresAt: value?.expiresAt || 0,
    hasPromise: Boolean(value?.promise),
  }));
}
