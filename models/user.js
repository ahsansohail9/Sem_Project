const mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String,
    image: {
        type: String,
        default: "default.png"
    },
    role: {
        type: String,
        default: "user"
    }
});

const user = mongoose.model("users", userSchema);

module.exports = user;