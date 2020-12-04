const express = require("express");
const auth = require("../middleware/auth");
const Companies = require("../models/Companies");
const CompanyContact = require("../models/CompanyContact");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");

//@route    GET api/companies
//@desc     Get all companies for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
  try {
    const { user_uid } = req;

    const userExists = checkIfExists("users", "user_uid", user_uid);
    if (!userExists) {
      return res.status(400).json({ msg: "invalid_credentials" });
    }
    let companiesArr = [];
    try {
      const companies = await Companies.findAll({
        where: {
          user_uid: user_uid,
        },
      });
      companies.map(async (company, ix) => {
        let company_contact_arr = [];
        const company_contact = await CompanyContact.findAll({
          where: {
            company_uid: company.dataValues.company_uid,
          },
          attributes: ["contact_uid"],
        });
        company_contact.map((cc) => {
          company_contact_arr.push(cc.dataValues.contact_uid);
        });
        let returned = company.dataValues;
        returned["people"] = company_contact_arr;
        if (returned.picture !== "") {
          let dir = `${process.env.USER_UPLOAD_COMPANY_IMAGE}${company.dataValues.company_uid}`;
          returned.picture = `${process.env.FILE_SERVER_HOST}/${dir}/${returned.picture}`;
        }
        companiesArr.push(returned);
        if (ix === companies.length - 1) {
          return res
            .status(200)
            .json({ msg: "success_orm", companies: companiesArr });
        }
      });
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    return res.status(500).send("Server error");
  }
});

module.exports = router;
