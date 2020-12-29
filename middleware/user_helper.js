const loggedOut = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/user/profile');
    }

    return next();
}

const requiresLogin = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        const err = new Error('You must login to view this page.');
        err.status = 401;
        return next(err);
    }
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;