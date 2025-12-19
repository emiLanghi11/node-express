

const validateRoles = (roles = []) => {
	return (req, res, next) => {

		if (!roles.includes(req.user.role)) {
			return res.status(401).json({
				message: 'User is not authorized to perform this action'
			});
		}
		next();
	}
}

module.exports = {
	validateRoles
}