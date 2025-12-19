const { Router } = require('express');
const { check } = require('express-validator');
const { getUsers, putUsers, postUsers, deleteUsers, patchUsers } = require('../controllers/user.controller');
const { validateRequestErrors, validateJWTToken, validateRoles } = require('../middlewares');
const { roleExists } = require('../helpers/db.validation');
const router = Router();


router.get('/', [
	validateJWTToken,
	validateRoles(['ADMIN', 'ADMINISTRATIVE', 'SALESPERSON'])
], getUsers);

router.put('/:id', [
	check('id', 'Invalid ID').isMongoId(),
	//check('id').custom(id => userExists(id)),
	validateRequestErrors
], putUsers);

router.post('/', [
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
	check('id', 'Invalid ID').isMongoId(),
	validateRequestErrors
], deleteUsers);

router.patch('/', patchUsers);


module.exports = router;