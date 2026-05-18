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
    // Support both req.user.id and req.user._id depending on auth middleware shape.
    const ownerId = req.user?.id || req.user?._id;
    if (!ownerId) return res.status(401).json({ message: 'Unauthorized' });

    const notifications = await Notification.find({ owner: ownerId })
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
    if (!id) return res.status(400).json({ message: 'Missing notification id' });

    // Support both req.user.id and req.user._id depending on auth middleware implementation.
    const ownerId = req.user?.id || req.user?._id;
    if (!ownerId) return res.status(401).json({ message: 'Unauthorized' });

    const updated = await Notification.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { isRead: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    return res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};


