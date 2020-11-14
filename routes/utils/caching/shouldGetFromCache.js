const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const getCache = require("./general/getCache");

const shoudGetFromCache = async (lastWriteKey, lastReadKey, user_uid) => {
  //LR > LW || LR === LW -> get from cache
  // LR < LW -> get from db
  let lw = await getCache(lastWriteKey, user_uid);
  let lr = await getCache(lastReadKey, user_uid);
  if (lr === null || lw === null) return false;

  lw = parseInt(lw);
  lr = parseInt(lr);

  if (lr === lw || lr > lw) return true;
  if (lr < lw) return false;
};

module.exports = shoudGetFromCache;
