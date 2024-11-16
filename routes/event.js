import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Event Collection from database
import EVENT from '../models/Event.js';

// import middleware
import auth from '../middleware/auth.js';
import Student from '../models/Student.js';
import INFORMATION from '../models/Information.js';

dotenv.config();

const router = express.Router();

// ------------------------------------------------------           ROUTER EVENT                 ----------------------------------------------

// GET ALL EVENT
router.get('/get_all_event', auth, async (req, res) => {
	try {
		const all_event = await EVENT.find().sort({ createdAt: -1 });

		return res.status(200).json({
			status: 'ok',
			message: 'SUCCESS GET ALL INFORMATION DATA',
			data: all_event,
		});
	} catch (error) {
		console.log('errorrrr' + error);
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});

// GET LATEST EVENT
router.get('/latest_event', auth, async (req, res) => {
	try {
		const latest_event = await EVENT.find().sort({ createdAt: -1 }).limit(3);

		return res.status(200).json({
			status: 'ok',
			message: 'SUCCESS GET ALL LATEST EVENT DATA',
			latest_event: latest_event,
		});
	} catch (error) {
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});

// GET STUDENT EVENT JOIN
router.post('/event_student_join', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const studentEventIDList = [];
	const eventfilterstudent = [];

	try {
		const student = await Student.findOne({ _id: studentID });
		const allEvent = await EVENT.find().sort({ createdAt: -1 });

		// console.log(allEvent);

		if (!student) {
			res.status(403).json({ message: 'not find student' });
		}

		for (let i = 0; i < student.event_join.length; i++) {
			studentEventIDList.push(student.event_join[i]['eventID']);
		}

		for (let a = 0; a < allEvent.length; a++) {
			if (studentEventIDList.includes(allEvent[a]._id.toString())) {
				eventfilterstudent.push(allEvent[a]);
			}
		}

		res.status(200).json({ data: eventfilterstudent });
	} catch (error) {
		console.log(error.message);
		return res.status(403).json({
			status: 'error',
			message: error.message,
		});
	}
});

// get list of event id taht student join
router.post('/event_join', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const studentEventIDJoin = [];

	try {
		const getStudent = await Student.findOne({
			_id: studentID,
		});

		if (!getStudent) {
			res.status(403).json({
				message: 'cannot find this student',
			});
		}

		for (let i = 0; i < getStudent.event_join.length; i++) {
			studentEventIDJoin.push(getStudent.event_join[i]);
		}

		res.status(200).json({ data: studentEventIDJoin });
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ message: error.message });
	}
});

