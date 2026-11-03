const { redis } = require("../config/redis");

const MEMORY_TTL_MS = 60 * 1000;
const MEMORY_MAX = 200;
const memory = new Map();

const memGet = (key) => {
  const entry = memory.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return entry.body;
};

const memSet = (key, body) => {
  if (memory.size >= MEMORY_MAX) {
    memory.delete(memory.keys().next().value);
  }
  memory.set(key, { body, expires: Date.now() + MEMORY_TTL_MS });
};

const sendJsonString = (res, body) => {
  res.status(200).type("application/json").send(body);
};

const cacheResponse =
  (PREFIX, ttl = 300) =>
  async (req, res, next) => {
    const key = `${PREFIX}${req.originalUrl}`;

    const inMemory = memGet(key);
    if (inMemory) {
      res.set("X-Cache", "HIT-MEMORY");
      return sendJsonString(res, inMemory);
    }

    try {
      const cached = await redis.get(key);
      if (cached) {
        const serialized =
          typeof cached === "string" ? cached : JSON.stringify(cached);
        memSet(key, serialized);
        res.set("X-Cache", "HIT-REDIS");
        return sendJsonString(res, serialized);
      }
    } catch (err) {
      console.error("Redis get failed:", err.message);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        memSet(key, JSON.stringify(body));
        redis.set(key, body, { ex: ttl }).catch((err) => {
          console.error("Redis set failed:", err.message);
        });
      }
      return originalJson(body);
    };

    res.set("X-Cache", "MISS");
    next();
  };

const clearCache = async (PREFIX) => {
  memory.clear();
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, {
      match: `${PREFIX}*`,
      count: 100,
    });
    cursor = String(next);
    if (keys.length) await redis.del(...keys);
  } while (cursor !== "0");
};

const invalidateCache = (PREFIX) => (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode < 400) {
      clearCache(PREFIX).catch((err) => {
        console.error("Redis invalidate failed:", err.message);
      });
    }
  });
  next();
};

module.exports = { cacheResponse, invalidateCache };
