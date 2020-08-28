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
//@desc     Register a user & get token
//@access   Public
router.post(
  "/sign-up",
  [
    check("user_uid", "Please enter a user_uid").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { email, password } = req.body; // destructuring request body
    const userExists = await checkuserExists("email", email);

    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user_uid = uuidv4();

    const salt = await bcrypt.genSalt(10); //generating salt for password hashing
    const encryptedPassword = await bcrypt.hash(password, salt); // hashing the password

    const token = generateAccessToken(user_uid); // new access token

    pool.query(
      `INSERT INTO users (user_uid, email, password) VALUES ('${user_uid}', '${email}', '${encryptedPassword}') `,
      (error, results) => {
        if (error) {
          res.status(400).json(error);
        }
        res.status(200).json({ message: "user registered", token });
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
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // destructuring request body

    const userExists = await checkuserExists("email", email);

    if (!userExists) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    try {
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE email='${email}'`
      );

      const passwordFromDb = rows[0].password;
      const isMatch = await bcrypt.compare(password, passwordFromDb);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const user_uid = rows[0].user_uid;
      const token = generateAccessToken(user_uid); // new access token

      res.status(200).json({ token, message: "logged in" });
    } catch {
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
