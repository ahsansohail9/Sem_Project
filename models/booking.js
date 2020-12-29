const mongoose = require("mongoose");

var bookingSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    session: String
});

const booking = mongoose.model("bookings", bookingSchema);

module.exports = booking;