import express from 'express';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js';
import Student from '../models/Student.js';
import EVENT from '../models/Event.js';
import Feedback from '../models/Feedback.js';

dotenv.config();

const router = express.Router();

// give feedback
router.post('/give_feedback', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const eventID = req.body.eventID;
	const feedback = req.body.feedback;
	const rating = req.body.rating;

	if (!feedback || !rating) {
		return res.status(403).json({
			status: 'Error',
			message: 'Please fill all the form',
		});
	}

	// create Event object
	const newFeedback = new Feedback({
		student_id: studentID,
		event_id: eventID,
		comment: feedback,
		rating: rating,
	});

	try {
		const saveFeedback = await newFeedback.save();

		const student = await Student.findOne({ _id: studentID });

		const event = await EVENT.findOne({ _id: eventID });

		if (!saveFeedback) {
			res.status(403).json({ message: 'cannot save feedback' });
		}

		if (!student) {
			res.status(403).json({ message: 'not find student' });
		}

		if (!event) {
			res.status(403).json({ message: 'not find event' });
		}

		const feedbackID = saveFeedback._id.toString();

		const setFeedbackIDToStudent = await student.updateOne({
			$push: {
				event_feedback: {
					feedbackID,
					eventID,
				},
			},
		});

		const setFeedbackIDTEvent = await event.updateOne({
			$push: {
				feedback: {
					feedbackID,
					studentID,
					feedback,
					rating,
				},
			},
		});

		if (!setFeedbackIDToStudent || !setFeedbackIDTEvent) {
			res.status(403).json({ message: 'error when to save feedback' });
		}

		res.status(200).json(true);
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// get event feedaback for student
router.post('/event_feedback', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const eventID = req.body.eventID;
	var listEvent = [];
	var listEventData = [];

	try {
		const student = await Student.findOne({ _id: studentID });
		const event = await EVENT.findOne({ _id: eventID });

		if (!student) {
			res.status(403).json({ message: 'not find student' });
		}

		// e

		event.feedback.map((item) => {
			if (item['studentID'] == studentID) {
				res.status(200).json({ isFeedback: true, dataFeedback: item });
			} else {
				res.status(200).json({ isFeedback: false, dataFeedback: null });
			}
		});

		// for (let i = 0; i < event.length; i++) {
		// 	event[i].feedback.map((item) => {
		// 		if (item['studentID'] == studentID) {
		// 			listEvent.push(event[i]._id);
		// 		}
		// 	});
		// }

		// console.log(listEvent);

		// for (let o = 0; o < listEvent.length; o++) {
		// 	var eventData = await EVENT.findOne({ _id: listEvent[o] });

		// 	listEventData.push(eventData);
		// }

		// res.status(200).json({ data: listEventData });
	} catch (error) {
		console.log(error.message);
		res.status(403).json({ message: error.message });
	}
});

// edit event
router.patch('/edit_feedback', auth, async (req, res) => {
	const eventID = req.body.eventID;
	const studentID = req.body.studentID;
	const feeedback = req.body.feedback;
	const rating = req.body.rating;

	try {
		const event = await EVENT.updateOne(
			{ _id: eventID },
			{
				$set: {
					'feedback.$[i].feedback': feeedback,
					'feedback.$[i].rating': rating,
				},
			},
			{
				arrayFilters: [
					{
						'i.studentID': studentID,
					},
				],
			}
		);

		if (!event) {
			res.status(403).json({ message: 'not find this event' });
		}

		res.status(200).json(true);
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// get all feedback for each event
router.post('/feedback_for_event', auth, async (req, res) => {
	const eventID = req.body.eventID;

	try {
		//
		const event = await EVENT.findOne({ _id: eventID });

		if (!event) {
			res.status(403).json({ message: 'not find this event' });
		}

		console.log('EVENT FEEDBACK');
		if (event.feedback.length <= 0) {
			res.status(200).json({ isHaveFeedback: false, data: null });
		} else {
			res.status(200).json({ isHaveFeedback: true, data: event.feedback });
		}
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

export default router;
