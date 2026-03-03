const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
    age: Number,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
});

module.exports = mongoose.model("Patient", schema);