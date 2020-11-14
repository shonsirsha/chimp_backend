const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const checkCacheIfExists = require("./general/checkCacheExists");
const setCache = require("./general/setCache");
const delCache = require("./general/delCache");

const setLastCacheTime = async (parentKeyName, childKeyName) => {
  const cacheExists = await checkCacheIfExists(parentKeyName, childKeyName);
  // if no cache set yet
  if (!cacheExists) {
    return setCache(parentKeyName, [childKeyName, Date.now()]); //set cache
  }
  const del = await delCache(parentKeyName, childKeyName);
  if (del) {
    return setCache(parentKeyName, [childKeyName, Date.now()]); //set cache
  }
  return false;
};

module.exports = setLastCacheTime;
