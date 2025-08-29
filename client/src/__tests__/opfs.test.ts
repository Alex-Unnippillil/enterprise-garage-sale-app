import { isExpired, DEFAULT_MAX_AGE_MS } from "@/lib/opfs";

interface Entry { path: string; deletedAt: number }

describe("isExpired", () => {
  it("flags entries older than max age", () => {
    const now = Date.now();
    const old: Entry = { path: "old", deletedAt: now - DEFAULT_MAX_AGE_MS - 1000 };
    const fresh: Entry = { path: "fresh", deletedAt: now - 1000 };
    expect(isExpired(old, now)).toBe(true);
    expect(isExpired(fresh, now)).toBe(false);
  });
});
