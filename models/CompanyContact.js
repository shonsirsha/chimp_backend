const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const CompanyContact = db2.define(
	"company_contact",
	{
		contact_uid: {
			type: Sequelize.STRING,
		},
		company_uid: {
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

module.exports = CompanyContact;
