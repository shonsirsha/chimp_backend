const checkIfExists = require("./checkIfExists");
const tagValidator = async (tagUids) => {
	let x;
	for (const uid of tagUids) {
		const tagExists = await checkIfExists("tags", "tag_uid", uid);
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
