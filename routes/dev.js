const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log(process.env.MY_VARIABLE);
  return res.status(200).json({ message: "Hello World!" });
});

module.exports = router;
