const User = require('../models/User');
const Message = require('../models/Message');

exports.browseUsers = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const currentUser = await User.findById(req.user.id);

    const users = await User.find({
      _id: { $ne: req.user.id },
      gender: currentUser.preferenceGender === 'both' ? { $in: ['male', 'female'] } : currentUser.preferenceGender,
      _id: { $nin: currentUser.matches },
    })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error browsing users', error: error.message });
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
