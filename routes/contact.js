const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { check, validationResult } = require("express-validator");
const path = require("path");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");
const deleteFile = require("./utils/deleteFile");
const setLastCacheTime = require("./utils/caching/setLastCacheTime");
const arrayShaper = require("./utils/arrayShaper");
const companyValidator = require("./utils/companyValidator");
//@route    GET api/contact
//@desc     Get a contact for currently logged in user
//@access   Private
router.get(
  "/",
  [check("contact_uid", "contact_uid_fail").exists()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_uid } = req;

      const userExists = checkIfExists("users", "user_uid", user_uid);
      if (!userExists) {
        return res.status(400).json({ msg: "invalid_credentials" });
      }

      const { contact_uid } = req.body;
      const contactExists = await checkIfExists(
        "contacts",
        "contact_uid",
        contact_uid
      );
      if (contact_uid.length === 0 || !contactExists) {
        return res.status(400).json({ msg: "contact_not_found" });
      }
      let { rows } = await pool.query(
        `SELECT * FROM contacts WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`
      );

      const tagsFromDb = await pool.query(
        `SELECT tag FROM tag_contact WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`
      );

      const companyUidsFromDb = await pool.query(
        `SELECT company_uid FROM company_contact WHERE contact_uid='${contact_uid}'`
      );

      if (rows[0].picture !== "") {
        let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
        rows[0].picture = `${process.env.FILE_SERVER_HOST}/${dir}/${rows[0].picture}`;
      }

      let tags = [];
      tagsFromDb.rows.forEach(({ tag }) => {
        tags.push(tag);
      });

      let companyUids = [];
      companyUidsFromDb.rows.forEach(({ company_uid }) => {
        companyUids.push(company_uid);
      });

      let contactModel = rows[0];
      contactModel["tags"] = tags;
      contactModel["companies"] = companyUids;

      return res.status(200).json({ msg: "success", contact: contactModel });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  }
);

//@route    POST api/contact
//@desc     Create a contact for currently logged in user
//@access   Private
router.post(
  "/",
  [
    check("first_name", "first_name_fail").exists(),
    check("last_name", "last_name_fail").exists(),
    check("phone", "phone_fail").exists(),
    check("email", "email_fail").exists().isEmail(),
    check("dob", "dob_fail").exists(),
    check("note", "note_fail").exists(),
    check("company_uids", "company_uids_fail").exists(),
    check("tags", "tags_fail").exists(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_uid } = req;
      const {
        first_name,
        last_name,
        phone,
        email,
        dob,
        note,
        company_uids,
        tags,
      } = req.body;
      if (!Array.isArray(tags)) {
        return res.status(400).json({ msg: "tags_not_array" });
      }

      if (!Array.isArray(company_uids)) {
        return res.status(400).json({ msg: "company_uid_not_array" });
      }

      const shapedArray = arrayShaper(company_uids);

      if ((await companyValidator(shapedArray)) || shapedArray.length === 0) {
        // all company uid present in db
        const contact_uid = `cont-${uuidv4()}`;
        console.log(shapedArray);
        pool.query(
          `INSERT INTO contacts(user_uid, contact_uid, first_name, last_name, phone, email, dob, note, picture, created_at) VALUES('${user_uid}', '${contact_uid}', '${first_name}', '${last_name}', '${phone}', '${email}', '${dob}', '${note}',  '', '${Date.now()}')`,
          async (err) => {
            if (err) {
              return res.status(400).json(err);
            }

            if (tags.length > 0) {
              tags.forEach((tag) => {
                pool.query(
                  `INSERT INTO tag_contact(user_uid, contact_uid, tag) VALUES('${user_uid}', '${contact_uid}', '${tag}')`,
                  (err) => {
                    if (err) {
                      return res.status(400).json(err);
                    }
                  }
                );
              });
            }
            if (shapedArray.length > 0) {
              shapedArray.forEach(async (uid) => {
                pool.query(
                  `INSERT INTO company_contact(contact_uid,company_uid) VALUES( '${contact_uid}', '${uid}')`,
                  async (err) => {
                    if (err) {
                      return res.status(400).json(err);
                    }
                    const setLastWrite = await setLastCacheTime(
                      "lastContactWriteToDb",
                      user_uid
                    );
                    if (setLastWrite) {
                      return res
                        .status(200)
                        .json({ msg: "contact_added", contact_uid });
                    } else {
                      return res.status(400).json({ msg: "caching_error" });
                    }
                  }
                );
              });
            } else {
              const setLastWrite = await setLastCacheTime(
                "lastContactWriteToDb",
                user_uid
              );
              if (setLastWrite) {
                return res
                  .status(200)
                  .json({ msg: "contact_added", contact_uid });
              }
              return res.status(400).json({ msg: "caching_error" });
            }
          }
        );
      } else {
        return res.status(400).json({ msg: "one_or_more_invalid_company" });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send("Server error");
    }
  }
);

