const { transports, format, createLogger } = require("winston");

const myCustomLevels = {
  levels: {
    info: 0,
    token_error: 1,
  },
};
let filePathPrefix;

if (process.env.NODE_ENV === "development") filePathPrefix = "./logs";
else filePathPrefix = "../logs";
const infoLog = createLogger({
  levels: myCustomLevels.levels,
  format: format.simple(),
  transports: [
    new transports.File({
      filename: `${filePathPrefix}/info.log`,
      level: "info",
    }),
  ],
});

const tokenErrorLog = createLogger({
  levels: myCustomLevels.levels,
  format: format.simple(),
  transports: [
    new transports.File({
      filename: `${filePathPrefix}/token_errors.log`,
      level: "token_error",
    }),
  ],
});

module.exports = { infoLog, tokenErrorLog };
