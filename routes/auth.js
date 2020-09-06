const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const pool = require("../db/pool");
const router = express.Router();
const generateAccessToken = require("./utils/generateAccessToken");
const checkIfExists = require("./utils/checkIfExists");

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
    const userExists = await checkIfExists("users", "email", email);

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
      INSERT INTO tokens(user_uid, refresh_token, access_token) VALUES ('${user_uid}', '${refreshToken}', '${token}');
      `,
      (error, results) => {
        if (error) {
          return res.status(400).json(error);
        }
        return res.status(200).json({ msg: "signed_up", token, user_uid });
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

    const userExists = await checkIfExists("users", "email", email);
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

      const refreshToken = jwt.sign(
        { payload: user_uid },
        process.env.JWT_REFRESH_SECRET
      ); // refresh token

      pool.query(
        `INSERT INTO tokens(user_uid, refresh_token, access_token) VALUES ('${user_uid}', '${refreshToken}', '${token}')`,
        (error, results) => {
          if (error) {
            return res.status(400).json(error);
          }
          return res.status(200).json({ token, msg: "signed_in", user_uid });
        }
      );
    } catch {
      return res.status(500).send("Server error");
    }
  }
);

//@route    POST api/auth/new-access-token
//@desc     Get new access token if expired (by supplying ID & expired access token and exchange it for a new token w/ the help of a refresh token)
//@access   Private (as user needs to prove that they have the (expired) access token)
router.post(
  "/new-access-token",
  [check("user_uid", "user_uid_fail").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const oldAccessToken = req.header("x-auth-token");

    //check if theres token in the header
    if (!oldAccessToken) {
      return res.status(401).json({ msg: "unauthorised" });
    }

    try {
      const { user_uid } = req.body; // destructuring request body

      const { rows } = await pool.query(
        `SELECT refresh_token FROM tokens WHERE user_uid='${user_uid}' AND access_token='${oldAccessToken}'`
      );
      if (rows[0] !== undefined) {
        // if exists
        jwt.verify(
          rows[0].refresh_token,
          process.env.JWT_REFRESH_SECRET,
          (err) => {
            if (err) res.status(401).json({ msg: "refresh_token_invalid" }); //token is not valid

            const newAccessToken = generateAccessToken(user_uid); // a new access token (refreshed)
            pool.query(
              `UPDATE tokens SET access_token='${newAccessToken}' WHERE user_uid='${user_uid}' AND refresh_token='${rows[0].refresh_token}'`,
              (error, results) => {
                if (error) {
                  res.status(400).json(error);
                }
                res.status(200).json({ token: newAccessToken });
              }
            );
          }
        );
      } else {
        return res.status(401).json({ msg: "unauthorised" });
      }
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    POST api/auth/sign-out
//@desc     Signs out currently logged in user
//@access   Private (as user needs to prove that they have access token)
router.post(
  "/sign-out",
  [check("user_uid", "user_uid_fail").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const accessToken = req.header("x-auth-token");

    //check if theres token in the header
    if (!accessToken) {
      return res.status(401).json({ msg: "unauthorised" });
    }

    try {
      const { user_uid } = req.body; // destructuring request body
      const userExists = await checkIfExists("users", "user_uid", user_uid);
      if (!userExists) {
        return res.status(400).json({ msg: "invalid_credentials" });
      }
      pool.query(
        `DELETE FROM tokens WHERE user_uid='${user_uid}' AND access_token='${accessToken}'`,
        (error, results) => {
          if (error) {
            return res.status(400).json(error);
          }
          return res.status(200).json({ msg: "signed_out" });
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
