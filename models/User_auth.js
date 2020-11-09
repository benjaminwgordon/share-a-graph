const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAuthSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // not required bc we want to keep placeholders to prevent users from reusing deleted account names
  user: {type: Schema.Types.ObjectId}
}, { timestamps: true });

module.exports = mongoose.model('User_auth', userAuthSchema);