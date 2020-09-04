const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const pool = require("../db/pool");
const router = express.Router();
const generateAccessToken = require("./utils/generateAccessToken");
const checkuserExists = require("./utils/checkUserExists");

//@route    POST api/auth/sign-up
//@desc     Register a user & get token + user id
//@access   Public
router.post(
  "/sign-up",
  [
    check("email", "email_fail").isEmail(),
    check("password", "password_fail").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body; // destructuring request body
    const userExists = await checkuserExists("email", email);

    if (userExists) {
      return res.status(400).json({ msg: "email_unavailable" });
    }

    const user_uid = uuidv4();

    const salt = await bcrypt.genSalt(10); //generating salt for password hashing
    const encryptedPassword = await bcrypt.hash(password, salt); // hashing the password

    const token = generateAccessToken(user_uid); // new access token

    const refreshToken = jwt.sign(
      { payload: user_uid },
      process.env.JWT_REFRESH_SECRET
    ); // refresh token

    pool.query(
      `INSERT INTO users (user_uid, email, password) VALUES ('${user_uid}', '${email}', '${encryptedPassword}');
      INSERT INTO user_profile(user_uid, first_name, last_name, profile_pic_name) VALUES ('${user_uid}', '', '', '');
      INSERT INTO refresh_tokens(user_uid, refresh_token) VALUES ('${user_uid}', '${refreshToken}');
      `,
      (error, results) => {
        if (error) {
          res.status(400).json(error);
        }
        res.status(200).json({ msg: "user registered", token, user_uid });
      }
    );
  }
);

//@route    POST api/auth/sign-in
//@desc     Logs in / Signs in a user & get token
//@access   Public
router.post(
  "/sign-in",
  [
    check("email", "email_fail").isEmail(),
    check("password", "password_fail").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // destructuring request body

    const userExists = await checkuserExists("email", email);
    if (!userExists) {
      return res.status(400).json({ msg: "invalid_credentials" });
    }

    try {
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE email='${email}'`
      );

      const passwordFromDb = rows[0].password;
      const isMatch = await bcrypt.compare(password, passwordFromDb);

      if (!isMatch) {
        return res.status(400).json({ msg: "invalid_credentials" });
      }
      const user_uid = rows[0].user_uid;
      const token = generateAccessToken(user_uid); // new access token

      res.status(200).json({ token, msg: "logged in", user_uid });
    } catch {
      res.status(500).send("Server error");
    }
  }
);

//@route    POST api/auth/new-access-token
//@desc     Get new access token if expired (by supplying ID, and getting refrsh token in DB)
//@access   Public
router.post(
  "/new-access-token",
  [check("user_uid", "user_uid_fail").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { user_uid } = req.body; // destructuring request body
      const { rows } = await pool.query(
        `SELECT refresh_token FROM refresh_tokens WHERE user_uid='${user_uid}'`
      );
      console.log(rows[0].refresh_token.length > 0);
      if (rows[0].refresh_token.length > 0) {
        // if exists

        jwt.verify(
          rows[0].refresh_token,
          process.env.JWT_REFRESH_SECRET,
          (err) => {
            if (err) res.status(401).json({ msg: "token_invalid" }); //token is not valid

            const token = generateAccessToken(user_uid); // a new access token (refreshed)

            res.status(200).json({ token: token });
          }
        );
      } else {
      }
    } catch (e) {
      res.status(500).send("Server error ", e);
    }
  }
);

module.exports = router;
