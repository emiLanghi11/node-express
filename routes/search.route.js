const { Router } = require('express');
const { search } = require('../controllers/search.controller');
const { check } = require('express-validator');
const { validateRequestErrors } = require('../middlewares/request.middleware');
const { VALID_COLLECTIONS } = require('../helpers/db.validation');

const router = Router();

router.get('/:collection/:term', [
	check('collection', 'Collection is required').not().isEmpty(),
	check('collection', 'Collection is invalid').isIn(VALID_COLLECTIONS),
	check('term', 'Term is required').not().isEmpty(),
	validateRequestErrors
], search);

module.exports = router;