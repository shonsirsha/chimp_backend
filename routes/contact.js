const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { check, validationResult } = require("express-validator");
const path = require("path");
const auth = require("../middleware/auth");
const Contacts = require("../models/Contacts");
const TagContact = require("../models/TagContact");
const CompanyContact = require("../models/CompanyContact");
const router = express.Router();
const checkIfExists = require("./utils/checkIfExists");
const deleteFile = require("./utils/deleteFile");
const setLastCacheTime = require("./utils/caching/setLastCacheTime");
const arrayShaper = require("./utils/arrayShaper");
const companyValidator = require("./utils/companyValidator");
const tagValidator = require("./utils/tagValidator");

//@route    GET api/contact
//@desc     Get a contact for currently logged in user
//@access   Private
router.get(
	"/",
	[check("contact_uid", "contact_uid_fail").exists()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;

			const userExists = checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}

			const { contact_uid } = req.body;
			const contactExists = await checkIfExists(
				"contacts",
				"contact_uid",
				contact_uid
			);
			if (contact_uid.length === 0 || !contactExists) {
				return res.status(400).json({ msg: "contact_not_found" });
			}
			const allContacts = await Contacts.findAll({
				where: {
					contact_uid,
					user_uid,
				},
			});

			const tagUids = await TagContact.findAll({
				attributes: ["tag_uid"],
				where: {
					contact_uid,
					user_uid,
				},
			});

			const companyUidsFromDb = await CompanyContact.findAll({
				field: ["company_uid"],
				where: {
					contact_uid,
				},
			});
			let contactModel = allContacts[0].dataValues;

			if (contactModel.picture !== "") {
				let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
				contactModel.picture = `${process.env.FILE_SERVER_HOST}/${dir}/${companyModel.picture}`;
			}

			let tags = [];
			// tagsFromDb.forEach(({ tag }) => {
			// 	tags.push(tag);
			// });

			tagUids.forEach(({ tag_uid }) => {
				tags.push(tag_uid);
			});

			let companyUids = [];
			companyUidsFromDb.forEach(({ company_uid }) => {
				companyUids.push(company_uid);
				console.log(company_uid);
			});

			contactModel["tags"] = tags;
			contactModel["companies"] = companyUids;

			return res.status(200).json({ msg: "success", contact: contactModel });
		} catch (e) {
			return res.status(500).send("Server error");
		}
	}
);

//@route    POST api/contact
//@desc     Create a contact for currently logged in user
//@access   Private
router.post(
	"/",
	[
		check("first_name", "first_name_fail").exists(),
		check("last_name", "last_name_fail").exists(),
		check("phone", "phone_fail").exists(),
		check("email", "email_fail").exists().isEmail(),
		check("dob", "dob_fail").exists(),
		check("note", "note_fail").exists(),
		check("company_uids", "company_uids_fail").exists(),
		check("tags", "tags_fail").exists(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const userExists = checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			const {
				first_name,
				last_name,
				phone,
				email,
				dob,
				note,
				company_uids,
				tags,
			} = req.body;
			if (!Array.isArray(tags)) {
				return res.status(400).json({ msg: "tags_not_array" });
			}

			if (!Array.isArray(company_uids)) {
				return res.status(400).json({ msg: "company_uid_not_array" });
			}

			const shapedCompanyUidArray = arrayShaper(company_uids);
			const shapedTagsArray = arrayShaper(tags);

			if (
				(await tagValidator(shapedTagsArray)) ||
				shapedTagsArray.length === 0
			) {
				// all tag uid present in db
				if (
					(await companyValidator(shapedCompanyUidArray)) ||
					shapedCompanyUidArray.length === 0
				) {
					// all company uid present in db

					const contact_uid = `cont-${uuidv4()}`;
					try {
						await Contacts.create({
							user_uid,
							contact_uid,
							first_name,
							last_name,
							phone,
							email,
							dob,
							note,
							picture: "",
							created_at: Date.now(),
						});

						//if there's a tag for this contact
						if (shapedTagsArray.length > 0) {
							shapedTagsArray.forEach(async (tag_uid) => {
								try {
									await TagContact.create({
										tag_uid,
										contact_uid,
										user_uid,
									});
								} catch (e) {
									return res.status(500).send("Server error");
								}
							});
						}

						//if this contact works for any company
						if (shapedCompanyUidArray.length > 0) {
							shapedCompanyUidArray.forEach(async (uid) => {
								await CompanyContact.create({
									contact_uid,
									company_uid: uid,
								});
								const setLastWrite = await setLastCacheTime(
									"lastContactWriteToDb",
									user_uid
								);
								if (setLastWrite) {
									return res
										.status(200)
										.json({ msg: "contact_added", contact_uid });
								} else {
									return res.status(400).json({ msg: "caching_error" });
								}
							});
						} else {
							const setLastWrite = await setLastCacheTime(
								"lastContactWriteToDb",
								user_uid
							);
							if (setLastWrite) {
								return res
									.status(200)
									.json({ msg: "contact_added", contact_uid });
							} else {
								return res.status(400).json({ msg: "caching_error" });
							}
						}
					} catch (e) {
						return res.status(500).send("Server error");
					}
				} else {
					return res
						.status(400)
						.json({ msg: "one_or_more_invalid_company_uid" });
				}
			} else {
				//something wrong with the tags uid
				return res.status(400).json({ msg: "one_or_more_invalid_tag_uid" });
			}
		} catch (e) {
			return res.status(500).send("Server error" + e);
		}
	}
);

