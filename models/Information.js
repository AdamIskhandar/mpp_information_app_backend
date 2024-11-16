import mongoose from 'mongoose';

const InformationSchema = new mongoose.Schema(
	{
		information_title: {
			type: String,
			require: true,
		},
		information_desc: {
			type: String,
			require: true,
		},
		created_by: {
			type: String,
			require: true,
		},
	},
	{ timestamps: true }
);

const INFORMATION = mongoose.model('Information', InformationSchema);

export default INFORMATION;
