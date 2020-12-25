const express = require("express");
const auth = require("../middleware/auth");
const Tag = require("../models/Tag");
const router = express.Router();

// //@route    GET api/tags
// //@desc     Get all tags for currently logged in user
// //@access   Private
router.get("/", auth, async (req, res) => {
	try {
		const { user_uid } = req;

		const tags = await Tag.findAll({
			where: {
				user_uid,
			},
		});
		return res.status(200).json({ msg: "success", tags });
	} catch (e) {
		return res.status(500).send("Server error" + e);
	}
});

module.exports = router;
