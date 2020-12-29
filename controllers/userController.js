const User = require('../models/user');
const {body, validationResult} = require('express-validator');

exports.user_login_get = (req, res, next) => {
    res.render('user_login', {title: 'Login:'});
}

exports.user_login_post = (req, res, next) => {
    res.send('not implement');
}

exports.user_logout_get = (req, res, next) => {
    res.render('user_logout', {title: 'Logout'})
}

exports.user_logout_post = (req, res, next) => {
    res.send('not implement')
}

exports.user_profile_get = (req, res, next) => {
    res.send('will implement')
}
exports.user_profile_post = (req, res, next) => {
    res.send('will implement')
}