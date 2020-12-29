const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userHelper = require('../middleware/user_helper');

router.get('/profile',userHelper.requiresLogin, userController.user_profile_get);
router.post('/profile', userController.user_profile_post);

module.exports = router;
