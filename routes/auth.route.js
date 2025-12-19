const { Router } = require('express');
const { check } = require('express-validator');
const { login } = require('../controllers/auth.controller');
const { validateRequestErrors } = require('../middlewares/request.middleware');

const router = Router();

router.post('/login', [
	check('email', 'Email is required').not().isEmpty(),
	check('email', 'Email is invalid').isEmail(),
	check('password', 'Password is required').not().isEmpty(),
	validateRequestErrors
], login);

module.exports = router;