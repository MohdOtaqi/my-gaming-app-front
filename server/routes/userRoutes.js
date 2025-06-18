const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user's profile
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Update current user's profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, gamertag, description, favoriteGames, platforms, avatar } = req.body;
    req.user.name = name ?? req.user.name;
    req.user.gamertag = gamertag ?? req.user.gamertag;
    req.user.description = description ?? req.user.description;
    req.user.favoriteGames = favoriteGames ?? req.user.favoriteGames;
    req.user.platforms = platforms ?? req.user.platforms;
    req.user.avatar = avatar ?? req.user.avatar;
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Set user active (support multiple games)
router.post('/me/active', authMiddleware, async (req, res) => {
  const { game } = req.body;
  if (!game || (Array.isArray(game) && game.length === 0)) {
    return res.status(400).json({ message: 'Game is required to set active.' });
  }
  if (Array.isArray(game)) {
    req.user.isActive = true;
    req.user.activeGames = game;
    req.user.activeGame = game[0] || '';
  } else {
    req.user.isActive = true;
    req.user.activeGames = [game];
    req.user.activeGame = game;
  }
  await req.user.save();
  res.json({ message: 'User set as active', activeGames: req.user.activeGames });
});

// Set user inactive
router.post('/me/inactive', authMiddleware, async (req, res) => {
  req.user.isActive = false;
  req.user.activeGame = '';
  await req.user.save();
  res.json({ message: 'User set as inactive' });
});

// Get all active members for a game (for member lookup)
router.get('/members', authMiddleware, async (req, res) => {
  const { game } = req.query;
  try {
    const members = await User.find({
      activeGame: game,
      isActive: true
    }).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all chats for current user
router.get('/me/chats', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar gamertag')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chat with a specific user
router.get('/me/chats/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, otherUserId] }
    }).populate('messages.sender', 'name avatar');
    if (!chat) {
      // Create chat if not exists
      chat = new Chat({ participants: [req.user._id, otherUserId], messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message to a user (creates chat if not exists)
router.post('/me/chats/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text required.' });
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, otherUserId] }
    });
    if (!chat) {
      chat = new Chat({ participants: [req.user._id, otherUserId], messages: [] });
    }
    chat.messages.push({ sender: req.user._id, text });
    chat.updatedAt = new Date();
    await chat.save();
    await chat.populate('messages.sender', 'name avatar');
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a chat for the current user
router.delete('/me/chats/:chatId', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }
    // Only allow deletion if the user is a participant
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this chat.' });
    }
    await chat.deleteOne();
    res.json({ message: 'Chat deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID (for profile viewing)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
