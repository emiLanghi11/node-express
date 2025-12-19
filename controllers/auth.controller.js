

const { generateJWT } = require('../helpers/jwt');
const User = require('../models/user.model');
const bcryptjs = require('bcryptjs');

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email, active: true });

		if (!user) {
			return res.status(400).json({
				message: 'User not found'
			});
		}

		if (user.active === false) {
			return res.status(400).json({
				message: 'User is not active'
			});
		}

		const validPassword = bcryptjs.compareSync(password, user.password);
		
		if (!validPassword) {
			return res.status(400).json({
				message: 'Invalid password'
			});
		}

		const token = await generateJWT(user._id);

		return res.status(200).json({
			user,
			token
		});
	} catch (error) {
		console.log('error logging in', error);
		return res.status(500).json({
			message: 'Error logging in',
			error: error.message
		});
	}
};

module.exports = {
	login
};
