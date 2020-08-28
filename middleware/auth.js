const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  //check if theres token in the header
  if (!token) {
    return res.status(401).json({ message: "unauthorised/no token found" }); //401 is unauthorised
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user_uid = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid " });
  }
};
