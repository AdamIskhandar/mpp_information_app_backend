import express from 'express';
import dotenv from 'dotenv';
import { getMessaging } from 'firebase-admin/messaging';
import auth from '../middleware/auth.js';
import EVENT from '../models/Event.js';
import Student from '../models/Student.js';
import INFORMATION from '../models/Information.js';
import MPP from '../models/Mpp.js';
import Notification from '../models/Notification.js';
import MppNotification from '../models/mppNotification.js';

dotenv.config();

const router = express.Router();

// NOTICATION FOR MPP
// when student give feedback to event
router.post('/student_feedback_notify', auth, async (req, res) => {
	const eventFeedbackID = req.body.eventFeedbackID;
	const studentID = req.body.studentID;

	const listAllMppRegistrationkey = [];
	const studentFeedback = [];

	try {
		//
		const event = await EVENT.findOne({ _id: eventFeedbackID });
		const student = await Student.findOne({ _id: studentID });
		const mpp = await MPP.find();

		if (!event) {
			return res.status(403).json({ message: 'cannot find any event' });
		}

		for (let i = 0; i < event.feedback.length; i++) {
			if (event.feedback[i]['studentID'] == studentID) {
				studentFeedback.push(event.feedback[i]);
			}
		}

		for (let i = 0; i < mpp.length; i++) {
			listAllMppRegistrationkey.push(mpp[i].mppToken);
		}

		const notification_title = 'STUDENT FEEDBACK FOR : ' + event.event_title;
		const notification_body = studentFeedback[0]['feedback'];

		if (listAllMppRegistrationkey.length > 0) {
			const notification = {
				notification: {
					title: notification_title,
					body: notification_body,
				},
				data: {
					type: 'new feedback',
				},
				android: {
					priority: 'normal',
				},
				apns: {
					headers: {
						'apns-priority': '5',
					},
				},
				tokens: listAllMppRegistrationkey,
			};

			// create new notification
			const newNotification = new MppNotification({
				message: notification_title,
				description: notification_body,
				studentName: student.name,
				is_read: false,
			});

			const saveNotify = await newNotification.save();

			if (saveNotify) {
				for (let i = 0; i < mpp.length; i++) {
					await mpp[i].updateOne({
						$push: {
							notifications: saveNotify,
						},
					});
				}
				getMessaging()
					.sendEachForMulticast(notification)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
						console.log(studentFeedback);
						return res
							.status(200)
							.json({ message: 'Done Send Notification Create New Feedback' });
					})
					.catch((error) => {
						console.log('Error sending message:', error);
						return res.status(403).json({ message: 'Error Send Notification' });
					});
			}
		}
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});

// when student join the event
router.post('/student_join_event', auth, async (req, res) => {
	const studentID = req.body.studentID;
	const eventID = req.body.eventID;

	const listAllMppRegistrationkey = [];
	try {
		const student = await Student.findOne({ _id: studentID });
		const event = await EVENT.findOne({ _id: eventID });
		const mpp = await MPP.find();

		if (!student) {
			return res.status(403).json({ message: 'cannot find any student' });
		}

		if (!event) {
			return res.status(403).json({ message: 'cannot find any event' });
		}

		for (let i = 0; i < mpp.length; i++) {
			listAllMppRegistrationkey.push(mpp[i].mppToken);
		}

		const notification_title =
			student.name + ' JOIN EVENT : ' + event.event_title;
		const notification_body = event.description;

		if (listAllMppRegistrationkey.length > 0) {
			const notification = {
				notification: {
					title: notification_title,
					body: notification_body,
				},
				data: {
					type: 'new feedback',
				},
				android: {
					priority: 'normal',
				},
				apns: {
					headers: {
						'apns-priority': '5',
					},
				},
				tokens: listAllMppRegistrationkey,
			};

			// create new notification
			const newNotification = new MppNotification({
				message: notification_title,
				description: notification_body,
				studentName: student.name,
				is_read: false,
			});

			const saveNotify = await newNotification.save();

			if (saveNotify) {
				for (let i = 0; i < mpp.length; i++) {
					await mpp[i].updateOne({
						$push: {
							notifications: saveNotify,
						},
					});
				}
				getMessaging()
					.sendEachForMulticast(notification)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);

						return res
							.status(200)
							.json({ message: 'Done Send Notification Student Join Event' });
					})
					.catch((error) => {
						console.log('Error sending message:', error);
						return res.status(403).json({ message: 'Error Send Notification' });
					});
			}
		}
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});

