const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required',
        code: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is missing',
        code: 'UNAUTHORIZED',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id || decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or session invalid',
        code: 'UNAUTHORIZED',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token',
      code: 'UNAUTHORIZED',
    });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Requires ${role} privileges`,
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
