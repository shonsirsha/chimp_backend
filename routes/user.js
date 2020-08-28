const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const generateAccessToken = require("./utils/generateAccessToken");
const checkuserExists = require("./utils/checkUserExists");

//@route    GET api/user
//@desc     Get currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  const { user_uid } = req;

  try {
    let { rows } = await pool.query(
      `SELECT * FROM users WHERE user_uid='${user_uid}'`
    );
    for (const property in rows[0]) {
      if (property === "password" || property === "id") {
        // not including password and id
        delete rows[0][property];
      }
    }
    res.status(200).json({ user: rows[0], message: "success" });
  } catch {
    res.status(500).send("Server error");
  }
});

module.exports = router;
