const { transports, format, createLogger } = require("winston");

const myCustomLevels = {
  levels: {
    info: 0,
    auth_error: 1,
    auth_success: 2,
  },
};
let filePathPrefix;

if (process.env.NODE_ENV === "development") filePathPrefix = "./logs";
else filePathPrefix = "../logs";
const serverInfo = createLogger({
  levels: myCustomLevels.levels,
  format: format.simple(),
  transports: [
    new transports.File({
      filename: `${filePathPrefix}/info.log`,
      level: "info",
    }),
  ],
});

const authErrorLog = createLogger({
  levels: myCustomLevels.levels,
  format: format.simple(),
  transports: [
    new transports.File({
      filename: `${filePathPrefix}/auth_errors.log`,
      level: "auth_error",
    }),
  ],
});

const authSuccessLog = createLogger({
  levels: myCustomLevels.levels,
  format: format.simple(),
  transports: [
    new transports.File({
      filename: `${filePathPrefix}/auth_success.log`,
      level: "auth_success",
    }),
  ],
});

module.exports = { serverInfo, authErrorLog, authSuccessLog };
