import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
	{
		student_id: {
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
			default: 'student',
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
		event_join: {
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
		studentToken: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

const Student = mongoose.model('Student', StudentSchema);

export default Student;
