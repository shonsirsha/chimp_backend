const { tokenErrorLog } = require("../logger");
module.exports = function (req, violation) {
  const { ip, baseUrl, method } = req;
  const d = new Date();
  const n = d.toISOString();
  const str = `${n} | ${violation} on ${baseUrl} | ${method} | platform ${process.platform} on address ${ip}`;
  tokenErrorLog.token_error(str);
};
