const checkIfExists = require("./checkIfExists");
const companyValidator = async (uids) => {
  let x;
  for (const uid of uids) {
    const companyExists = await checkIfExists("companies", "company_uid", uid);
    if (!companyExists) {
      x = false;
      break;
    } else {
      x = true;
    }
  }
  return x;
};

module.exports = companyValidator;
