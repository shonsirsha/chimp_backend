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
      console.log(rows);
      return res.status(200).json({ msg: "success", contact: rows[0] });
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
      } = req.body;

      if (company_uid.length > 0) {
        const companyExists = await checkIfExists(
          "companies",
          "company_uid",
          company_uid
        );
        if (!companyExists) {
          return res.status(400).json({ msg: "company_not_found" });
        }
      }
      const contact_uid = `cont-${uuidv4()}`;
      pool.query(
        `INSERT INTO contacts(user_uid, contact_uid, first_name, last_name, phone, email, dob, note, contact_image_name) VALUES('${user_uid}', '${contact_uid}', '${first_name}', '${last_name}', '${phone}', '${email}', '${dob}', '${note}',  '${contact_image}')`,
        (err, results) => {
          if (err) {
            console.log(err);
            return res.status(400).json(err);
          }
          console.log(results);
          return res.status(200).json({ msg: "contact_added", contact_uid });
        }
      );
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
    check("company_uid", "company_uid_fail").exists(),
    check("contact_image", "contact_image_fail").exists(),
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
      } = req.body;
      const contactExists = await checkIfExists(
        "contacts",
        "contact_uid",
        contact_uid
      );
      if (contact_uid.length === 0 || !contactExists) {
        return res.status(400).json({ msg: "contact_not_found" });
      }

      pool.query(
        `UPDATE contacts SET first_name='${first_name}', last_name='${last_name}', phone='${phone}', email='${email}', dob='${dob}', note='${note}' WHERE contact_uid='${contact_uid}' AND user_uid='${user_uid}'`,
        (err, results) => {
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

//@route    PUT api/contact/image
//@desc     Edit a contact's profile picture (image) for currently logged in user
//@access   Private
router.put("/image/:contact_uid", auth, async (req, res) => {
  const { user_uid } = req;
  const { contact_uid } = req.params;
  let xists = await checkIfExists("users", "user_uid", user_uid);
  if (!xists) {
    return res.status(400).json({ msg: "user_not_found" });
  }
  xists = await checkIfExists("contacts", "contact_uid", contact_uid);
  if (!xists || contact_uid.length.length === 0) {
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
    let dir = `user_uploads/public/images/contact_image/${user_uid}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    } else {
      deleteFile(false, "/images/contact_image", user_uid);
      // false bc filename will be updated/overwritten below
    }
    file.mv(`${dir}/${newFileName}`, (err) => {
      if (err) {
        return res.status(400).json({ msg: `mv_file_failed` });
      }
      //updates in in db
      pool.query(
        `UPDATE user_profile SET profile_pic_name='${newFileName}' WHERE user_uid='${user_uid}'`,
        (err) => {
          if (!err) {
            return res.status(200).json({
              msg: "profile_pic_updated",
              filePath: `${dir}/${newFileName}`,
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
        (err, results) => {
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
