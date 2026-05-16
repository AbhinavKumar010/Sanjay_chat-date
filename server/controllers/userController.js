const User = require('../models/User');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const User = require('../models/User');

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
