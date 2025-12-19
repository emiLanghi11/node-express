const Role = require('../models/role.model');
const User = require('../models/user.model');


const roleExists = async (role = '') => {
	const existsRole = await Role.findOne({ name: role });
	if (!existsRole) {
		throw new Error(`Role ${role} is not valid`);
	}
}

const emailAlreadyExists = async (email = '') => {
	const existsEmail = await User.findOne({ email });
	if (existsEmail) {
		throw new Error(`Email ${email} already exists`);
	}
}

const userExists = async (id = '') => {
	const existsUser = await User.findById(id);
	if (!existsUser) {
		throw new Error(`User with id ${id} not found`);
	}
	return existsUser;
}

module.exports = {
	roleExists,
	emailAlreadyExists,
	userExists
}