const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        ecoScore: user.ecoScore,
        totalEmission: user.totalEmission,
        badges: user.badges,
        streak: user.streak
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        ecoScore: user.ecoScore,
        totalEmission: user.totalEmission,
        badges: user.badges,
        streak: user.streak
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = {};
    if (name) updates.name = name;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update(updates);

    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
