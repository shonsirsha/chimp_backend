const express = require("express");
const app = express();
const { serverInfo } = require("./middleware/loggers/logger");

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
console.log(envpath);
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
		console.error("Error connecting to DB:", e);
	});

// Define Routes

app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.AUTH_PORT || 4000;
app.listen(PORT, () => {
	serverInfo.info(`Auth server started on port ${PORT}`);
});

module.exports = app;
