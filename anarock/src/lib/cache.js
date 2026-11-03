const globalState = globalThis;
if (!globalState.__anarockMemoryCache) {
  globalState.__anarockMemoryCache = new Map();
}
const cache = globalState.__anarockMemoryCache;
const MAX_CACHE_KEYS = 500;
function pruneCache(excludeKey) {
  if (cache.size <= MAX_CACHE_KEYS) return;
  for (const [key, entry] of cache) {
    if (key === excludeKey || entry?.promise) continue;
    cache.delete(key);
    if (cache.size <= MAX_CACHE_KEYS) break;
  }
}
export async function getOrFetchCache(key, fetcher, ttlMs, options = {}) {
  if (typeof fetcher !== "function") {
    throw new TypeError("Cache fetcher must be a function");
  }

  const safeTtl =
    Number.isFinite(Number(ttlMs)) && Number(ttlMs) > 0 ? Number(ttlMs) : 0;
  const now = Date.now();
  const existing = cache.get(key);
  if (existing?.data !== undefined && existing.expiresAt > now) {
    cache.delete(key);
    cache.set(key, existing);
    return existing.data;
  }
  if (existing?.data !== undefined && options.staleWhileRevalidate !== false) {
    if (!existing.promise) {
      const refreshPromise = Promise.resolve()
        .then(fetcher)
        .then((data) => {
          cache.set(key, {
            data,
            expiresAt: Date.now() + safeTtl,
            promise: null,
          });
          pruneCache(key);
          return data;
        })
        .catch((error) => {
          const current = cache.get(key);
          if (current) {
            current.promise = null;
            cache.set(key, current);
          }
          console.error(
            `[MemoryCache] Background refresh failed for "${String(key)}":`,
            error?.message || "Unknown error",
          );
          return current?.data;
        });
      cache.set(key, {
        ...existing,
        promise: refreshPromise,
      });
    }

    return existing.data;
  }
  if (existing?.promise) {
    return existing.promise;
  }

  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      cache.set(key, {
        data,
        expiresAt: Date.now() + safeTtl,
        promise: null,
      });

      pruneCache(key);
      return data;
    })
    .catch((error) => {
      if (existing?.data !== undefined) {
        cache.set(key, {
          ...existing,
          promise: null,
        });
      } else {
        cache.delete(key);
      }

      throw error;
    });

  cache.set(key, {
    data: existing?.data,
    expiresAt: existing?.expiresAt || 0,
    promise,
  });

  pruneCache(key);

  return promise;
}
export function clearMemoryCache(key) {
  if (key !== undefined) {
    cache.delete(key);
    return;
  }
  cache.clear();
}
export function getMemoryCacheInfo() {
  return Array.from(cache.entries()).map(([key, value]) => ({
    key,
    hasData: value?.data !== undefined,
    expiresAt: value?.expiresAt || 0,
    hasPromise: Boolean(value?.promise),
  }));
}