// add the event to student event join
router.post('/add_event_join', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const eventID = req.body.eventID;

	try {
		const getStudent = await Student.findOne({
			_id: studentID,
		});

		const getEvent = await EVENT.findOne({
			_id: eventID,
		});

		if (!getStudent) {
			res.status(403).json({
				message: 'cannot find this student',
			});
		}

		if (!eventID) {
			res.status(403).json({
				message: 'cannot find this event',
			});
		}

		const addEvent = await getStudent.updateOne({
			$push: {
				event_join: {
					eventID,
				},
			},
		});

		const addStudent = await getEvent.updateOne({
			$push: {
				attendees: {
					studentID,
				},
			},
		});

		res.json(true);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// ROUTE TO START THE EVENT
router.post('/start_event', auth, async (req, res) => {
	const event_id = req.body.eventID;

	try {
		const getEvent = await EVENT.findOne({ _id: event_id });

		if (!getEvent) {
			res.status(403).json({
				message: 'cannot find this event',
			});
		}

		const changeStatusEvent = await getEvent.updateOne({
			event_status: 'Ongoing',
		});

		res.status(200).json({ data: getEvent });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// ROUTE TO END THE EVENT
router.post('/end_event', auth, async (req, res) => {
	const event_id = req.body.eventID;

	try {
		const getEvent = await EVENT.findOne({ _id: event_id });

		if (!getEvent) {
			res.status(403).json({
				message: 'cannot find this event',
			});
		}

		const changeStatusEvent = await getEvent.updateOne({
			event_status: 'Ended',
		});

		res.status(200).json(true);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// CREATE EVENT
router.post('/create_event', auth, async (req, res) => {
	const event_title = req.body.event_title;
	const event_desc = req.body.event_desc;
	const event_location = req.body.event_location;
	const event_date = req.body.event_date;
	const event_time = req.body.event_time;
	const event_time_end = req.body.event_time_end;
	const event_mode = req.body.event_mode;
	const event_is_paid = req.body.event_is_paid;
	const event_fee = req.body.event_fee;
	const event_max = req.body.event_max;
	const create_by = req.body.create_by;

	if (
		!event_title ||
		!event_desc ||
		!create_by ||
		!event_location ||
		!event_date ||
		!event_time ||
		!event_mode ||
		!event_time_end
	) {
		return res.status(403).json({
			status: 'Error',
			message: 'Please fill all the form',
		});
	}

	// create Event object
	const Event = new EVENT({
		event_title: event_title,
		description: event_desc,
		location: event_location,
		date: event_date,
		time: event_time,
		timeEnd: event_time_end,
		mode: event_mode,
		created_by: create_by,
		is_paid: event_is_paid,
		price: event_fee,
		max_participants: event_max,
		event_status: 'Upcoming',
	});

	// save Event to database
	try {
		await Event.save();

		res.status(200).json({
			status: 'Success',
			message: 'Successfully Create new information',
			new_event_added: Event,
		});
	} catch (error) {
		if (error) {
			console.log(error);
			return res
				.status(400)
				.json({ status: 'error', message: 'Error to create new Information' });
		}
	}
});

// UPDATE EVENT
router.patch('/edit_event', auth, async (req, res) => {
	const event_id = req.body.event_id;
	const event_title = req.body.event_title;
	const event_desc = req.body.event_desc;
	const event_location = req.body.event_location;
	const event_date = req.body.event_date;
	const event_time = req.body.event_time;
	const event_mode = req.body.event_mode;
	const event_is_paid = req.body.event_is_paid;
	const event_fee = req.body.event_fee;
	const event_max = req.body.event_max;
	const create_by = req.body.create_by;

	const dataEvent = {
		event_title: event_title,
		description: event_desc,
		location: event_location,
		time: event_time,
		mode: event_mode,
		date: event_date,
		created_by: create_by,
		is_paid: event_is_paid,
		price: event_fee,
		max_participants: event_max,
	};

	try {
		const getEvent = await EVENT.findOne({
			_id: event_id,
		});

		if (getEvent) {
			const editedEvent = await getEvent.updateOne({
				$set: dataEvent,
			});

			if (editedEvent) {
				return res.status(200).json({
					status: 'Success',
					message: 'Successfully Edit the Event',
				});
			} else {
				return res.status(403).json({
					status: 'Error',
					message: 'Error to Edit the Event',
				});
			}
		} else {
			return res.status(200).json({
				status: 'Error',
				message: 'NOT FIND EVENT ID',
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(403).json({ status: 'Error', message: 'erorrrrrrr' });
	}
});

// GET ATTENDEES FOR EACH EVENT
router.post('/event_attendees', auth, async (req, res) => {
	const eventID = req.body.eventID;
	const listAttendees = [];
	try {
		const event = await EVENT.findOne({ _id: eventID });

		if (!event) {
			return res.status(403).json({ message: 'not find this event' });
		}

		for (let i = 0; i < event.attendees.length; i++) {
			const student = await Student.findOne({
				_id: event.attendees[i]['studentID'],
			});

			if (student) {
				listAttendees.push(student);
			}
		}

		if (listAttendees.length > 0) {
			return res
				.status(200)
				.json({ isHaveAttendees: true, dataAttendees: listAttendees });
		} else {
			return res
				.status(200)
				.json({ isHaveAttendees: false, dataAttendees: null });
		}

		// console.log(listAttendees.length);
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// GET STUDENT EVENT HISTORY
router.post('/event_history', async (req, res) => {
	const studentID = req.body.studentID;
	const listHistoryEvent = [];

	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			return res.status(403).json({ message: 'not find this student' });
		}

		// student.event_join.map(async (item) => {
		// 	const event = await EVENT.findOne({ _id: item['eventID'] });
		// 	if (event) {
		// 		if (event.event_status == 'Ended') {
		// 			// console.log('event dah end');
		// 			console.log(event);
		// 			listHistoryEvent.push(event);

		// 		}
		// 	}
		// });
		for (let i = 0; i < student.event_join.length; i++) {
			const event = await EVENT.findOne({
				_id: student.event_join[i]['eventID'],
			});

			if (event) {
				if (event.event_status == 'Ended') {
					listHistoryEvent.push(event);
				}
			}
		}

		if (listHistoryEvent.length > 0) {
			return res
				.status(200)
				.json({ isHaveHistory: true, listEventHistory: listHistoryEvent });
		} else {
			return res
				.status(200)
				.json({ isHaveHistory: false, listEventHistory: null });
		}
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// SEARCH EVENT
router.post('/search', auth, async (req, res) => {
	const queryString = req.body.searchInput;
	const queryStrings = queryString.split(' ');
	var allEventQueries = [];
	var allInfoQueries = [];

	queryStrings.forEach((element) => {
		allEventQueries.push({ event_title: { $regex: String(element) } });
		allInfoQueries.push({ information_title: { $regex: String(element) } });
	});

	const allEvent = await EVENT.find({ $or: allEventQueries });
	const allInfo = await INFORMATION.find({ $or: allInfoQueries });
	if (!allEvent && !allInfo) {
		return res
			.status(400)
			.json({ message: 'No found Anything Information Or Event' });
	}
	return res.status(200).json({ allInfo: allInfo, allEvent: allEvent });
});

// DELETE EVENT
router.delete('/delete_event', auth, async (req, res) => {
	const event_id = req.body.event_id;

	try {
		const Event = await EVENT.findOne({
			_id: event_id,
		});

		if (Event) {
			const delete_event = await EVENT.deleteOne({
				_id: event_id,
			});

			return res.status(200).json({
				status: 'Success',
				message: 'Successfull Delete Event',
			});
		} else {
			res.status(403).json({ status: 'error', message: 'NOT FIND EVENT ID' });
		}
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'Error to delete event' });
	}
});

// ------------------------------------------------------           END ROUTER EVENT                 ----------------------------------------------

export default router;
