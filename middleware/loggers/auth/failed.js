module.exports = function (req, violation) {
  const { ip, baseUrl, method } = req;
  const str = `${ip} | ${violation} on ${baseUrl} | ${method}`;
  console.log(str);
};
