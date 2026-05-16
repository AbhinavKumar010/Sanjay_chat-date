const Notification = require('../models/Notification');

exports.createNotification = async ({ ownerId, fromId, type, content = '' }) => {
  if (!ownerId || !fromId || !type) return;

  await Notification.create({
    owner: ownerId,
    from: fromId,
    type,
    content: content || '',
  });
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('from', 'name profilePhoto');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { isRead: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

