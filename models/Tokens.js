const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const Tokens = db2.define(
	"tokens",
	{
		user_uid: {
			type: Sequelize.STRING,
		},
		refresh_token: {
			type: Sequelize.STRING,
		},
		access_token: {
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

module.exports = Tokens;
