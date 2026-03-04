const { Role, User, Category, Product } = require('../models');


// ROLES
const roleExists = async (role = '') => {
	const existsRole = await Role.findOne({ name: role });
	if (!existsRole) {
		throw new Error(`Role ${role} is not valid`);
	}
}

// USERS
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
}

// CATEGORIES
const categoryExists = async (id = '') => {
	const existsCategory = await Category.findById(id);
	if (!existsCategory) {
		throw new Error(`Category with id ${id} not found`);
	}
}

// PRODUCTS
const productExists = async (id = '') => {
	const existsProduct = await Product.findById(id);
	if (!existsProduct) {
		throw new Error(`Product with id ${id} not found`);
	}
}

// FILES
const validCollections = (collection = '', validList = []) => {
	if(!validList.includes(collection)){
		throw new Error(`Collection ${collection} is not valid. Valid collections: ${validList.join(', ')}`);
	}
	return true;
}

module.exports = {
	roleExists,
	emailAlreadyExists,
	userExists,
	categoryExists,
	productExists,
	validCollections,
}