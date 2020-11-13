const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const HDEL_ASYNC = promisify(redisClient.hdel).bind(redisClient);

//delete hash type
const delCache = async (parentKeyName, childKeyName) => {
  const del = await HDEL_ASYNC(parentKeyName, childKeyName); // deleting saved cache
  if (del) {
    return true;
  }
  return false;
};

module.exports = delCache;
