import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
	{
		event_id: {
			type: String,
			require: true,
		},
		student_id: {
			type: String,
			require: true,
		},
		payment_id: {
			type: String,
			require: true,
		},
		amount: {
			type: String,
			require: true,
		},
		payment_status: {
			type: String,
			require: true,
		},
		payment_mehod: {
			type: String,
			require: true,
		},
		transaction_id: {
			type: String,
			require: true,
		},
	},
	{ timestamps: true }
);

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
