const express = require("express");
require("dotenv").config();
const router = express.Router();
router.get("/", (req, res) => {
  return res.status(200).json({ msg: "Whatsgud  World!@!!!!!" });
});

module.exports = router;
