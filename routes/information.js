import express from 'express';
import dotenv from 'dotenv';

// Information Collection from database
import INFORMATION from '../models/Information.js';
import auth from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// ------------------------------------------------------           ROUTER INFORMATION                 ----------------------------------------------
// GET ALL INFORMATION
router.get('/get_all_information', auth, async (req, res) => {
	try {
		const all_information = await INFORMATION.find().sort({ createdAt: -1 });

		return res.status(200).json({
			status: 'ok',
			message: 'SUCCESS GET ALL INFORMATION DATA',
			data: all_information,
		});
	} catch (error) {
		console.log('errorrrr' + error);
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});

// GET LATEST INFORMATION
router.get('/get_latest_information', auth, async (req, res) => {
	try {
		const latest_information = await INFORMATION.find()
			.sort({ createdAt: -1 })
			.limit(3);

		return res.status(200).json({
			status: 'ok',
			message: 'SUCCESS GET ALL LATEST INFORMATION DATA',
			latest_info: latest_information,
		});
	} catch (error) {
		console.log('errorrrr' + error);
		return res.status(403).json({
			status: 'error',
			message: 'ERRORRRRRR',
		});
	}
});

// CREATE INFORMATION
router.post('/create_information', auth, async (req, res) => {
	const information_title = req.body.information_title;
	const information_desc = req.body.information_desc;
	const create_by = req.body.create_by;

	if (!information_title || !information_desc || !create_by) {
		return res.status(403).json({
			status: 'Error',
			message: 'Please fill all the form',
		});
	}

	// create Information object
	const Information = new INFORMATION({
		information_title: information_title,
		information_desc: information_desc,
		created_by: create_by,
	});

	// save information to database
	try {
		await Information.save();

		res.status(200).json({
			status: 'Success',
			message: 'Successfully Create new information',
			data: Information,
		});
	} catch (error) {
		if (error) {
			console.log(error);
			return res
				.status(400)
				.json({ status: 'error', message: 'Error to create new Information' });
		}
	}
});

// UPDATE INFORMATION
router.patch('/edit_information', auth, async (req, res) => {
	const information_id = req.body.information_id;
	const information_title = req.body.information_title;
	const information_desc = req.body.information_desc;

	console.log(information_id);

	const dataInformation = {
		information_title: information_title,
		information_desc: information_desc,
	};

	try {
		const getInformation = await INFORMATION.findOne({
			_id: information_id,
		});

		if (getInformation) {
			const editedInformation = await getInformation.updateOne({
				$set: dataInformation,
			});

			if (editedInformation) {
				return res.status(200).json({
					status: 'Success',
					message: 'Successfully Edit the Information',
				});
			} else {
				return res.status(403).json({
					status: 'Error',
					message: 'Error to Edit the Information',
				});
			}
		} else {
			return res.status(200).json({
				status: 'Error',
				message: 'NOT FIND INFORMATION ID',
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(403).json({ status: 'Error', message: 'erorrrrrrr' });
	}
});

// DELETE INFORMATON
router.delete('/delete_information', auth, async (req, res) => {
	const information_id = req.body.information_id;

	try {
		const Information = await INFORMATION.findOne({
			_id: information_id,
		});

		if (Information) {
			const delete_information = await INFORMATION.deleteOne({
				_id: information_id,
			});

			return res.status(200).json({
				status: 'Success',
				message: 'Successfull Delete Information',
			});
		} else {
			res
				.status(403)
				.json({ status: 'error', message: 'NOT FIND INFORMATION ID' });
		}
	} catch (error) {
		console.log(error);
		res
			.status(403)
			.json({ status: 'error', message: 'Error to delete information' });
	}
});

// ------------------------------------------------------          END ROUTER INFORMATION                ----------------------------------------------

export default router;
