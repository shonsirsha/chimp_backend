const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const Contacts = db2.define(
	"contacts",
	{
		user_uid: {
			type: Sequelize.STRING,
		},
		contact_uid: {
			type: Sequelize.STRING,
		},
		first_name: {
			type: Sequelize.STRING,
		},
		last_name: {
			type: Sequelize.STRING,
		},
		phone: {
			type: Sequelize.STRING,
		},
		email: {
			type: Sequelize.STRING,
		},
		note: {
			type: Sequelize.STRING,
		},
		picture: {
			type: Sequelize.STRING,
		},
		dob: {
			type: Sequelize.BIGINT,
		},
		created_at: {
			type: Sequelize.BIGINT,
		},
		updated_at: {
			type: Sequelize.BIGINT,
		},
	},
	{
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Contacts;