//@route    PUT api/contact
//@desc     Edit a contact for currently logged in user
//@access   Private
router.put(
	"/",
	[
		check("contact_uid", "contact_uid_fail").exists(),
		check("first_name", "first_name_fail").exists(),
		check("last_name", "last_name_fail").exists(),
		check("phone", "phone_fail").exists(),
		check("email", "email_fail").exists().isEmail(),
		check("dob", "dob_fail").exists(),
		check("note", "note_fail").exists(),
		check("company_uids", "company_uids_fail").exists(),
		check("tags", "tags_fail").exists(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const userExists = checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			const {
				contact_uid,
				first_name,
				last_name,
				phone,
				email,
				dob,
				note,
				tags,
				company_uids,
			} = req.body;

			if (!Array.isArray(tags)) {
				return res.status(400).json({ msg: "tags_not_array" });
			}

			if (!Array.isArray(company_uids)) {
				return res.status(400).json({ msg: "company_uids_not_array" });
			}

			const shapedCompanyUidArray = arrayShaper(company_uids);
			const shapedTagsArray = arrayShaper(tags);

			const contactExists = await checkIfExists(
				"contacts",
				"contact_uid",
				contact_uid
			);
			if (contact_uid.length === 0 || !contactExists) {
				return res.status(400).json({ msg: "contact_not_found" });
			}

			if (
				(await tagValidator(shapedTagsArray)) ||
				shapedTagsArray.length === 0
			) {
				//all tags uid are ok
				if (
					(await companyValidator(shapedCompanyUidArray)) ||
					shapedCompanyUidArray.length === 0
				) {
					//all company uids are ok
					try {
						// readjusting tags (deleting and re-inserting):
						await TagContact.destroy({
							where: {
								user_uid,
								contact_uid,
							},
						}); // delete all tags

						if (shapedTagsArray.length > 0) {
							shapedTagsArray.forEach(async (tag_uid) => {
								await TagContact.create({
									user_uid,
									contact_uid,
									tag_uid,
								});
							}); // insert all tags
						}
						await Contacts.update(
							{
								first_name,
								last_name,
								phone,
								email,
								dob,
								note,
							},
							{
								where: {
									user_uid,
									contact_uid,
								},
							}
						);
						await CompanyContact.destroy({
							where: {
								contact_uid,
							},
						});
						if (shapedCompanyUidArray.length > 0) {
							// if all company uid is valid / present in db
							shapedCompanyUidArray.forEach(async (uid, ix) => {
								await CompanyContact.create({
									contact_uid,
									company_uid: uid,
								});
								if (ix === shapedCompanyUidArray.length - 1) {
									const setLastWrite = await setLastCacheTime(
										"lastContactWriteToDb",
										user_uid
									);
									if (setLastWrite) {
										return res
											.status(200)
											.json({ msg: "contact_updated", contact_uid });
									} else {
										return res.status(400).json({ msg: "caching_error" });
									}
								}
							});
						} else {
							const setLastWrite = await setLastCacheTime(
								"lastContactWriteToDb",
								user_uid
							);
							if (setLastWrite) {
								return res
									.status(200)
									.json({ msg: "contact_updated", contact_uid });
							} else {
								return res.status(400).json({ msg: "caching_error" });
							}
						}
					} catch (e) {
						return res.status(500).send("Server error" + e);
					}
				} else {
					return res
						.status(400)
						.json({ msg: "one_or_more_invalid_company_uid" });
				}
			} else {
				//something wrong with the tags uid
				return res.status(400).json({ msg: "one_or_more_invalid_tag_uid" });
			}
		} catch (e) {
			console.log(e);
			return res.status(500).send("Server error");
		}
	}
);