// NOTIFICATION FOR STUDENT
// when mpp create new event
router.post('/event_create_notify', auth, async (req, res) => {
	const eventID = req.body.eventID;

	const listAllStudentRegistrationkey = [];
	try {
		const event = await EVENT.findOne({ _id: eventID });
		const student = await Student.find();

		if (!event) {
			return res.status(403).json({ message: 'not find this event' });
		}

		for (let i = 0; i < student.length; i++) {
			listAllStudentRegistrationkey.push(student[i].studentToken);
		}

		const notification_title = 'NEW EVENT : ' + event.event_title;
		const notification_body = event.description;

		if (listAllStudentRegistrationkey.length > 0) {
			const notification = {
				notification: {
					title: notification_title,
					body: notification_body,
				},
				data: {
					type: 'new event',
				},
				android: {
					priority: 'normal',
				},
				apns: {
					headers: {
						'apns-priority': '5',
					},
				},
				tokens: listAllStudentRegistrationkey,
			};

			// create new notification
			const newNotification = new Notification({
				message: notification_title,
				description: notification_body,
				is_read: false,
			});

			const saveNotify = await newNotification.save();

			if (saveNotify) {
				for (let i = 0; i < student.length; i++) {
					await student[i].updateOne({
						$push: {
							notifications: saveNotify,
						},
					});
				}
				getMessaging()
					.sendEachForMulticast(notification)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
						return res
							.status(200)
							.json({ message: 'Done Send Notification Create New Event' });
					})
					.catch((error) => {
						console.log('Error sending message:', error);
						return res.status(403).json({ message: 'Error Send Notification' });
					});
			} else {
				return res.status(403).json({ message: 'not save notify' });
			}
		}
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});
// when mpp create information
router.post('/info_create_notify', auth, async (req, res) => {
	const infoID = req.body.infoID;

	const listAllStudentRegistrationkey = [];
	try {
		const info = await INFORMATION.findOne({ _id: infoID });
		const student = await Student.find();

		if (!info) {
			return res.status(403).json({ message: 'not find this info' });
		}

		for (let i = 0; i < student.length; i++) {
			listAllStudentRegistrationkey.push(student[i].studentToken);
		}

		const notification_title = 'NEW INFORMATION : ' + info.information_title;
		const notification_body = info.information_desc;

		if (listAllStudentRegistrationkey.length > 0) {
			const notification = {
				notification: {
					title: notification_title,
					body: notification_body,
				},
				data: {
					type: 'new info',
				},
				android: {
					priority: 'high',
				},
				apns: {
					headers: {
						'apns-priority': '5',
					},
				},
				tokens: listAllStudentRegistrationkey,
			};

			// create new notification
			const newNotification = new Notification({
				message: notification_title,
				description: notification_body,
				is_read: false,
			});

			const saveNotify = await newNotification.save();

			if (saveNotify) {
				for (let i = 0; i < student.length; i++) {
					await student[i].updateOne({
						$push: {
							notifications: saveNotify,
						},
					});
				}
				getMessaging()
					.sendEachForMulticast(notification)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
						return res.status(200).json({
							message: 'Done Send Notification Create New Infomation',
						});
					})
					.catch((error) => {
						console.log('Error sending message:', error);
						return res.status(403).json({ message: 'Error Send Notification' });
					});
			} else {
				return res.status(403).json({ message: 'not save notify' });
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(403).json({ message: error.message });
	}
});
// when mpp start the event
router.post('/event_start_notify', auth, async (req, res) => {
	const eventID = req.body.eventID;

	const listAllStudentRegistrationkey = [];
	try {
		const event = await EVENT.findOne({ _id: eventID });

		if (!event) {
			return res.status(403).json({ message: 'not find this event' });
		}

		for (let i = 0; i < event.attendees.length; i++) {
			console.log(event.attendees[i]['studentID']);
			const student = await Student.findOne({
				_id: event.attendees[i]['studentID'],
			});

			listAllStudentRegistrationkey.push(student.studentToken);
		}

		const notification_title = 'EVENT START : ' + event.event_title;
		const notification_body = event.description;

		if (listAllStudentRegistrationkey.length > 0) {
			const notification = {
				notification: {
					title: notification_title,
					body: notification_body,
				},
				data: {
					type: 'start event',
				},
				android: {
					priority: 'high',
				},
				apns: {
					headers: {
						'apns-priority': '5',
					},
				},
				tokens: listAllStudentRegistrationkey,
			};
			// create new notification
			const newNotification = new Notification({
				message: notification_title,
				description: notification_body,
				is_read: false,
			});

			const saveNotify = await newNotification.save();

			if (saveNotify) {
				for (let i = 0; i < event.attendees.length; i++) {
					const student = await Student.findOne({
						_id: event.attendees[i]['studentID'],
					});

					await student.updateOne({
						$push: {
							notifications: saveNotify,
						},
					});
				}
				getMessaging()
					.sendEachForMulticast(notification)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
						return res.status(200).json({
							message: 'Done Send Notification Start Event',
						});
					})
					.catch((error) => {
						console.log('Error sending message:', error);
						return res.status(403).json({ message: 'Error Send Notification' });
					});
			} else {
				return res.status(403).json({ message: 'not save notify' });
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(403).json({ message: error.message });
	}
});

