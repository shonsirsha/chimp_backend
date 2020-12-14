const { Sequelize } = require("sequelize");

const db2 = new Sequelize(
  `postgres://${process.env.DB_USER}:@${process.env.DB_HOST}:5432/${process.env.DB_DATABASE_NAME}`
);

module.exports = db2;
