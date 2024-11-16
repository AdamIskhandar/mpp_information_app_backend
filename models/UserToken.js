import mongoose from 'mongoose';

const UserTokenSchema = new mongoose.Schema({
	student: {
		type: Array,
		default: [],
	},
	mpp: {
		type: Array,
		default: [],
	},
});

const UserToken = mongoose.model('UserToken', UserTokenSchema);

export default UserToken;
