const jwt = require("jsonwebtoken");
const generateAccessToken = (payload) => {
  return jwt.sign(payload, "bigSecret");
};

module.exports = generateAccessToken;
