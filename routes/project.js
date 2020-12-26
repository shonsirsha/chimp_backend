const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Projects = require("../models/Projects");
const router = express.Router();
const checkIfExistsUnique = require("./utils/checkIfExistsUnique");

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
	],
	auth,
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { user_uid } = req;
			const {
				project_uid,
				project_name,
				project_starts,
				project_ends,
			} = req.body;
			const projectExists = await checkIfExistsUnique(
				"projects",
				"project_uid",
				project_uid,
				user_uid
			);

			if (projectExists) {
				return res.status(400).json({ msg: "project_already_exists" });
			}

			await Projects.create({
				user_uid,
				project_uid,
				project_name,
				project_starts,
				project_ends,
				created_at: Date.now(),
				updated_at: Date.now(),
			});
			return res.status(200).json({ msg: "project_created", project_uid });
		} catch (e) {
			return res.status(500).send("Server error" + e);
		}
	}
);

module.exports = router;
