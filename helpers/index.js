const { uploadFileToServer } = require('./file');
const { generateJWT, validateJWT, validateSocketJWT } = require('./jwt');
const { googleTokenValidation } = require('./google.validation');
const { roleExists, emailAlreadyExists, userExists, categoryExists, productExists, validCollections } = require('./db.validation');
const { validateFileUpload } = require('./file.validation');

module.exports = {
	uploadFileToServer,
	generateJWT,
	validateJWT,
	googleTokenValidation,
	roleExists,
	emailAlreadyExists,
	userExists,
	categoryExists,
	productExists,
	validCollections,
	validateFileUpload,
	validateSocketJWT
}