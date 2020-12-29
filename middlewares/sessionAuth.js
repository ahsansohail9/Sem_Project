function sessionAuth(req, res, next) {
    if (req.session.loginuser)
        res.locals.loginuser = req.session.loginuser;

    next();
}

module.exports = sessionAuth;