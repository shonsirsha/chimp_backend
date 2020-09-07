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

//@route    GET api/companies
//@desc     Get all companies for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { user_uid } = req;

    let { rows } = await pool.query(
      `SELECT * FROM companies WHERE user_uid='${user_uid}' ORDER BY id ASC`
    );

    rows.forEach((company, ix) => {
      pool.query(
        //get all people's (contacts) contact_uid that are working for this company
        `SELECT contact_uid FROM company_contact WHERE company_uid='${company.company_uid}'`,
        (err, result) => {
          //result.rows gives ({contact_uid})
          if (err) {
            return res.status(400).json(error);
          }
          let contact_uids = [];
          result.rows.forEach(({ contact_uid }) => {
            contact_uids.push(contact_uid);
          });

          company["people"] = contact_uids;
          if (ix === rows.length - 1) {
            // last
            return res.status(200).json({ msg: "success", companies: rows });
          }
        }
      );
    });
  } catch (e) {
    return res.status(500).send("Server error");
  }
});

module.exports = router;
