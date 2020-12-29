const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const ProjectContact = db2.define(
	"project_contact",
	{
		contact_uid: {
			type: Sequelize.STRING,
		},
		company_uid: {
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

module.exports = ProjectContact;
