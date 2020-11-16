const express = require("express");
const app = express();
const { serverInfo } = require("./middleware/loggers/logger");
require("dotenv").config({
  path: `${process.env.NODE_ENV === `development` ? `./.env` : `../env/.env`}`,
});
const sequelize = require("./db/db2");

// Init Middleware
app.use(express.json({ extended: false }));

//Test db connection
sequelize
  .authenticate()
  .then(() => {
    console.log(`Database connected. DB: ${process.env.DB_DATABASE_NAME}`);
  })
  .catch((e) => {
    console.error("Error connectiong to DB:", e);
  });

// Define Routes

app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  serverInfo.info(`Auth server started on port ${PORT}`);
});

module.exports = app;
