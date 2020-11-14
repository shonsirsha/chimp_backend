const express = require("express");
const { check, validationResult } = require("express-validator");
const path = require("path");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");

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
    const userExists = checkIfExists("users", "user_uid", user_uid);
    if (!userExists) {
      return res.status(400).json({ msg: "user_not_found" });
    }
    let { rows } = await pool.query(
      `SELECT * FROM contacts WHERE user_uid='${user_uid}' ORDER BY contacts.created_at ASC`
    );
    if (rows.length > 0) {
      let processed = 0;

      rows.forEach((contact, ix) => {
        let { picture, contact_uid } = contact;
        if (picture !== "") {
          let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
          contact.picture = `${process.env.FILE_SERVER_HOST}/${dir}/${picture}`;
        }
        pool.query(
          //get all tags for this person
          `SELECT tag FROM tag_contact WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`,
          (err, result) => {
            // result.rows gives the tag

            if (err) {
              return res.status(400).json(error);
            }
            let tags = [];
            result.rows.forEach(({ tag }) => {
              tags.push(tag);
            });
            contact["tags"] = tags;
            //get all company uid that this contact works for
            pool.query(
              `SELECT company_uid FROM company_contact WHERE contact_uid='${contact.contact_uid}'`,
              (err, result) => {
                // result.rows gives the tag

                if (err) {
                  return res.status(400).json(error);
                }

                let company_uids = [];
                result.rows.forEach(({ company_uid }) => {
                  company_uids.push(company_uid);
                });

                contact["companies"] = company_uids;
                processed++;
                if (processed === rows.length) {
                  // last
                  return res
                    .status(200)
                    .json({ msg: "success", contacts: rows });
                }
              }
            );
          }
        );
      });
    } else {
      //returns empty array (user has 0 contact)
      return res.status(200).json({ msg: "success", contacts: rows });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
