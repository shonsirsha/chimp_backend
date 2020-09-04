const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const router = express.Router();
const generateAccessToken = require("./utils/generateAccessToken");
const checkuserExists = require("./utils/checkUserExists");
const deleteFile = require("./utils/deleteFile");

//@route    GET api/user
//@desc     Get currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  const { user_uid } = req;

  try {
    let { rows } = await pool.query(
      `SELECT * FROM users WHERE user_uid='${user_uid}'`
    );
    for (const property in rows[0]) {
      if (property === "password" || property === "id") {
        // not including password and id
        delete rows[0][property];
      }
    }
    if (rows[0] === null || rows[0] === undefined) {
      // if token is valid but that uid not in db
      res.status(401).json({ msg: "token is invalid" });
    } else {
      res.status(200).json({ user: rows[0], msg: "success" });
    }
  } catch {
    res.status(500).send("Server error");
  }
});

//@route    PUT api/user
//@desc     Update (currently logged in) user's profile detail
//@access   Private
router.put("/", auth, async (req, res) => {
  const { user_uid } = req;
  const { first_name, last_name } = req.body;
  try {
    pool.query(
      `UPDATE user_profile SET first_name='${first_name}', last_name='${last_name}' WHERE user_uid='${user_uid}'`,
      (err) => {
        if (!err) {
          res.status(200).json({ msg: "profile_detail_updated" });
        } else {
          res.status(400).json(error);
        }
      }
    );
  } catch (e) {
    res.status(500).send("Server error");
  }
});

//@route    PUT api/user/profile-picture
//@desc     Update (currently logged in) user's profile picture
//@access   Private
router.put("/profile-picture", auth, async (req, res) => {
  const { user_uid } = req;
  if (req.files === null) {
    return res.status(400).json({ msg: "file_not_found" });
  }
  const { file } = req.files;
  try {
    const fileExt = path.extname(file.name);
    let newFileName =
      file.name.substr(0, file.name.lastIndexOf(".")).replace(/ /g, "") +
      Date.now() +
      fileExt;
    let dir = `user_uploads/public/images/profile_pictures/${user_uid}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    } else {
      await deleteFile(false, "images/profile_pictures", user_uid); // false bc filename will be updated/overwritten below
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
            res.status(200).json({
              msg: "profile_pic_updated",
              filePath: `${dir}/${newFileName}`,
            });
          } else {
            res.status(400).json(error);
          }
        }
      );
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

module.exports = router;
