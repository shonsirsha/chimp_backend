const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const TagProject = db2.define(
	"tag_project",
	{
		tag_uid: {
			type: Sequelize.STRING,
		},
		project_uid: {
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

module.exports = TagProject;
