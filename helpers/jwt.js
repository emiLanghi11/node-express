const jwt = require('jsonwebtoken');


const generateJWT = async (id = '') => {
	return new Promise((resolve, reject) => {
		const payload = {
			uid: id,
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
		resolve(decoded);
	});
}

module.exports = {
	generateJWT,
	validateJWT
}