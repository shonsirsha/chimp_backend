const express = require("express");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");

//@route    GET api/companies
//@desc     Get all companies for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  try {
    const { user_uid } = req;

    const userExists = checkIfExists("users", "user_uid", user_uid);
    if (!userExists) {
      return res.status(400).json({ msg: "invalid_credentials" });
    }

    let { rows } = await pool.query(
      `SELECT * FROM companies WHERE user_uid='${user_uid}' ORDER BY id ASC`
    );

    if (rows.length > 0) {
      let processed = 0;
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
            processed++;
            if (processed === rows.length) {
              return res.status(200).json({ msg: "success", companies: rows });
            }
          }
        );
      });
    } else {
      return res.status(200).json({ msg: "success", companies: rows });
    }
  } catch (e) {
    return res.status(500).send("Server error");
  }
});

module.exports = router;
