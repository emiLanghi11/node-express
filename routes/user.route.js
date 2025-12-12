const { Router } = require('express');
const { getUsers, putUsers, postUsers, deleteUsers, patchUsers } = require('../controllers/user.controller');

const router = Router();


router.get('/', getUsers);

router.put('/:id', putUsers);

router.post('/', postUsers);

router.delete('/', deleteUsers);

router.patch('/', patchUsers);


module.exports = router;