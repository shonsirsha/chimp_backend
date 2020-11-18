const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const UserProfile = db2.define(
  "user_profile",
  {
    user_uid: {
      type: Sequelize.STRING,
    },
    first_name: {
      type: Sequelize.STRING,
    },
    last_name: {
      type: Sequelize.STRING,
    },
    picture: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = UserProfile;
