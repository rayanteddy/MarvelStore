const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  addresses: [
    {
      full: String,
      label: String
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);
