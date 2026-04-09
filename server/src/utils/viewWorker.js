const MarketplaceListing = require("../models/Marketplacelisting");
const { getRedis } = require("../config/redis");

const VIEW_QUEUE_KEY = "marketplace:view-queue";
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds

let intervalHandle = null;

/**
 * Push a view event onto the Redis queue.
 * Called from the getListingById controller instead of await listing.save().
 * If Redis is unavailable, falls back to a direct DB increment (original behaviour).
 */
async function recordView(listingId) {
  const redis = getRedis();

  if (!redis) {
    // Graceful fallback — direct increment, same as before
    try {
      await MarketplaceListing.findByIdAndUpdate(listingId, {
        $inc: { views: 1 },
      });
    } catch (err) {
      console.warn("[Views] Direct increment failed:", err.message);
    }
    return;
  }

  try {
    await redis.lPush(VIEW_QUEUE_KEY, String(listingId));
  } catch (err) {
    console.warn("[Views] Queue push failed:", err.message);
  }
}

/**
 * Drain the view queue and flush aggregated counts to MongoDB.
 * Runs on a timer started by startViewWorker().
 */
async function flushViews() {
  const redis = getRedis();
  if (!redis) return;

  let events;
  try {
    // Atomically drain the entire list
    const len = await redis.lLen(VIEW_QUEUE_KEY);
    if (!len) return;
    events = await redis.lRange(VIEW_QUEUE_KEY, 0, len - 1);
    await redis.lTrim(VIEW_QUEUE_KEY, len, -1); // remove only what we read
  } catch (err) {
    console.warn("[Views] Queue drain failed:", err.message);
    return;
  }

  if (!events.length) return;

  // Aggregate: { listingId -> count }
  const counts = {};
  for (const id of events) {
    counts[id] = (counts[id] || 0) + 1;
  }

  // Batch-write with Promise.all — one updateOne per unique listing
  const writes = Object.entries(counts).map(([id, n]) =>
    MarketplaceListing.findByIdAndUpdate(id, { $inc: { views: n } }).catch(
      (err) => console.warn(`[Views] DB update failed for ${id}:`, err.message),
    ),
  );

  await Promise.all(writes);
  console.log(
    `[Views] Flushed ${events.length} views across ${Object.keys(counts).length} listings`,
  );
}

/**
 * Start the background flush loop.
 * Call once at app startup: startViewWorker()
 */
function startViewWorker() {
  if (intervalHandle) return; // already running
  intervalHandle = setInterval(flushViews, FLUSH_INTERVAL_MS);
  // Also flush on graceful shutdown
  process.on("SIGTERM", async () => {
    clearInterval(intervalHandle);
    await flushViews();
  });
  process.on("SIGINT", async () => {
    clearInterval(intervalHandle);
    await flushViews();
  });
  console.log(
    `[Views] Worker started — flushing every ${FLUSH_INTERVAL_MS / 1000}s`,
  );
}

module.exports = { recordView, startViewWorker, flushViews };
