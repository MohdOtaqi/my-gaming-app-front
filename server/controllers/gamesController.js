const Game = require('../models/Game');

exports.addGame = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const game = await Game.create({ name, imageUrl });
    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
