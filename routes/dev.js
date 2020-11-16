const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res
    .status(200)
    .json({ msg: `Hello world! ${process.env.DB_DATABASE_NAME}` });
});

module.exports = router;
