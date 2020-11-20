const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({ msg: `Hello world! ${process.env.NODE_ENV}` });
});

router.get("/2", (req, res) => {
  return res.status(200).json({ msg: `Hello hello` });
});

module.exports = router;
