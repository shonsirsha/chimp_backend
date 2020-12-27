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

//@route    POST api/project
//@desc     Create a new project
//@access   Private
router.post(
	"/",
	[
		check("project_uid", "project_uid_fail").exists(),
		check("project_name", "project_name_fail").exists(),
		check("project_starts", "project_starts_fail").exists(),
		check("project_ends", "project_ends_fail").exists(),
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
				project_uid,
				project_name,
				project_starts,
				project_ends,
				tags,
			} = req.body;

			if (!Array.isArray(tags)) {
				return res.status(400).json({ msg: "tags_not_array" });
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

			const shapedTagsArray = arrayShaper(tags);

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
						project_starts,
						project_ends,
						created_at: Date.now(),
						updated_at: Date.now(),
					});

					shapedTagsArray.forEach(async (tag_uid) => {
						try {
							await TagProject.create({
								user_uid,
								project_uid,
								tag_uid,
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

			const userExists = checkIfExists("users", "user_uid", user_uid);
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

			projectModel["tags"] = tags;

			return res.status(200).json({ msg: "success", project: projectModel });
		} catch (e) {
			return res.status(500).send("Server error " + e);
		}
	}
);

module.exports = router;
