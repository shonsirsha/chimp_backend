const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const HGET_ASYNC = promisify(redisClient.hget).bind(redisClient);

const getCache = async (parentKeyName, childKeyName) => {
  const data = await HGET_ASYNC(parentKeyName, childKeyName);
  return data;
};

module.exports = getCache;
