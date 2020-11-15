const { transports, format, createLogger } = require("winston");
const myCustomLevels = {
  levels: {
    info: 0,
    token_error: 1,
  },
  colors: {
    foo: "blue",
    bar: "green",
    baz: "yellow",
    foobar: "red",
  },
};
let filePathPrefix;

if (process.env.NODE_ENV === "development") filePathPrefix = "./";
else filePathPrefix = "../";

const logger = createLogger({
  levels: myCustomLevels.levels,
  format: format.simple(),
  transports: [
    new transports.File({
      filename: `info.log`,
      level: "info",
    }),
    new transports.File({
      filename: "token_errors.log",
      level: "token_error",
    }),
  ],
});

module.exports = logger;
