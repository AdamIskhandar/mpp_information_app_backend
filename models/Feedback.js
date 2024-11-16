import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
	{
		event_id: {
			type: String,
			require: true,
		},
		student_id: {
			type: String,
			require: true,
		},
		rating: {
			type: String,
			default: '0',
		},
		comment: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;
