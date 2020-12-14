const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const HSET_ASYNC = promisify(redisClient.hset).bind(redisClient);

// set hash type
const setCache = async (parentKeyName, childKeyName) => {
  const cacheSet = await HSET_ASYNC(parentKeyName, childKeyName); // set cache;
  if (cacheSet) {
    return true;
  }
  return false;
};

module.exports = setCache;
