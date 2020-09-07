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
  let fileName = rows[0][`${field}`];

  if (removeInDb) {
    pool.query(
      `UPDATE ${table} SET ${field}='' WHERE ${keyIdName}='${key_uid}'`,
      async (err) => {
        if (!err) {
          await deleteActualFile(dir, fileName);
        } else {
          res.status(400).json(error);
        }
      }
    );
  } else {
    console.log("BB");
    await deleteActualFile(dir, fileName);
  }
};

const deleteActualFile = async (dir, fileName) => {
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
