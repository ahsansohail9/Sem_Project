const mongoose = require("mongoose");

var subscriberSchema = mongoose.Schema({
    email: String
});

const subscriber = mongoose.model("subscribers", subscriberSchema);

module.exports = subscriber;