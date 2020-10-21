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

//@route    GET api/company
//@desc     Get a contact for currently logged in user
//@access   Private
router.get(
  "/",
  [check("company_uid", "company_uid_fail").exists()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_uid } = req;
      const { company_uid } = req.body;
      const companyExists = await checkIfExists(
        "companies",
        "company_uid",
        company_uid
      );
      if (company_uid.length === 0 || !companyExists) {
        return res.status(400).json({ msg: "company_not_found" });
      }
      let { rows } = await pool.query(
        `SELECT * FROM companies WHERE company_uid='${company_uid}' AND user_uid='${user_uid}'`
      );

      let contacts = await pool.query(
        `SELECT company_uid FROM company_contact WHERE company_uid='${company_uid}'`
      );

      let company_uids = [];
      contacts.rows.forEach(({ company_uid }) => {
        company_uids.push(company_uid);
      });

      let companyModel = rows[0];
      companyModel["people"] = company_uids;

      return res.status(200).json({ msg: "success", contact: companyModel });
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    POST api/company
//@desc     Create a company for currently logged in user
//@access   Private
router.post(
  "/",
  [
    check("company_name", "company_name_fail").exists(),
    check("company_email", "company_email_fail").exists(),
    check("company_website", "company_website_fail").exists(),
    check("company_phone", "company_phone_fail").exists(),
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
        company_name,
        company_email,
        company_website,
        company_phone,
      } = req.body;

      const company_uid = `company-${uuidv4()}`;

      pool.query(
        `INSERT INTO companies(user_uid, company_uid, company_name, company_email, company_website, company_phone, picture) 
        VALUES('${user_uid}','${company_uid}' ,'${company_name}', '${company_email}', '${company_website}', '${company_phone}' ,'')`,
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }

          return res.status(200).json({ msg: "company_created", company_uid });
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    PUT api/company
//@desc     Edit a company for currently logged in user
//@access   Private
router.put(
  "/",
  [
    check("company_name", "company_name_fail").exists(),
    check("company_email", "company_email_fail").exists(),
    check("company_website", "company_website_fail").exists(),
    check("company_phone", "company_phone_fail").exists(),
    check("company_uid", "company_uid_fail").exists(),
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
        company_name,
        company_email,
        company_website,
        company_phone,
        company_uid,
      } = req.body;

      const companyExists = await checkIfExists(
        "companies",
        "company_uid",
        company_uid
      );

      if (company_uid.length === 0 || !companyExists) {
        return res.status(400).json({ msg: "company_not_found" });
      }

      pool.query(
        `UPDATE companies SET company_name='${company_name}', company_email='${company_email}',
         company_website='${company_website}', company_phone='${company_phone}' WHERE user_uid='${user_uid}' AND company_uid='${company_uid}' `,
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }
          return res.status(200).json({ msg: "company_updated", company_uid });
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    PUT api/company/image/company_uid
//@desc     Edit a contact's profile picture (image) for currently logged in user
//@access   Private
router.put("/image/:company_uid", auth, async (req, res) => {
  const { user_uid } = req;
  const { company_uid } = req.params;
  let thisExists = await checkIfExists("users", "user_uid", user_uid);
  if (!thisExists) {
    return res.status(400).json({ msg: "user_not_found" });
  }
  thisExists = await checkIfExists("companies", "company_uid", company_uid);
  if (!thisExists || company_uid.length === 0) {
    return res.status(400).json({ msg: "company_not_found" });
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
    let dir = `${process.env.USER_UPLOAD_COMPANY_IMAGE}${company_uid}`;
    await deleteFile(
      false,
      "images/company_image",
      company_uid,
      "companies",
      "picture",
      "company_uid"
    );
    fs.mkdirSync(dir, { recursive: true });
    file.mv(`${dir}/${newFileName}`, (err) => {
      if (err) {
        return res.status(400).json({ msg: `mv_file_failed` });
      }
      //updates in in db
      pool.query(
        `UPDATE companies SET picture='${newFileName}' WHERE company_uid='${company_uid}'`,
        (err) => {
          if (!err) {
            return res.status(200).json({
              msg: "picture_updated",
              picture: `${process.env.FILE_SERVER_HOST}/${dir}/${newFileName}`,
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

//@route    DELETE api/contact/image/
//@desc     DELETE / REMOVE (currently logged in) a company's image
//@access   Private
router.delete(
  "/image",
  check("company_uid", "company_uid_fail").exists(),
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_uid } = req;
    const { company_uid } = req.body;

    let thisExists = await checkIfExists("users", "user_uid", user_uid);
    if (!thisExists) {
      return res.status(400).json({ msg: "user_not_found" });
    }
    thisExists = await checkIfExists("companies", "company_uid", company_uid);
    if (!thisExists || company_uid.length === 0) {
      return res.status(400).json({ msg: "company_not_found" });
    }
    try {
      let dir = `${process.env.USER_UPLOAD_COMPANY_IMAGE}${company_uid}`;
      if (!fs.existsSync(dir)) {
        return res.status(200).json({ msg: "picture_removed" });
      } else {
        await deleteFile(
          true,
          "images/company_image",
          company_uid,
          "companies",
          "picture",
          "company_uid"
        );
        return res.status(200).json({ msg: "picture_removed" });
      }
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    DELETE api/company
//@desc     Delete a company
//@access   Private
router.delete(
  "/",
  [check("company_uid", "company_uid_fail").exists()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_uid } = req;
      const { company_uid } = req.body;

      const companyExists = await checkIfExists(
        "companies",
        "company_uid",
        company_uid
      );

      if (company_uid.length === 0 || !companyExists) {
        return res.status(400).json({ msg: "company_not_found" });
      }

      pool.query(
        `DELETE FROM company_contact WHERE company_uid='${company_uid}';
        DELETE FROM companies WHERE company_uid='${company_uid}' AND user_uid='${user_uid}';
        `,
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }
          return res.status(200).json({ msg: "company_deleted" });
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
