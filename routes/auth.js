const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const Tokens = require("../models/Tokens");
const generateAccessToken = require("./utils/generateAccessToken");
const checkIfExists = require("./utils/checkIfExists");
const blacklistAccessToken = require("./utils/blacklistAccessToken");
const authFailed = require("../middleware/loggers/auth/failed");
const authSucceeded = require("../middleware/loggers/auth/success");
const {
	NO_TOKEN,
	REFRESH_TOKEN_ERROR,
	INVALID_CREDENTIALS,
	EMAIL_UNAVAILABLE,
} = require("../middleware/loggers/auth/types");

router.post(
	"/sign-up",
	[
		check("email", "email_fail").isEmail(),
		check("password", "password_fail").isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body; // destructuring request body
		const userExists = await checkIfExists("users", "email", email);

		if (userExists) {
			authFailed(req, EMAIL_UNAVAILABLE);
			return res.status(400).json({ msg: "email_unavailable" });
		}

		const user_uid = uuidv4();

		const salt = await bcrypt.genSalt(10); //generating salt for password hashing
		const encryptedPassword = await bcrypt.hash(password, salt); // hashing the password

		const token = generateAccessToken(user_uid); // new access token

		const refreshToken = jwt.sign(
			{ payload: user_uid },
			process.env.JWT_REFRESH_SECRET
		); // refresh token
		try {
			await User.create({
				user_uid,
				email,
				password: encryptedPassword,
				created_at: Date.now(),
				updated_at: Date.now(),
			});
			await UserProfile.create({
				user_uid,
				first_name: "",
				last_name: "",
				picture: "",
				created_at: Date.now(),
				updated_at: Date.now(),
			});
			await Tokens.create({
				user_uid,
				refresh_token: refreshToken,
				access_token: token,
			});
			authSucceeded(req);
			return res.status(200).json({ msg: "signed_up", token, user_uid });
		} catch (e) {
			return res.status(500).send("Server error");
		}
	}
);

//@route    POST api/auth/sign-in
//@desc     Logs in / Signs in a user & get token
//@access   Public
router.post(
	"/sign-in",
	[
		check("email", "email_fail").isEmail(),
		check("password", "password_fail").exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const { email, password } = req.body; // destructuring request body
			let passwordFromUser = password;
			const userExists = await checkIfExists("users", "email", email);
			if (!userExists) {
				authFailed(req, INVALID_CREDENTIALS);
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			try {
				const user = await User.findOne({
					where: {
						email: email,
					},
				});

				const {
					dataValues: { password, user_uid },
				} = user;

				const passwordFromDb = password;
				const isMatch = await bcrypt.compare(passwordFromUser, passwordFromDb);

				if (!isMatch) {
					authFailed(req, INVALID_CREDENTIALS);
					return res.status(400).json({ msg: "invalid_credentials" });
				}
				const token = generateAccessToken(user_uid); // new access token

				const refreshToken = jwt.sign(
					{ payload: user_uid },
					process.env.JWT_REFRESH_SECRET
				); // refresh token

				await Tokens.create({
					user_uid,
					refresh_token: refreshToken,
					access_token: token,
				});
				authSucceeded(req);
				return res.status(200).json({ token, msg: "signed_in", user_uid });
			} catch (e) {
				return res.status(500).send("Server error");
			}
		} catch {
			return res.status(500).send("Server error");
		}
	}
);

//@route    POST api/auth/new-access-token
//@desc     Get new access token if expired (by supplying ID & expired access token and exchange it for a new token w/ the help of a refresh token)
//@access   Private (for frontend - as user needs to prove that they have the (expired) access token) - but not actually checked if token is expr via middleware
router.post(
	"/new-access-token",
	[check("user_uid", "user_uid_fail").exists()],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const oldAccessToken = req.header("x-auth-token");

		//check if theres no  token in the header
		if (!oldAccessToken) {
			authFailed(req, NO_TOKEN);
			return res.status(401).json({ msg: "unauthorised" });
		}

		try {
			const { user_uid } = req.body; // destructuring request body
			try {
				const tokenFromDb = await Tokens.findOne({
					attributes: ["refresh_token"],
					where: {
						user_uid: user_uid,
						access_token: oldAccessToken,
					},
				});

				if (tokenFromDb !== null) {
					const {
						dataValues: { refresh_token },
					} = tokenFromDb;
					// if exists
					jwt.verify(
						refresh_token,
						process.env.JWT_REFRESH_SECRET,
						async (err) => {
							if (err) res.status(401).json({ msg: "refresh_token_invalid" }); //token is not valid

							const newAccessToken = generateAccessToken(user_uid); // a new access token (refreshed)
							try {
								await Tokens.update(
									{ access_token: newAccessToken },
									{
										where: {
											user_uid: user_uid,
											refresh_token: refresh_token,
										},
									}
								);
								return res.status(200).json({ token: newAccessToken });
							} catch (e) {
								return res.status(500).send("Server error");
							}
						}
					);
				} else {
					authFailed(req, REFRESH_TOKEN_ERROR);
					return res.status(401).json({ msg: "unauthorised" });
				}
			} catch (e) {
				return res.status(500).send("Server error");
			}
		} catch (e) {
			return res.status(500).send("Server error");
		}
	}
);

//@route    POST api/auth/sign-out
//@desc     Signs out currently logged in user
//@access   Private  (for frontend - as user needs to prove that they have access token) - but not actually checked if token is expr via middleware
router.post(
	"/sign-out",
	[check("user_uid", "user_uid_fail").exists()],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const accessToken = req.header("x-auth-token");

			//check if theres no  token in the header
			if (!accessToken) {
				authFailed(req, NO_TOKEN);
				return res.status(401).json({ msg: "unauthorised" });
			}

			const { user_uid } = req.body; // destructuring request body
			const userExists = await checkIfExists("users", "user_uid", user_uid);
			if (!userExists) {
				authFailed(req, INVALID_CREDENTIALS);
				return res.status(400).json({ msg: "invalid_credentials" });
			}
			const blacklisted = await blacklistAccessToken(user_uid, accessToken);
			if (!blacklisted) {
				return res.status(500).json({ msg: "signout_bl_error" });
			}
			try {
				await Tokens.destroy({
					where: {
						user_uid: user_uid,
						access_token: accessToken,
					},
				});
				return res.status(200).json({ msg: "signed_out" });
			} catch (e) {
				return res.status(500).send("Server error");
			}
		} catch (e) {
			return res.status(500).send("Server Error");
		}
	}
);

module.exports = router;
