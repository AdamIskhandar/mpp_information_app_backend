import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

// Student Collection from database
import Student from '../models/Student.js';
import auth from '../middleware/auth.js';
import MPP from '../models/Mpp.js';

// GET ALL STUDENT
router.get('/get_all_student', auth, async (req, res) => {
	try {
		const all_student = await Student.find().sort({ createdAt: -1 });

		return res.status(200).json({
			status: 'ok',
			message: 'SUCCESS GET ALL STUDENT',
			data: all_student,
		});
	} catch (error) {
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});
// GET ONE STUDENT
router.post('/get_student', auth, async (req, res) => {
	const student_id = req.body.student_id;

	try {
		const getStudent = await Student.findOne({
			_id: student_id,
		});

		if (getStudent) {
			return res.status(200).json({
				status: 'ok',
				message: 'SUCCESS GET THE STUDENT',
				data: getStudent,
			});
		} else {
			return res.status(200).json({
				status: 'Error',
				message: 'NOT FIND STUDENT ID',
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

// GET STUDENT DETAILS
router.post('/student_details', auth, async (req, res) => {
	const studentID = req.body.studentID;

	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			res.status(403).json({ message: 'not find this student' });
		}

		res.json({ token: req.token, ...student._doc });
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// POST REGISTER NEW STUDENT
router.post('/student_register', async (req, res) => {
	const student_id = req.body.studentID;
	const student_name = req.body.studentName;
	const student_email = req.body.studentEmail;
	const student_password = req.body.studentPassword;

	// user credential validation
	if (!student_id || !student_password || !student_name || !student_email) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Sila lengkapkan maklumat.' });
	}

	// hash password
	const hashedPassword = await bcrypt.hash(student_password, 10);

	// create student
	const student = new Student({
		student_id,
		name: student_name,
		password: hashedPassword,
		email: student_email,
		course: '',
		currentSemester: '',
		faculty: '',
		role: 'Student',
		event_feedback: [],
		event_history: [],
		event_join: [],
		studentToken: '',
	});

	// save student to database
	try {
		const findSameID = await Student.findOne({ student_id: student_id });

		if (findSameID) {
			return res
				.status(403)
				.json({ message: 'this student id is already registered.' });
		}
		await student.save();

		if (student) {
			let payload = { id: student._id };
			const token = jwt.sign(payload, process.env.JWT_SECRET);
			return res.json({ token, ...student._doc });
		} else {
			return res.status(403).json({ message: 'cannot save student' });
		}
	} catch (error) {
		if (error) {
			return res
				.status(400)
				.json({ status: 'error', message: 'ada error takleh save student' });
		}
	}
});

// POST LOGIN FOR STUDENT LOGIN
router.post('/student_login', async (req, res) => {
	const student_id = req.body.studentID;
	const student_password = req.body.password;

	// user credentials validation
	if (!student_id || !student_password) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Sila lengkapkan maklumat' });
	}

	try {
		const student = await Student.findOne({
			student_id,
		});

		if (!student) {
			return res.status(403).json({
				status: 'error',
				message: 'the id is not match with our record!!',
			});
		}

		// check password using bcrypt
		const checkPassword = await bcrypt.compare(
			student_password,
			student.password
		);

		if (!checkPassword) {
			return res
				.status(403)
				.json({ status: 'error', message: 'Salah username atau password' });
		}
		let payload = { id: student._id };
		const token = jwt.sign(payload, process.env.JWT_SECRET);
		return res.json({ token, ...student._doc });
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'error' });
	}
});

// student change password
router.patch('/changePassword', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const oldPassword = req.body.oldPassword;
	const newPassword = req.body.newPassword;

	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			return res.status(403).json({ message: 'not find this student' });
		}

		if (oldPassword == '') {
			return res
				.status(403)
				.json({ message: 'Please Enter your Old Password' });
		}

		console.log(typeof oldPassword);

		const checkOldPassword = await bcrypt.compare(
			oldPassword,
			student.password
		);
		if (checkOldPassword) {
			const hashedNewPassword = await bcrypt.hash(newPassword, 10);

			if (hashedNewPassword) {
				const updatepassword = await student.updateOne({
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
		console.log(error.message);
		return res.status(403).json({ message: error.message });
	}
});

//  POST EDIT STUDENT DETAILS
router.patch('/edit_student_details', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const studentFaculty = req.body.faculty;
	const studentCourse = req.body.course;
	const studentCurrentSemester = req.body.currentSemester;

	const dataStudent = {
		faculty: studentFaculty.trim(),
		course: studentCourse.trim(),
		currentSemester: studentCurrentSemester.trim(),
	};
	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			res.status(403).json({ message: 'not find this user' });
		}

		const updateStudent = await student.updateOne({
			$set: dataStudent,
		});

		if (updateStudent) {
			return res.json({ token: req.token, ...student._doc });
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

// check token
router.post('/tokenIsValid', async (req, res) => {
	try {
		const token = req.header('x-auth-token');
		if (!token) return res.json(false);

		const verified = jwt.verify(token, process.env.JWT_SECRET);
		if (!verified) return res.json(false);

		const user = await Student.findOne({ _id: verified.id });
		if (!user) {
			const mpp = await MPP.findOne({ _id: verified.id });

			if (!mpp) {
				return res.json(false);
			} else {
				return res.json(true);
			}
		} else {
			return res.json(true);
		}
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// add fcm token to student
router.post('/addFcmToken', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const fcmToken = req.header('x-fcm-token');

	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			return res.status(403).json({ message: 'not find thi student' });
		}

		if (student.studentToken == '') {
			const addToken = await student.updateOne({
				studentToken: fcmToken,
			});

			if (addToken) return res.status(200).json(true);
		} else if (student.studentToken == fcmToken) {
			return res.status(200).json(false);
		} else if (student.studentToken != fcmToken) {
			const addToken = await student.updateOne({
				studentToken: fcmToken,
			});

			if (addToken) return res.status(200).json(true);
		}
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// SEARCH STUDENT
router.post('/search', auth, async (req, res) => {
	const queryString = req.body.searchInput;
	const queryStrings = queryString.split(' ');
	var allEventQueries = [];
	var allInfoQueries = [];

	queryStrings.forEach((element) => {
		allEventQueries.push({
			student_id: { $regex: String(element) },
		});
		allInfoQueries.push({
			MPP_id: { $regex: String(element) },
		});
	});

	const allStudent = await Student.find({ $or: allEventQueries });
	const allMPP = await MPP.find({ $or: allInfoQueries });
	if (!allStudent && !allMPP) {
		return res
			.status(400)
			.json({ message: 'No found Anything Student Or MPP' });
	}
	return res.status(200).json({ allStudent: allStudent, allMPP: allMPP });
});

// get user data
router.get('/', auth, async (req, res) => {
	const student = await Student.findById(req.user);

	if (student) {
		return res.json({ ...student._doc, token: req.token });
	}

	const mpp = await MPP.findOne({ _id: req.user });

	if (mpp) {
		return res.json({ ...mpp._doc, token: req.token });
	}
});

export default router;
