const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { check, validationResult } = require("express-validator");
const path = require("path");
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const Tag = require("../models/Tag");
const { Op } = require("sequelize");
const CompanyContact = require("../models/CompanyContact");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");
const checkIfExistsUnique = require("./utils/checkIfExistsUnique");
const deleteFile = require("./utils/deleteFile");
const setLastCacheTime = require("./utils/caching/setLastCacheTime");

//@route    POST api/tag
//@desc     Create a new tag
//@access   Private
router.post(
	"/",
	[
		check("tag_uid", "tag_uid_fail").exists(),
		check("tag_name", "tag_name_fail").exists(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const { tag_uid, tag_name } = req.body;
			const tagExists = await checkIfExistsUnique(
				"tags",
				"tag_name_lc",
				tag_name.toLowerCase(),
				user_uid
			);

			if (tagExists) {
				return res.status(400).json({ msg: "tag_already_exists" });
			}

			await Tag.create({
				tag_uid,
				tag_name,
				tag_name_lc: tag_name.toLowerCase(),
				user_uid,
				created_at: Date.now(),
			});
			return res.status(200).json({ msg: "tag_created", tag_uid });
		} catch (e) {
			return res.status(500).send("Server error" + e);
		}
	}
);

// //@route    PUT api/tag
// //@desc     Edit a tag for currently logged in user
// //@access   Private
router.put(
	"/",
	[
		check("tag_uid", "tag_uid_fail").exists(),
		check("tag_name", "tag_name_fail").exists(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const { tag_uid, tag_name } = req.body;
			const tagExists = await checkIfExists("tags", "tag_uid", tag_uid);
			if (!tagExists || tag_uid.length === 0) {
				return res.status(400).json({ msg: "tag_not_found" });
			}
			const tagInDb = await Tag.findOne({
				where: {
					tag_uid: {
						[Op.ne]: tag_uid,
					},
					tag_name_lc: tag_name.toLowerCase(),
				},
			});
			if (tagInDb !== null) {
				return res.status(400).json({ msg: "tag_already_exists" });
			}

			await Tag.update(
				{
					tag_name,
					tag_name_lc: tag_name.toLowerCase(),
				},
				{
					where: {
						tag_uid,
					},
				}
			);
			return res.status(200).json({ msg: "tag_updated", tag_uid });
		} catch (e) {
			return res.status(500).send("Server error" + e);
		}
	}
);

// //@route    PUT api/company
// //@desc     Edit a company for currently logged in user
// //@access   Private
// router.put(
//   "/",
//   [
//     check("company_name", "company_name_fail").exists(),
//     check("company_email", "company_email_fail").exists(),
//     check("company_website", "company_website_fail").exists(),
//     check("company_phone", "company_phone_fail").exists(),
//     check("company_uid", "company_uid_fail").exists(),
//   ],
//   auth,
//   async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { user_uid } = req;
//       const {
//         company_name,
//         company_email,
//         company_website,
//         company_phone,
//         company_uid,
//       } = req.body;

//       const companyExists = await checkIfExists(
//         "companies",
//         "company_uid",
//         company_uid
//       );

//       if (company_uid.length === 0 || !companyExists) {
//         return res.status(400).json({ msg: "company_not_found" });
//       }

//       await Companies.update(
//         {
//           company_name,
//           company_email,
//           company_website,
//           company_phone,
//         },
//         {
//           where: {
//             user_uid,
//             company_uid,
//           },
//         }
//       );
//       return res.status(200).json({ msg: "company_updated", company_uid });
//     } catch (e) {
//       return res.status(500).send("Server error");
//     }
//   }
// );

module.exports = router;
