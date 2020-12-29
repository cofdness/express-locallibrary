const User = require('../models/user');
const {check, body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');

exports.login_get = (req, res, next) => {
    res.render('login_form', {title:'Login'});
}
exports.login_post = [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({min: 1}).trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('login_form',{title:'Login', user: req.body, errors: errors.array()})
        }
        else {
            User.authenticate(req.body.email, req.body.password, (error, user) => {
                if (error || !user) {
                    const err = new Error('Invalid email or password')
                    err.status = 401
                    err.msg = 'Invalid email or password'
                    console.log(err)
                    console.log(user)
                    res.render('login_form', {title: 'Login', user: user, errors: [err]})
                }
                else {
                    req.session.userId = user._id
                    res.redirect('/user/profile')
                }
            })
        }
    }
]
exports.register_get = (req, res, next) => {
    res.render('register_form', {title:'Register'})
}
exports.register_post = [
    (req, res, next) => {
        if  (req.body.password !== req.body.confirmpassword) {
            const err = new Error('Confirm password not match')
            return res.render('register_form', {user: req.body, errors: [error]})
        }
        next()
    },
    body('name').isLength({min: 1}).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min: 5}).trim().escape(),
    (req, res, next) => {
        console.log('abc')
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('register_form', {user: req.body, errors: errors.array()})
        }
        else {
            const userData = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            console.log(req.body.name)
            console.log(req.body.password)
            User.create(userData, (err, user) => {
                if (err) return next(err)
                else {
                    req.session.userId = user._id
                    return res.redirect('/user/profile')
                }
            })
        }
    }
]
exports.logout_get = (req, res, next) => {
    if(req.session) {
        req.session.destroy((err) => {
            if (err) return next(err);
            else {
                return res.redirect('/');
            }
        })
    }
}
exports.logout_post = (req, res, next) => {
    res.send('will implement')
}