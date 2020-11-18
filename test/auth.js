const request = require("supertest");
const authapp = require("../authServer.js");
const pool = require("../db/pool");

describe("Auth tests", function () {
  it("succeeded signing up", function (done) {
    request(authapp)
      .post("/api/auth/sign-up")
      .send({
        email: "sean@2mail.com",
        password: "123456",
      })
      .expect(200, done);
  });

  it("failed signing up", function (done) {
    request(authapp)
      .post("/api/auth/sign-up")
      .send({
        email: "sean@2mail.com",
        password: "123456",
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

  pool.query(
    `truncate table companies, company_contact, contacts, tag_contact, tokens, user_profile, companies, users RESTART identity`
  );
});
