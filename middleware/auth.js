const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  //check if theres token in the header
  if (!token) {
    return res.status(401).json({ message: "unauthorised" }); //401 is unauthorised
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
      req.token_expired = true;
      next();
    } else {
      return res.status(401).json({ message: "token_invalid" });
    }
  }
};
