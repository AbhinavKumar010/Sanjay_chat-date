const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    await message.save();
    await message.populate('sender', 'name profilePhoto');

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('sender', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, { isRead: true });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};

// Delete chat history for the current user (only messages where current user is sender)
exports.clearChatHistory = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    await Message.deleteMany({
      sender: req.user.id,
      receiver: otherUserId,
    });

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing chat history', error: error.message });
  }
};

exports.getConversations = async (req, res) => {

  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user.id] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
        },
      },
    ]);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};
