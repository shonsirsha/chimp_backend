const request = require("supertest");
const app = require("../server.js");

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
