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

//@route    GET api/contact
//@desc     Get a contact for currently logged in user
//@access   Private
router.get(
  "/",
  [check("contact_uid", "first_name_fail").exists()],
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
      let { rows } = await pool.query(
        `SELECT * FROM contacts WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`
      );

      const tagsFromDb = await pool.query(
        `SELECT tag FROM tag_contact WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`
      );

      let tags = [];
      tagsFromDb.rows.forEach(({ tag }) => {
        tags.push(tag);
      });

      let contactModel = rows[0];
      contactModel["tags"] = tags;

      return res.status(200).json({ msg: "success", contact: contactModel });
    } catch (e) {
      console.log(e);
      return res.status(500).send("Server error");
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
    check("company_uid", "company_uid_fail").exists(),
    check("contact_image", "contact_image_fail").exists(),
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
        company_uid,
        contact_image,
        tags,
      } = req.body;
      if (!Array.isArray(tags)) {
        return res.status(400).json({ msg: "tags_not_array" });
      }

      const contact_uid = `cont-${uuidv4()}`;

      if (company_uid.length > 0) {
        const companyExists = await checkIfExists(
          "companies",
          "company_uid",
          company_uid
        );
        if (!companyExists) {
          return res.status(400).json({ msg: "company_not_found" });
        }

        pool.query(
          `INSERT INTO company_contact(contact_uid,company_uid) VALUES( '${contact_uid}', '${company_uid}')`,
          (err) => {
            if (err) {
              return res.status(400).json(err);
            }
          }
        );
      }
      pool.query(
        `INSERT INTO contacts(user_uid, contact_uid, first_name, last_name, phone, email, dob, note, picture) VALUES('${user_uid}', '${contact_uid}', '${first_name}', '${last_name}', '${phone}', '${email}', '${dob}', '${note}',  '${contact_image}')`,
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }

          if (tags.length >= 1) {
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
          return res.status(200).json({ msg: "contact_added", contact_uid });
        }
      );
    } catch (e) {
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
    check("company_uid", "company_uid_fail").exists(),
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
      } = req.body;

      if (!Array.isArray(tags)) {
        return res.status(400).json({ msg: "tags_not_array" });
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
          return res.status(200).json({ msg: "contact_updated", contact_uid });
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
    return res.status(400).json({ msg: "user_not_found" });
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
        (err) => {
          if (!err) {
            return res.status(200).json({
              msg: "picture_updated",
              picture: `${dir}/${newFileName}`,
            });
          } else {
            return res.status(400).json(error);
          }
        }
      );
    });
  } catch (e) {
    return res.status(500).send("Server error");
  }
});

//@route    DELETE api/contact/image/contact_uid
//@desc     DELETE / REMOVE (currently logged in) a user's contact's image
//@access   Private
router.delete("/image/:contact_uid", auth, async (req, res) => {
  const { user_uid } = req;
  const { contact_uid } = req.params;

  let thisExists = await checkIfExists("users", "user_uid", user_uid);
  if (!thisExists) {
    return res.status(400).json({ msg: "user_not_found" });
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
      return res.status(200).json({ msg: "picture_removed" });
    }
  } catch (e) {
    return res.status(500).send("Server error");
  }
});

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
        `DELETE FROM contacts WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`,
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }
          return res.status(200).json({ msg: "contact_deleted" });
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;