const { authSuccessLog } = require("../logger");
module.exports = function (req, violation) {
  const { ip, originalUrl, method } = req;
  const d = new Date();
  const n = d.toISOString();
  const str = `${n} | ${originalUrl} | ${method} | platform ${process.platform} - IP address ${ip}`;
  authSuccessLog.auth_success(str);
};
