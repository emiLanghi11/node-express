const jwt = require('jsonwebtoken');
const { User } = require('../models');


const generateJWT = async (id = '') => {
	return new Promise((resolve, reject) => {
		const payload = {
			id,
		}
		jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
			if (err) {
				console.log('error generating JWT', err);
				reject('Error generating JWT');
			} else {
				resolve(token);
			}
		});
	});
}

const validateJWT = async (token = '') => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				console.log('error validating JWT', err);
				reject('Error validating JWT');
			} else {
				resolve(decoded);
			}
		});
	});
}

const validateSocketJWT = async (token = '') => {
	try {
		if (!token || token.length <= 10) {
			throw new Error('No token provided');
		}

		const decoded = await validateJWT(token);
		const user = await User.findById(decoded.id);
		if (!user) {
			return null;
		}

		return user;
	} catch (error) {
		console.log('error validating socket JWT', error);
		throw new Error('Error validating socket JWT');
	}
}

module.exports = {
	generateJWT,
	validateJWT,
	validateSocketJWT
}