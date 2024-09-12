const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  publicAddress: {
    type: String,
    required: true,
    unique: true,
  },
  nonce: {
    type: Number,
    required: true,
  },
});

userSchema.pre("save", function (next) {
  if (!this.publicAddress || this.publicAddress.trim() === "") {
    return next(new Error("Public address is required"));
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
