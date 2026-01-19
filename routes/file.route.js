const { Router } = require('express');
const { uploadFile, updateImage, getImage } = require('../controllers/file.controller');
const { validateJWTToken, validateRoles, validateRequestErrors } = require('../middlewares');
const { VALID_ROLES } = require('../constants/constants');
const { check } = require('express-validator');
const { VALID_COLLECTIONS } = require('../constants/constants');
const { validCollections } = require('../helpers/db.validation');
const { validateFileUpload } = require('../helpers');


const router = Router();

router.post('/upload', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN, VALID_ROLES.ADMINISTRATIVE]),
	validateFileUpload,
	validateRequestErrors
], uploadFile);

router.put('/:collection/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN, VALID_ROLES.ADMINISTRATIVE]),
	validateFileUpload,
	check('collection', 'Collection is required').not().isEmpty(),
	check('collection').custom(collection => validCollections(collection, [VALID_COLLECTIONS.PRODUCTS, VALID_COLLECTIONS.USERS])),
	check('id', 'ID is required').not().isEmpty(),
	check('id', 'ID is invalid').isMongoId(),
	validateRequestErrors
], updateImage);

router.get('/:collection/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN, VALID_ROLES.ADMINISTRATIVE]),
	check('collection', 'Collection is required').not().isEmpty(),
	check('collection').custom(collection => validCollections(collection, [VALID_COLLECTIONS.PRODUCTS, VALID_COLLECTIONS.USERS])),
	check('id', 'ID is required').not().isEmpty(),
	check('id', 'ID is invalid').isMongoId(),
	validateRequestErrors
], getImage);

module.exports = router;
