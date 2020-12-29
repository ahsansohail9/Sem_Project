const mongoose = require("mongoose");

var sessionSchema = mongoose.Schema({
    title: String,
    location: String,
    category: String,
    day: String,
    month: String,
    year: String,
    expert: String,
    maplink: String,
    image: {
        type: String,
        default: "default.jpg"
    },
    description: String
});

const session = mongoose.model("sessions", sessionSchema);

module.exports = session;