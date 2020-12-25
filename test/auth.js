const request = require("supertest");
const authapp = require("../authServer.js");
let envpath;
if (process.env.NODE_ENV === "development") {
	envpath = "./.env";
} else if (process.env.NODE_ENV == "production") {
	envpath = "../../env/.env";
} else if (process.env.NODE_ENV === "test-production") {
	envpath = "../../env/.test.env";
} else if (process.env.NODE_ENV === "test-development") {
	envpath = "./.test.env";
}
require("dotenv").config({
	path: envpath,
});
describe("Auth tests", function () {
	it("failed signing up", function (done) {
		request(authapp)
			.post("/api/auth/sign-up")
			.send({
				email: "sean@2mail.com",
				password: "",
			})
			.expect(400, done);
	});

	it("failed signing in", function (done) {
		request(authapp)
			.post("/api/auth/sign-in")
			.send({
				email: "sean@2mail.com",
				password: "12345",
			})
			.expect(400, done);
	});

	it("Failed signing out", function (done) {
		request(authapp)
			.post("/api/auth/sign-out")
			.send({
				user_uid: "",
			})
			.expect(401, done);
	});
});
