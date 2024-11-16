import mongoose from 'mongoose';

const MPPSchema = new mongoose.Schema(
	{
		MPP_id: {
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
		name: {
			type: String,
			require: true,
		},
		role: {
			type: String,
			default: 'Mpp',
		},
		faculty: {
			type: String,
			dedault: '',
		},
		course: {
			type: String,
			dedault: '',
		},
		currentSemester: {
			type: String,
			dedault: '',
		},
		event_history: {
			type: Array,
			default: [],
		},
		event_feedback: {
			type: Array,
			default: [],
		},
		notifications: {
			type: Array,
			default: [],
		},
		mppToken: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

const MPP = mongoose.model('MPP', MPPSchema);

export default MPP;
