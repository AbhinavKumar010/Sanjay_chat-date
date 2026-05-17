const User = require('../models/User');
const Message = require('../models/Message');
const mongoose = require('mongoose');


exports.browseUsers = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const users = await User.find({
      _id: { $ne: userId }   // ONLY exclude self
    })
      .limit(Number(limit))
      .skip(Number(skip))
      .select("-password");

    console.log("USERS FOUND:", users.length);

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error browsing users",
      error: error.message,
    });
  }
};
exports.likeUser = async (req, res) => {
  try {
    const { likedUserId } = req.body;

    const currentUser = await User.findById(req.user.id);
    const likedUser = await User.findById(likedUserId);

    if (!likedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to likes
    if (!currentUser.likes.includes(likedUserId)) {
      currentUser.likes.push(likedUserId);
    }

    // Check if it's a match
    if (likedUser.likes.includes(req.user.id)) {
      if (!currentUser.matches.includes(likedUserId)) {
        currentUser.matches.push(likedUserId);
      }
      if (!likedUser.matches.includes(req.user.id)) {
        likedUser.matches.push(req.user.id);
      }
      await likedUser.save();
    }

    await currentUser.save();

    res.json({ message: 'User liked', isMatch: likedUser.likes.includes(req.user.id) });
  } catch (error) {
    res.status(500).json({ message: 'Error liking user', error: error.message });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('matches', 'name profilePhoto age bio')
      .select('matches');

    res.json(user.matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name age gender bio profilePhoto location interests');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// =========================
// Admin actions
// =========================

exports.adminListUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role isBlocked age gender profilePhoto createdAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error listing users', error: error.message });
  }
};

exports.adminBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.isBlocked = true;
    await target.save();

    res.json({ message: 'User blocked', userId: target._id, isBlocked: target.isBlocked });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};

exports.adminUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.isBlocked = false;
    await target.save();

    res.json({ message: 'User unblocked', userId: target._id, isBlocked: target.isBlocked });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
};

exports.adminRemoveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(id);

    res.json({ message: 'User removed', userId: id });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user', error: error.message });
  }
};

