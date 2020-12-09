const pool = require("../../db/pool");

const checkIfExists = async (table, field, data) => {
  try {
    const { rows } = await pool.query(
      `SELECT count(1) FROM ${table} WHERE ${field}='${data}'`
    );
    let numOfUsers = rows[0].count; // {count: 'num'}
    return parseInt(numOfUsers) === 1 ? true : false;
  } catch {
    return false;
  }
};

module.exports = checkIfExists;
