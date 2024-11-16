import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
	{
		event_title: {
			type: String,
			require: true,
		},
		description: {
			type: String,
			require: true,
		},
		location: {
			type: String,
			require: true,
		},
		date: {
			type: String,
			require: true,
		},
		time: {
			type: String,
			require: true,
		},
		timeEnd: {
			type: String,
			require: true,
		},
		mode: {
			type: String,
			require: true,
		},
		created_by: {
			type: String,
			require: true,
		},
		attendees: {
			type: Array,
			default: [],
		},
		feedback: {
			type: Array,
			default: [],
		},
		is_paid: {
			type: String,
			default: false,
		},
		price: {
			type: String,
			default: '0',
		},
		max_participants: {
			type: String,
			default: '0',
		},
		event_status: {
			type: String,
			default: 'upcoming',
		},
	},
	{ timestamps: true }
);

const EVENT = mongoose.model('Event', EventSchema);

export default EVENT;
