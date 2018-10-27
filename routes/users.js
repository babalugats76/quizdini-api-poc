const express = require('express');
const userController = require('../controllers/user.js');
const router = express.Router();
/* GET users listing. */
//router.get('/', userController.getUsers);
router.get('/:username', userController.getByUsername);
router.post('/', userController.postUser);
//router.put('/', userController.putUser);
// Need to implement DELETE (to remove record) 
//router.get('/id/:userId', userController.getById); 
module.exports = router;
