const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const TagContactX = db2.define(
	"tag_contact_x",
	{
		tag_uid: {
			type: Sequelize.STRING,
		},
		contact_uid: {
			type: Sequelize.STRING,
		},
		user_uid: {
			type: Sequelize.STRING,
		},
	},
	{
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = TagContactX;
