const { Router } = require('express');
const { check } = require('express-validator');
const { getUsers, putUsers, postUsers, deleteUsers } = require('../controllers/user.controller');
const { validateRequestErrors, validateJWTToken, validateRoles } = require('../middlewares');
const { roleExists, userExists } = require('../helpers/db.validation');
const { VALID_ROLES } = require('../constants/constants');
const router = Router();


router.get('/', [], getUsers);

router.put('/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('id', 'Invalid ID')
		.isMongoId()
		.bail()
		.custom(id => userExists(id)),
	validateRequestErrors,
], putUsers);

router.post('/', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('email', 'Email is invalid').isEmail(),
	check('name', 'Name is required').not().isEmpty(),
	check('password', 'Password is required').not().isEmpty(),
	check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
	check('role', 'Role is required').not().isEmpty(),
	check('role').custom(role => roleExists(role)),
	validateRequestErrors
],
postUsers);

router.delete('/:id', [
	validateJWTToken,
	validateRoles([VALID_ROLES.ADMIN]),
	check('id', 'Invalid ID')
		.isMongoId()
		.bail()
		.custom(id => userExists(id)),
	validateRequestErrors,
], deleteUsers);


module.exports = router;