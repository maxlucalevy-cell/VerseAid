const requestLog = new Map<string, number[]>();

/**
 * In-memory sliding-window rate limiter. Resets on server restart and is
 * per-instance only — not durable across serverless cold starts or multiple
 * instances. A soft usage guard, not a hard security boundary.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxRequests) {
    requestLog.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  return { allowed: true, remaining: maxRequests - timestamps.length };
}
