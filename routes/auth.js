const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const generateAccessToken = require("./utils/generateAccessToken");
const checkuserExists = require("./utils/checkUserExists");

//@route    POST api/auth/sign-up
//@desc     Register a user & get token
//@access   Public
router.post("/sign-up", async (req, res) => {
  const { email, password } = req.body; // destructuring request body
  const random = uuidv4();

  const salt = await bcrypt.genSalt(10); //generating salt for password hashing
  const encryptedPassword = await bcrypt.hash(password, salt); // hashing the password

  const token = generateAccessToken(random); // new access token

  pool.query(
    `INSERT INTO users (user_uid, email, password) VALUES ('${random}', '${email}', '${encryptedPassword}') `,
    (error, results) => {
      if (error) {
        res.status(400).json(error);
      }
      res.status(200).json({ message: "user registered", token });
    }
  );
});

//@route    POST api/auth/sign-in
//@desc     Logs in / Signs in a user & get token
//@access   Public
router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body; // destructuring request body

  let userExists = await checkuserExists("email", email);
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
    const userUid = rows[0].user_uid;
    const token = generateAccessToken(userUid); // new access token

    res.status(200).json({ token, message: "logged in" });
  } catch {
    res.status(500).send("Server error");
  }
});

module.exports = router;
