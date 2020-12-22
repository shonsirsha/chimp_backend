const pool = require("../../db/pool");
const checkIfExistsUnique = async (table, field, data, user_uid) => {
	try {
		const { rows } = await pool.query(
			`SELECT count(1) FROM ${table} WHERE ${field}='${data}' AND user_uid='${user_uid}'`
		);
		let numOfUsers = rows[0].count; // {count: 'num'}
		return parseInt(numOfUsers) === 1 ? true : false;
	} catch {
		return false;
	}
};

module.exports = checkIfExistsUnique;
