const notificationController = require('./notificationController');

// Minimal authenticated endpoint used by ChatPage to persist notifications
// for cases where receiver is online but not actively chatting.
exports.quickCreate = async (req, res) => {
  try {
    const { type, fromId, content = '' } = req.body;

    await notificationController.createNotification({
      ownerId: req.user.id,
      fromId,
      type,
      content,
    });

    res.json({ message: 'Notification created' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};

