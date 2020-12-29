const jwt = require("jsonwebtoken");
const config = require("config");

function checkUserLogin(req, res, next) {

    if (req.header.loginToken) {
        let token = req.header.loginToken;
        let user = jwt.verify(token, config.get("jwtPrivateKey"));

        if (!user)
            return res.status(400).send("Token Not Verified");
    } else {
        return res.status(400).send("User Not Logged In ");
    }

    next();
}

module.exports = checkUserLogin;