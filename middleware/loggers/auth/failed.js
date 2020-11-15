const { tokenErrorLog } = require("../logger");
module.exports = function (req, violation) {
  const { ip, baseUrl, method } = req;
  const str = `${ip} | ${violation} on ${baseUrl} | ${method}`;
  tokenErrorLog.token_error(str);
};
