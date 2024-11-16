import mongoose from 'mongoose';

const MppNotificationSchema = new mongoose.Schema(
	{
		studentName: {
			type: String,
			require: true,
		},
		message: {
			type: String,
			require: true,
		},
		description: {
			type: String,
			require: true,
		},
		is_read: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const MppNotification = mongoose.model(
	'MppNotification',
	MppNotificationSchema
);

export default MppNotification;
