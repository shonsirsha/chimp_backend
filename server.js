const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(fileUpload());

require("dotenv").config({
  path: `${process.env.NODE_ENV === `development` ? `./.env` : `../env/.env`}`,
});

// Define Routes

app.use("/api/dev", require("./routes/dev"));
app.use("/api/admin", require("./routes/admin"));
// app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/company", require("./routes/company"));
app.use("/api/companies", require("./routes/companies"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`REST API server started on port ${PORT}`);
  console.log(process.env.NODE_ENV);
});

module.exports = app;
