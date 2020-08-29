const express = require("express");
const pool = require("../db/pool");
const router = express.Router();

router.get("/all-users", async (req, res) => {
  try {
    let { rows } = await pool.query(`SELECT * FROM users ORDER BY id ASC`);
    rows.map((r) => {
      for (const property in r) {
        if (property === "password") {
          // not including password
          delete r[property];
        }
      }
    });
  } catch {
    res.status(500).send(`Server error`);
  }
});

module.exports = router;
