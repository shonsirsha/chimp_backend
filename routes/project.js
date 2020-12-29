const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Projects = require("../models/Projects");
const TagProject = require("../models/TagProject");
const router = express.Router();
const checkIfExistsUnique = require("./utils/checkIfExistsUnique");
const arrayShaper = require("./utils/arrayShaper");
const tagValidator = require("./utils/tagValidator");
const checkIfExists = require("./utils/checkIfExists");
const ProjectContact = require("../models/ProjectContact");

//@route    GET api/project
//@desc     Get a project for currently logged in user
//@access   Private
router.get(
	"/",
	[check("project_uid", "project_uid_fail").exists()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;

			const userExists = await checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}

			const { project_uid } = req.body;
			const projectExists = await checkIfExists(
				"projects",
				"project_uid",
				project_uid
			);
			if (project_uid.length === 0 || !projectExists) {
				return res.status(400).json({ msg: "project_not_found" });
			}
			const allProjects = await Projects.findAll({
				where: {
					project_uid,
					user_uid,
				},
			});

			const tagUids = await TagProject.findAll({
				attributes: ["tag_uid"],
				where: {
					project_uid,
					user_uid,
				},
			});

			let tags = [];

			tagUids.forEach(({ tag_uid }) => {
				tags.push(tag_uid);
			});

			let projectModel = allProjects[0].dataValues;

			projectModel["tag_uids"] = tags;

			return res.status(200).json({ msg: "success", project: projectModel });
		} catch (e) {
			return res.status(500).send("Server error " + e);
		}
	}
);

//@route    POST api/project
//@desc     Create a new project
//@access   Private
router.post(
	"/",
	[
		check("project_uid", "project_uid_fail").exists(),
		check("project_name", "project_name_fail").exists(),
		check("project_note", "project_note_fail").exists(),
		check("project_status", "project_status_fail").exists(),
		check("project_starts", "project_starts_fail").exists(),
		check("project_ends", "project_ends_fail").exists(),
		check("project_due", "project_due_fail").exists(),
		check("tag_uids", "tag_uids_fail").exists(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const userExists = await checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			const {
				project_uid,
				project_name,
				project_note,
				project_status,
				project_starts,
				project_ends,
				project_due,
				tag_uids,
			} = req.body;

			if (!Array.isArray(tag_uids)) {
				return res.status(400).json({ msg: "tag_uids_not_array" });
			}

			const projectExists = await checkIfExistsUnique(
				"projects",
				"project_uid",
				project_uid,
				user_uid
			);

			if (projectExists) {
				return res.status(400).json({ msg: "project_already_exists" });
			}

			const shapedTagsArray = arrayShaper(tag_uids);

			if (
				(await tagValidator(shapedTagsArray)) ||
				shapedTagsArray.length === 0
			) {
				// all tag uid present in db
				try {
					await Projects.create({
						user_uid,
						project_uid,
						project_name,
						project_note,
						project_status,
						project_starts,
						project_ends,
						project_due,
						created_at: Date.now(),
						updated_at: Date.now(),
					});

					shapedTagsArray.forEach(async (tag_uid) => {
						try {
							await TagProject.create({
								user_uid,
								project_uid,
								tag_uid,
								created_at: Date.now(),
							});
						} catch (e) {
							return res.status(500).send("Server error");
						}
					});

					return res.status(200).json({ msg: "project_created", project_uid });
				} catch {
					return res.status(500).send("Server error");
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

//@route    PUT api/project
//@desc     Edit / update a single project
//@access   Private
router.put(
	"/",
	[
		check("project_uid", "project_uid_fail").exists(),
		check("project_name", "project_name_fail").exists(),
		check("project_note", "project_note_fail").exists(),
		check("project_status", "project_status_fail").exists(),
		check("project_starts", "project_starts_fail").exists(),
		check("project_ends", "project_ends_fail").exists(),
		check("project_due", "project_due_fail").exists(),
		check("tag_uids", "tag_uids_fail").exists(),
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const userExists = await checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			const {
				project_uid,
				project_name,
				project_note,
				project_status,
				project_starts,
				project_ends,
				project_due,
				tag_uids,
			} = req.body;

			const projectExists = await checkIfExists(
				"projects",
				"project_uid",
				project_uid
			);

			if (project_uid.length === 0 || !projectExists) {
				return res.status(400).json({ msg: "project_not_found" });
			}

			if (!Array.isArray(tag_uids)) {
				return res.status(400).json({ msg: "tag_uids_not_array" });
			}

			const shapedTagsArray = arrayShaper(tag_uids);

			if (
				!(await tagValidator(shapedTagsArray)) &&
				shapedTagsArray.length > 0
			) {
				//something wrong with the tags uid
				return res.status(400).json({ msg: "one_or_more_invalid_tag_uid" });
			}

			try {
				// readjusting tags (deleting and re-inserting):
				await TagProject.destroy({
					where: {
						user_uid,
						project_uid,
					},
				}); // delete all tags

				await Projects.update(
					{
						project_name,
						project_note,
						project_status,
						project_starts,
						project_ends,
						project_due,
						updated_at: Date.now(),
					},
					{
						where: {
							project_uid,
							user_uid,
						},
					}
				);

				if (shapedTagsArray.length > 0) {
					shapedTagsArray.forEach(async (tag_uid) => {
						try {
							await TagProject.create({
								user_uid,
								project_uid,
								tag_uid,
								created_at: Date.now(),
							}); // insert all tags
						} catch (e) {
							return res.status(500).send("Server error");
						}
					});
				}

				return res.status(200).json({ msg: "project_updated", project_uid });
			} catch {
				return res.status(500).send("Server error");
			}
		} catch (e) {
			return res.status(500).send("Server error" + e);
		}
	}
);

// //@route    DELETE api/project
// //@desc     Delete a project for currently logged in user
// //@access   Private
router.delete(
	"/",
	[check("project_uid", "project_uid_fail").exists()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const { project_uid } = req.body;

			const projectExists = await checkIfExists(
				"projects",
				"project_uid",
				project_uid
			);
			if (!projectExists || project_uid.length === 0) {
				return res.status(400).json({ msg: "project_not_found" });
			}
			await TagProject.destroy({
				where: {
					project_uid,
					user_uid,
				},
			}); //delete all relationship between this project and its tag(s)

			await ProjectContact.destroy({
				where: {
					project_uid,
					user_uid,
				},
			}); //delete all relationship between this project and its contact(s)

			await Projects.destroy({
				where: {
					project_uid,
					user_uid,
				},
			}); // delete the project

			return res.status(200).json({ msg: "project_deleted" });
		} catch (e) {
			return res.status(500).send("Server error" + e);
		}
	}
);

module.exports = router;
