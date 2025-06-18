const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
exports.register = async (req, res) => {
  try {
    console.log('Registration attempt with data:', { ...req.body, password: '[REDACTED]' });
    
    const {
      name,
      email,
      password,
      gamertag,
      description,
      avatar,
      favoriteGames,
      platforms
    } = req.body;

    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Always store email as lowercase for consistency
    const emailLower = email.toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      console.log('User already exists with email:', emailLower);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email: emailLower,
      password: hashedPassword,
      gamertag: gamertag || '',
      description: description || '',
      avatar: avatar || '',
      favoriteGames: favoriteGames || [],
      platforms: platforms || [],
    });

    await user.save();
    console.log('User registered successfully:', { id: user._id, email: user.email });

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gamertag: user.gamertag,
        description: user.description,
        avatar: user.avatar,
        favoriteGames: user.favoriteGames,
        platforms: user.platforms,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    email = email.toLowerCase();

    // Find user and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get full user info (without password)
    const { password: pwd, ...userData } = user.toObject();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gamertag: user.gamertag,
        description: user.description,
        avatar: user.avatar,
        favoriteGames: user.favoriteGames,
        platforms: user.platforms,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
