import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
	{
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

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
