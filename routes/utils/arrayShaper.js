const arrayShaper = (a) => {
  let u = [...new Set(a)]; // rm any dupe
  u = a.filter(function (e) {
    return e != null && /\S/.test(e);
  }); // rm empty elements "" or "   " or null or undef
  return u;
};

module.exports = arrayShaper;
