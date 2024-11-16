import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		user_id: {
			type: String,
			require: true,
		},
		user_uid: {
			type: String,
			require: true,
		},
		name: {
			type: String,
			require: true,
		},
		password: {
			type: String,
			require: true,
		},
		email: {
			type: String,
			require: true,
		},
		role: {
			type: String,
			default: '',
		},
		phone_number: {
			type: String,
			default: '',
		},
		faculty: {
			type: String,
			require: true,
		},
		course: {
			type: String,
			require: true,
		},
		currentSemester: {
			type: String,
			require: true,
		},
		event_history: {
			type: Array,
			default: [],
		},
		event_feedback: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
);

const User = mongoose.model('User', UserSchema);

export default User;
