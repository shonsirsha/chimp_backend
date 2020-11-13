const express = require("express");
const router = express.Router();
const { promisify } = require("util");

router.get("/", (req, res) => {
  return res.status(200).json({ msg: `Hello world! ${process.env.NODE_ENV}` });
});

module.exports = router;
