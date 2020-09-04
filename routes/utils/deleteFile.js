const fs = require("fs");
const pool = require("../../db/pool");

const deleteFile = async (detailPath, user_uid) => {
  let dir = `user_uploads/public/${detailPath}/${user_uid}`;

  const { rows } = await pool.query(
    `SELECT * FROM user_profile WHERE user_uid='${user_uid}'`
  );
  if (
    rows[0].profile_pic_name.length !== "" ||
    rows[0].profile_pic_name.length !== null
  ) {
    // if a profile picture alr exists
    const picDir = `${dir}/${rows[0].profile_pic_name}`;
    fs.unlinkSync(picDir, (err) => {
      // delete that picture in dir
      if (!err) {
        return true;
      } else {
        return false;
      }
    });
  }
};

module.exports = deleteFile;
