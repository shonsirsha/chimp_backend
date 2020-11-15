const jwt = require("jsonwebtoken");
const authfailed = require("./loggers/auth/failed");
const redis = require("redis");
const { promisify } = require("util");
const redisClient = redis.createClient(process.env.REDIS_PORT);
const GET_ASYNC = promisify(redisClient.get).bind(redisClient);
const {
  NO_TOKEN,
  TOKEN_BLACKLISTED,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
} = require("./loggers/auth/types");
module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");

  //check if theres token in the header
  if (!token) {
    authfailed(req, NO_TOKEN);
    return res.status(401).json({ msg: "unauthorised" }); //401 is unauthorised
  }
  let tokenDataFromRedis = await GET_ASYNC(token);
  if (tokenDataFromRedis !== null) {
    // this means that this token is BLACKLISTED
    authfailed(req, TOKEN_BLACKLISTED);
    return res.status(401).json({ msg: "unauthorised" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user_uid = decoded.payload;
    req.token_expired = false;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      //token expired
      //get new token w/ refresh token
      authfailed(req, TOKEN_EXPIRED);
      return res.status(401).json({ msg: "token_expired" });
    } else {
      authfailed(req, TOKEN_INVALID);
      return res.status(401).json({ msg: "token_invalid" });
    }
  }
};
