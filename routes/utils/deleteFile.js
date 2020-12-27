const fs = require("fs");
const pool = require("../../db/pool");

const deleteFile = async (
  removeInDb,
  detailPath,
  key_uid,
  table,
  field,
  keyIdName
) => {
  //keyIdName is the id for WHERE clause of SQL e.g key_uid
  let dir = `user_uploads/public/${detailPath}/${key_uid}`;

  const { rows } = await pool.query(
    `SELECT * FROM ${table} WHERE ${keyIdName}='${key_uid}'`
  );

  if (removeInDb) {
    pool.query(
      `UPDATE ${table} SET ${field}='' WHERE ${keyIdName}='${key_uid}'`,
      async (err) => {
        if (!err) {
          await deleteActualFile(dir);
        } else {
          res.status(400).json(error);
        }
      }
    );
  } else {
    await deleteActualFile(dir);
  }
};

const deleteActualFile = async (dir) => {
  fs.rmdirSync(dir, { recursive: true }, (err) => {
    // delete that dir since it's empty
    if (!err) {
      return true;
    } else {
      return false;
    }
  });
};

module.exports = deleteFile;
