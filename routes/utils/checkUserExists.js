const pool = require("../../db/pool");

const checkuserExists = async (field, data) => {
  let p = "";
  try {
    const { rows } = await pool.query(
      `SELECT count(1) FROM users WHERE ${field}='${data}'`
    );
    let numOfUsers = rows[0].count; // {count: 'num'}
    return parseInt(numOfUsers) === 1 ? true : false;
  } catch {
    return false;
  }
};

module.exports = checkuserExists;
