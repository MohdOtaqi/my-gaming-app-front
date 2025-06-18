const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Invalid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  gamertag: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  favoriteGames: {
    type: [String],
    default: [],
  },
  platforms: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  activeGame: {
    type: String,
    default: '',
  },
  activeGames: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

module.exports = mongoose.model('User', userSchema);
