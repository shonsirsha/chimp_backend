const express = require("express");
const auth = require("../middleware/auth");
const Projects = require("../models/Projects");
const TagProject = require("../models/TagProject");
const router = express.Router();

// //@route    GET api/projects
// //@desc     Get all projects for currently logged in user
// //@access   Private
router.get("/", auth, async (req, res) => {
	try {
		const { user_uid } = req;

		const projects = await Projects.findAll({
			where: {
				user_uid,
			},
		});
		let projArrs = [];
		projects.map(async (project, ix) => {
			let projTagsArr = [];
			let projModel = project.dataValues;
			const projectTags = await TagProject.findAll({
				where: {
					project_uid: projModel.project_uid,
					user_uid: projModel.user_uid,
				},
			});
			projectTags.map((tag) => {
				projTagsArr.push(tag.dataValues.tag_uid);
			});
			projModel["tag_uids"] = projTagsArr;
			projArrs.push(projModel);
			if (ix === projects.length - 1) {
				return res.status(200).json({ msg: "success", projects: projArrs });
			}
		});
	} catch (e) {
		return res.status(500).send("Server error" + e);
	}
});

module.exports = router;
