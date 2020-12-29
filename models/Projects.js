const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const Projects = db2.define(
	"projects",
	{
		user_uid: {
			type: Sequelize.STRING,
		},
		project_uid: {
			type: Sequelize.STRING,
		},
		project_name: {
			type: Sequelize.STRING,
		},
		project_note: {
			type: Sequelize.STRING,
		},
		project_status: {
			type: Sequelize.STRING,
		},
		project_starts: {
			type: Sequelize.STRING,
		},
		project_ends: {
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

module.exports = Projects;
