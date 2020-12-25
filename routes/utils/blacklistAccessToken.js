const redis = require("redis");
const { promisify } = require("util");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const SET_ASYNC = promisify(redisClient.set).bind(redisClient);
const blacklistAccessToken = async (uid, access_token) => {
  const y = await SET_ASYNC(access_token, uid, "EX", 30 * 60);
  if (y) {
    return true;
  }
  return false;
};

module.exports = blacklistAccessToken;
