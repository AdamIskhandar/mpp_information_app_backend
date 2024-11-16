import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

// MPP Collection from database
import MPP from '../models/Mpp.js';
import auth from '../middleware/auth.js';

// GET /
router.get('/', async (req, res) => {
	res.status(200).json({
		status: 'SUCCESS',
		message: 'MPP ROUTES',
	});
});

// ------------------------------------------------------        ROUTER MPP                           ----------------------------------------------
// GET ONE MPP
router.post('/get_mpp', auth, async (req, res) => {
	const mpp_id = req.body.mppID;

	try {
		const getMpp = await MPP.findOne({
			_id: mpp_id,
		});

		if (getMpp) {
			return res.status(200).json({
				status: 'ok',
				message: 'SUCCESS GET THE MPP',
				data: getMpp,
			});
		} else {
			return res.status(200).json({
				status: 'Error',
				message: 'NOT FIND MPP ID',
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
// GET ALL STUDENT
router.get('/get_all_mpp', auth, async (req, res) => {
	try {
		const all_mpp = await MPP.find().sort({ createdAt: -1 });

		return res.status(200).json({
			status: 'ok',
			message: 'SUCCESS GET ALL MPP',
			data: all_mpp,
		});
	} catch (error) {
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});

// CREATE NEW MPP ACC
router.post('/create_mpp', async (req, res) => {
	const mpp_id = req.body.mppID;
	const mpp_name = req.body.mppName;

	if (!mpp_id || !mpp_name) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Please fill the mandatory field.' });
	}

	const mpp = await MPP.findOne({ MPP_id: mpp_id });

	if (mpp) {
		return res
			.status(403)
			.json({ message: 'this mpp id is already registered.' });
	}

	// hash password
	const hashedPassword = await bcrypt.hash('12345678', 10);

	// create MPP object
	const Mpp = new MPP({
		MPP_id: mpp_id,
		password: hashedPassword,
		name: mpp_name,
		faculty: '',
		course: '',
		currentSemester: '',
		event_feedback: [],
		event_feedback: [],
		mppToken: '',
	});

	// save student to database
	try {
		await Mpp.save();

		res.status(200).json({
			status: 'Success',
			message: 'Successfully Create New Mpp',
		});
	} catch (error) {
		if (error) {
			console.log(error);
			return res
				.status(400)
				.json({ status: 'error', message: 'Error to create new MPP' });
		}
	}
});

// add fcm token to student
router.post('/addFcmToken', auth, async (req, res) => {
	const mppID = req.body.mppID;
	const fcmToken = req.header('x-fcm-token');

	try {
		const mpp = await MPP.findOne({ _id: mppID });

		if (!mpp) {
			return res.status(403).json({ message: 'not find this mpp' });
		}

		if (mpp.mppToken == '') {
			const addToken = await mpp.updateOne({
				mppToken: fcmToken,
			});

			if (addToken) return res.status(200).json(true);
		} else if (mpp.mppToken == fcmToken) {
			return res.status(200).json(false);
		} else if (mpp.mppToken != fcmToken) {
			const addToken = await MPP.updateOne({
				mppToken: fcmToken,
			});

			if (addToken) return res.status(200).json(true);
		}
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// remove token from mpp

// MPP LOGIN
router.post('/mpp_login', async (req, res) => {
	const mpp_id = req.body.mppID;
	const mpp_pass = req.body.mppPassword;

	// user credentials validation
	if (!mpp_id || !mpp_pass) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Please Fill all Form' });
	}

	try {
		const Mpp = await MPP.findOne({
			MPP_id: mpp_id,
		});

		if (!Mpp) {
			return res
				.status(403)
				.json({ status: 'error', message: 'Wrong Password or Username' });
		}

		// check password using bcrypt
		const checkPassword = await bcrypt.compare(mpp_pass, Mpp.password);

		if (!checkPassword) {
			return res
				.status(403)
				.json({ status: 'error', message: 'Wrong Password or Usernameyyy' });
		}
		let payload = { id: Mpp._id };
		const token = jwt.sign(payload, process.env.JWT_SECRET);
		res.json({ token, ...Mpp._doc });
	} catch (error) {
		console.log(error.message);
		res.status(403).json({ status: 'error', message: 'error' });
	}
});

// GET STUDENT DETAILS
router.post('/mpp_details', auth, async (req, res) => {
	const mppID = req.body.mppID;

	try {
		const mpp = await MPP.findOne({ _id: mppID });

		if (!mpp) {
			res.status(403).json({ message: 'not find this mpp' });
		}

		res.json({ token: req.token, ...mpp._doc });
	} catch (error) {
		console.log('error');
		res.status(403).json({ message: error.message });
	}
});

// mpp change password
router.patch('/changePassword', auth, async (req, res) => {
	const mppID = req.body.mppID;
	const oldPassword = req.body.oldPassword;
	const newPassword = req.body.newPassword;

	console.log(oldPassword);
	console.log(newPassword);

	try {
		const mpp = await MPP.findOne({ _id: mppID });

		if (!mpp) {
			return res.status(403).json({ message: 'not find this mpp' });
		}

		if (oldPassword == '') {
			return res
				.status(403)
				.json({ message: 'Please Enter your Old Password' });
		}

		const checkOldPassword = await bcrypt.compare(oldPassword, mpp.password);
		if (checkOldPassword) {
			const hashedNewPassword = await bcrypt.hash(newPassword, 10);

			if (hashedNewPassword) {
				const updatepassword = await mpp.updateOne({
					password: hashedNewPassword,
				});

				if (updatepassword) {
					return res.status(200).json(true);
				}
			}
		} else {
			return res.status(403).json({ message: 'Wrong Old Password..' });
		}
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});

//  POST EDIT MPP DETAILS
router.patch('/edit_mpp_details', auth, async (req, res) => {
	const mppID = req.body.mppID;
	const mppFaculty = req.body.faculty;
	const mppCourse = req.body.course;
	const mppCurrentSemester = req.body.currentSemester;

	const dataMpp = {
		faculty: mppFaculty.trim(),
		course: mppCourse.trim(),
		currentSemester: mppCurrentSemester.trim(),
	};
	try {
		const mpp = await MPP.findOne({ _id: mppID });

		if (!mpp) {
			return res.status(403).json({ message: 'not find this mpppppp' });
		}

		const updateMpp = await mpp.updateOne({
			$set: dataMpp,
		});

		if (updateMpp) {
			return res.json({ token: req.token, ...mpp._doc });
		} else {
			return res
				.status(403)
				.json({ message: 'Error While Update your Profile.' });
		}

		//
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// DELETE CURRENT MPP
router.delete('/delete_mpp', async (req, res) => {
	const mpp_id = req.body.mpp_id;

	try {
		const Mpp = await MPP.findOne({
			MPP_id: mpp_id,
		});

		if (Mpp) {
			const deleteMpp = await MPP.deleteOne({
				MPP_id: mpp_id,
			});

			return res.status(200).json({
				status: 'Success',
				message: 'Successfull Delete MPP',
			});
		} else {
			res.status(403).json({ status: 'error', message: 'Error To Delete MPP' });
		}
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'NOT FIND MPP ID' });
	}
});

// ------------------------------------------------------         END ROUTER MPP                ----------------------------------------------

export default router;
