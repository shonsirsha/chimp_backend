const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const User = db2.define(
  "users",
  {
    user_uid: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = User;
