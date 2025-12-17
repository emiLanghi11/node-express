const User = require('../models/user.model');
const bcryptjs = require('bcryptjs');
const { emailExists, userExists, roleExists } = require('../helpers/db.validation');


const getUsers = async (req, res) => {

	try {
		const { limit = 5, from = 0 } = req.query;
		const filter = { active: true };
		
		const [users, total] = await Promise.all([
			User.find(filter)
				.skip(Number(from))
				.limit(Number(limit)),
			User.countDocuments(filter)
		]);

		res.status(200).json({
			users,
			total
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error getting users',
			error: error.message
		});
		console.log('error getting users', error);
	}
	
};

const putUsers = async (req, res) => {
	try {
		const id = req.params.id;

		const { password, email, role } = req.body;

		const user = await userExists(id);

		if (password) {
			const salt = bcryptjs.genSaltSync(10);
			const hash = bcryptjs.hashSync(password, salt);
			user.password = hash;
		}

		if (email) {
			await emailExists(email);
			user.email = email;
		}

		if (role) {
			await roleExists(role);
			user.role = role;
		}

		user.updatedAt = Date.now();

		await user.save();

		res.status(201).json({
			message: 'User updated successfully',
			user
		});
		console.log('user updated successfully', id);
	} catch (error) {
		res.status(500).json({
			message: 'Error updating user',
			error: error.message
		});
		console.log('error updating user', error);
	}
};

const postUsers = async (req, res) => {
	try {
		const { name, email, role, password } = req.body;

		await emailExists(email);

		const salt = bcryptjs.genSaltSync(10);
		const hash = bcryptjs.hashSync(password, salt);

		const user = new User({ name, email, role, password: hash });

		await user.save();

		res.status(201).json({
			message: 'user created successfully',
			user
		});
		console.log('user created successfully', user._id.toString());
	} catch (error) {
		res.status(500).json({
			message: 'Error creating user',
			error: error.message
		});
		console.log('error creating user', error);
	}
	
};

const deleteUsers = async (req, res) => {
	try {
		const id = req.params.id;

		const user = await userExists(id);

		user.active = false;
		user.deletedAt = Date.now();
		await user.save();

		res.status(201).json({
			message: 'User deleted successfully',
			user
		});
		console.log('user deleted successfully', id);
	} catch (error) {
		res.status(500).json({
			message: 'Error deleting user',
			error: error.message
		});
		console.log('error deleting user', error);
	}
};

const patchUsers = (req, res) => {
	res.json({
		message: 'PATCH users API'
	});
};

module.exports = {
	getUsers,
	putUsers,
	postUsers,
	deleteUsers,
	patchUsers
};