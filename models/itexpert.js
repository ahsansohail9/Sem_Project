const mongoose = require("mongoose");

var expertSchema = mongoose.Schema({
    name: String,
    qualification: String,
    specialization: Array,
    category: String,
    contact: Array,
    image: {
        type: String,
        default: "default.png"
    },
});

const itExpert = mongoose.model("itexperts", expertSchema);

module.exports = itExpert;