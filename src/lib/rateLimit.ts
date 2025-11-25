type Entry = { ts: number };

const buckets = new Map<string, Entry[]>();

/**
 * Very simple in-memory rate limiter (per user + route).
 * Not production-ready for multi-instance, but prevents accidental spam in dev/demo.
 */
export function assertRateLimit(userId: string, route: string, limit = 30, windowMs = 60_000) {
  const key = `${userId}:${route}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  const arr = buckets.get(key)?.filter((e) => e.ts >= windowStart) ?? [];
  if (arr.length >= limit) {
    const retryAfter = Math.ceil((arr[0]?.ts + windowMs - now) / 1000);
    const error = new Error("rate_limited") as Error & { status?: number; retryAfter?: number };
    error.status = 429;
    error.retryAfter = retryAfter;
    throw error;
  }
  arr.push({ ts: now });
  buckets.set(key, arr);
}
