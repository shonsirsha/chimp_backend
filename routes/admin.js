const express = require("express");
const pool = require("../db/pool");
const router = express.Router();

router.get("/all-users", (req, res) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      res.status(400).json({ error });
    }
    res.status(200).json(results.rows);
  });
});

module.exports = router;
