// VALID ROLES
const VALID_ROLES = {
	ADMIN: 'ADMIN',
	ADMINISTRATIVE: 'ADMINISTRATIVE',
	SALESPERSON: 'SALESPERSON',
}

// VALID COLLECTIONS
const VALID_COLLECTIONS = {
	CATEGORIES: 'categories',
	PRODUCTS: 'products',
	USERS: 'users',
}

// FILE EXTENSIONS
const VALID_DOC_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'md', 'txt'];
const VALID_IMG_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

// NO IMAGE FOUND
const NO_IMAGE_FOUND = '../assets/no-image-found.jpg';

module.exports = {
	VALID_COLLECTIONS,
	VALID_DOC_EXTENSIONS,
	VALID_IMG_EXTENSIONS,
	VALID_ROLES,
	NO_IMAGE_FOUND,
}
