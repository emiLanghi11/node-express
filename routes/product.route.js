const { Router } = require('express');
const { getProducts, createProduct, updateProduct, getProductById, deleteProduct } = require('../controllers/product.controller');
const { validateJWTToken, validateRoles, validateRequestErrors } = require('../middlewares');
const { productExists, categoryExists } = require('../helpers/db.validation');
const { check } = require('express-validator');
const { VALID_ROLES } = require('../constants/constants');

const router = Router();

router.get('/', getProducts);

router.get('/:id', [
	check('id', 'Invalid id')
		.isMongoId()
		.bail()
		.custom(id => productExists(id)),
	validateRequestErrors,
], getProductById);

router.post('/',
	[
		validateJWTToken,
		validateRoles([VALID_ROLES.ADMIN]),
		check('name', 'Name is required').not().isEmpty(),
		check('description', 'Description is required').not().isEmpty(),
		check('price', 'Price is required').not().isEmpty(),
		check('category', 'Category is required').not().isEmpty(),
		check('category', 'Category is not valid')
			.isMongoId()
			.bail()
			.custom(category => categoryExists(category)),
		validateRequestErrors,
	], createProduct);

router.put('/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('id', 'Invalid id')
		.isMongoId()
		.bail()
		.custom(id => productExists(id)),
	check('category', 'Category is required').not().isEmpty(),
	check('category', 'Category is not valid')
		.isMongoId()
		.bail()
		.custom(category => categoryExists(category)),
	validateRequestErrors,
], updateProduct);

router.delete('/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('id', 'Invalid id')
		.isMongoId()
		.bail()
		.custom(id => productExists(id)),
	validateRequestErrors,
], deleteProduct);


module.exports = router;