// send notification
router.get('/sendNotification', auth, async (req, res) => {
	// This registration token comes from the client FCM SDKs.

	const message = {
		notification: {
			title: 'TESTTINGG NOTIFICATION DARI SERVER',
			body: 'HAI SEMUA USERRR',
		},
		data: {
			score: '850',
			time: '2:45',
		},
		token:
			'd3hSG8JjR868AvN71fXwVl:APA91bH_zzrGjVEMl38qPqNNgYnhZp5lcgb2qdkuRqvtIoty8BWYemZpYfG4LXvMCX9wkt-gCh8EWpA7uqu9Awe0KIobDbdhQFrRrA7XyfnVX1sqGH5hQFE',
	};

	// Send a message to the device corresponding to the provided
	// registration token.
	getMessaging()
		.send(message)
		.then((response) => {
			// Response is a message ID string.
			console.log('Successfully sent message:', response);
			return res.status(200).json({ message: 'Done Send Notification' });
		})
		.catch((error) => {
			console.log('Error sending message:', error);
			return res.status(403).json({ message: 'Error Send Notification' });
		});
});

// CRUD NOTIFICATION
// get notification for student ui
router.post('/delete_notification', async (req, res) => {
	const notificationID = req.body.notificationID;
	const studentID = req.body.studentID;

	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			res.status(403).json({ message: 'not find student' });
		}

		for (let i = 0; i < student.notifications.length; i++) {
			if (notificationID == student.notifications[i]['_id']) {
				console.log(student.notifications[i]);
				const update = await student.updateOne({
					$pull: {
						notifications: { _id: student.notifications[i]['_id'] },
					},
				});

				if (update) {
					console.log('oiiiii');
					return res.status(200).json(true);
				}
			}
		}
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// delete mpp notification
router.post('/delete_mpp_notification', async (req, res) => {
	const notificationID = req.body.notificationID;
	const mppID = req.body.mppID;

	try {
		const mpp = await MPP.findOne({ _id: mppID });

		if (!mpp) {
			s;
			res.status(403).json({ message: 'not find mpp' });
		}

		for (let i = 0; i < mpp.notifications.length; i++) {
			if (mpp.notifications[i]['_id'] == notificationID) {
				const update = await mpp.updateOne({
					$pull: {
						notifications: { _id: mpp.notifications[i]['_id'] },
					},
				});

				if (update) {
					return res.status(200).json(true);
				}
			}
		}
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

// delete student token
router.patch('/delete_student_token', auth, async (req, res) => {
	const studentID = req.body.studentID;

	try {
		const student = await Student.findOne({ _id: studentID });

		if (!student) {
			return res.status(403).json({ message: 'Cannot find this student.' });
		}

		const updateStudent = await student.updateOne({
			studentToken: '',
		});

		if (updateStudent) {
			return res.status(200).json(true);
		}
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});
// delete mpp token
router.patch('/delete_mpp_token', auth, async (req, res) => {
	const mppID = req.body.mppID;

	try {
		const mpp = await MPP.findOne({ _id: mppID });

		if (!mpp) {
			return res.status(403).json({ message: 'Cannot find this mpp.' });
		}

		const updateMpp = await mpp.updateOne({
			mppToken: '',
		});

		if (updateMpp) {
			console.log(updateMpp);
			return res.status(200).json(true);
		}
	} catch (error) {
		return res.status(403).json({ message: error.message });
	}
});
export default router;
