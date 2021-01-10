const express = require("express");
const auth = require("../middleware/auth");
const Companies = require("../models/Companies");
const CompanyContact = require("../models/CompanyContact");
const TagCompany = require("../models/TagCompany");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");

//@route    GET api/companies
//@desc     Get all companies for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
	try {
		const { user_uid } = req;

		const userExists = await checkIfExists("users", "user_uid", user_uid);
		if (!userExists) {
			return res.status(400).json({ msg: "invalid_credentials" });
		}
		let companiesArr = [];
		try {
			//get all companies
			const companies = await Companies.findAll({
				where: {
					user_uid: user_uid,
				},
			});
			//loop thru fetched companies
			if (companies.length > 0) {
				companies.map(async (company, ix) => {
					let company_contact_arr = [];
					let tag_company_arr = [];
					let companyObj = company.dataValues;

					//give picture a full url if exists
					if (companyObj.picture !== "") {
						let dir = `${process.env.USER_UPLOAD_COMPANY_IMAGE}${company.dataValues.company_uid}`;
						companyObj.picture = `${process.env.FILE_SERVER_HOST}/${dir}/${companyObj.picture}`;
					}

					//get all company contact (getting all contacts for this company)
					const company_contact = await CompanyContact.findAll({
						where: {
							company_uid: company.dataValues.company_uid,
						},
						attributes: ["contact_uid"],
					});

					const tag_company = await TagCompany.findAll({
						where: {
							company_uid: company.dataValues.company_uid,
						},
						attributes: ["tag_uid"],
					});

					//loop thru fetched cC
					company_contact.map((cc) => {
						company_contact_arr.push(cc.dataValues.contact_uid);
					});

					tag_company.map((tc) => {
						tag_company_arr.push(tc.dataValues.tag_uid);
					});

					//setting all contacts that works for this company (cC)
					companyObj["contact_uids"] = company_contact_arr;

					//setting all tags that this company has
					companyObj["tag_uids"] = tag_company_arr;

					companiesArr.push(companyObj);
					if (ix === companies.length - 1) {
						return res
							.status(200)
							.json({ msg: "success", companies: companiesArr });
					}
				});
			} else {
				return res.status(200).json({ msg: "success", companies: [] });
			}
		} catch (e) {
			return res.status(500).send("Server error");
		}
	} catch (e) {
		return res.status(500).send("Server error");
	}
});

module.exports = router;
