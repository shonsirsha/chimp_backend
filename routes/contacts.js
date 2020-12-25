const express = require("express");
const auth = require("../middleware/auth");
const Contacts = require("../models/Contacts");
const TagContact = require("../models/TagContact");
const CompanyContact = require("../models/CompanyContact");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");
const setLastCacheTime = require("./utils/caching/setLastCacheTime");
const setCache = require("./utils/caching/general/setCache");
const shouldGetFromCache = require("./utils/caching/shouldGetFromCache");
const getCache = require("./utils/caching/general/getCache");

const getAllContacts = async (user_uid, res) => {
	let contactsArr = [];

	try {
		const allContacts = await Contacts.findAll({
			where: {
				user_uid: user_uid,
			},
		});
		if (allContacts.length > 0) {
			allContacts.map(async (contact, ix) => {
				let tagsArr = [];
				let companyContactArr = [];

				let contactObj = contact.dataValues;

				//give picture a full url if exists
				if (contactObj.picture !== "") {
					let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contactObj.contact_uid}`;
					contactObj.picture = `${process.env.FILE_SERVER_HOST}/${dir}/${contactObj.picture}`;
				}

				//get all tag uids
				const allTagUids = await TagContact.findAll({
					attributes: ["tag_uid"],
					where: {
						contact_uid: contactObj.contact_uid,
						user_uid: contactObj.user_uid,
					},
				});

				const allCompanyContact = await CompanyContact.findAll({
					attributes: ["company_uid"],
					where: {
						contact_uid: contactObj.contact_uid,
					},
				});

				contactsArr.push(contact.dataValues);

				allTagUids.map(({ tag_uid }) => {
					tagsArr.push(tag_uid);
				});
				//setting all tags
				contactObj["tags"] = tagsArr;

				//loop thru the fetched companyContact
				allCompanyContact.map((ccObj) => {
					companyContactArr.push(ccObj.dataValues.company_uid);
				});

				//setting all cC
				contactObj["companies"] = companyContactArr;

				if (ix === allContacts.length - 1) {
					const setLastRead = await setLastCacheTime(
						"lastContactReadFromDb",
						user_uid
					);
					await setCache("contacts", [user_uid, JSON.stringify(contactsArr)]); // if it fails, it fails silently - users don't need to be notified
					if (setLastRead) {
						return res
							.status(200)
							.json({ msg: "success", contacts: contactsArr });
					}
				}
			});
		} else {
			//returns empty array (user has 0 contact)
			const setLastRead = await setLastCacheTime(
				"lastContactReadFromDb",
				user_uid
			);
			if (setLastRead) {
				return res.status(200).json({ msg: "success", contacts: [] });
			}
			// }
		}
	} catch (e) {
		return res.status(500).send("Server error");
	}
};

//@route    GET api/contacts
//@desc     Get all contacts for currently logged in user
//@access   Private
router.get("/", auth, async (req, res) => {
	try {
		const { user_uid } = req;
		const userExists = checkIfExists("users", "user_uid", user_uid);
		if (!userExists) {
			return res.status(400).json({ msg: "user_not_found" });
		}
		const shouldUseCachedData = await shouldGetFromCache(
			"lastContactWriteToDb",
			"lastContactReadFromDb",
			user_uid
		);

		if (shouldUseCachedData) {
			const contacts = JSON.parse(await getCache("contacts", user_uid));
			if (!contacts || contacts === null || contacts === undefined) {
				getAllContacts(user_uid, res);
			}
			return res.status(200).json({ msg: "success", contacts });
		} else {
			getAllContacts(user_uid, res);
		}
	} catch (e) {
		return res.status(500).send("Server error");
	}
});

module.exports = router;
