const { getRedis } = require("../config/redis");

const DEFAULT_TTL = 60; // seconds

/**
 * cacheMiddleware(ttl?)
 *
 * Usage on a GET route:
 *   router.get("/", cacheMiddleware(60), getAllListings);
 *
 * The cache key is built from the full request URL (path + query string),
 * so every unique filter/sort/page combo gets its own entry.
 */
function cacheMiddleware(ttl = DEFAULT_TTL) {
  return async (req, res, next) => {
    const redis = getRedis();
    if (!redis) return next(); // Redis unavailable — skip cache transparently

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("[Cache] GET error:", err.message);
      return next();
    }

    // Intercept res.json so we can store the response before sending
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await redis.setEx(key, ttl, JSON.stringify(body));
        } catch (err) {
          console.warn("[Cache] SET error:", err.message);
        }
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

/**
 * invalidateCache(patterns)
 *
 * Call after writes (create, update, delete) to bust relevant cache keys.
 * patterns: array of glob strings, e.g. ["cache:/api/marketplace*"]
 *
 * Usage in a controller:
 *   await invalidateCache(["cache:/api/marketplace*", "cache:/api/marketplace/stats*"]);
 */
async function invalidateCache(patterns = []) {
  const redis = getRedis();
  if (!redis || !patterns.length) return;

  try {
    const pipeline = redis.multi();
    for (const pattern of patterns) {
      // SCAN is non-blocking; safe for production
      let cursor = 0;
      do {
        const { cursor: next, keys } = await redis.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = next;
        if (keys.length) pipeline.del(keys);
      } while (cursor !== 0);
    }
    await pipeline.exec();
  } catch (err) {
    console.warn("[Cache] Invalidation error:", err.message);
  }
}

module.exports = { cacheMiddleware, invalidateCache };
