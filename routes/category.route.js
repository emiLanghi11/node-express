const { Router } = require('express');
const { validateJWTToken, validateRoles, validateRequestErrors } = require('../middlewares');
const { categoryExists } = require('../helpers/db.validation');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { check } = require('express-validator');
const { VALID_ROLES } = require('../constants/constants');



const router = Router();

router.get('/', getCategories);

router.get('/:id', [
	check('id', 'Invalid id')
		.isMongoId()
		.bail()
		.custom(id => categoryExists(id)),
		validateRequestErrors,
], getCategoryById);

router.post('/', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('name', 'Name is required').not().isEmpty(),
	validateRequestErrors,
], createCategory);

router.put('/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('id', 'Invalid id')
		.isMongoId()
		.bail()
		.custom(id => categoryExists(id)),
	check('name', 'Name is required').not().isEmpty(),
	validateRequestErrors,
], updateCategory);

router.delete('/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('id', 'Invalid id')
		.isMongoId()
		.bail()
		.custom(id => categoryExists(id)),
	validateRequestErrors,
], deleteCategory);

module.exports = router;
