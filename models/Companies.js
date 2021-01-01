const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const Companies = db2.define(
	"companies",
	{
		user_uid: {
			type: Sequelize.STRING,
		},
		company_uid: {
			type: Sequelize.STRING,
		},
		company_name: {
			type: Sequelize.STRING,
		},
		company_email: {
			type: Sequelize.STRING,
		},
		company_website: {
			type: Sequelize.STRING,
		},
		picture: {
			type: Sequelize.STRING,
		},
		company_phone: {
			type: Sequelize.STRING,
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

module.exports = Companies;
