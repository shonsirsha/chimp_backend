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

//@route    GET api/user
//@desc     Get currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  const { user_uid } = req;
  const userExists = checkIfExists("users", "user_uid", user_uid);
  if (!userExists) {
    return res.status(400).json({ msg: "user_not_found" });
  }
  try {
    let { rows } = await pool.query(
      `SELECT user_profile.*, users.* FROM user_profile, users WHERE users.user_uid='${user_uid}'`
    );
    for (const property in rows[0]) {
      if (property === "password" || property === "id") {
        // not including password and id
        delete rows[0][property];
      }
    }
    if (rows[0] === null || rows[0] === undefined) {
      // if token is valid but that uid not in db
      return res.status(401).json({ msg: "token_invalid" });
    } else {
      return res.status(200).json({ user: rows[0], msg: "success" });
    }
  } catch {
    return res.status(500).send("Server error");
  }
});

//@route    PUT api/user
//@desc     Update (currently logged in) user's profile detail
//@access   Private
router.put(
  "/",
  [
    check("first_name", "first_name_mail").exists(),
    check("last_name", "last_name_fail").exists(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { user_uid } = req;
    const userExists = checkIfExists("users", "user_uid", user_uid);
    if (!userExists) {
      return res.status(400).json({ msg: "user_not_found" });
    }
    const { first_name, last_name } = req.body;
    try {
      pool.query(
        `UPDATE user_profile SET first_name='${first_name}', last_name='${last_name}' WHERE user_uid='${user_uid}'`,
        (err) => {
          if (!err) {
            return res.status(200).json({ msg: "profile_detail_updated" });
          } else {
            return res.status(400).json(error);
          }
        }
      );
    } catch (e) {
      return res.status(500).send("Server error");
    }
  }
);

//@route    PUT api/user/profile-picture
//@desc     Update (currently logged in) user's profile picture
//@access   Private
router.put("/profile-picture", auth, async (req, res) => {
  const { user_uid } = req;
  let userExists = checkIfExists("users", "user_uid", user_uid);
  if (!userExists) {
    return res.status(400).json({ msg: "user_not_found" });
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
    let dir = `${process.env.USER_UPLOAD_PROFILE_PIC}${user_uid}`;
    await deleteFile(
      false,
      "images/profile_pictures",
      user_uid,
      "user_profile",
      "picture",
      "user_uid"
    );
    fs.mkdirSync(dir, { recursive: true });
    file.mv(`${dir}/${newFileName}`, (err) => {
      if (err) {
        return res.status(400).json({ msg: `mv_file_failed` });
      }
      //updates in in db
      pool.query(
        `UPDATE user_profile SET picture='${newFileName}' WHERE user_uid='${user_uid}'`,
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

//@route    DELETE api/user/profile-picture
//@desc     DELETE / REMOVE (currently logged in) user's profile picture
//@access   Private
router.delete("/profile-picture", auth, async (req, res) => {
  const { user_uid } = req;
  let userExists = checkIfExists("users", "user_uid", user_uid);
  if (!userExists) {
    return res.status(400).json({ msg: "user_not_found" });
  }
  try {
    let dir = `${process.env.USER_UPLOAD_PROFILE_PIC}${user_uid}`;
    if (!fs.existsSync(dir)) {
      return res.status(200).json({ msg: "picture_removed" });
    } else {
      await deleteFile(
        true,
        "images/profile_pictures",
        user_uid,
        "user_profile",
        "picture",
        "user_uid"
      );
      return res.status(200).json({ msg: "picture_removed" });
    }
  } catch (e) {
    return res.status(500).send("Server error");
  }
});

module.exports = router;
