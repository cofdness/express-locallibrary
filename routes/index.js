const express = require('express');
const router = express.Router();
const authenticatorController = require('../controllers/authenticationControlller');
const userHelper = require('../middleware/user_helper');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index_entry');
});

router.get('/login', userHelper.loggedOut, authenticatorController.login_get);
router.post('/login', userHelper.loggedOut, authenticatorController.login_post);
router.get('/register', authenticatorController.register_get);
router.post('/register', authenticatorController.register_post);
router.get('/logout', authenticatorController.logout_get);
router.post('/logout', authenticatorController.logout_get);

module.exports = router;
