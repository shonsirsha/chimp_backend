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
router.get("/", auth, (req, res) => {
  const { user_uid } = req;
});

module.exports = router;
