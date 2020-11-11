const express = require("express");
const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
require("dotenv").config({
  path: `${1 === `development` ? `./.env` : `../env/.env`}`,
});

// Define Routes

app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth server started on port ${PORT}`);
  console.log(process.env);
});

module.exports = app;
