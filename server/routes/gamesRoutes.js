const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { addGame, getGames } = require('../controllers/gamesController');

router.post('/', authMiddleware, adminMiddleware, addGame);
router.get('/', authMiddleware, getGames);

module.exports = router;
