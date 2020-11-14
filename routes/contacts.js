const express = require("express");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");
const setLastCacheTime = require("./utils/caching/setLastCacheTime");
const setCache = require("./utils/caching/general/setCache");
const shouldGetFromCache = require("./utils/caching/shouldGetFromCache");
const getCache = require("./utils/caching/general/getCache");

//@route    GET api/contacts
//@desc     Get all contacts for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  try {
    const { user_uid } = req;
    const userExists = checkIfExists("users", "user_uid", user_uid);
    if (!userExists) {
      return res.status(400).json({ msg: "user_not_found" });
    }
    const shouldUseCachedData = await shouldGetFromCache(
      "lastContactWriteToDb",
      "lastContactReadFromDb",
      user_uid
    );
    if (shouldUseCachedData) {
      const contacts = JSON.parse(await getCache("contacts", user_uid));

      return res.status(200).json({ msg: "success_R", contacts });
    } else {
      let { rows } = await pool.query(
        `SELECT * FROM contacts WHERE user_uid='${user_uid}' ORDER BY contacts.created_at ASC`
      );
      if (rows.length > 0) {
        let processed = 0;

        rows.forEach((contact) => {
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
                async (err, result) => {
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
                    const setLastRead = await setLastCacheTime(
                      "lastContactReadFromDb",
                      user_uid
                    );
                    await setCache("contacts", [
                      user_uid,
                      JSON.stringify(rows),
                    ]); // if it fails, it fails silently - users don't need to be notified
                    if (setLastRead) {
                      return res
                        .status(200)
                        .json({ msg: "success", contacts: rows });
                    }
                  }
                }
              );
            }
          );
        });
      } else {
        //returns empty array (user has 0 contact)
        const setLastRead = await setLastCacheTime(
          "lastContactReadFromDb",
          user_uid
        );
        if (setLastRead) {
          return res.status(200).json({ msg: "success", contacts: rows });
        }
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
