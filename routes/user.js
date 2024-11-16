import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

import User from '../models/User.js';

// GET ONE STUDENT
router.post('/get_user', async (req, res) => {
	const user_uid = req.body.user_uid;

	try {
		const getuser = await User.findOne({
			user_uid: user_uid,
		});

		if (getuser) {
			return res.status(200).json({
				status: 'ok',
				message: 'SUCCESS GET THE user',
				role: getuser.role,
			});
		} else {
			return res.status(200).json({
				status: 'Error',
				message: 'NOT FIND user ID',
			});
		}
	} catch (error) {
		console.log('errorrrr' + error);
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});

// POST REGISTER NEW user
router.post('/user_register', async (req, res) => {
	const user_id = req.body.user_id;
	const user_name = req.body.user_name;
	const user_email = req.body.user_email;
	const user_uid = req.body.user_uid;
	const user_password = req.body.user_password;
	const user_role = req.body.user_role;

	// user credential validation
	if (!user_id || !user_password || !user_name || !user_email) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Sila lengkapkan maklumat.' });
	}

	// hash password
	const hashedPassword = await bcrypt.hash(user_password, 10);

	// create user
	const user = new User({
		user_id: user_id,
		user_uid: user_uid,
		name: user_name,
		password: hashedPassword,
		email: user_email,
		role: user_role,
	});

	// save user to database
	try {
		await user.save();

		return res.status(200).json({
			status: 'SUCCESS',
			message: 'BERJAYA SAVE user!!',
			role: user.role,
		});
	} catch (error) {
		if (error) {
			console.log(error);
			return res
				.status(400)
				.json({ status: 'error', message: 'ada error takleh save user' });
		}
	}
});

// POST LOGIN user
router.post('/user_login', async (req, res) => {
	const user_id = req.body.user_id;
	const user_password = req.body.password;

	// user credentials validation
	if (!user_id || !user_password) {
		return res.status(403).json({ message: 'Sila lengkapkan maklumat' });
	}

	try {
		const user = await User.findOne({
			user_id,
		});

		if (!user) {
			return res.status(403).json({ message: 'not match our record' });
		}

		// check password using bcrypt
		const checkPassword = await bcrypt.compare(user_password, user.password);

		if (!checkPassword) {
			return res.status(403).json({ message: 'Salah username atau password' });
		}

		const token = jwt.sign({ id: user._id }, 'passwordKey');
		res.json({ token, ...user._doc });
	} catch (error) {
		res.status(500).json({ error: e.message });
	}
});

export default router;
