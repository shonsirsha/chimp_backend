const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const TagCompany = db2.define(
	"tag_company",
	{
		tag_uid: {
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

module.exports = TagCompany;
