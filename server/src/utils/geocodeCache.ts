export type Coordinates = [number, number];

interface CacheEntry {
  value: Coordinates;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export const getCacheKey = (
  address: string,
  city: string,
  country: string,
  postalCode: string,
): string => `${address}|${city}|${country}|${postalCode}`.toLowerCase();

export const getCachedCoordinates = (key: string): Coordinates | undefined => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
};

export const setCachedCoordinates = (
  key: string,
  value: Coordinates,
  ttlMs: number = DEFAULT_TTL_MS,
): void => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const clearCache = (): void => {
  cache.clear();
};

export default {
  getCacheKey,
  getCachedCoordinates,
  setCachedCoordinates,
  clearCache,
};
