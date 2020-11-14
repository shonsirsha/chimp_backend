const express = require("express");
const router = express.Router();

// set hash type
const setCache = async (parentKeyName, childKeyName) => {
  const cacheSet = await HSET_ASYNC(parentKeyName, childKeyName); // set cache;
  if (cacheSet) {
    return true;
  }
  return false;
};

const getCache = async (parentKeyName, childKeyName) => {
  const data = await HGET_ASYNC(parentKeyName, childKeyName);
  return data;
};

router.get("/", (req, res) => {
  return res.status(200).json({ msg: `Hello world! ${process.env.NODE_ENV}` });
});

module.exports = router;
