const Sequelize = require("sequelize");
const db2 = require("../db/db2");

const TagContact = db2.define(
  "tag_contact",
  {
    user_uid: {
      type: Sequelize.STRING,
    },
    contact_uid: {
      type: Sequelize.STRING,
    },
    tag: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = TagContact;
