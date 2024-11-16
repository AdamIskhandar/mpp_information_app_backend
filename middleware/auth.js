import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

// get mongodb url from env file
dotenv.config();

const auth = async (req, res, next) => {
	try {
		const token = req.header('x-auth-token');
		if (!token)
			return res.status(403).json({ msg: 'No auth token, access denied' });

		const verified = jwt.verify(token, process.env.JWT_SECRET);
		if (!verified)
			return res
				.status(403)
				.json({ msg: 'Token verification failed, authorization denied.' });

		req.user = verified.id;
		req.token = token;
		next();
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export default auth;
