const jwt = require("jsonwebtoken");
const generateAccessToken = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: 35 });
};

module.exports = generateAccessToken;
