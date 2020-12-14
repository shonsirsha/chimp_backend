const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const { serverInfo } = require("./middleware/loggers/logger");
// Init Middleware
app.use(express.json({ extended: false }));
app.use(fileUpload());
let envpath;
if (process.env.NODE_ENV === "development") {
  envpath = "./.env";
} else if (process.env.NODE_ENV == "production") {
  envpath = "../env/.env";
} else if (process.env.NODE_ENV === "test-production") {
  envpath = "../env/.test.env";
} else if (process.env.NODE_ENV === "test-development") {
  envpath = "../env/.test.env";
} else if (process.env.NODE_ENV === "dev-remote") {
  envpath = "../env/.dev.env";
}

require("dotenv").config({
  path: envpath,
});

// Define Routes

app.use("/api/dev", require("./routes/dev"));
app.use("/api/user", require("./routes/user"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/company", require("./routes/company"));
app.use("/api/companies", require("./routes/companies"));

const PORT = process.env.REST_PORT || 5000;
app.listen(PORT, () => {
  serverInfo.info(`REST API server started on port ${PORT}`);
});

module.exports = app;
