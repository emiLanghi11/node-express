const bcryptjs = require('bcryptjs');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Category = require('../models/category.model');
const { generateJWT } = require('../helpers/jwt');

const seedRoles = async () => {
	await Role.create([
		{ name: 'ADMIN' },
		{ name: 'ADMINISTRATIVE' },
		{ name: 'SALESPERSON' },
	]);
};

const createUserWithToken = async (overrides = {}) => {
	const salt = bcryptjs.genSaltSync(10);
	const user = await User.create({
		name: 'Admin User',
		email: 'admin@test.com',
		password: bcryptjs.hashSync('password123', salt),
		role: 'ADMIN',
		active: true,
		...overrides,
	});
	const token = await generateJWT(user.id);
	return { user, token };
};

const createCategory = async (adminUserId, name = 'TEST CATEGORY') => {
	return Category.create({
		name,
		active: true,
		createdBy: adminUserId,
	});
};

module.exports = { seedRoles, createUserWithToken, createCategory };
