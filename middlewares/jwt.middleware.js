const { validateJWT } = require('../helpers/jwt');
const User = require('../models/user.model');

const validateJWTToken = async (req, res, next) => {
	const token = req.header('Authorization');
	if (!token) {
		return res.status(401).json({
			message: 'No token provided'
		});
	}

	try {
		const decoded = await validateJWT(token.split(' ')[1]);
		req.uid = decoded.uid;

		const user = await User.findById(decoded.uid);
		if (!user) {
			return res.status(401).json({
				message: 'User not found'
			});
		}

		if (!user.active) {
			return res.status(401).json({
				message: 'User is not active'
			});
		}

		req.user = user.toJSON();

		next();
	} catch (error) {
		console.log('error validating JWT', error);
		return res.status(401).json({
			message: 'Invalid token'
		});
	}
}


module.exports = {
	validateJWTToken
}