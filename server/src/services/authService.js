const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

class AuthService {
  async register({ name, email, password, role = 'operator' }) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 400;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'operator',
      lastLogin: new Date(),
    });

    const token = generateToken(user);
    return {
      user: formatUser(user),
      token,
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    return {
      user: formatUser(user),
      token,
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return formatUser(user);
  }
}

module.exports = new AuthService();
