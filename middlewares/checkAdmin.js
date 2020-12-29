function checkAdmin(req, res, next) {

    if (req.session.loginuser) {
        let user = req.session.loginuser;

        if (user.role != "admin")
            return res.status(400).send("You are not Admin");
    } else {
        return res.status(400).send("User Not Logged In");
    }

    next();
}

module.exports = checkAdmin;