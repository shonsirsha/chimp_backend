const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({ msg: `Hello world! ${process.env.REST_PORT}` });
});

module.exports = router;