//@route    PUT api/contact/image/contact_uid
//@desc     Edit a contact's profile picture (image) for currently logged in user
//@access   Private
router.put("/image/:contact_uid", auth, async (req, res) => {
	const { user_uid } = req;
	const userExists = checkIfExists("users", "user_uid", user_uid);
	if (!userExists) {
		return res.status(400).json({ msg: "invalid_credentials" });
	}
	const { contact_uid } = req.params;
	const contactExists = await checkIfExists(
		"contacts",
		"contact_uid",
		contact_uid
	);
	if (!contactExists || contact_uid.length.length === 0) {
		return res.status(400).json({ msg: "contact_not_found" });
	}
	if (req.files === null || req.files === undefined) {
		return res.status(400).json({ msg: "file_not_found" });
	}
	const { file } = req.files;
	try {
		const fileExt = path.extname(file.name);
		let newFileName =
			file.name.substr(0, file.name.lastIndexOf(".")).replace(/ /g, "") +
			Date.now() +
			fileExt;
		let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
		await deleteFile(
			false,
			"images/contact_image",
			contact_uid,
			"contacts",
			"picture",
			"contact_uid"
		);
		fs.mkdirSync(dir, { recursive: true });
		file.mv(`${dir}/${newFileName}`, async (err) => {
			if (err) {
				return res.status(400).json({ msg: `mv_file_failed` });
			}
			//updates in in db
			try {
				await Contacts.update(
					{
						picture: newFileName,
					},
					{
						where: {
							contact_uid,
						},
					}
				);
				const setLastWrite = await setLastCacheTime(
					"lastContactWriteToDb",
					user_uid
				);
				if (setLastWrite) {
					return res.status(200).json({
						msg: "picture_updated",
						picture: `${process.env.FILE_SERVER_HOST}/${dir}/${newFileName}`,
					});
				}
				return res.status(400).json({ msg: "caching_error" });
			} catch (e) {
				return res.status(500).send("Server error");
			}
		});
	} catch (e) {
		return res.status(500).send("Server error");
	}
});

//@route    DELETE api/contact/image/contact_uid
//@desc     DELETE / REMOVE (currently logged in) a user's contact's image
//@access   Private
router.delete(
	"/image",
	check("contact_uid", "contact_uid_fail").exists(),
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { user_uid } = req;
		const userExists = checkIfExists("users", "user_uid", user_uid);
		if (!userExists) {
			return res.status(400).json({ msg: "invalid_credentials" });
		}
		const { contact_uid } = req.body;

		const contactExists = await checkIfExists(
			"contacts",
			"contact_uid",
			contact_uid
		);
		if (!contactExists || contact_uid.length.length === 0) {
			return res.status(400).json({ msg: "contact_not_found" });
		}
		try {
			let dir = `${process.env.USER_UPLOAD_CONTACT_IMAGE}${contact_uid}`;
			if (!fs.existsSync(dir)) {
				return res.status(200).json({ msg: "picture_removed" });
			} else {
				await deleteFile(
					true,
					"images/contact_image",
					contact_uid,
					"contacts",
					"picture",
					"contact_uid"
				);

				const setLastWrite = await setLastCacheTime(
					"lastContactWriteToDb",
					user_uid
				);
				if (setLastWrite) {
					return res.status(200).json({ msg: "picture_removed" });
				}
				return res.status(400).json({ msg: "caching_error" });
			}
		} catch (e) {
			return res.status(500).send("Server error");
		}
	}
);

//@route    DELETE api/contact
//@desc     Delete a contact for currently logged in user
//@access   Private
router.delete(
	"/",
	[check("contact_uid", "contact_uid_fail").exists()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const userExists = checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			const { contact_uid } = req.body;
			const contactExists = await checkIfExists(
				"contacts",
				"contact_uid",
				contact_uid
			);
			if (contact_uid.length === 0 || !contactExists) {
				return res.status(400).json({ msg: "contact_not_found" });
			}
			try {
				await TagContact.destroy({
					where: {
						user_uid,
						contact_uid,
					},
				});
				// await TagContact.destroy({
				// 	where: {
				// 		contact_uid,
				// 		user_uid,
				// 	},
				// });
				await CompanyContact.destroy({
					where: {
						contact_uid,
					},
				});
				await Contacts.destroy({
					where: {
						contact_uid,
						user_uid,
					},
				});
				const setLastWrite = await setLastCacheTime(
					"lastContactWriteToDb",
					user_uid
				);
				if (setLastWrite) {
					return res.status(200).json({ msg: "contact_deleted" });
				} else {
					return res.status(400).json({ msg: "caching_error" });
				}
			} catch (e) {
				return res.status(500).send("Server error");
			}
		} catch (e) {
			return res.status(500).send("Server error");
		}
	}
);

module.exports = router;
