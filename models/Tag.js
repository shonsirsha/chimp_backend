const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const Tag = db2.define(
	"tags",
	{
		tag_uid: {
			type: Sequelize.STRING,
		},
		tag_name: {
			type: Sequelize.STRING,
		},
		tag_name_lc: {
			type: Sequelize.STRING,
		},
		user_uid: {
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

module.exports = Tag;
