const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

/* GET users listing. */
router.get('/', userController.getUsers);
router.get('/:username', userController.getUserByUsername);
router.post('/', userController.postUser);
router.put('/', userController.putUser);
// Need to implement PUT (to update)
// Need to implement DELETE (to remove record) 
module.exports = router;