//@route    PUT api/contact
//@desc     Edit a contact for currently logged in user
//@access   Private
router.put(
  "/",
  [
    check("contact_uid", "contact_uid_fail").exists(),
    check("first_name", "first_name_fail").exists(),
    check("last_name", "last_name_fail").exists(),
    check("phone", "phone_fail").exists(),
    check("email", "email_fail").exists().isEmail(),
    check("dob", "dob_fail").exists(),
    check("note", "note_fail").exists(),
    check("company_uids", "company_uids_fail").exists(),
    check("tags", "tags_fail").exists(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_uid } = req;
      const {
        contact_uid,
        first_name,
        last_name,
        phone,
        email,
        dob,
        note,
        tags,
        company_uids,
      } = req.body;

      if (!Array.isArray(tags)) {
        return res.status(400).json({ msg: "tags_not_array" });
      }

      if (!Array.isArray(company_uids)) {
        return res.status(400).json({ msg: "company_uids_not_array" });
      }

      const contactExists = await checkIfExists(
        "contacts",
        "contact_uid",
        contact_uid
      );
      if (contact_uid.length === 0 || !contactExists) {
        return res.status(400).json({ msg: "contact_not_found" });
      }

      pool.query(
        `DELETE FROM tag_contact WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`,
        (err) => {
          // delete all tags
          if (err) {
            return res.status(400).json(err);
          }
          tags.forEach((tag) => {
            pool.query(
              `INSERT INTO tag_contact(user_uid, contact_uid, tag) VALUES('${user_uid}', '${contact_uid}', '${tag}')`,
              (err) => {
                if (err) {
                  return res.status(400).json(err);
                }
              }
            );
          }); // insert all tags
        }
      ); // readjust tags

      pool.query(
        `UPDATE contacts SET first_name='${first_name}', last_name='${last_name}', phone='${phone}', email='${email}', dob='${dob}', note='${note}' WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`,
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }
          pool.query(
            `DELETE FROM company_contact WHERE contact_uid='${contact_uid}'`, // deleting all relation of company-contact
            async (err) => {
              if (err) {
                return res.status(400).json(err);
              }
              if (company_uids.length > 0) {
                let processed = 0;

                company_uids.forEach(async (uid, ix) => {
                  const companyExists = await checkIfExists(
                    "companies",
                    "company_uid",
                    uid
                  );
                  processed++;
                  if (!companyExists) {
                    return res
                      .status(400)
                      .json({ msg: "company_not_found", company_uid: uid });
                  } else {
                    pool.query(
                      `INSERT INTO company_contact(contact_uid, company_uid) VALUES('${contact_uid}', '${uid}')`,
                      async (err) => {
                        // re inserting it back from the company_uid arr supplied by the user...
                        if (err) {
                          return res.status(400).json(err);
                        }

                        if (processed === company_uids.length) {
                          const setLastWrite = await setLastCacheTime(
                            "lastContactWriteToDb",
                            user_uid
                          );
                          if (setLastWrite) {
                            return res
                              .status(200)
                              .json({ msg: "contact_updated", contact_uid });
                          }
                          return res.status(400).json({ msg: "caching_error" });
                        }
                      }
                    );
                  }
                });
              } else {
                const setLastWrite = await setLastCacheTime(
                  "lastContactWriteToDb",
                  user_uid
                );
                if (setLastWrite) {
                  return res
                    .status(200)
                    .json({ msg: "contact_updated", contact_uid });
                }
                return res.status(400).json({ msg: "caching_error" });
              }
            }
          );
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    PUT api/contact/image/contact_uid
//@desc     Edit a contact's profile picture (image) for currently logged in user
//@access   Private
router.put("/image/:contact_uid", auth, async (req, res) => {
  const { user_uid } = req;
  const { contact_uid } = req.params;
  let thisExists = await checkIfExists("users", "user_uid", user_uid);
  if (!thisExists) {
    return res.status(400).json({ msg: "invalid_credentials" });
  }
  thisExists = await checkIfExists("contacts", "contact_uid", contact_uid);
  if (!thisExists || contact_uid.length.length === 0) {
    return res.status(400).json({ msg: "contact_not_found" });
  }
  if (req.files === null || req.files === undefined) {
    return res.status(400).json({ msg: "file_not_found" });
  }
  const { file } = req.files;
  try {
    const fileExt = path.extname(file.name);
    let newFileName =
      file.name.substr(0, file.name.lastIndexOf(".")).replace(/ /g, "") +
      Date.now() +
      fileExt;
    let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
    await deleteFile(
      false,
      "images/contact_image",
      contact_uid,
      "contacts",
      "picture",
      "contact_uid"
    );
    fs.mkdirSync(dir, { recursive: true });
    file.mv(`${dir}/${newFileName}`, (err) => {
      if (err) {
        return res.status(400).json({ msg: `mv_file_failed` });
      }
      //updates in in db
      pool.query(
        `UPDATE contacts SET picture='${newFileName}' WHERE contact_uid='${contact_uid}'`,
        async (err) => {
          if (!err) {
            const setLastWrite = await setLastCacheTime(
              "lastContactWriteToDb",
              user_uid
            );
            if (setLastWrite) {
              return res.status(200).json({
                msg: "picture_updated",
                picture: `${process.env.FILE_SERVER_HOST}/${dir}/${newFileName}`,
              });
            }
            return res.status(400).json({ msg: "caching_error" });
          } else {
            return res.status(400).json(error);
          }
        }
      );
    });
  } catch (e) {
    return res.status(500).json({ msg: "Server error", e });
  }
});

//@route    DELETE api/contact/image/contact_uid
//@desc     DELETE / REMOVE (currently logged in) a user's contact's image
//@access   Private
router.delete(
  "/image",
  check("contact_uid", "contact_uid_fail").exists(),
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_uid } = req;
    const { contact_uid } = req.body;

    let thisExists = await checkIfExists("users", "user_uid", user_uid);
    if (!thisExists) {
      return res.status(400).json({ msg: "invalid_credentials" });
    }
    thisExists = await checkIfExists("contacts", "contact_uid", contact_uid);
    if (!thisExists || contact_uid.length.length === 0) {
      return res.status(400).json({ msg: "contact_not_found" });
    }
    try {
      let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
      if (!fs.existsSync(dir)) {
        return res.status(200).json({ msg: "picture_removed" });
      } else {
        await deleteFile(
          true,
          "images/contact_image",
          contact_uid,
          "contacts",
          "picture",
          "contact_uid"
        );

        const setLastWrite = await setLastCacheTime(
          "lastContactWriteToDb",
          user_uid
        );
        if (setLastWrite) {
          return res.status(200).json({ msg: "picture_removed" });
        }
        return res.status(400).json({ msg: "caching_error" });
      }
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    DELETE api/contact
//@desc     Delete a contact for currently logged in user
//@access   Private
router.delete(
  "/",
  [check("contact_uid", "contact_uid_fail").exists()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_uid } = req;
      const { contact_uid } = req.body;
      const contactExists = await checkIfExists(
        "contacts",
        "contact_uid",
        contact_uid
      );
      if (contact_uid.length === 0 || !contactExists) {
        return res.status(400).json({ msg: "contact_not_found" });
      }

      pool.query(
        `DELETE FROM tag_contact WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}';
        DELETE FROM company_contact WHERE contact_uid='${contact_uid}';
        DELETE FROM contacts WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}';
        `,
        async (err) => {
          if (err) {
            return res.status(400).json(err);
          }

          const setLastWrite = await setLastCacheTime(
            "lastContactWriteToDb",
            user_uid
          );
          if (setLastWrite) {
            return res.status(200).json({ msg: "contact_deleted" });
          }
          return res.status(400).json({ msg: "caching_error" });
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
