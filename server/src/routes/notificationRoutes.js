const express = require('express');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({
      owner: req.user._id,
      isRead: false,
    });
    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ owner: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
