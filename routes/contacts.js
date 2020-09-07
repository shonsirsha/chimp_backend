const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { check, validationResult } = require("express-validator");
const path = require("path");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const generateAccessToken = require("./utils/generateAccessToken");
const checkIfExists = require("./utils/checkIfExists");
const deleteFile = require("./utils/deleteFile");

//@route    GET api/contacts
//@desc     Get all contacts for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { user_uid } = req;

    let { rows } = await pool.query(
      `SELECT * FROM contacts WHERE user_uid='${user_uid}' ORDER BY id ASC`
    );
    let contactArr = [];
    rows.forEach((contact, ix) => {
      pool.query(
        `SELECT tag FROM tag_contact WHERE contact_uid='${contact.contact_uid}' AND user_uid='${user_uid}'`,
        (err, result) => {
          // result.rows gives the tag

          if (err) {
            console.log(err);
            return;
          }
          let tags = [];
          result.rows.forEach(({ tag }) => {
            tags.push(tag);
          });

          contact["tags"] = tags;
          if (ix === rows.length - 1) {
            // last
            return res.status(200).json({ msg: "success", contact: rows });
          }
        }
      );
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
