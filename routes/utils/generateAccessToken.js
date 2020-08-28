const jwt = require("jsonwebtoken");
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

module.exports = generateAccessToken;
