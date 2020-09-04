const fs = require("fs");
const pool = require("../../db/pool");

const deleteFile = async (removeInDb, detailPath, user_uid) => {
  let dir = `user_uploads/public/${detailPath}/${user_uid}`;

  const { rows } = await pool.query(
    `SELECT * FROM user_profile WHERE user_uid='${user_uid}'`
  );
  let fileName = rows[0].profile_pic_name;
  if (removeInDb) {
    pool.query(
      `UPDATE user_profile SET profile_pic_name='' WHERE user_uid='${user_uid}'`,
      async (err) => {
        if (!err) {
          await deleteActualFile(dir, fileName);
        } else {
          res.status(400).json(error);
        }
      }
    );
  } else {
    await deleteActualFile(dir, fileName);
  }
};

const deleteActualFile = async (dir, fileName) => {
  const picDir = `${dir}/${fileName}`;
  fs.unlinkSync(picDir, (err) => {
    // delete that file in dir
    if (!err) {
      return true;
    } else {
      return false;
    }
  });
};

module.exports = deleteFile;
