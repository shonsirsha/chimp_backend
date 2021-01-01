const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const TagContact = db2.define(
	"tag_contact",
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
		created_at: {
			type: Sequelize.BIGINT,
		},
	},
	{
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = TagContact;
