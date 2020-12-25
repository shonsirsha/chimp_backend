const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const HGET_ASYNC = promisify(redisClient.hget).bind(redisClient);

const checkDataExists = async (parentKeyName, childKeyName) => {
  const data = await HGET_ASYNC(parentKeyName, childKeyName);
  if (data === null) {
    return false;
  }
  return true;
};

module.exports = checkDataExists;
