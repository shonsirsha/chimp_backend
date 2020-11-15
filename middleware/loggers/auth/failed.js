const { authErrorLog } = require("../logger");
module.exports = function (req, violation) {
  const { ip, originalUrl, method } = req;
  const d = new Date();
  const n = d.toISOString();
  const str = `${n} | ${violation} on ${originalUrl} | ${method} | platform ${process.platform} - IP address ${ip}`;
  authErrorLog.auth_error(str);
};
