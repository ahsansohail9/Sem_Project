const mongoose = require("mongoose");

var querySchema = mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String
});

const query = mongoose.model("contactqueries", querySchema);

module.exports = query;