import express from 'express';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import EVENT from '../models/Event.js';
import auth from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// callback url toyyibpay
router.post('/save_payment', auth, async (req, res) => {
	const billCode = req.body.billCode;
	const statusID = req.body.statusID;
	const orderID = req.body.orderID;
	const studentID = req.body.studentID;
	const eventID = req.body.eventID;

	try {
		const student = await Student.findOne({ _id: studentID });
		const event = await EVENT.findOne({ _id: eventID });

		if (!student) {
			return res.status(403).json({ message: 'not find this student' });
		}
		if (!event) {
			return res.status(403).json({ message: 'not find this event' });
		}

		const addEvent = await student.updateOne({
			$push: {
				event_join: {
					eventID,
				},
			},
		});

		const addStudent = await event.updateOne({
			$push: {
				attendees: {
					studentID,
					statusID,
					billCode,
					orderID,
				},
			},
		});

		res.status(200).json(true);
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});

export default router;
