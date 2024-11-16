import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import admin from 'firebase-admin';

import { readFile } from 'fs/promises';

async function loadServiceAccount() {
	const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	const serviceAccount = JSON.parse(await readFile(filePath, 'utf-8'));
	return serviceAccount;
}

const serviceAccount = await loadServiceAccount();

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// get mongodb url from env file
dotenv.config();
//PORT
const PORT = process.env.PORT || 8001;
const app = express();

// connect to database
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;

try {
	db.on('connected', () => {
		console.log('Successfully connected to database..');
	});
} catch (error) {
	db.on('error', () => {
		console.log('error to connect database..');
	});
}

app.use(express.json());
app.use(cookieParser());

// routes
import studentRoutes from './routes/student.js';
import mppRoutes from './routes/mpp.js';
import informationRoutes from './routes/information.js';
import eventRoutes from './routes/event.js';
import userRoutes from './routes/user.js';
import feedBackRoutes from './routes/feedback.js';
import noficationRoutes from './routes/notification.js';
import paymentRoutes from './routes/payment.js';

app.get('/', (req, res) => {
	res.send('MPP INFORMATION APP UPTM!');
});

// routes to student register
app.use('/authStudent', studentRoutes);

// routes to mpp
app.use('/mpp', mppRoutes);

// routes to user
app.use('/user', userRoutes);

// routes to information
app.use('/information', informationRoutes);

// routes to event
app.use('/event', eventRoutes);

app.use('/feedback', feedBackRoutes);

app.use('/notification', noficationRoutes);
app.use('/payment', paymentRoutes);

app.listen(PORT, () => {
	console.log(`Mpp Information app backend listening on port ${PORT}`);
});

export default admin;

// adamiskhandar76
// ykOcDj0heGxKXRFd
