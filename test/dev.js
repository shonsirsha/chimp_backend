const request = require("supertest");
const app = require("../server.js");
let envpath;
if (process.env.NODE_ENV === "development") {
  envpath = "./.env";
} else if (process.env.NODE_ENV == "production") {
  envpath = "../env/.env";
} else if (process.env.NODE_ENV === "test-production") {
  envpath = "../env/.test.env";
} else if (process.env.NODE_ENV === "test-development") {
  envpath = "./.test.env";
}
require("dotenv").config({
  path: envpath,
});
describe("Rest API reachable", function () {
  it("responds with json", function (done) {
    request(app)
      .get("/api/dev")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        {
          msg: `Hello world! ${process.env.NODE_ENV}`,
        },
        done
      );
  });
});
