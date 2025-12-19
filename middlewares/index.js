const { validateJWTToken } = require('./jwt.middleware');
const { validateRoles } = require('./role.middleware');
const { validateRequestErrors } = require('./request.middleware');

module.exports = {
	validateJWTToken,
	validateRoles,
	validateRequestErrors
}