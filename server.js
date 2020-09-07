const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(fileUpload());

// Define Routes

app.use("/api/dev", require("./routes/dev"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/contacts", require("./routes/contacts"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
