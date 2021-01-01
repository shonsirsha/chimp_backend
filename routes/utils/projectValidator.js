const checkIfExists = require("./checkIfExists");
const tagValidator = async (projectUids) => {
	let x;
	for (const uid of projectUids) {
		const tagExists = await checkIfExists("projects", "project_uid", uid);
		if (!tagExists) {
			x = false;
			break;
		} else {
			x = true;
		}
	}
	return x;
};

module.exports = tagValidator;
