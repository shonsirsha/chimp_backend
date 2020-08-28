const express = require("express");
const path = require("path");

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/dev", require("./routes/dev"));
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
