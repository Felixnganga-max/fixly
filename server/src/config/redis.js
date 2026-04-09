const { createClient } = require("redis");

let client = null;
let connected = false;

/**
 * Call once at app startup: await connectRedis()
 * All other files import { getRedis } and check for null before using.
 */
async function connectRedis() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  client = createClient({ url });

  client.on("error", (err) => {
    // Don't crash the app if Redis goes down — degrade gracefully
    if (connected) {
      console.error("[Redis] Connection error:", err.message);
    }
    connected = false;
  });

  client.on("ready", () => {
    connected = true;
    console.log("[Redis] Connected:", url);
  });

  try {
    await client.connect();
  } catch (err) {
    console.warn("[Redis] Could not connect — caching disabled:", err.message);
    client = null;
  }
}

/**
 * Returns the Redis client, or null if Redis is unavailable.
 * Always null-check before using: const redis = getRedis(); if (!redis) { ... }
 */
function getRedis() {
  return connected ? client : null;
}

module.exports = { connectRedis, getRedis };
